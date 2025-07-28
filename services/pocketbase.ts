import PocketBase from 'pocketbase';
import type { User, Post } from '../types';

const POCKETBASE_URL = 'http://127.0.0.1:8090';

export const pb = new PocketBase(POCKETBASE_URL);

export const getAvatarUrl = (user: { collectionId: string; id: string; avatar: string; }) => {
  if (user.avatar) {
    return `${POCKETBASE_URL}/api/files/${user.collectionId}/${user.id}/${user.avatar}`;
  }
  // Return a placeholder if no avatar is set
  return `https://picsum.photos/seed/${user.id}/200/200`;
};

export const getCoverUrl = (user: User) => {
    if (user.cover) {
        return `${POCKETBASE_URL}/api/files/${user.collectionId}/${user.id}/${user.cover}`;
    }
    // Return a generic placeholder banner
    return `https://placehold.co/1000x250/1f2937/3b82f6?text=Naxxivo`;
};

export const getPostImageUrl = (post: Post) => {
    if (post.image && post.image.length > 0) {
        return `${POCKETBASE_URL}/api/files/${post.collectionId}/${post.id}/${post.image[0]}`;
    }
    return `https://placehold.co/600x400/1f2937/3b82f6?text=No+Image`;
};

export const getPostVideoUrl = (post: Post) => {
    if (post.video && post.video.length > 0) {
        return `${POCKETBASE_URL}/api/files/${post.collectionId}/${post.id}/${post.video[0]}`;
    }
    return '';
};