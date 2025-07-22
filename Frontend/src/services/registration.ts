import axios from "axios";

const API_BASE = "http://localhost:7001/api";

// 报名相关接口
export async function registerActivity(activityId: number, userId: number) {
  const res = await axios.post(`${API_BASE}/registrations`, {
    user_id: userId,
    activity_id: activityId
  });
  return res.data;
}

export async function cancelRegistration(activityId: number) {
  const res = await axios.delete(`${API_BASE}/registrations/activity/${activityId}`);
  return res.data;
}

export async function checkRegistrationStatus(activityId: number) {
  const res = await axios.get(`${API_BASE}/registrations/check/${activityId}`);
  return res.data;
}

// 管理员查看活动报名情况
export async function getActivityRegistrations(activityId: number) {
  const res = await axios.get(`${API_BASE}/registrations/activity/${activityId}/admin`);
  return res.data;
}

// 获取用户的所有报名
export async function getUserRegistrations() {
  const res = await axios.get(`${API_BASE}/registrations/user`);
  return res.data;
}
