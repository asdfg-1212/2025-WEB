import axios from "axios";

const API_BASE = "http://localhost:7001/api";

// 评论相关接口
export async function getActivityComments(activityId: number) {
  const res = await fetch(`/api/comments/activity/${activityId}`);
  const data = await res.json();
  return data;
}

export async function createComment(comment: {
  content: string;
  user_id: number;
  activity_id: number;
  parent_id?: number;
}) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(comment)
  });
  const data = await res.json();
  return data;
}

export async function updateComment(id: number, content: string) {
  const res = await axios.put(`${API_BASE}/comments/${id}`, { content });
  return res.data;
}

export async function deleteComment(id: number) {
  const res = await axios.delete(`${API_BASE}/comments/${id}`);
  return res.data;
}
