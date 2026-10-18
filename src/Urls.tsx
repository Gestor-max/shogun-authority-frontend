import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { Link as LinkIcon, Plus, Search, Trash2, Edit2, CheckCircle2, Clock, XCircle, X, Save, ExternalLink, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from './config';

interface UrlItem {
  id: number;
  url: string;
  comment: string;
  status: number; // 0: pending, 1: finished, 2: cancelled
  created_at: string;
}

const Urls: React.FC = () => {
  const { token } = useAuth();
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingUrl, setEditingUrl] = useState<UrlItem | null>(null);

  const fetchUrls = async (searchQuery = search, statusQuery = statusFilter) => {
    try {
      let queryParams = [];
      if (searchQuery) queryParams.push(`search=${encodeURIComponent(searchQuery)}`);
      if (statusQuery !== '') queryParams.push(`status=${statusQuery}`);
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

      const res = await axios.get(`${API_BASE_URL}/urls${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUrls(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUrls(search, statusFilter);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta URL?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/urls/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUrls(search, statusFilter);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (urlItem: UrlItem, newStatus: number) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/urls/${urlItem.id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUrls(search, statusFilter);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUrl) return;
    try {
      await axios.patch(
        `${API_BASE_URL}/urls/${editingUrl.id}`,
        {
          url: editingUrl.url,
          comment: editingUrl.comment,
          status: Number(editingUrl.status),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingUrl(null);
      fetchUrls(search, statusFilter);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="category-tag" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={13} /> Finalizado
          </span>
        );
      case 2:
        return (
          <span className="category-tag" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <XCircle size={13} /> Cancelado
          </span>
        );
      default:
        return (
          <span className="category-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={13} /> Pendiente
          </span>
        );
    }
  };

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Gestión de URLs</h1>
          <p className="subtitle" style={{ textAlign: 'left', margin: 0 }}>
            Monitorea e indexa enlaces web con control de estado
          </p>
        </div>
        <Link to="/urls/new" className="btn btn-primary">
          <Plus size={18} /> Nueva URL
        </Link>
      </div>

      {/* Controles de Búsqueda y Filtro de Estado */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <form onSubmit={handleSearch} className="search-bar" style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por URL o comentario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.75rem' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Buscar</button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} style={{ color: 'var(--text-muted)' }} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.75rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text)', cursor: 'pointer' }}
          >
            <option value="">Todos los Estados</option>
            <option value="0">Pendientes</option>
            <option value="1">Finalizados</option>
            <option value="2">Cancelados</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div>Cargando URLs...</div>
      ) : urls.length === 0 ? (
        <div className="empty-state">
          <LinkIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No se encontraron URLs</h3>
          <p>Comienza agregando enlaces web para su indexación.</p>
          <Link to="/urls/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            <Plus size={18} /> Registrar URL
          </Link>
        </div>
      ) : (
        <div className="notes-grid">
          {urls.map((item) => (
            <div key={item.id} className="note-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  {getStatusBadge(item.status)}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <a
                    href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', wordBreak: 'break-all' }}
                  >
                    {item.url} <ExternalLink size={14} />
                  </a>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', background: 'var(--input-bg)', padding: '0.75rem', borderRadius: '0.5rem', fontStyle: 'italic' }}>
                  "{item.comment}"
                </p>
              </div>

              <div>
                {/* Selector rápido de cambio de estado */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <button
                    onClick={() => handleStatusChange(item, 0)}
                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', borderRadius: '0.4rem', border: 'none', cursor: 'pointer', background: item.status === 0 ? '#f59e0b' : 'rgba(245, 158, 11, 0.1)', color: item.status === 0 ? 'white' : '#f59e0b', fontWeight: 600 }}
                  >
                    Pendiente
                  </button>
                  <button
                    onClick={() => handleStatusChange(item, 1)}
                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', borderRadius: '0.4rem', border: 'none', cursor: 'pointer', background: item.status === 1 ? '#22c55e' : 'rgba(34, 197, 94, 0.1)', color: item.status === 1 ? 'white' : '#22c55e', fontWeight: 600 }}
                  >
                    Finalizado
                  </button>
                  <button
                    onClick={() => handleStatusChange(item, 2)}
                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', borderRadius: '0.4rem', border: 'none', cursor: 'pointer', background: item.status === 2 ? '#ef4444' : 'rgba(239, 68, 68, 0.1)', color: item.status === 2 ? 'white' : '#ef4444', fontWeight: 600 }}
                  >
                    Cancelado
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => setEditingUrl(item)}
                    className="btn btn-icon"
                    title="Editar URL"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-icon"
                    title="Eliminar URL"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edición */}
      {editingUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="container" style={{ maxWidth: '500px', width: '90%', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Editar URL</h2>
              <button onClick={() => setEditingUrl(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit}>
              <div className="form-group">
                <label>URL</label>
                <input
                  type="url"
                  value={editingUrl.url}
                  onChange={(e) => setEditingUrl({ ...editingUrl, url: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Comentario / Notas</label>
                <textarea
                  value={editingUrl.comment}
                  onChange={(e) => setEditingUrl({ ...editingUrl, comment: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text)' }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select
                  value={editingUrl.status}
                  onChange={(e) => setEditingUrl({ ...editingUrl, status: Number(e.target.value) })}
                >
                  <option value={0}>Pendiente</option>
                  <option value={1}>Finalizado</option>
                  <option value={2}>Cancelado</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingUrl(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Save size={18} /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Urls;
