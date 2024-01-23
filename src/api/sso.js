/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import request from "@/config/request";
import ENDPOINT from "@/config/endpoint";

async function check_exists() {
  return await request({
    url: ENDPOINT.SSO_CONFIGURATION_CHECK_EXISTS,
    method: "get",
  });
}

export default {
  check_exists,
};
