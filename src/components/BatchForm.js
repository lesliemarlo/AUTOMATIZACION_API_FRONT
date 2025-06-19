import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';

const BatchForm = ({ onBatchStart, onProgressUpdate, onBatchComplete, onBatchError }) => {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    interval_days: '7',
    limit: '999999',
    offset: '1',
    portfolio: '07',
    notification_email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dateFormat = 'YYYY-MM-DD HH:mm:ss';

    if (!formData.start_date || !moment(formData.start_date, dateFormat, true).isValid()) {
      toast.error('Fecha de inicio inválida. Use formato: AAAA-MM-DD HH:mm:ss');
      return false;
    }
    if (!formData.end_date || !moment(formData.end_date, dateFormat, true).isValid()) {
      toast.error('Fecha de fin inválida. Use formato: AAAA-MM-DD HH:mm:ss');
      return false;
    }
    if (moment(formData.start_date).isAfter(formData.end_date)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return false;
    }
    if (!formData.interval_days || isNaN(formData.interval_days) || formData.interval_days <= 0) {
      toast.error('Intervalo de días debe ser un número positivo');
      return false;
    }
    if (!formData.limit || isNaN(formData.limit) || formData.limit <= 0) {
      toast.error('Límite debe ser un número positivo');
      return false;
    }
    if (!formData.offset || isNaN(formData.offset) || formData.offset < 0) {
      toast.error('Offset debe ser un número no negativo');
      return false;
    }
    if (!formData.portfolio) {
      toast.error('Portfolio es obligatorio');
      return false;
    }
    if (!formData.notification_email || !emailRegex.test(formData.notification_email)) {
      toast.error('Correo de notificación inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    onBatchStart();

    try {
      const response = await axios.post('http://localhost:8080/api/cliente/batch', null, {
        params: {
          start_date: formData.start_date,
          end_date: formData.end_date,
          interval_days: formData.interval_days,
          limit: formData.limit,
          offset: formData.offset,
          portfolio: formData.portfolio,
          notification_email: formData.notification_email,
        },
      });
      toast.success(response.data);

      // Simular progreso (en un caso real, el backend enviaría actualizaciones)
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgressUpdate(progress);
        if (progress >= 100) {
          clearInterval(interval);
          onBatchComplete();
          setIsSubmitting(false);
        }
      }, 1000);
    } catch (error) {
      const errorMessage = error.response?.data || error.message;
      toast.error(`Error al iniciar el batch: ${errorMessage}`);
      onBatchError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleTestEmail = async () => {
    if (!formData.notification_email) {
      toast.error('Ingrese un correo de notificación');
      return;
    }
    try {
      const response = await axios.get('http://localhost:8080/api/cliente/test-email', {
        params: { to: formData.notification_email },
      });
      toast.success(response.data);
    } catch (error) {
      const errorMessage = error.response?.data || error.message;
      toast.error(`Error al enviar correo de prueba: ${errorMessage}`);
    }
  };

  return (
    <div className="batch-form">
      <h2>Iniciar Proceso Batch</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Fecha de Inicio (AAAA-MM-DD HH:mm:ss)</label>
          <input
            type="text"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            placeholder="2025-06-13 00:00:00"
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label>Fecha de Fin (AAAA-MM-DD HH:mm:ss)</label>
          <input
            type="text"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            placeholder="2025-06-20 23:59:59"
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label>Intervalo de Días</label>
          <input
            type="number"
            name="interval_days"
            value={formData.interval_days}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label>Límite</label>
          <input
            type="number"
            name="limit"
            value={formData.limit}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label>Offset</label>
          <input
            type="number"
            name="offset"
            value={formData.offset}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label>Portfolio</label>
          <input
            type="text"
            name="portfolio"
            value={formData.portfolio}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label>Correo de Notificación</label>
          <input
            type="email"
            name="notification_email"
            value={formData.notification_email}
            onChange={handleChange}
            placeholder="tu-correo@ejemplo.com"
            disabled={isSubmitting}
          />
        </div>
        <div className="form-buttons">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Procesando...' : 'Iniciar Batch'}
          </button>
          <button type="button" onClick={handleTestEmail} disabled={isSubmitting}>
            Probar Correo
          </button>
        </div>
      </form>
    </div>
  );
};

export default BatchForm;