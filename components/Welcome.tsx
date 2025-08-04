import React from 'react';
import Button from './common/Button';

interface WelcomeProps {
    setView: (view: 'welcome' | 'login' | 'signup') => void;
}

const WelcomeIllustration = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-64 h-64 mx-auto animate-float drop-shadow-lg">
        <path fill="#8A3FFC" d="M60.6,-59.6C75.8,-46.9,83.4,-23.5,83.1,-0.4C82.7,22.7,74.5,45.4,59.3,59.3C44.1,73.2,22.1,78.3,0.8,77.6C-20.4,76.9,-40.8,70.5,-55.1,57.9C-69.4,45.4,-77.6,26.7,-77.8,7.7C-78,-11.3,-70.2,-30.3,-56.9,-43.8C-43.6,-57.4,-24.8,-65.5,-5.2,-64.8C14.3,-64.1,35.4,-72.2,60.6,-59.6Z" transform="translate(100 100)" />
        <path fill="#FFC700" d="M41.5,-63.9C52.4,-56.1,58.9,-43.1,63.7,-29.3C68.5,-15.5,71.7,-1,70.6,13.2C69.5,27.4,64.2,41.4,53.8,51.8C43.5,62.2,28.2,69,12.3,72.2C-3.6,75.4,-20.1,75,-33.8,68.9C-47.5,62.8,-58.4,51,-65.3,37.3C-72.2,23.6,-75.1,8.1,-72.7,-6.2C-70.2,-20.5,-62.4,-33.7,-51.2,-42.6C-40,-51.5,-25.4,-56.1,-11.9,-59.5C1.6,-62.9,14.1,-65.1,23.9,-65.5C33.7,-65.8,41.5,-63.9,41.5,-63.9Z" transform="translate(100 100) rotate(45) scale(0.8)" />
    </svg>
);


const Welcome: React.FC<WelcomeProps> = ({ setView }) => {
    return (
        <div className="w-full max-w-md mx-auto text-center">
            <WelcomeIllustration />
            <h1 className="text-4xl font-bold text-white mt-8">Welcome to NAXXIVO</h1>
            <p className="text-gray-400 mt-4 max-w-xs mx-auto">
                The place to connect with your friends and share your moments.
            </p>
            <div className="mt-12 space-y-4">
                <Button onClick={() => setView('signup')}>Register</Button>
                <Button onClick={() => setView('login')} variant="secondary">Log In</Button>
            </div>
            <div className="mt-8">
                 <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    World verification
                </a>
            </div>
        </div>
    );
};

export default Welcome;