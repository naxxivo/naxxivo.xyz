
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition.tsx';
import { ailments } from '@/components/ui/data/healthData.ts';
import AilmentCard from '@/components/health/AilmentCard.tsx';
import { motion } from 'framer-motion';
import { ShieldExclamationIcon } from '@heroicons/react/24/solid';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const HealthHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAilment, setSelectedAilment] = useState('');

  const handleSymptomSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ailmentId = e.target.value;
    setSelectedAilment(ailmentId);
    if (ailmentId) {
      navigate(`/health/${ailmentId}`);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-6xl font-bold from-accent to-primary-blue bg-gradient-to-r bg-clip-text text-transparent mb-2">
            Health Hub
          </h1>
          <p className="text-lg text-secondary-purple/80 dark:text-dark-text/80">
            Common health issues & remedies.
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
        
        {/* Interactive Symptom Checker ("Bot") */}
        <div className="mb-12">
            <label htmlFor="symptom-selector" className="block text-xl font-bold mb-2 text-center">What is your issue?</label>
            <select
                id="symptom-selector"
                value={selectedAilment}
                onChange={handleSymptomSelect}
                className="w-full max-w-md mx-auto block px-4 py-3 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-2 border-primary-blue/20 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 outline-none shadow-lg text-lg"
            >
                <option value="" disabled>Select an issue...</option>
                {ailments.map(ailment => (
                    <option key={ailment.id} value={ailment.id}>{ailment.name}</option>
                ))}
            </select>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {ailments.map(ailment => (
            <AilmentCard key={ailment.id} ailment={ailment} />
          ))}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default HealthHubPage;