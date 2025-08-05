import React from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Logo from '../common/Logo';

interface AuthPageProps {
  onSetMode: (mode: 'login' | 'signup') => void;
}

const Polaroid = ({ src, alt, rotation, position, text, animationDelay }: { src: string, alt: string, rotation: string, position: string, text?: string, animationDelay: number }) => (
  <motion.div
    className={`absolute bg-white p-2 pb-6 shadow-xl w-32 md:w-40 ${position}`}
    style={{ rotate: rotation }}
    initial={{ opacity: 0, y: 100, rotate: 0 }}
    animate={{ opacity: 1, y: 0, rotate: rotation }}
    transition={{ type: 'spring', stiffness: 50, delay: animationDelay }}
  >
    <img src={src} alt={alt} className="w-full h-auto" />
    {text && <p className="text-center font-logo text-gray-700 text-lg mt-2">{text}</p>}
  </motion.div>
);

const AuthPage: React.FC<AuthPageProps> = ({ onSetMode }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-6">
      <header className="w-full max-w-sm mx-auto flex justify-between items-center text-sm">
        <span>3:19</span>
        <div className="flex items-center gap-2">
          <span>📶</span>
          <span>🔋 59%</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="relative w-64 h-64 mb-12">
           <Polaroid 
            src="https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=160" 
            alt="Friendship memories" 
            rotation="-15deg" 
            position="top-0 left-0"
            text="Friendship"
            animationDelay={0.2}
          />
           <Polaroid 
            src="https://images.unsplash.com/photo-1511216335778-75a2a4922437?w=160" 
            alt="Group of friends" 
            rotation="10deg" 
            position="top-8 right-0"
            animationDelay={0.4}
          />
           <Polaroid 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160" 
            alt="Memories" 
            rotation="-5deg" 
            position="bottom-0 left-4"
            text="Memories"
            animationDelay={0.6}
          />
        </div>

        <Logo />

      </main>

      <footer className="w-full max-w-sm mx-auto space-y-3">
        <Button variant="secondary" onClick={() => onSetMode('login')}>Login</Button>
        <Button variant="primary" onClick={() => onSetMode('signup')}>Create new account</Button>
        <p className="text-xs text-center text-gray-400 pt-2">
          By Signing up, you agree to the Terms of use & privacy policy
        </p>
      </footer>
    </div>
  );
};

export default AuthPage;
