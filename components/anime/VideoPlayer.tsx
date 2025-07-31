
import React from 'react';

interface VideoPlayerProps {
  url: string;
  className?: string;
  autoplay?: boolean;
  muted?: boolean;
}

const getEmbedUrl = (url: string, autoplay: boolean, muted: boolean): string | null => {
  let embedUrl: string | null = null;
  const autoplayParams: { [key: string]: string } = {
    youtube: '&autoplay=1&mute=1',
    facebook: '&autoplay=true&mute=true'
  };
  
  try {
    const urlObj = new URL(url);
    
    // YouTube
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&controls=0`;
    } else if (urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.pathname.slice(1);
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&controls=0`;
    }
    
    // Google Drive
    else if (urlObj.hostname.includes('drive.google.com')) {
      const match = url.match(/file\/d\/([^/]+)/);
      if (match && match[1]) {
          embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    
    // Facebook (basic iframe, might be restricted)
    else if (urlObj.hostname.includes('facebook.com')) {
        embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`;
    }

    // Append autoplay and mute parameters if applicable
    if (embedUrl && autoplay) {
        if (embedUrl.includes('youtube.com')) {
            embedUrl += autoplayParams.youtube;
        } else if (embedUrl.includes('facebook.com')) {
            embedUrl += autoplayParams.facebook;
        }
    }

  } catch (error) {
    console.error("Invalid URL for video player:", error);
    return null;
  }
  
  return embedUrl;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, className, autoplay = false, muted = false }) => {
  const embedUrl = getEmbedUrl(url, autoplay, muted);

  const containerClasses = className || "aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl shadow-primary-blue/30";

  if (!embedUrl) {
    return (
      <div className={containerClasses}>
        <div className="w-full h-full flex items-center justify-center text-white bg-black p-4 text-center">
          <p>Unsupported video URL or format.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <iframe
        src={embedUrl}
        title="Video Player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
