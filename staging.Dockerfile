FROM node:16.20.0

RUN apt update && apt install curl jq -y

WORKDIR /app

COPY . /app

RUN npm install

ARG VUE_APP_ID_URL

ARG VUE_APP_BASE_API_URL

ARG VUE_APP_WS_URL

ARG VUE_APP_LOGO_URL

ARG VUE_APP_SENTRY_DSN

ARG VUE_APP_ENVIRONMENT

ARG VUE_APP_DESKTOP_WS_URL

ARG VERSION_API_TOKEN

ARG VERSION_API_URL

RUN (curl -H 'Authorization: Token '$VERSION_API_TOKEN'' -H 'Content-Type: application/json' --data '{"client_id": "browser", "environment": "staging"}' ''$VERSION_API_URL'/current' | jq -r .version) > version.txt

RUN cat version.txt

RUN  sed -i 's|"version": "1.0.0"|"version": "'$(cat version.txt)'"|' package.json

RUN npm run build

ARG APP_ID

ARG CLIENT_ID

ARG CLIENT_SECRET

ARG REFRESH_TOKEN

RUN (curl "https://accounts.google.com/o/oauth2/token" -d "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&refresh_token=$REFRESH_TOKEN&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" | jq -r .access_token) > access_token.txt

RUN curl -H "Authorization: Bearer $(cat access_token.txt)" -H "x-goog-api-version: 2" -X PUT -T artifacts/locker-extention-v$(cat version.txt)-production.zip "https://www.googleapis.com/upload/chromewebstore/v1.1/items/$APP_ID"

RUN curl -H "Authorization: Bearer $(cat access_token.txt)" -H "x-goog-api-version: 2" -H "Content-Length: 0" -X POST "https://www.googleapis.com/chromewebstore/v1.1/items/$APP_ID/publish"

# RUN if grep -q "OK" status.txt; then curl -H 'Authorization: Token '$VERSION_API_TOKEN'' -H 'Content-Type: application/json' --data '{"build": true, "client_id": "browser", "environment": "staging"}' ''$VERSION_API_URL'/new'; fi
