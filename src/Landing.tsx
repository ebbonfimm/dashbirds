import React from 'react';
import { ArrowRight } from 'lucide-react';
import './Landing.css';

interface LandingProps {
  isTransitioning: boolean;
  isReturning: boolean;
  onStart: () => void;
}

export default function Landing({ isTransitioning, isReturning, onStart }: LandingProps) {
  return (
    <div className={`landing-container ${isTransitioning ? 'slide-up' : ''} ${isReturning && !isTransitioning ? 'expand-in' : ''}`}>
      <div className="landing-content">
        <h1 className="landing-title">Dashbirds</h1>
        <p className="landing-subtitle">In data we trust, in marketing we believe</p>
        <button className="start-button" onClick={onStart}>
          Start chatting
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
