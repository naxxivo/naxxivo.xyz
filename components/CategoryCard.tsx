
import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
    name: string;
    icon: React.ReactNode;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, icon }) => {
    return (
        <Link to={`/shop?category=${name}`} className="group flex flex-col items-center justify-center p-6 bg-white dark:bg-accent border border-gray-200 dark:border-slate-800 rounded-lg hover:border-gray-300 dark:hover:border-slate-700 hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 mb-4 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {icon}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-text-primary">{name}</h3>
        </Link>
    );
};

export default CategoryCard;