import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let subscribers = [];

function onRefreshed(newToken) {
  subscribers.forEach((cb) => cb(newToken));
  subscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthEndpoint = config?.url === "/auth/refresh" || config?.url === "/auth/login";

    if (response?.status === 401 && !config._retry && !isAuthEndpoint) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return Promise.reject(error);

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribers.push((newToken) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            config._retry = true;
            resolve(api(config));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        onRefreshed(data.accessToken);
        isRefreshing = false;

        config.headers.Authorization = `Bearer ${data.accessToken}`;
        config._retry = true;
        return api(config);
      } catch (refreshError) {
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    if (response?.status === 500) {
      window.location.href = "/server-error";
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;