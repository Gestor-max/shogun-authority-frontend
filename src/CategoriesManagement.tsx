import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { FolderPlus, Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { API_BASE_URL } from './config';

interface CategoryItem {
  id: number;
  name: string;
  description?: string;
  authorities?: any[];
}

const CategoriesManagement: React.FC = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar categorías');
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCategories();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const url = editingCat ? `${API_BASE_URL}/categories/${editingCat.id}` : `${API_BASE_URL}/categories`;
      const method = editingCat ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al guardar categoría');
      }

      setSuccess(editingCat ? 'Categoría actualizada' : 'Categoría creada con éxito');
      setShowModal(false);
      setName('');
      setDescription('');
      setEditingCat(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openEdit = (cat: CategoryItem) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar categoría');
      setSuccess('Categoría eliminada');
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#5bc0be' }}>
            <FolderPlus size={26} /> Gestión de Categorías
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Creación, edición y administración de temáticas para portales authority.
          </p>
        </div>
        <button 
          onClick={() => { setEditingCat(null); setName(''); setDescription(''); setShowModal(true); }}
          style={{ width: 'auto' }}
        >
          <Plus size={18} /> Nueva Categoría
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Cargando categorías...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Categoría</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No hay categorías creadas.
                  </td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id}>
                    <td>#{cat.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Tag size={16} style={{ color: '#5bc0be' }} />
                        <strong style={{ color: 'var(--text)' }}>{cat.name}</strong>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{cat.description || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-secondary"
                          style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => openEdit(cat)}
                        >
                          <Edit2 size={14} /> Editar
                        </button>
                        <button 
                          className="btn-danger"
                          style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => handleDelete(cat.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear / Editar Categoría */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingCat ? 'Editar Categoría' : 'Crear Nueva Categoría'}</h3>
            <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Nombre de la Categoría *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Ej. Tecnología & Software"
                />
              </div>

              <div className="form-group">
                <label>Descripción (Opcional)</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Breve explicación de la categoría..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit">
                  {editingCat ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
