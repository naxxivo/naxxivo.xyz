
import React from 'react';
import { useCountdown } from '../hooks/useCountdown';

interface CountdownTimerProps {
  targetDate: Date;
}

const TimerBox: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm rounded-lg w-20 h-20 text-white">
    <span className="text-3xl font-bold">{value.toString().padStart(2, '0')}</span>
    <span className="text-xs uppercase">{label}</span>
  </div>
);

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const { days, hours, minutes, seconds } = useCountdown(targetDate);

  return (
    <div className="flex items-center space-x-4">
      <TimerBox value={days} label="Days" />
      <TimerBox value={hours} label="Hours" />
      <TimerBox value={minutes} label="Minutes" />
      <TimerBox value={seconds} label="Seconds" />
    </div>
  );
};

export default CountdownTimer;
