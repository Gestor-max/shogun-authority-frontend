import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from './config';
import {
  Search,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Archive,
  RefreshCw,
  X,
  FileJson,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MapPin,
  Globe
} from 'lucide-react';

export interface CategoryItem {
  id: number;
  name: string;
  description?: string;
}

export interface LocationItem {
  id: number;
  name: string;
  iso?: string;
  type?: string;
}

export interface AuthoritySite {
  id: number;
  title?: string;
  description?: string;
  portal: string;
  link?: string;
  country?: string;
  location_id?: number;
  location?: LocationItem;
  language?: string;
  main_category?: string;
  category_id?: number;
  category?: CategoryItem;
  also_accepting?: string;
  accepts_gambling?: boolean;
  accepts_cbd?: boolean;
  accepts_crypto?: boolean;
  accepts_adult?: boolean;
  accepts_pharmacy?: boolean;
  accepts_loans?: boolean;
  dr?: string;
  traffic?: string;
  keywords?: string;
  rd?: string;
  ld?: string;
  da?: string;
  pa?: string;
  ss?: string;
  age?: string;
  price?: string;
  cost_price?: string;
  min_final_price?: number;
  max_final_price?: number;
  min_base_price?: number;
  max_base_price?: number;
  min_discount?: number;
  max_discount?: number;
  is_verified?: boolean;
  source?: string;
  external_id?: number;
  favicon?: string;
  status: number; // 0: Pending, 1: Active, 2: Archived
  created_at: string;
}

