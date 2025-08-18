
export interface User {
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
}

export enum ActivityType {
  POST = 'POST',
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
}

export interface Activity {
  id: number;
  type: ActivityType;
  description: string;
  timestamp: string;
}
