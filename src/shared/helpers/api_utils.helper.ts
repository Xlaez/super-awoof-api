import axios, { AxiosResponse } from "axios";
import { ApiRequest } from "./types";

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";

axios.defaults.timeout = 2500000;

export const getRequest = async ({ endpoint, headers }: ApiRequest) => {
  try {
    let response: AxiosResponse<any, any>;

    if (headers) {
      response = await axios.request({
        url: endpoint,
        method: "GET",
        headers: { ...headers },
      });
    } else {
      response = await axios.get(endpoint);
    }
    return response;
  } catch (e: any) {
    console.error(`${e.response?.status} ${JSON.stringify(e.response?.data)}`);
    throw new Error(e.response);
  }
};

export const postRequest = async ({ endpoint, headers, data }: ApiRequest) => {
  try {
    let response: AxiosResponse;

    if (headers) {
      response = await axios.request({
        url: endpoint,
        method: "POST",
        data: data,
        headers: { ...headers },
      });
    } else {
      if (typeof data === "string") {
        response = await axios.post(endpoint, data);
      } else {
        response = await axios.post(endpoint, { ...data });
      }
    }

    return response;
  } catch (e: any) {
    console.error(`${e?.response.status} ${JSON.stringify(e.response.data)}`);
    throw new Error(e);
  }
};

export const putRequest = async ({ endpoint, headers, data }: ApiRequest) => {
  try {
    let response: AxiosResponse;

    if (headers) {
      response = await axios.request({
        url: endpoint,
        method: "PUT",
        data: data,
        headers: { ...headers },
      });
    } else {
      if (typeof data === "string") {
        response = await axios.post(endpoint, data);
      } else {
        response = await axios.post(endpoint, { ...data });
      }
    }

    return response;
  } catch (e: any) {
    console.error(`${e?.response.status} ${JSON.stringify(e.response.data)}`);
    throw new Error(e);
  }
};

export const deleteRequest = async ({
  endpoint,
  headers,
  data,
}: ApiRequest) => {
  try {
    let response: AxiosResponse;

    if (headers) {
      response = await axios.request({
        url: endpoint,
        method: "DELETE",
        data: data,
        headers: { ...headers },
      });
    } else {
      if (typeof data === "string") {
        response = await axios.post(endpoint, data);
      } else {
        response = await axios.post(endpoint, { ...data });
      }
    }

    return response;
  } catch (e: any) {
    console.error(`${e.response.status} ${JSON.stringify(e.response.data)}`);
    throw new Error(e);
  }
};
