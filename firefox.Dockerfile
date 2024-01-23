FROM nikolaik/python-nodejs:python3.10-nodejs16

WORKDIR /app

COPY . /app

ARG VUE_APP_ID_URL

ARG VUE_APP_BASE_API_URL

ARG VUE_APP_WS_URL

ARG VUE_APP_LOGO_URL

ARG VUE_APP_SENTRY_DSN

ARG VUE_APP_ENVIRONMENT

ARG VUE_APP_DESKTOP_WS_URL

ARG VERSION_API_TOKEN

ARG VERSION_API_URL

ARG GET_VERSION_URL

ARG FIREFOX_ADDON_ID

ARG FIREFOX_JWT_ISS

ARG FIREFOX_JWT_SECRET

ARG UPDATE_VERSION_URL

RUN pip install pyjwt requests

RUN python3 deploy.py
