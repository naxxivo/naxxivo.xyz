
import React from 'react';

export const AnimeLoader: React.FC = () => {
  const colors = ['#FF6584', '#6A5ACD', '#FFD166', '#FF8E72', '#2E294E'];
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="flex space-x-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-4 h-12 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.1}s`,
              backgroundColor: colors[i],
            }}
          ></div>
        ))}
      </div>
      <p className="font-display text-black mt-4 text-lg animate-pulse">
        Loading... 頑張って!
      </p>
    </div>
  );
};
