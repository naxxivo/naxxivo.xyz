
import React from 'react';
import { Link } from 'react-router-dom';
import { AnimeSeries } from '@/types';
import { motion } from 'framer-motion';

interface AnimeSeriesCardProps {
  series: AnimeSeries;
}

const AnimeSeriesCard: React.FC<AnimeSeriesCardProps> = ({ series }) => {
  const fallbackThumbnail = 'https://via.placeholder.com/400x600.png?text=No+Image';

  return (
    <Link to={`/anime/${series.id}`}>
      <div
        className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-105"
      >
        <img
          src={series.thumbnail_url || fallbackThumbnail}
          alt={series.title}
          className="w-full h-full object-cover aspect-[2/3] transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="font-bold text-white text-lg drop-shadow-md">{series.title}</h3>
        </div>
      </div>
    </Link>
  );
};

export default AnimeSeriesCard;
