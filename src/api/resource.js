/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import request from "@/config/request";
import ENDPOINT from "@/config/endpoint";

async function countries() {
  return await request({
    url: ENDPOINT.RESOURCES_COUNTRIES,
    method: "get",
  });
}

export default {
  countries,
};
