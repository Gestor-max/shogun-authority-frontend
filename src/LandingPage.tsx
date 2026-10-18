import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { 
  Shield, 
  Sparkles, 
  ArrowRight, 
  Globe, 
  CheckCircle2, 
  Lock,
  Layers,
  BarChart3
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { token } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#0b132b', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 3rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11, 19, 43, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(91, 192, 190, 0.15)', padding: '0.5rem', borderRadius: '10px', color: '#5bc0be', border: '1px solid rgba(91, 192, 190, 0.3)' }}>
            <Shield size={24} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
            Shogun<span style={{ color: '#5bc0be' }}>Authority</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>Características</a>
          <a href="#metrics" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>Métricas SEO</a>
          <a href="#pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>Planes & Precios</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {token ? (
            <Link to="/marketplace" className="btn-success" style={{ textDecoration: 'none', padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
              Ir al Panel <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 600, padding: '0.5rem 1rem' }}>
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                Comenzar Gratis <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '6rem 2rem 4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'radial-gradient(circle at 50% 20%, #1c2541 0%, #0b132b 70%)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(91, 192, 190, 0.15)', color: '#5bc0be', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid rgba(91, 192, 190, 0.3)' }}>
            <Sparkles size={16} /> La Plataforma Premium para Agencias & Consultores SEO
          </div>

          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.15, margin: '0 0 1.5rem 0', letterSpacing: '-0.03em', background: 'linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Escala el Ranking de tus Sitios Web con Portales de Alta Autoridad
          </h1>

          <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '720px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
            Acceso instantáneo a un catálogo exclusivo de publicaciones en medios digitales verificado por DR (Domain Rating), tráfico orgánico real y gestión de saldo unificada.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 700 }}>
              Explorar Catálogo Gratis <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 600 }}>
              <Lock size={18} /> Acceso Clientes
            </Link>
          </div>

          {/* Feature Badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '3.5rem', flexWrap: 'wrap', color: '#64748b', fontSize: '0.9375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} style={{ color: '#34d399' }} /> DR Verificado (Ahrefs 40+)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} style={{ color: '#34d399' }} /> Indexación Garantizada
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} style={{ color: '#34d399' }} /> Precios Directos sin Intermediarios
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section id="metrics" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#1c2541', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#5bc0be', margin: '0 0 0.25rem 0' }}>25+</h2>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9375rem', fontWeight: 500 }}>Medios & Portales Verificados</p>
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399', margin: '0 0 0.25rem 0' }}>58+</h2>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9375rem', fontWeight: 500 }}>DR Promedio de la Red</p>
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fbbf24', margin: '0 0 0.25rem 0' }}>100K+</h2>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9375rem', fontWeight: 500 }}>Tráfico Orgánico Mensual</p>
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#c084fc', margin: '0 0 0.25rem 0' }}>100%</h2>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9375rem', fontWeight: 500 }}>Transparencia de Saldo</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 1rem 0' }}>
            Diseñado para Impulsar tus Campañas de Link Building
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Todo lo que necesitas para gestionar compras de medios, controlar tus publicaciones y auditar backlinks desde una única interfaz SaaS.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <div style={{ background: '#1c2541', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '2rem' }}>
            <div style={{ background: 'rgba(91, 192, 190, 0.15)', color: '#5bc0be', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Globe size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: '#f8fafc' }}>Marketplace con Métricas Reales</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>
              Filtra portales por DR, DA, Tráfico Orgánico mensual, Keywords posicionadas y país (Estados Unidos, Reino Unido e India).
            </p>
          </div>

          <div style={{ background: '#1c2541', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '2rem' }}>
            <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: '#f8fafc' }}>Compra Directa en 1-Clic</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>
              Solicita publicaciones directamente utilizando tu saldo recargado de usuario con notificación automática al equipo editorial.
            </p>
          </div>

          <div style={{ background: '#1c2541', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '2rem' }}>
            <div style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: '#f8fafc' }}>Auditoría & Transacciones</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>
              Historial completo de recargas aprobadas, saldo disponible y registro de salida por cada publicación solicitada.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section style={{ padding: '5rem 2rem', background: 'linear-gradient(180deg, #1c2541 0%, #0b132b 100%)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#f8fafc' }}>
            ¿Listo para potenciar la autoridad de tus sitios?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Crea tu cuenta hoy mismo y comienza a explorar nuestra red de medios digitales de alto rendimiento.
          </p>
          <Link to="/register" className="btn-success" style={{ textDecoration: 'none', padding: '1rem 2.5rem', fontSize: '1.05rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Crear Cuenta Gratis <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
        <div>
          © 2026 <strong>Shogun Authority</strong>. Todos los derechos reservados.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/login" style={{ color: '#64748b', textDecoration: 'none' }}>Iniciar Sesión</Link>
          <Link to="/register" style={{ color: '#64748b', textDecoration: 'none' }}>Registrarse</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
