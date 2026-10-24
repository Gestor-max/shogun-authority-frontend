import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './i18n/LanguageContext';
import { FolderPlus, Plus, Edit2, Trash2, Tag, X } from 'lucide-react';
import { API_BASE_URL } from './config';

interface CategoryItem {
  id: number;
  name: string;
  description?: string;
  authorities?: any[];
}

const CategoriesManagement: React.FC = () => {
  const { token } = useAuth();
  const { t } = useLanguage();
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
      if (!res.ok) throw new Error(t.common.error);
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
        throw new Error(data.message || t.common.error);
      }

      setSuccess(editingCat ? t.admin.categoryUpdatedSuccess : t.admin.categoryCreatedSuccess);
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
    if (!window.confirm(t.admin.deleteCategoryConfirm)) return;
    setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(t.common.error);
      setSuccess(t.admin.categoryDeletedSuccess);
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t.admin.categoriesTitle}
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            {t.admin.categoriesSubtitle}
          </p>
        </div>
        <button 
          onClick={() => { setEditingCat(null); setName(''); setDescription(''); setShowModal(true); }}
          className="btn-primary"
          style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={18} /> {t.admin.newCategoryBtn}
        </button>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="success-message" style={{ marginBottom: '1rem' }}>{success}</div>}

      <div className="card">
        <div className="card-header">
          <h3>
            <FolderPlus size={18} /> {t.admin.categoryListTitle}
          </h3>
          <span className="card-header-badge">{categories.length} {t.admin.categoriesCountBadge}</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              {t.admin.loadingCategories}
            </div>
          ) : (
            <div className="table-responsive" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>{t.admin.colId}</th>
                    <th>{t.admin.colCategoryName}</th>
                    <th>{t.admin.colCategoryDesc}</th>
                    <th style={{ textAlign: 'right' }}>{t.admin.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                        {t.admin.noCategories}
                      </td>
                    </tr>
                  ) : (
                    categories.map(cat => (
                      <tr key={cat.id}>
                        <td><strong>#{cat.id}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Tag size={15} style={{ color: 'var(--primary)' }} />
                            <strong style={{ color: 'var(--text-primary)' }}>{cat.name}</strong>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{cat.description || '-'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn-secondary"
                              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                              onClick={() => openEdit(cat)}
                            >
                              <Edit2 size={13} /> {t.common.edit}
                            </button>
                            <button 
                              className="btn-danger"
                              style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                              onClick={() => handleDelete(cat.id)}
                            >
                              <Trash2 size={13} />
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
        </div>
      </div>

      {/* Modal Crear / Editar Categoría */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCat ? t.admin.editCategoryTitle : t.admin.createCategoryTitle}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn" title={t.common.close}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label>{t.admin.categoryNameLabel}</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder={t.admin.categoryNamePlaceholder}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label>{t.admin.categoryDescLabel}</label>
                  <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    placeholder={t.admin.categoryDescPlaceholder}
                  />
                </div>

                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary" style={{ width: 'auto' }} onClick={() => setShowModal(false)}>
                    {t.common.cancel}
                  </button>
                  <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                    {editingCat ? t.admin.saveCategoryChanges : t.admin.createCategoryBtn}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
