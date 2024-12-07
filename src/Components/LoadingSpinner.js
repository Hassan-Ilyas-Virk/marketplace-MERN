import React from 'react';
import '../styles/spinner.css';

const LoadingSpinner = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4">
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner; 