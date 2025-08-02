
import React, { useState, useEffect, useRef } from 'react';
import { Post } from '@/types';
import VideoPlayer from '@/components/anime/VideoPlayer';
import ShortsUI from '@/components/shorts/ShortsUI';

interface ShortsPlayerProps {
    post: Post;
}

const ShortsPlayer: React.FC<ShortsPlayerProps> = ({ post }) => {
    const videoRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsPlaying(true);
                } else {
                    setIsPlaying(false);
                }
            },
            {
                threshold: 0.5, // 50% of the video must be visible
            }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

    return (
        <div ref={videoRef} className="w-full h-full bg-black flex items-center justify-center">
            {post.content_url && (
                 <VideoPlayer
                    url={post.content_url}
                    autoplay={isPlaying}
                    muted={true}
                    className="w-full h-full object-contain"
                />
            )}
            <ShortsUI post={post} />
        </div>
    );
};

export default ShortsPlayer;
