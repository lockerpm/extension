/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import request from "@/config/request";
import ENDPOINT from "@/config/endpoint";

async function me() {
  return await request({
    url: ENDPOINT.ME,
    method: "get",
  });
}

async function me_intercom() {
  return await request({
    url: ENDPOINT.ME_INTERCOM,
    method: "get",
  });
}


async function update(data) {
  return await request({
    url: ENDPOINT.ME,
    method: "put",
    data
  });
}

export default {
  me,
  update,
  me_intercom,
};
