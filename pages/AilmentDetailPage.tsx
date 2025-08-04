


import React from 'react';
import { useParams, Link } from 'react-router-dom';
import PageTransition from '../components/ui/PageTransition';
import { ailments } from '../data/healthData';
import { ShieldExclamationIcon } from '@heroicons/react/24/solid';

const RemedySection: React.FC<{ title: string; remedies: { name: string; description: string }[]; icon: React.ElementType }> = ({ title, remedies, icon: Icon }) => (
    <div className="bg-white/50 dark:bg-dark-bg/50 p-6 rounded-xl shadow-inner">
        <div className="flex items-center gap-3 mb-4">
            <Icon className="h-8 w-8 text-accent" />
            <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <ul className="space-y-4">
            {remedies.map((remedy, index) => (
                <li key={index}>
                    <p className="font-semibold">{remedy.name}</p>
                    <p className="text-sm text-secondary-purple/90 dark:text-dark-text/90">{remedy.description}</p>
                </li>
            ))}
        </ul>
    </div>
);

const AilmentDetailPage: React.FC = () => {
  const { ailmentId } = useParams<{ ailmentId: string }>();
  const ailment = ailments.find(a => a.id === ailmentId);

  if (!ailment) {
    return (
      <PageTransition>
        <div className="text-center py-20">
          <h1 className="font-display text-4xl">Ailment Not Found</h1>
          <p className="mt-4">The health information you're looking for could not be found.</p>
          <Link to="/health" className="mt-6 inline-block text-accent hover:underline">
            &larr; Back to Health Hub
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/health" className="text-accent hover:underline font-semibold mb-4 inline-block">
            &larr; Back to Health Hub
          </Link>
          <h1 className="font-display text-4xl md:text-5xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent">
            {ailment.name}
          </h1>
          <p className="text-lg mt-2 text-secondary-purple/80 dark:text-dark-text/80">
            {ailment.description}
          </p>
        </div>
        
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-r-lg mb-8" role="alert">
          <div className="flex">
            <div className="py-1">
                <ShieldExclamationIcon className="h-6 w-6 text-red-500 mr-4"/>
            </div>
            <div>
              <p className="font-bold">Important Disclaimer</p>
              <p className="text-sm">This information is for general knowledge only. Consult a professional doctor for any health issues. In case of serious illness, contact a hospital.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RemedySection title="Pharmaceutical Remedies" remedies={ailment.pharmaceuticalRemedies} icon={ailment.icon} />
            <RemedySection title="Home Remedies" remedies={ailment.homeRemedies} icon={ailment.icon} />
        </div>
      </div>
    </PageTransition>
  );
};

export default AilmentDetailPage;