import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-animation"></div>
      <div className="absolute inset-0">
        <div className="absolute h-[50vh] w-[50vh] top-[-25vh] left-[-25vh] rounded-full bg-blue-500 mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute h-[50vh] w-[50vh] top-[-25vh] right-[-25vh] rounded-full bg-purple-500 mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute h-[50vh] w-[50vh] bottom-[-25vh] left-[-25vh] rounded-full bg-pink-500 mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default AnimatedBackground;