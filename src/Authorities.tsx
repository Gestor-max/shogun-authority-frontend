import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './i18n/LanguageContext';
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
  Globe,
  SlidersHorizontal,
  Database
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
  const { t } = useLanguage();
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
    if (!window.confirm(t.marketplace.deletePortalConfirm)) return;
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
      setImportStatus(t.common.loading);
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
        setImportStatus(t.marketplace.importSuccessMsg.replace('{0}', String(items.length)));
        setTimeout(() => {
          setShowImportModal(false);
          setImportJsonText('');
          setImportStatus('');
          fetchSites();
        }, 1200);
      } else {
        setImportStatus(t.marketplace.importErrorMsg);
      }
    } catch (err: any) {
      setImportStatus(t.marketplace.importInvalidJsonMsg.replace('{0}', err.message));
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
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{t.marketplace.title}</h1>
            <span style={{ fontSize: '0.8rem', background: 'rgba(91, 192, 190, 0.15)', color: '#5bc0be', border: '1px solid rgba(91, 192, 190, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
              {total.toLocaleString()} {t.marketplace.totalPortalsBadge}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            {t.marketplace.subtitle}
          </p>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowImportModal(true)}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
            >
              <FileJson size={18} /> {t.marketplace.importJsonBtn}
            </button>

            <button
              onClick={() => { resetForm(); setEditingSite(null); setShowAddModal(true); }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
            >
              <Plus size={18} /> {t.marketplace.newPortalBtn}
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Card with Dark Navy Header */}
      <div className="card">
        <div className="card-header">
          <h3>
            <SlidersHorizontal size={18} /> {t.marketplace.filterCardTitle}
          </h3>
          <span className="card-header-badge">
            {total.toLocaleString()} {t.marketplace.portalsAvailableBadge}
          </span>
        </div>
        <div className="card-body">
          {/* Main search and dropdowns */}
          <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={t.marketplace.searchPlaceholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
              <select
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
              >
                <option value="ALL">{t.marketplace.allCategories}</option>
                {allCategoryNames.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
              <select
                value={locationFilter}
                onChange={e => { setLocationFilter(e.target.value); setPage(1); }}
              >
                <option value="ALL">{t.marketplace.allCountries}</option>
                {dbLocations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.iso ? `(${loc.iso})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="ALL">{t.marketplace.allStatuses}</option>
                <option value="1">{t.marketplace.statusActive}</option>
                <option value="0">{t.marketplace.statusPending}</option>
                <option value="2">{t.marketplace.statusArchived}</option>
              </select>
            </div>

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
              className="btn-secondary"
              title={t.marketplace.clearFilters}
            >
              <RefreshCw size={15} /> {t.marketplace.clearFilters}
            </button>
          </div>

          {/* Advanced Range Sliders (Clean Light Panels) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {/* DR Range Slider */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {t.marketplace.drRangeLabel}
                </label>
                <span className="badge badge-info" style={{ fontWeight: 700 }}>
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
                  style={{ accentColor: '#2563eb', width: '50%', cursor: 'pointer' }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={maxDr || 100}
                  onChange={e => setMaxDr(e.target.value)}
                  style={{ accentColor: '#2563eb', width: '50%', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => { setMinDr('30'); setMaxDr('100'); }} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>DR 30+</button>
                <button type="button" onClick={() => { setMinDr('50'); setMaxDr('100'); }} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>DR 50+</button>
                <button type="button" onClick={() => { setMinDr('70'); setMaxDr('100'); }} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>DR 70+</button>
              </div>
            </div>

            {/* Traffic Range Slider */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {t.marketplace.trafficRangeLabel}
                </label>
                <span className="badge badge-success" style={{ fontWeight: 700 }}>
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
                  style={{ accentColor: '#10b981', width: '50%', cursor: 'pointer' }}
                />
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={maxTraffic || 100000}
                  onChange={e => setMaxTraffic(e.target.value)}
                  style={{ accentColor: '#10b981', width: '50%', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => { setMinTraffic('1000'); setMaxTraffic(''); }} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>+1K</button>
                <button type="button" onClick={() => { setMinTraffic('10000'); setMaxTraffic(''); }} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>+10K</button>
                <button type="button" onClick={() => { setMinTraffic('50000'); setMaxTraffic(''); }} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>+50K</button>
              </div>
            </div>

            {/* Price Range Slider */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {t.marketplace.priceRangeLabel}
                </label>
                <span className="badge badge-warning" style={{ fontWeight: 700 }}>
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
                  style={{ accentColor: '#f59e0b', width: '50%', cursor: 'pointer' }}
                />
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={maxPrice || 500}
                  onChange={e => setMaxPrice(e.target.value)}
                  style={{ accentColor: '#f59e0b', width: '50%', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => { setMinPrice('0'); setMaxPrice('100'); }} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>&lt; $100</button>
                <button type="button" onClick={() => { setMinPrice('100'); setMaxPrice('200'); }} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>$100 - $200</button>
                <button type="button" onClick={() => { setMinPrice('200'); setMaxPrice('500'); }} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>$200+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="card">
          <div className="card-header">
            <h3><Database size={18} /> {t.marketplace.catalogCardTitle}</h3>
          </div>
          <div className="card-body" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-secondary)' }}>
            {t.marketplace.loadingCatalog}
          </div>
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="card">
          <div className="card-header">
            <h3><Database size={18} /> {t.marketplace.catalogCardTitle}</h3>
          </div>
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{t.marketplace.noPortalsFound}</p>
            {isAdmin && (
              <button
                onClick={() => setShowImportModal(true)}
                className="btn-primary"
                style={{ marginTop: '1rem', width: 'auto', display: 'inline-flex', padding: '0.5rem 1rem' }}
              >
                {t.marketplace.loadSampleData}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3><Database size={18} /> {t.marketplace.catalogCardTitle}</h3>
            <span className="card-header-badge">
              {t.marketplace.pageOf.replace('{page}', String(page)).replace('{totalPages}', String(totalPages || 1))} ({total.toLocaleString()} {t.marketplace.totalPortalsBadge})
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
                    <th onClick={() => handleSort('portal')} style={{ padding: '0.85rem 1rem', cursor: 'pointer' }} title={t.marketplace.colPortal}>
                      {t.marketplace.colPortal} {sortBy === 'portal' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th style={{ padding: '0.85rem 1rem' }}>{t.marketplace.colCountryLang}</th>
                    <th style={{ padding: '1rem' }}>{t.marketplace.colCategory}</th>
                    <th style={{ padding: '1rem' }}>{t.marketplace.colNiches}</th>
                    <th onClick={() => handleSort('dr')} style={{ padding: '1rem', cursor: 'pointer' }} title={t.marketplace.colDr}>
                      {t.marketplace.colDr} {sortBy === 'dr' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th style={{ padding: '1rem' }}>{t.marketplace.colDa}</th>
                    <th onClick={() => handleSort('traffic')} style={{ padding: '1rem', cursor: 'pointer' }} title={t.marketplace.colTraffic}>
                      {t.marketplace.colTraffic} {sortBy === 'traffic' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th onClick={() => handleSort('price')} style={{ padding: '1rem', cursor: 'pointer' }} title={t.marketplace.colPrice}>
                      {t.marketplace.colPrice} {sortBy === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th style={{ padding: '1rem' }}>{t.marketplace.colStatus}</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>{t.marketplace.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSites.map(site => {
                    const drVal = parseInt(site.dr || '0', 10);
                    const catDisplay = site.category?.name || site.main_category || 'General';

                    const nicheChips = [
                      { name: t.marketplace.acceptsGambling, active: site.accepts_gambling },
                      { name: t.marketplace.acceptsCbd, active: site.accepts_cbd },
                      { name: t.marketplace.acceptsCrypto, active: site.accepts_crypto },
                      { name: t.marketplace.acceptsAdult, active: site.accepts_adult },
                      { name: t.marketplace.acceptsPharmacy, active: site.accepts_pharmacy },
                      { name: t.marketplace.acceptsLoans, active: site.accepts_loans }
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
                                  <span title={t.marketplace.verifiedBadge} style={{ display: 'inline-flex' }}>
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
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.common.standard}</span>
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
                              <CheckCircle size={12} /> {t.common.active}
                            </span>
                          ) : site.status === 0 ? (
                            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <AlertCircle size={12} /> {t.common.pending}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Archive size={12} /> {t.common.archived}
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
                              title={t.marketplace.buyBtn}
                            >
                              <Eye size={15} /> {t.marketplace.buyBtn}
                            </button>

                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => openEdit(site)}
                                  style={{ padding: '0.4rem', border: 'none', background: 'transparent', color: '#8b5cf6', cursor: 'pointer' }}
                                  title={t.common.edit}
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(site.id)}
                                  style={{ padding: '0.4rem', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                                  title={t.common.delete}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: '#ffffff', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {t.marketplace.showingRange
                    .replace('{start}', String(total === 0 ? 0 : (page - 1) * limit + 1))
                    .replace('{end}', String(Math.min(page * limit, total)))
                    .replace('{total}', total.toLocaleString())}
                </span>
                <select
                  value={limit}
                  onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                  style={{ width: 'auto', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border)', background: '#ffffff', color: 'var(--text-primary)', fontSize: '0.825rem' }}
                >
                  <option value={25}>25 {t.marketplace.perPage}</option>
                  <option value={50}>50 {t.marketplace.perPage}</option>
                  <option value={100}>100 {t.marketplace.perPage}</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  className="btn-secondary"
                  style={{ width: 'auto', padding: '0.4rem 0.6rem', opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
                  title={t.marketplace.firstPage}
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-secondary"
                  style={{ width: 'auto', padding: '0.4rem 0.6rem', opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
                  title={t.marketplace.prevPage}
                >
                  <ChevronLeft size={16} />
                </button>

                <span style={{ fontSize: '0.875rem', padding: '0 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t.marketplace.pageOf.replace('{page}', String(page)).replace('{totalPages}', String(totalPages || 1))}
                </span>

                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn-secondary"
                  style={{ width: 'auto', padding: '0.4rem 0.6rem', opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
                  title={t.marketplace.nextPage}
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="btn-secondary"
                  style={{ width: 'auto', padding: '0.4rem 0.6rem', opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
                  title={t.marketplace.lastPage}
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSite && (
        <div className="modal-overlay" onClick={() => setSelectedSite(null)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Globe size={18} /> {selectedSite.title || selectedSite.portal}</h3>
              <button onClick={() => setSelectedSite(null)} className="modal-close-btn" title={t.marketplace.closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: 0 }}>
                {selectedSite.description || t.marketplace.noDescription}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', margin: '1rem 0', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div><strong>{t.marketplace.portalLabel}:</strong> {selectedSite.portal}</div>
                <div>
                  <strong>{t.marketplace.finalPriceLabel}:</strong>{' '}
                  <span style={{ color: '#059669', fontWeight: 700 }}>
                    {selectedSite.min_final_price !== undefined && selectedSite.min_final_price !== null ? (
                      selectedSite.min_final_price === selectedSite.max_final_price || !selectedSite.max_final_price
                        ? `$${selectedSite.min_final_price.toFixed(2)}`
                        : `$${selectedSite.min_final_price.toFixed(2)} - $${selectedSite.max_final_price.toFixed(2)}`
                    ) : (selectedSite.price || '-')}
                  </span>
                </div>
                {selectedSite.min_base_price !== undefined && selectedSite.min_base_price !== null ? (
                  <div>
                    <strong>{t.marketplace.basePriceLabel}:</strong>{' '}
                    <span>
                      {selectedSite.min_base_price === selectedSite.max_base_price || !selectedSite.max_base_price
                        ? `$${selectedSite.min_base_price.toFixed(2)}`
                        : `$${selectedSite.min_base_price.toFixed(2)} - $${selectedSite.max_base_price.toFixed(2)}`}
                    </span>
                  </div>
                ) : null}
                {selectedSite.min_discount !== undefined && selectedSite.min_discount !== null && selectedSite.min_discount > 0 ? (
                  <div>
                    <strong>{t.marketplace.discountLabel}:</strong>{' '}
                    <span style={{ color: '#d97706', fontWeight: 600 }}>
                      {selectedSite.min_discount === selectedSite.max_discount || !selectedSite.max_discount
                        ? `-$${selectedSite.min_discount.toFixed(2)}`
                        : `-$${selectedSite.min_discount.toFixed(2)} a -$${selectedSite.max_discount.toFixed(2)}`}
                    </span>
                  </div>
                ) : null}
                <div>
                  <strong>{t.marketplace.verifiedLabel}:</strong>{' '}
                  {selectedSite.is_verified ? (
                    <span style={{ color: '#0284c7', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={14} /> {t.marketplace.verifiedSearchEye}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>{t.marketplace.notVerified}</span>
                  )}
                </div>
                <div><strong>{t.marketplace.countryLabel}:</strong> {selectedSite.location ? `${selectedSite.location.name} ${selectedSite.location.iso ? `(${selectedSite.location.iso})` : ''}` : selectedSite.country || '-'}</div>
                <div><strong>{t.marketplace.languageLabel}:</strong> {selectedSite.language || '-'}</div>
                <div><strong>{t.marketplace.categoryLabel}:</strong> {selectedSite.category?.name || selectedSite.main_category || '-'}</div>
                <div><strong>DR:</strong> {selectedSite.dr || '-'} | <strong>DA:</strong> {selectedSite.da || '-'}</div>
                <div><strong>{t.marketplace.trafficLabel}:</strong> {selectedSite.traffic || '-'}</div>
                <div><strong>{t.marketplace.keywordsLabel}:</strong> {selectedSite.keywords || '-'}</div>
                <div><strong>{t.marketplace.rdLabel}:</strong> {selectedSite.rd || '-'}</div>
                <div><strong>{t.marketplace.ldLabel}:</strong> {selectedSite.ld || '-'}</div>
                <div><strong>{t.marketplace.ssLabel}:</strong> {selectedSite.ss || '-'}</div>
                <div><strong>{t.marketplace.ageLabel}:</strong> {selectedSite.age ? `${selectedSite.age} ${t.marketplace.yearsOld}` : '-'}</div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.marketplace.specialNichesTitle}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedSite.accepts_gambling ? '#059669' : 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {selectedSite.accepts_gambling ? <CheckSquare size={16} /> : <Square size={16} />} {t.marketplace.acceptsGambling}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedSite.accepts_cbd ? '#059669' : 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {selectedSite.accepts_cbd ? <CheckSquare size={16} /> : <Square size={16} />} {t.marketplace.acceptsCbd}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedSite.accepts_crypto ? '#059669' : 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {selectedSite.accepts_crypto ? <CheckSquare size={16} /> : <Square size={16} />} {t.marketplace.acceptsCrypto}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedSite.accepts_adult ? '#059669' : '#dc2626', fontSize: '0.8125rem' }}>
                    {selectedSite.accepts_adult ? <CheckSquare size={16} /> : <Square size={16} />} {t.marketplace.acceptsAdult}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedSite.accepts_pharmacy ? '#059669' : 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {selectedSite.accepts_pharmacy ? <CheckSquare size={16} /> : <Square size={16} />} {t.marketplace.acceptsPharmacy}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedSite.accepts_loans ? '#059669' : 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {selectedSite.accepts_loans ? <CheckSquare size={16} /> : <Square size={16} />} {t.marketplace.acceptsLoans}
                  </div>
                </div>
              </div>

              {selectedSite.also_accepting && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.marketplace.originalCriteriaTitle}</h4>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-wrap', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
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
                  {t.common.close}
                </button>
                <button 
                  type="button" 
                  className="btn-success" 
                  style={{ width: 'auto', padding: '0.6rem 1.25rem' }}
                  onClick={() => {
                    const target = selectedSite;
                    setSelectedSite(null);
                    setBuyingSite(target);
                    setBuyComments(`Publication on ${target.portal}`);
                    setBuyError('');
                  }}
                >
                  {t.marketplace.buyBtn} ${selectedSite.price || '0.00'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Buy Confirmation Modal */}
      {buyingSite && (
        <div className="modal-overlay" onClick={() => setBuyingSite(null)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.marketplace.confirmBuyTitle}</h3>
              <button onClick={() => setBuyingSite(null)} className="modal-close-btn" title={t.common.close}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{buyingSite.title || buyingSite.portal}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{buyingSite.portal}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t.marketplace.costLabel}</span>
                  <strong style={{ fontSize: '1.25rem', color: '#059669' }}>${buyingSite.price || '0.00'}</strong>
                </div>
              </div>

              {buyError && (
                <div className="error-message" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                    <AlertCircle size={16} /> {t.marketplace.orderErrorTitle}
                  </div>
                  <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', lineHeight: 1.5 }}>{buyError}</div>
                  {(buyError.toLowerCase().includes('saldo') || buyError.toLowerCase().includes('balance')) && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <a 
                        href="/balance" 
                        className="btn-primary" 
                        style={{ display: 'inline-flex', padding: '0.4rem 0.85rem', fontSize: '0.8rem', width: 'auto', textDecoration: 'none' }}
                      >
                        {t.marketplace.topUpBalanceBtn}
                      </a>
                    </div>
                  )}
                </div>
              )}

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
                  if (!res.ok) {
                    const msg = Array.isArray(data.message) ? data.message.join('. ') : data.message || t.common.error;
                    throw new Error(msg);
                  }
                  alert(t.marketplace.buySuccessAlert);
                  setBuyingSite(null);
                  setBuyComments('');
                } catch (err: any) {
                  setBuyError(err.message);
                } finally {
                  setBuySubmitting(false);
                }
              }}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.85rem' }}>{t.marketplace.instructionsLabel}</label>
                  <textarea
                    rows={3}
                    value={buyComments}
                    onChange={e => setBuyComments(e.target.value)}
                    placeholder={t.marketplace.instructionsPlaceholder}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border)' }}
                  />
                </div>

                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ width: 'auto' }}
                    onClick={() => setBuyingSite(null)}
                  >
                    {t.common.cancel}
                  </button>
                  <button 
                    type="submit" 
                    className="btn-success" 
                    style={{ width: 'auto', padding: '0.6rem 1.5rem' }}
                    disabled={buySubmitting}
                  >
                    {buySubmitting ? t.marketplace.processingPayBtn : `${t.marketplace.confirmPayBtn} $${buyingSite.price || '0.00'}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSite ? t.marketplace.editPortalTitle : t.marketplace.createPortalTitle}</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close-btn" title={t.common.close}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <form onSubmit={handleCreateOrUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>{t.marketplace.colPortal}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Bless Circle"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>{t.marketplace.portalLabel} (URL) *</label>
                <input
                  type="text"
                  required
                  value={formData.portal}
                  onChange={e => setFormData({ ...formData, portal: e.target.value })}
                  placeholder="https://example.com"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>{t.marketplace.colPrice}</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="From $60.00"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>{t.marketplace.colCategory}</label>
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
                  <option value="">{t.marketplace.allCategories}</option>
                  {dbCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>{t.marketplace.countryLabel}</label>
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
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>{t.marketplace.trafficLabel}</label>
                <input
                  type="text"
                  value={formData.traffic}
                  onChange={e => setFormData({ ...formData, traffic: e.target.value })}
                  placeholder="34,933"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>{t.marketplace.keywordsLabel}</label>
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
                  {t.marketplace.specialNichesTitle}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.accepts_gambling}
                      onChange={e => setFormData({ ...formData, accepts_gambling: e.target.checked })}
                    />
                    {t.marketplace.acceptsGambling}
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.accepts_cbd}
                      onChange={e => setFormData({ ...formData, accepts_cbd: e.target.checked })}
                    />
                    {t.marketplace.acceptsCbd}
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.accepts_crypto}
                      onChange={e => setFormData({ ...formData, accepts_crypto: e.target.checked })}
                    />
                    {t.marketplace.acceptsCrypto}
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.accepts_adult}
                      onChange={e => setFormData({ ...formData, accepts_adult: e.target.checked })}
                    />
                    {t.marketplace.acceptsAdult}
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.accepts_pharmacy}
                      onChange={e => setFormData({ ...formData, accepts_pharmacy: e.target.checked })}
                    />
                    {t.marketplace.acceptsPharmacy}
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.accepts_loans}
                      onChange={e => setFormData({ ...formData, accepts_loans: e.target.checked })}
                    />
                    {t.marketplace.acceptsLoans}
                  </label>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>{t.marketplace.originalCriteriaTitle}</label>
                <textarea
                  value={formData.also_accepting}
                  onChange={e => setFormData({ ...formData, also_accepting: e.target.value })}
                  placeholder={t.marketplace.instructionsPlaceholder}
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
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                >
                  {editingSite ? t.common.save : t.marketplace.createPortalTitle}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* Import JSON Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FileJson size={18} /> {t.marketplace.importModalTitle}</h3>
              <button onClick={() => setShowImportModal(false)} className="modal-close-btn" title={t.common.close}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 0, marginBottom: '1rem' }}>
                {t.marketplace.importModalDesc}
              </p>

              <textarea
                rows={10}
                value={importJsonText}
                onChange={e => setImportJsonText(e.target.value)}
                placeholder={t.marketplace.importModalPlaceholder}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
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
                  type="button"
                  className="btn-secondary"
                  style={{ width: 'auto' }}
                  onClick={() => setShowImportModal(false)}
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: 'auto' }}
                  onClick={handleImportJson}
                >
                  {t.marketplace.importModalSubmit}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Authorities;
