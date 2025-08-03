
import React from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition.tsx';
import Button from '@/components/ui/Button.tsx';

const NotFoundPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="text-center py-20">
        <h1 className="font-display text-9xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300">
          404
        </h1>
        <h2 className="text-3xl font-bold mt-4">Oops! You've Wandered Off...</h2>
        <p className="mt-2 mb-8">It seems you've found a secret level that doesn't exist yet.</p>
        <Link to="/">
            <Button>Go Back to Home</Button>
        </Link>
      </div>
    </PageTransition>
  );
};

export default NotFoundPage;