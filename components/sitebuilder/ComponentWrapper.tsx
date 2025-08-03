
import React from 'react';
import { SiteComponent } from '@/types.ts';
import RenderedComponent from './RenderedComponent.tsx';
import { XCircleIcon } from '@heroicons/react/24/solid';

interface ComponentWrapperProps {
    component: SiteComponent;
    onDelete: (id: number) => void;
    onSelect: () => void;
    isActive: boolean;
}

const ComponentWrapper: React.FC<ComponentWrapperProps> = ({ component, onDelete, onSelect, isActive }) => {
    return (
        <div
            onClick={onSelect}
            className={`w-full h-full p-4 bg-white dark:bg-dark-card rounded-lg shadow-md cursor-pointer transition-all duration-200 overflow-hidden ${isActive ? 'ring-2 ring-accent' : ''}`}
        >
            <RenderedComponent type={component.component_type} data={component.component_data} />
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(component.id);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                title="Delete Component"
            >
                <XCircleIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default ComponentWrapper;