import type { User } from '../types/user';

// 默认头像的 SVG base64
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2ZjEiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMzJDOCAyNi40NzcgMTMuNDc3IDIyIDIwIDIyQzI2LjUyMyAyMiAzMiAyNi40NzcgMzIgMzJWMzRIOFYzMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=";

/**
 * 获取用户头像URL
 * @param user 用户对象
 * @returns 头像URL或默认头像
 */
export function getUserAvatar(user: User | null): string {
  if (!user) return DEFAULT_AVATAR;
  
  // 如果用户有emoji头像，创建emoji图像
  if (user.avatar_emoji) {
    // 创建一个包含emoji的SVG
    const emojiSvg = `
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="#f0f0f0"/>
        <text x="20" y="28" text-anchor="middle" font-size="18" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">${user.avatar_emoji}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(emojiSvg)}`;
  }
  
  return DEFAULT_AVATAR;
}

/**
 * 获取用户显示名称
 * @param user 用户对象
 * @returns 用户名或默认名称
 */
export function getUserDisplayName(user: User | null): string {
  return user?.username || '用户';
}
