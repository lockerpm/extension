/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import request from "@/config/request";
import ENDPOINT from "@/config/endpoint";

async function get_addresses(params) {
  return request({
    url: ENDPOINT.ADDRESSES,
    method: "get",
    params
  });
}

async function create_address() {
  return request({
    url: ENDPOINT.ADDRESSES,
    method: "post",
  });
}

export default {
  get_addresses,
  create_address,
};
