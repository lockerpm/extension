import request from "@/config/request";
import ENDPOINT from "@/config/endpoint";

async function sso_auth(data) {
  return await request({
    url: ENDPOINT.SSO_AUTH,
    method: "post",
    data
  });
}

async function sso_auth_otp(data) {
  return await request({
    url: ENDPOINT.SSO_AUTH_OTP,
    method: "post",
    data
  });
}

async function sso_auth_otp_mail(data) {
  return await request({
    url: ENDPOINT.SSO_AUTH_OTP_MAIL,
    method: "post",
    data
  });
}

async function sso_last_active() {
  return await request({
    url: ENDPOINT.SSO_LAST_ACTIVE,
    method: "post",
  });
}

function sso_access_token(data) {
  return request({
    url: ENDPOINT.SSO_ACCESS_TOKEN,
    method: "post",
    data
  });
}

export default {
  sso_auth,
  sso_auth_otp,
  sso_auth_otp_mail,
  sso_last_active,
  sso_access_token
};
