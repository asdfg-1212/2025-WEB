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

export async function deleteComment(id: number, userId: number) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/comments/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    throw new Error('删除评论失败');
  }

  return response.json();
}
