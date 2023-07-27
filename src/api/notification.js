/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import request from "@/config/request";
import ENDPOINT from "@/config/endpoint";

async function get(params = {}) {
  return await request({
    url: ENDPOINT.NOTIFICATIONS,
    method: "get",
    params
  });
}

export default {
  get,
};
