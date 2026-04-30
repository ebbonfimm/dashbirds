import { useState } from 'react';
import Chat from './Chat';
import Landing from './Landing';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handleStart = () => {
    setIsTransitioning(true);
    setHasStarted(true);
    // After the transition animation finishes, unmount the landing page
    setTimeout(() => {
      setShowLanding(false);
    }, 1000); // 1000ms matches the CSS transition duration
  };

  const handleBack = () => {
    setIsTransitioning(false);
    setShowLanding(true);
  };

  return (
    <div className="app-container">
      {/* The Chat is rendered underneath, so it's revealed when Landing slides up */}
      <Chat onBack={handleBack} />
      
      {showLanding && (
        <Landing 
          isTransitioning={isTransitioning} 
          isReturning={hasStarted} 
          onStart={handleStart} 
        />
      )}
    </div>
  );
}

export default App;
