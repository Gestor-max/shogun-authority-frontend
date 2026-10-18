import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Link as LinkIcon, Save, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from './config';

const NewUrl: React.FC = () => {
  const [url, setUrl] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(
        `${API_BASE_URL}/urls`,
        { url, comment, status: Number(status) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/urls');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al guardar la URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Link to="/urls" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={18} /> Volver a URLs
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '0.75rem', color: 'white' }}>
            <LinkIcon size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Registrar Nueva URL</h1>
            <p className="subtitle" style={{ margin: 0, textAlign: 'left' }}>Agrega un enlace web para su seguimiento e indexación</p>
          </div>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <div className="form-group">
            <label>URL *</label>
            <input
              type="url"
              placeholder="https://ejemplo.com/articulo-importante"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Comentario / Descripción *</label>
            <textarea
              placeholder="Ingresa notas o detalles sobre este enlace..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text)' }}
              required
            />
          </div>

          <div className="form-group">
            <label>Estado Inicial</label>
            <select value={status} onChange={(e) => setStatus(Number(e.target.value))}>
              <option value={0}>Pendiente</option>
              <option value={1}>Finalizado</option>
              <option value={2}>Cancelado</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
          >
            <Save size={18} /> {loading ? 'Guardando...' : 'Guardar URL'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewUrl;
