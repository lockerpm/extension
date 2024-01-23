import json
import os
import time

import jwt
import random
import requests


class Builder:
    def __init__(self):
        self.payload = {
            "client_id": "browser",
            "platform": "firefox"
        }
        self.headers = {
            'Authorization': f'Token {os.getenv("VERSION_API_TOKEN")}',
            'Content-Type': 'application/json'
        }
        self.version = self.get_version()
        self.local_file = f'locker-extention-v{self.version}-production.zip'
        self.commands = ['npm install', 'npm run build']

    def get_version(self):
        resp = requests.post(os.getenv("GET_VERSION_URL"), headers=self.headers, json=self.payload).text
        return json.loads(resp)['version']

    def update_version(self, success):
        if not success:
            return None
        self.payload['build'] = success
        resp = requests.post(os.getenv('UPDATE_VERSION_URL'), headers=self.headers, json=self.payload).text
        version = json.loads(resp)['version']
        return version

    def gen_jwt(self):
        issued_at = time.time()
        payload = {
          "iss": os.getenv("FIREFOX_JWT_ISS"),
          'jti': random.random(),
          'iat': issued_at,
          'exp': issued_at + 120,
        }
        encoded_jwt = jwt.encode(payload, os.getenv("FIREFOX_JWT_SECRET"), algorithm="HS256")
        return encoded_jwt

    def upload(self):
        if os.path.isfile(f'artifacts/{self.local_file}'):
            header = {
                'Authorization': f'JWT {self.gen_jwt()}'
            }
            files = {'upload': open(f'artifacts/{self.local_file}', 'rb')}
            resp = requests.post("https://addons.mozilla.org/api/v5/addons/upload/", headers=header, files=files,
                                 data={'channel': 'listed'})
            print(resp.text)
            uuid = json.loads(resp.text)['uuid']
            while True:
                resp = requests.get(f"https://addons.mozilla.org/api/v5/addons/upload/{uuid}/")
                valid = json.loads(resp.text)['valid']
                if valid:
                    break
                time.sleep(10)
            header['Content-Type'] = 'application/json'
            requests.post(f"https://addons.mozilla.org/api/v5/addons/addon/{os.getenv('FIREFOX_ADDON_ID')}/versions/",
                          headers=header, json={ "upload": uuid })
            return self.update_version(True)
        else:
            return self.update_version(False)

    def build(self):
        # if self.os != 'Linux':
        package_json = json.load(open('package.json'))
        package_json['version'] = self.version
        f = open('package.json', 'w')
        f.write(json.dumps(package_json))
        f.close()
        for command in self.commands:
            os.system(command)



if __name__ == '__main__':
    builder = Builder()
    builder.build()
    builder.upload()
