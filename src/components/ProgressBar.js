import React from 'react';

const ProgressBar = ({ progress, status }) => {
  return (
    <div className="progress-bar-container">
      <h3>Estado del Batch</h3>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
      <p>{status}</p>
    </div>
  );
};

export default ProgressBar;