import Axios, { AxiosRequestConfig } from "axios";
import { redirect } from "next/navigation";

import { siteConfig } from "../config";
import { AUTH_URI } from "./constants";
import { axiosErrorNormalizer } from "./errors";

const axiosConfig: AxiosRequestConfig = {
  baseURL: siteConfig.apiUrl,
  timeout: 30000,
  withCredentials: true,
};

const axios = Axios.create(axiosConfig);

axios.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err?.response?.status === 401) {
      return redirect(AUTH_URI.signIn);
    } else {
      return Promise.reject(axiosErrorNormalizer(err));
    }
  }
);

export default axios;
