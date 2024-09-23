import axios, { AxiosResponse } from "axios";
import { ApiRequest } from "./types";
import { DefaultException } from "@dolphjs/dolph/common/api/exceptions/default_exception.api";

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
    console.error("Error occurred during POST request:", e);

    if (axios.isAxiosError(e)) {
      const message = e.response?.data?.message || "An error occurred";
      const status = e.response?.status || 500;

      throw new DefaultException(message, status);
    } else {
      // Handle other types of errors
      throw new DefaultException("An unexpected error occurred", 500);
    }
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
    throw new Error(e.message);
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
    throw new Error(e.message);
  }
};
