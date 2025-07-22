import axios from "axios";

const API_BASE = "http://localhost:7001/api";

// 活动相关接口
export async function getActivities() {
  const res = await axios.get(`${API_BASE}/activities`);
  return res.data;
}

export async function getActivityById(id: number) {
  const res = await axios.get(`${API_BASE}/activities/${id}`);
  return res.data;
}

export async function createActivity(activity: {
  title: string;
  description: string;
  type: string;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  max_participants: number;
  venue_id: number;
  creator_id: number;
  notes?: string;
  allow_comments?: boolean;
}) {
  const res = await axios.post(`${API_BASE}/activities`, activity);
  return res.data;
}

export async function updateActivity(id: number, activity: any) {
  const res = await axios.put(`${API_BASE}/activities/${id}`, activity);
  return res.data;
}

export async function deleteActivity(id: number) {
  const res = await axios.delete(`${API_BASE}/activities/${id}`);
  return res.data;
}
