// 可选的头像emoji列表
export const AVATAR_EMOJIS = [
  '👤', // 默认用户
  '😀', // 开心
  '😎', // 酷
  '🤓', // 书呆子
  '😇', // 天使
  '🥳', // 庆祝
  '🤔', // 思考
  '😴', // 睡觉
  '🤗', // 拥抱
  '🙂', // 微笑
  '😊', // 害羞
  '😄', // 大笑
  '🧐', // 单片眼镜
  '🤨', // 疑惑
  '😋', // 美味
  '🤠', // 牛仔
  '🥸', // 伪装
  '🤖', // 机器人
  '👨‍💻', // 程序员
  '👩‍💻', // 女程序员
  '🏃‍♂️', // 跑步男
  '🏃‍♀️', // 跑步女
  '🏋️‍♂️', // 举重男
  '🏋️‍♀️', // 举重女
  '🏸', // 羽毛球
  '🏀', // 篮球
  '⚽', // 足球
  '🎾', // 网球
  '🏓', // 乒乓球
  '🏐', // 排球
] as const;

// 获取随机emoji
export function getRandomAvatar(): string {
  const randomIndex = Math.floor(Math.random() * AVATAR_EMOJIS.length);
  return AVATAR_EMOJIS[randomIndex];
}

// 验证emoji是否有效
export function isValidAvatarEmoji(emoji: string): boolean {
  return AVATAR_EMOJIS.includes(emoji as any);
}