const Authorities: React.FC = () => {
  const { token, user } = useAuth();
  const isAdmin = user?.rol_id === 1;
  const [sites, setSites] = useState<AuthoritySite[]>([]);
  const [dbCategories, setDbCategories] = useState<CategoryItem[]>([]);
  const [dbLocations, setDbLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Range filters
  const [minDr, setMinDr] = useState('');
  const [maxDr, setMaxDr] = useState('');
  const [minTraffic, setMinTraffic] = useState('');
  const [maxTraffic, setMaxTraffic] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState<AuthoritySite | null>(null);
  const [buyingSite, setBuyingSite] = useState<AuthoritySite | null>(null);
  const [buyComments, setBuyComments] = useState('');
  const [buyError, setBuyError] = useState('');
  const [buySubmitting, setBuySubmitting] = useState(false);
  const [editingSite, setEditingSite] = useState<AuthoritySite | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    portal: '',
    link: '',
    country: 'United States',
    location_id: undefined as number | undefined,
    language: 'English',
    main_category: 'News & Media',
    category_id: undefined as number | undefined,
    also_accepting: '',
    accepts_gambling: false,
    accepts_cbd: false,
    accepts_crypto: false,
    accepts_adult: false,
    accepts_pharmacy: false,
    accepts_loans: false,
    dr: '50',
    traffic: '1000',
    keywords: '500',
    rd: '100',
    ld: '50',
    da: '40',
    pa: '35',
    ss: '0',
    age: '1',
    price: 'From $50.00',
    status: 1
  });

  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState('');

  const fetchSites = async (targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(targetPage));
      params.append('limit', String(limit));
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (locationFilter !== 'ALL') params.append('locationId', locationFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (minDr) params.append('minDr', minDr);
      if (maxDr) params.append('maxDr', maxDr);
      if (minTraffic) params.append('minTraffic', minTraffic);
      if (maxTraffic) params.append('maxTraffic', maxTraffic);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const [sitesRes, catRes, locRes] = await Promise.all([
        fetch(`${API_BASE_URL}/authorities?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
        dbCategories.length === 0 ? fetch(`${API_BASE_URL}/categories`, { headers: { Authorization: `Bearer ${token}` } }) : null,
        dbLocations.length === 0 ? fetch(`${API_BASE_URL}/locations`, { headers: { Authorization: `Bearer ${token}` } }) : null,
      ]);

      if (sitesRes.ok) {
        const data = await sitesRes.json();
        if (data && Array.isArray(data.data)) {
          setSites(data.data);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        } else if (Array.isArray(data)) {
          setSites(data);
          setTotal(data.length);
          setTotalPages(1);
        }
      }
      if (catRes && catRes.ok) {
        const cats = await catRes.json();
        setDbCategories(cats);
      }
      if (locRes && locRes.ok) {
        const locs = await locRes.json();
        setDbLocations(locs);
      }
    } catch (err) {
      console.error('Error fetching authority data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search & slider changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchSites(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm, minDr, maxDr, minTraffic, maxTraffic, minPrice, maxPrice]);

  // Immediate fetch on page, limit, or dropdown changes
  useEffect(() => {
    if (token) {
      fetchSites(page);
    }
  }, [page, limit, categoryFilter, locationFilter, statusFilter, sortBy, sortOrder, token]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSite ? `${API_BASE_URL}/authorities/${editingSite.id}` : `${API_BASE_URL}/authorities`;
      const method = editingSite ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowAddModal(false);
        setEditingSite(null);
        resetForm();
        fetchSites();
      }
    } catch (err) {
      console.error('Error saving site:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este portal de autoridad?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/authorities/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSites(sites.filter(s => s.id !== id));
        if (selectedSite?.id === id) setSelectedSite(null);
      }
    } catch (err) {
      console.error('Error deleting site:', err);
    }
  };

  const handleImportJson = async () => {
    if (!importJsonText.trim()) return;
    try {
      setImportStatus('Procesando datos JSON...');
      const parsed = JSON.parse(importJsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      const res = await fetch(`${API_BASE_URL}/authorities/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(items)
      });

      if (res.ok) {
        setImportStatus(`¡Éxito! Importados ${items.length} portales.`);
        setTimeout(() => {
          setShowImportModal(false);
          setImportJsonText('');
          setImportStatus('');
          fetchSites();
        }, 1200);
      } else {
        setImportStatus('Error al enviar los datos al servidor.');
      }
    } catch (err: any) {
      setImportStatus(`JSON inválido: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      portal: '',
      link: '',
      country: dbLocations[0]?.name || 'United States',
      location_id: dbLocations[0]?.id,
      language: 'English',
      main_category: dbCategories[0]?.name || 'News & Media',
      category_id: dbCategories[0]?.id,
      also_accepting: '',
      accepts_gambling: false,
      accepts_cbd: false,
      accepts_crypto: false,
      accepts_adult: false,
      accepts_pharmacy: false,
      accepts_loans: false,
      dr: '50',
      traffic: '1000',
      keywords: '500',
      rd: '100',
      ld: '50',
      da: '40',
      pa: '35',
      ss: '0',
      age: '1',
      price: 'From $50.00',
      status: 1
    });
  };

  const openEdit = (site: AuthoritySite) => {
    setEditingSite(site);
    setFormData({
      title: site.title || '',
      description: site.description || '',
      portal: site.portal || '',
      link: site.link || '',
      country: site.country || '',
      location_id: site.location_id,
      language: site.language || '',
      main_category: site.main_category || '',
      category_id: site.category_id,
      also_accepting: site.also_accepting || '',
      accepts_gambling: !!site.accepts_gambling,
      accepts_cbd: !!site.accepts_cbd,
      accepts_crypto: !!site.accepts_crypto,
      accepts_adult: !!site.accepts_adult,
      accepts_pharmacy: !!site.accepts_pharmacy,
      accepts_loans: !!site.accepts_loans,
      dr: site.dr || '',
      traffic: site.traffic || '',
      keywords: site.keywords || '',
      rd: site.rd || '',
      ld: site.ld || '',
      da: site.da || '',
      pa: site.pa || '',
      ss: site.ss || '',
      age: site.age || '',
      price: site.price || '',
      status: site.status
    });
    setShowAddModal(true);
  };

  // Categories list for filtering
  const allCategoryNames = Array.from(
    new Set([
      ...dbCategories.map(c => c.name),
      ...sites.map(s => s.category?.name || s.main_category).filter(Boolean)
    ])
  );

  const filteredSites = sites;

  return (
    <div style={{ padding: '1.5rem', width: '100%' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Portales Authority</h1>
            <span style={{ fontSize: '0.8rem', background: 'rgba(91, 192, 190, 0.15)', color: '#5bc0be', border: '1px solid rgba(91, 192, 190, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
              {total.toLocaleString()} portales
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Catálogo y métricas de sitios web de alta autoridad para publicaciones y guest posts.
          </p>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowImportModal(true)}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
            >
              <FileJson size={18} /> Importar JSON
            </button>

            <button
              onClick={() => { resetForm(); setEditingSite(null); setShowAddModal(true); }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
            >
              <Plus size={18} /> Nuevo Portal
            </button>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Buscar por portal, título o país..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.4rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            minWidth: '180px'
          }}
        >
          <option value="ALL">Todas las Categorías</option>
          {allCategoryNames.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Location / Country Dropdown */}
        <select
          value={locationFilter}
          onChange={e => { setLocationFilter(e.target.value); setPage(1); }}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            minWidth: '170px'
          }}
        >
          <option value="ALL">Todos los Países</option>
          {dbLocations.map(loc => (
            <option key={loc.id} value={loc.id}>
              {loc.name} {loc.iso ? `(${loc.iso})` : ''}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="ALL">Todos los Estados</option>
          <option value="1">Activos</option>
          <option value="0">Pendientes</option>
          <option value="2">Archivados</option>
        </select>

        <button
          onClick={() => {
            setSearchTerm('');
            setCategoryFilter('ALL');
            setLocationFilter('ALL');
            setStatusFilter('ALL');
            setMinDr(''); setMaxDr('');
            setMinTraffic(''); setMaxTraffic('');
            setMinPrice(''); setMaxPrice('');
            setPage(1);
          }}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
          title="Limpiar Filtros"
        >
          <RefreshCw size={16} /> Limpiar
        </button>
      </div>

      {/* Advanced Range Filters (Sliders & Controls) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem', background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        {/* DR Range Slider */}
        <div style={{ background: 'rgba(11, 19, 43, 0.4)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(91, 192, 190, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#5bc0be', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Rango DR (Ahrefs)
            </label>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc', background: 'rgba(91, 192, 190, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              {minDr || 0} - {maxDr || 100}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minDr || 0}
              onChange={e => setMinDr(e.target.value)}
              style={{ accentColor: '#5bc0be', width: '50%', cursor: 'pointer' }}
            />
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={maxDr || 100}
              onChange={e => setMaxDr(e.target.value)}
              style={{ accentColor: '#5bc0be', width: '50%', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => { setMinDr('30'); setMaxDr('100'); }} style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', margin: 0 }}>DR 30+</button>
            <button type="button" onClick={() => { setMinDr('50'); setMaxDr('100'); }} style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', margin: 0 }}>DR 50+</button>
            <button type="button" onClick={() => { setMinDr('70'); setMaxDr('100'); }} style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', margin: 0 }}>DR 70+</button>
          </div>
        </div>

        {/* Traffic Range Slider */}
        <div style={{ background: 'rgba(11, 19, 43, 0.4)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tráfico Orgánico
            </label>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc', background: 'rgba(52, 211, 153, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              {minTraffic ? `${Number(minTraffic).toLocaleString()}` : '0'} - {maxTraffic ? `${Number(maxTraffic).toLocaleString()}` : '1M+'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={minTraffic || 0}
              onChange={e => setMinTraffic(e.target.value)}
              style={{ accentColor: '#34d399', width: '50%', cursor: 'pointer' }}
            />
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={maxTraffic || 100000}
              onChange={e => setMaxTraffic(e.target.value)}
              style={{ accentColor: '#34d399', width: '50%', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => { setMinTraffic('1000'); setMaxTraffic(''); }} style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', margin: 0 }}>+1K</button>
            <button type="button" onClick={() => { setMinTraffic('10000'); setMaxTraffic(''); }} style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', margin: 0 }}>+10K</button>
            <button type="button" onClick={() => { setMinTraffic('50000'); setMaxTraffic(''); }} style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', margin: 0 }}>+50K</button>
          </div>
        </div>

        {/* Price Range Slider */}
        <div style={{ background: 'rgba(11, 19, 43, 0.4)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Precio ($ USD)
            </label>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc', background: 'rgba(251, 191, 36, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              ${minPrice || 0} - ${maxPrice || 500}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={minPrice || 0}
              onChange={e => setMinPrice(e.target.value)}
              style={{ accentColor: '#fbbf24', width: '50%', cursor: 'pointer' }}
            />
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={maxPrice || 500}
              onChange={e => setMaxPrice(e.target.value)}
              style={{ accentColor: '#fbbf24', width: '50%', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => { setMinPrice('0'); setMaxPrice('100'); }} style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', margin: 0 }}>&lt; $100</button>
            <button type="button" onClick={() => { setMinPrice('100'); setMaxPrice('200'); }} style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', margin: 0 }}>$100 - $200</button>
            <button type="button" onClick={() => { setMinPrice('200'); setMaxPrice('500'); }} style={{ width: 'auto', padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', margin: 0 }}>$200+</button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Cargando portales authority...
        </div>
      ) : filteredSites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No se encontraron portales.</p>
          {isAdmin && (
            <button
              onClick={() => setShowImportModal(true)}
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Cargar datos de prueba o JSON
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <th onClick={() => handleSort('portal')} style={{ padding: '1rem', cursor: 'pointer' }} title="Ordenar por portal">
                  Portal / Sitio {sortBy === 'portal' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style={{ padding: '1rem' }}>País / Idioma</th>
                <th style={{ padding: '1rem' }}>Categoría</th>
                <th style={{ padding: '1rem' }}>Nichos Aceptados</th>
                <th onClick={() => handleSort('dr')} style={{ padding: '1rem', cursor: 'pointer' }} title="Ordenar por DR">
                  DR {sortBy === 'dr' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style={{ padding: '1rem' }}>DA</th>
                <th onClick={() => handleSort('traffic')} style={{ padding: '1rem', cursor: 'pointer' }} title="Ordenar por Tráfico">
                  Tráfico {sortBy === 'traffic' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('price')} style={{ padding: '1rem', cursor: 'pointer' }} title="Ordenar por Precio">
                  Precio {sortBy === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style={{ padding: '1rem' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSites.map(site => {
                const drVal = parseInt(site.dr || '0', 10);
                const catDisplay = site.category?.name || site.main_category || 'General';

                const nicheChips = [
                  { name: 'Gambling', active: site.accepts_gambling },
                  { name: 'CBD', active: site.accepts_cbd },
                  { name: 'Crypto', active: site.accepts_crypto },
                  { name: 'Adult', active: site.accepts_adult },
                  { name: 'Pharmacy', active: site.accepts_pharmacy },
                  { name: 'Loans', active: site.accepts_loans }
                ].filter(n => n.active);

                return (
                  <tr key={site.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {site.favicon ? (
                          <img
                            src={site.favicon.startsWith('http') ? site.favicon : `https://searcheye.io/${site.favicon}`}
                            alt=""
                            style={{ width: '18px', height: '18px', borderRadius: '3px', objectFit: 'contain', flexShrink: 0 }}
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <Globe size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            {site.title || site.portal}
                            {site.is_verified && (
                              <span title="Sitio Verificado" style={{ display: 'inline-flex' }}>
                                <CheckCircle size={14} style={{ color: '#38bdf8', flexShrink: 0 }} />
                              </span>
                            )}
                          </div>
                          <a
                            href={site.link || (site.portal.startsWith('http') ? site.portal : `https://${site.portal}`)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}
                          >
                            {site.portal} <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} style={{ color: 'var(--text-secondary)' }} />
                        <span>{site.location ? `${site.location.name} ${site.location.iso ? `(${site.location.iso})` : ''}` : site.country || '-'}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.1rem' }}>{site.language || '-'}</div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        {catDisplay}
                      </span>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', maxWidth: '180px' }}>
                        {nicheChips.length > 0 ? nicheChips.map(n => (
                          <span key={n.name} style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            {n.name}
                          </span>
                        )) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estándar</span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontWeight: 700,
                        color: drVal >= 50 ? '#10b981' : drVal >= 30 ? '#f59e0b' : 'var(--text-primary)'
                      }}>
                        {site.dr || '-'}
                      </span>
                    </td>

                    <td style={{ padding: '1rem', fontWeight: 600 }}>{site.da || '-'}</td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{site.traffic || '-'}</td>

                    <td style={{ padding: '1rem', fontWeight: 600, color: '#10b981' }}>{site.price || '-'}</td>

                    <td style={{ padding: '1rem' }}>
                      {site.status === 1 ? (
                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle size={12} /> Activo
                        </span>
                      ) : site.status === 0 ? (
                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <AlertCircle size={12} /> Pendiente
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Archive size={12} /> Archivado
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          onClick={() => setSelectedSite(site)}
                          className="btn-success"
                          style={{
                            width: 'auto',
                            padding: '0.4rem 0.85rem',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                          }}
                          title="Ver Detalles y Comprar"
                        >
                          <Eye size={15} /> Comprar
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEdit(site)}
                              style={{ padding: '0.4rem', border: 'none', background: 'transparent', color: '#8b5cf6', cursor: 'pointer' }}
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(site.id)}
                              style={{ padding: '0.4rem', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modern Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', padding: '0.85rem 1.25rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Mostrando {total === 0 ? 0 : (page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total.toLocaleString()} portales
            </span>
            <select
              value={limit}
              onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
              style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.825rem' }}
            >
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: page <= 1 ? 'rgba(255,255,255,0.02)' : 'var(--card-bg)', color: page <= 1 ? 'var(--text-secondary)' : 'var(--text-primary)', cursor: page <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
              title="Primera página"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: page <= 1 ? 'rgba(255,255,255,0.02)' : 'var(--card-bg)', color: page <= 1 ? 'var(--text-secondary)' : 'var(--text-primary)', cursor: page <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
              title="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ fontSize: '0.875rem', padding: '0 0.5rem', fontWeight: 600 }}>
              Página {page} de {totalPages || 1}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: page >= totalPages ? 'rgba(255,255,255,0.02)' : 'var(--card-bg)', color: page >= totalPages ? 'var(--text-secondary)' : 'var(--text-primary)', cursor: page >= totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
              title="Página siguiente"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: page >= totalPages ? 'rgba(255,255,255,0.02)' : 'var(--card-bg)', color: page >= totalPages ? 'var(--text-secondary)' : 'var(--text-primary)', cursor: page >= totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
              title="Última página"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </>
    )}

      {/* Detail Modal */}
      {selectedSite && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#5bc0be' }}>{selectedSite.title || selectedSite.portal}</h2>
              <button onClick={() => setSelectedSite(null)} style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{selectedSite.description || 'Sin descripción disponible.'}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
              <div><strong>Portal:</strong> {selectedSite.portal}</div>
              <div>
                <strong>Precio Final:</strong>{' '}
                <span style={{ color: '#10b981', fontWeight: 700 }}>
                  {selectedSite.min_final_price !== undefined && selectedSite.min_final_price !== null ? (
                    selectedSite.min_final_price === selectedSite.max_final_price || !selectedSite.max_final_price
                      ? `$${selectedSite.min_final_price.toFixed(2)}`
                      : `$${selectedSite.min_final_price.toFixed(2)} - $${selectedSite.max_final_price.toFixed(2)}`
                  ) : (selectedSite.price || '-')}
                </span>
              </div>
              {selectedSite.min_base_price !== undefined && selectedSite.min_base_price !== null ? (
                <div>
                  <strong>Precio Base:</strong>{' '}
                  <span>
                    {selectedSite.min_base_price === selectedSite.max_base_price || !selectedSite.max_base_price
                      ? `$${selectedSite.min_base_price.toFixed(2)}`
                      : `$${selectedSite.min_base_price.toFixed(2)} - $${selectedSite.max_base_price.toFixed(2)}`}
                  </span>
                </div>
              ) : null}
              {selectedSite.min_discount !== undefined && selectedSite.min_discount !== null && selectedSite.min_discount > 0 ? (
                <div>
                  <strong>Descuento:</strong>{' '}
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                    {selectedSite.min_discount === selectedSite.max_discount || !selectedSite.max_discount
                      ? `-$${selectedSite.min_discount.toFixed(2)}`
                      : `-$${selectedSite.min_discount.toFixed(2)} a -$${selectedSite.max_discount.toFixed(2)}`}
                  </span>
                </div>
              ) : null}
              <div>
                <strong>Verificado:</strong>{' '}
                {selectedSite.is_verified ? (
                  <span style={{ color: '#38bdf8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle size={14} /> Verificado SearchEye
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-secondary)' }}>No verificado</span>
                )}
              </div>
              <div><strong>País:</strong> {selectedSite.location ? `${selectedSite.location.name} ${selectedSite.location.iso ? `(${selectedSite.location.iso})` : ''}` : selectedSite.country || '-'}</div>
              <div><strong>Idioma:</strong> {selectedSite.language || '-'}</div>
              <div><strong>Categoría:</strong> {selectedSite.category?.name || selectedSite.main_category || '-'}</div>
              <div><strong>DR:</strong> {selectedSite.dr || '-'} | <strong>DA:</strong> {selectedSite.da || '-'}</div>
              <div><strong>Tráfico:</strong> {selectedSite.traffic || '-'}</div>
              <div><strong>Keywords:</strong> {selectedSite.keywords || '-'}</div>
              <div><strong>Ref. Domains (RD):</strong> {selectedSite.rd || '-'}</div>
              <div><strong>Linked Domains (LD):</strong> {selectedSite.ld || '-'}</div>
              <div><strong>Spam Score (SS):</strong> {selectedSite.ss || '-'}</div>
              <div><strong>Antigüedad:</strong> {selectedSite.age ? `${selectedSite.age} años` : '-'}</div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>Aceptación de Nichos Especiales:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedSite.accepts_gambling ? '#10b981' : 'var(--text-secondary)' }}>
                  {selectedSite.accepts_gambling ? <CheckSquare size={16} /> : <Square size={16} />} Gambling (Juegos)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedSite.accepts_cbd ? '#10b981' : 'var(--text-secondary)' }}>
                  {selectedSite.accepts_cbd ? <CheckSquare size={16} /> : <Square size={16} />} CBD
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedSite.accepts_crypto ? '#10b981' : 'var(--text-secondary)' }}>
                  {selectedSite.accepts_crypto ? <CheckSquare size={16} /> : <Square size={16} />} Crypto
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedSite.accepts_adult ? '#10b981' : '#ef4444' }}>
                  {selectedSite.accepts_adult ? <CheckSquare size={16} /> : <Square size={16} />} Adult
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedSite.accepts_pharmacy ? '#10b981' : 'var(--text-secondary)' }}>
                  {selectedSite.accepts_pharmacy ? <CheckSquare size={16} /> : <Square size={16} />} Pharmacy (Farmacia)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedSite.accepts_loans ? '#10b981' : 'var(--text-secondary)' }}>
                  {selectedSite.accepts_loans ? <CheckSquare size={16} /> : <Square size={16} />} Loans (Préstamos)
                </div>
              </div>
            </div>

            {selectedSite.also_accepting && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>Criterios de Aceptación Originales:</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-wrap', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                  {selectedSite.also_accepting}
                </div>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ width: 'auto' }}
                onClick={() => setSelectedSite(null)}
              >
                Cerrar
              </button>
              <button 
                type="button" 
                className="btn-success" 
                style={{ width: 'auto', padding: '0.6rem 1.25rem' }}
                onClick={() => {
                  const target = selectedSite;
                  setSelectedSite(null);
                  setBuyingSite(target);
                  setBuyComments(`Publicación en ${target.portal}`);
                  setBuyError('');
                }}
              >
                Comprar ${selectedSite.price || '0.00'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Buy Confirmation Modal */}
      {buyingSite && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#c084fc' }}>Confirmar Compra de Portal</h3>
              <button onClick={() => setBuyingSite(null)} style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc' }}>{buyingSite.title || buyingSite.portal}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{buyingSite.portal}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Costo de publicación:</span>
                <strong style={{ fontSize: '1.25rem', color: '#34d399' }}>${buyingSite.price || '0.00'}</strong>
              </div>
            </div>

            {buyError && <div className="error-message">{buyError}</div>}

            <form onSubmit={async (e) => {
              e.preventDefault();
              setBuyError('');
              setBuySubmitting(true);
              try {
                const res = await fetch(`${API_BASE_URL}/authorities/${buyingSite.id}/buy`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({ name: buyingSite.title || buyingSite.portal, comments: buyComments })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Error al procesar la compra');
                alert('¡Compra completada con éxito! Registro enviado a tus pedidos.');
                setBuyingSite(null);
                setBuyComments('');
              } catch (err: any) {
                setBuyError(err.message);
              } finally {
                setBuySubmitting(false);
              }
            }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem' }}>Instrucciones / Comentarios para la Publicación</label>
                <textarea
                  rows={3}
                  value={buyComments}
                  onChange={e => setBuyComments(e.target.value)}
                  placeholder="Detalles sobre el enlace, texto ancla o indicaciones específicas..."
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ width: 'auto' }}
                  onClick={() => setBuyingSite(null)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-success" 
                  style={{ width: 'auto', padding: '0.6rem 1.5rem' }}
                  disabled={buySubmitting}
                >
                  {buySubmitting ? 'Procesando...' : `Pagar $${buyingSite.price || '0.00'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#5bc0be' }}>{editingSite ? 'Editar Portal Authority' : 'Nuevo Portal Authority'}</h2>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Título / Nombre</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Bless Circle"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Portal (URL) *</label>
                <input
                  type="text"
                  required
                  value={formData.portal}
                  onChange={e => setFormData({ ...formData, portal: e.target.value })}
                  placeholder="https://ejemplo.com"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Precio</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="From $60.00"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Categoría Base Datos</label>
                <select
                  value={formData.category_id || ''}
                  onChange={e => {
                    const id = parseInt(e.target.value, 10);
                    const catObj = dbCategories.find(c => c.id === id);
                    setFormData({
                      ...formData,
                      category_id: isNaN(id) ? undefined : id,
                      main_category: catObj ? catObj.name : formData.main_category
                    });
                  }}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  <option value="">Seleccionar Categoría</option>
                  {dbCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>País</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United States"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>DR (Domain Rating)</label>
                <input
                  type="text"
                  value={formData.dr}
                  onChange={e => setFormData({ ...formData, dr: e.target.value })}
                  placeholder="55"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>DA (Domain Authority)</label>
                <input
                  type="text"
                  value={formData.da}
                  onChange={e => setFormData({ ...formData, da: e.target.value })}
                  placeholder="40"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Tráfico Mensual</label>
                <input
                  type="text"
                  value={formData.traffic}
                  onChange={e => setFormData({ ...formData, traffic: e.target.value })}
                  placeholder="34,933"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Keywords Orgánicas</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="968"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Nichos Aceptados Checkboxes */}
              <div style={{ gridColumn: 'span 2', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
                  Nichos Aceptados / Permitidos:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.accepts_gambling}
                      onChange={e => setFormData({ ...formData, accepts_gambling: e.target.checked })}
                    />
                    Gambling (Juegos)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.accepts_cbd}
                      onChange={e => setFormData({ ...formData, accepts_cbd: e.target.checked })}
                    />
                    CBD
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.accepts_crypto}
                      onChange={e => setFormData({ ...formData, accepts_crypto: e.target.checked })}
                    />
                    Crypto
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.accepts_adult}
                      onChange={e => setFormData({ ...formData, accepts_adult: e.target.checked })}
                    />
                    Adult (Adultos)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.accepts_pharmacy}
                      onChange={e => setFormData({ ...formData, accepts_pharmacy: e.target.checked })}
                    />
                    Pharmacy (Farmacia)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.accepts_loans}
                      onChange={e => setFormData({ ...formData, accepts_loans: e.target.checked })}
                    />
                    Loans (Préstamos)
                  </label>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Criterios de Aceptación Adicionales</label>
                <textarea
                  value={formData.also_accepting}
                  onChange={e => setFormData({ ...formData, also_accepting: e.target.value })}
                  placeholder="Observaciones o notas de aceptación..."
                  rows={2}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                >
                  {editingSite ? 'Guardar Cambios' : 'Crear Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import JSON Modal */}
      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', maxWidth: '600px', width: '100%', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Importar Portales desde JSON</h2>
              <button onClick={() => setShowImportModal(false)} style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Pega a continuación el contenido de <code>results.json</code> o <code>data.json</code> extraído del scraper para cargarlo directamente en la base de datos:
            </p>

            <textarea
              rows={10}
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              placeholder='[ { "portal": "https://blesscircle.com", "dr": "55", ... } ]'
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '0.85rem'
              }}
            />

            {importStatus && (
              <div style={{ margin: '0.75rem 0', fontSize: '0.85rem', color: importStatus.includes('Error') || importStatus.includes('inválido') ? '#ef4444' : '#10b981' }}>
                {importStatus}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                onClick={() => setShowImportModal(false)}
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleImportJson}
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                Importar Datos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Authorities;
