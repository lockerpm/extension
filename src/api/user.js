/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import request from "@/config/request";
import ENDPOINT from "@/config/endpoint";

async function logout() {
  return await request({
    url: ENDPOINT.LOGOUT,
    method: "post",
  });
}

export default {
  logout,
};
