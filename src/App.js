import React, { useState } from 'react';
import BatchForm from './components/BatchForm';
import ProgressBar from './components/ProgressBar';
import LogPanel from './components/LogPanel';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

function App() {
  const [progress, setProgress] = useState(0);
  const [batchStatus, setBatchStatus] = useState('');

  const handleBatchStart = () => {
    setProgress(0);
    setBatchStatus('Iniciando batch...');
  };

  const handleProgressUpdate = (newProgress) => {
    setProgress(newProgress);
    setBatchStatus(`Procesando: ${newProgress}% completado`);
  };

  const handleBatchComplete = () => {
    setBatchStatus('Batch completado con éxito');
  };

  const handleBatchError = (error) => {
    setBatchStatus(`Error: ${error}`);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Automatización InformaPerú</h1>
      </header>
      <main>
        <BatchForm
          onBatchStart={handleBatchStart}
          onProgressUpdate={handleProgressUpdate}
          onBatchComplete={handleBatchComplete}
          onBatchError={handleBatchError}
        />
        <ProgressBar progress={progress} status={batchStatus} />
        <LogPanel />
      </main>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

export default App;