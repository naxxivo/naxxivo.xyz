import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RenderedComponentProps {
    type: 'text' | 'image' | 'video';
    data: { [key: string]: any };
}

const RenderedComponent: React.FC<RenderedComponentProps> = ({ type, data }) => {
    switch (type) {
        case 'text':
            return (
                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {data.text || ''}
                    </ReactMarkdown>
                </div>
            );
        case 'image':
            return data.url ? (
                <img src={data.url} alt="User content" className="w-full h-full object-contain" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-dark-bg text-sm text-gray-500">
                    Image URL needed
                </div>
            );
        case 'video':
            // Basic video rendering, can be improved with a proper player
            return data.url ? (
                <video src={data.url} controls className="w-full h-full" />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-dark-bg text-sm text-gray-500">
                    Video URL needed
                </div>
            );
        default:
            return null;
    }
};

export default RenderedComponent;
