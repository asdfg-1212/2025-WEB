import axios from "axios";

const API_BASE = "http://localhost:7001/api";

// 场馆相关接口
export async function getVenues() {
  const res = await axios.get(`${API_BASE}/venues`);
  return res.data;
}

export async function getVenueById(id: number) {
  const res = await axios.get(`${API_BASE}/venues/${id}`);
  return res.data;
}

export async function createVenue(venue: {
  name: string;
  location: string;
  capacity: number;
  description?: string;
  operator_id: number;
}) {
  const res = await axios.post(`${API_BASE}/venues`, venue);
  return res.data;
}

export async function updateVenue(id: number, venue: any) {
  const res = await axios.put(`${API_BASE}/venues/${id}`, venue);
  return res.data;
}

export async function deleteVenue(id: number) {
  const res = await axios.delete(`${API_BASE}/venues/${id}`);
  return res.data;
}
