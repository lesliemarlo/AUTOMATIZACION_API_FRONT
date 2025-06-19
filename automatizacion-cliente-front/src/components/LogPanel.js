import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const LogPanel = () => {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [usePolling, setUsePolling] = useState(false);
  const eventSourceRef = useRef(null);
  const pollingRef = useRef(null);

  const API_BASE = 'http://localhost:8080/api/cliente';

  // Función para obtener logs via HTTP (fallback)
  const fetchLogs = async () => {
    try {
      console.log('🔄 Fetching logs via HTTP...');
      const response = await axios.get(`${API_BASE}/logs`);
      
      if (response.data && response.data.logs) {
        setLogs(response.data.logs);
        setError(null);
        console.log('✅ Logs obtenidos:', response.data.logs.length);
      }
    } catch (error) {
      console.error('❌ Error fetching logs:', error);
      setError(`Error HTTP: ${error.message}`);
    }
  };

  // Conectar via Server-Sent Events
  const connectSSE = () => {
    try {
      console.log('🔗 Intentando conexión SSE...');
      eventSourceRef.current = new EventSource(`${API_BASE}/logs/stream`);
      
      eventSourceRef.current.onopen = () => {
        console.log('✅ SSE conectado');
        setIsConnected(true);
        setError(null);
        setUsePolling(false);
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          const logData = JSON.parse(event.data);
          console.log('📨 Log recibido via SSE:', logData);
          
          setLogs(prevLogs => {
            // Evitar duplicados
            const exists = prevLogs.some(log => 
              log.timestamp === logData.timestamp && log.message === logData.message
            );
            return exists ? prevLogs : [...prevLogs, logData];
          });
        } catch (e) {
          console.error('Error parsing SSE data:', e);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('❌ SSE Error:', error);
        setIsConnected(false);
        setError('SSE desconectado. Usando polling HTTP...');
        
        // Fallback a polling
        setUsePolling(true);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };

    } catch (error) {
      console.error('❌ Error conectando SSE:', error);
      setUsePolling(true);
    }
  };

  // Efecto principal
  useEffect(() => {
    // Intentar SSE primero
    connectSSE();

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Polling HTTP como fallback
  useEffect(() => {
    if (usePolling) {
      console.log('🔄 Iniciando polling HTTP...');
      fetchLogs(); // Fetch inicial
      
      pollingRef.current = setInterval(fetchLogs, 2000); // Cada 2 segundos
      
      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }
  }, [usePolling]);

  // Función para hacer test
  const handleTest = async () => {
    try {
      console.log('🧪 Enviando test...');
      const response = await axios.post(`${API_BASE}/test`);
      console.log('✅ Test enviado:', response.data);
    } catch (error) {
      console.error('❌ Error en test:', error);
      setError(`Error en test: ${error.message}`);
    }
  };

  // Limpiar logs
  const handleClear = async () => {
    try {
      await axios.delete(`${API_BASE}/logs`);
      setLogs([]);
    } catch (error) {
      console.error('Error limpiando logs:', error);
    }
  };

  const getLogClass = (level) => {
    switch (level?.toUpperCase()) {
      case 'ERROR': return 'log-error';
      case 'WARN': return 'log-warn';
      case 'INFO': return 'log-info';
      default: return 'log-debug';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Logs en Tiempo Real</h2>
      
      {/* Estado de conexión */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px',
          fontWeight: 'bold',
          background: isConnected ? '#d4edda' : (usePolling ? '#fff3cd' : '#f8d7da'),
          color: isConnected ? '#155724' : (usePolling ? '#856404' : '#721c24')
        }}>
          {isConnected ? '🟢 SSE Conectado' : (usePolling ? '🟡 HTTP Polling' : '🔴 Desconectado')}
        </span>
        
        <button onClick={handleTest} style={{
          padding: '8px 16px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          🧪 Probar Logs
        </button>
        
        <button onClick={handleClear} style={{
          padding: '8px 16px',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          🗑️ Limpiar
        </button>
        
        <button onClick={fetchLogs} style={{
          padding: '8px 16px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          🔄 Refrescar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Logs */}
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        height: '400px',
        overflow: 'auto',
        background: '#f8f9fa',
        padding: '10px'
      }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            📋 No hay logs disponibles. Haz clic en "Probar Logs" para generar algunos.
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{
              padding: '8px',
              marginBottom: '4px',
              borderRadius: '4px',
              borderLeft: `4px solid ${
                log.level === 'ERROR' ? '#dc3545' : 
                log.level === 'WARN' ? '#ffc107' : 
                log.level === 'INFO' ? '#17a2b8' : '#6c757d'
              }`,
              background: 'white',
              fontSize: '13px',
              fontFamily: 'monospace'
            }}>
              <strong>[{log.level}]</strong> [{log.timestamp}] {log.message}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Total logs: {logs.length} | Método: {isConnected ? 'Server-Sent Events' : (usePolling ? 'HTTP Polling' : 'Desconectado')}
      </div>
    </div>
  );
};

export default LogPanel;
