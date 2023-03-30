FROM node:14.17.1

RUN apt update && apt install curl jq -y

WORKDIR /app

COPY . /app

RUN yarn

RUN yarn build

ARG APP_ID

ARG CLIENT_ID

ARG CLIENT_SECRET

ARG REFRESH_TOKEN

RUN export ACCESS_TOKEN=$(curl "https://accounts.google.com/o/oauth2/token" -d "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&refresh_token=$REFRESH_TOKEN&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" | jq -r .access_token)

RUN curl -H "Authorization: Bearer $ACCESS_TOKEN" -H "x-goog-api-version: 2" -X PUT -T locker_chrome_extension.zip -v "https://www.googleapis.com/upload/chromewebstore/v1.1/items/$APP_ID"

RUN curl -H "Authorization: Bearer $ACCESS_TOKEN" -H "x-goog-api-version: 2" -H "Content-Length: 0" -X POST -v "https://www.googleapis.com/chromewebstore/v1.1/items/$APP_ID/publish"
