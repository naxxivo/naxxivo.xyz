
import React, { useEffect, useCallback } from 'react';

export const usePetals = (enabled: boolean = true) => {
  const createPetal = useCallback(() => {
    const petal = document.createElement('div');
    petal.className = 'petal';
    const randomX = Math.random() * 100;
    const randomOpacity = Math.random() * 0.5 + 0.5;
    const randomSize = Math.random() * 10 + 15; // 15px to 25px
    petal.style.left = `${randomX}vw`;
    petal.style.animationDuration = Math.random() * 5 + 5 + 's'; // 5s to 10s
    petal.style.opacity = `${randomOpacity}`;
    petal.style.width = `${randomSize}px`;
    petal.style.height = `${randomSize}px`;

    document.body.appendChild(petal);
    
    setTimeout(() => {
      petal.remove();
    }, 10000); // Remove after 10s
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(createPetal, 500);

    return () => {
      clearInterval(interval);
      // Clean up any existing petals when component unmounts or effect reruns
      document.querySelectorAll('.petal').forEach(e => e.remove());
    };
  }, [enabled, createPetal]);
};
