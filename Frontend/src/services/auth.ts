import axios from "axios";

const API_BASE = "/api";

export async function login(email: string, password: string) {
  const res = await axios.post(`${API_BASE}/login`, { email, password });
  localStorage.setItem("token", res.data.token);
  return res.data;
}

export async function register(email: string, password: string) {
  const res = await axios.post(`${API_BASE}/register`, { email, password });
  return res.data;
}
