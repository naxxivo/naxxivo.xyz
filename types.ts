import type { RecordModel } from 'pocketbase';

export interface User extends RecordModel {
  email: string;
  emailVisibility: boolean;
  verified: boolean;
  name: string;
  avatar: string;
  cover?: string;
  bio?: string;
  contect?: string;
  facebook?: string;
  youtube?: string;
}

export interface Like extends RecordModel {
  user: string;
  post: string;
}

export interface Comment extends RecordModel {
  content: string;
  post: string;
  user: string;
  expand?: {
    user: User;
  };
}

export interface Follow extends RecordModel {
  follower: string; // user who is doing the following
  following: string; // user who is being followed
}

export interface Post extends RecordModel {
  title: string;
  description: string;
  image: string[];
  video?: string[];
  videox?: string;
  user: string;
  tags?: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  profile?: string;
  expand?: {
    user: User;
  };
}

export interface Notification extends RecordModel {
  user: string; // The user receiving the notification
  source_user: string; // The user who triggered the notification
  post?: string; // The post related to the notification (for likes/comments)
  type: 'like' | 'comment' | 'follow';
  read: boolean;
  expand?: {
    source_user: User;
    post?: Post;
  };
}
