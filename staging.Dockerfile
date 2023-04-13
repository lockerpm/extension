FROM node:14.17.1

RUN apt update && apt install curl jq -y

WORKDIR /app

COPY . /app

RUN yarn

ARG VUE_APP_ID_URL

ARG VUE_APP_BASE_API_URL

ARG VUE_APP_WS_URL

ARG VUE_APP_LOGO_URL

ARG VUE_APP_SENTRY_DSN

ARG VUE_APP_ENVIRONMENT

ARG VUE_APP_RECAPTCHA_SITE_KEY

ARG VUE_APP_DESKTOP_WS_URL

ARG VERSION_API_TOKEN

RUN (curl 'https://api.cystack.net/v3/cystack_platform/pm/releases/new' --header 'Authorization: Token $VERSION_API_TOKEN' --header 'Content-Type: application/json' --data '{"build": true, "client_id": "browser", "environment": "prod"}' | jq -r .version) > version.txt

RUN  sed -i 's|"version": "1.0.0"|"version": "'$(cat version.txt)'"|' package.json

RUN yarn build

ARG APP_ID

ARG CLIENT_ID

ARG CLIENT_SECRET

ARG REFRESH_TOKEN

RUN export ACCESS_TOKEN=$(curl "https://accounts.google.com/o/oauth2/token" -d "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&refresh_token=$REFRESH_TOKEN&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" | jq -r .access_token)

RUN curl -H "Authorization: Bearer $ACCESS_TOKEN" -H "x-goog-api-version: 2" -X PUT -T artifacts/locker-extention-v$(cat version.txt)-production.zip -v "https://www.googleapis.com/upload/chromewebstore/v1.1/items/$APP_ID"

RUN curl -H "Authorization: Bearer $ACCESS_TOKEN" -H "x-goog-api-version: 2" -H "Content-Length: 0" -X POST -v "https://www.googleapis.com/chromewebstore/v1.1/items/$APP_ID/publish"
