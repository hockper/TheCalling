'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Login from '../components/Login';
import { useAuth } from '../context/AuthContext';
import type { User } from '../services/api/model/user';

interface HealthData {
  status: string;
  database: string;
  redis: string;
}

export default function Home() {
  const router = useRouter();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();

  const fetchHealth = useCallback(async () => {
    try {
      setHealthLoading(true);
      setError(null);
      const res = await fetch('/health');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to gateway router');
    } finally {
      setHealthLoading(false);
    }
  }, []);

  const redirectUser = useCallback((u: User) => {
    if (u.role === 'requester') {
      router.push('/requester/requests');
    } else if (u.role === 'handler') {
      router.push('/handler/dashboard');
    }
  }, [router]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    if (user) {
      redirectUser(user);
    }
  }, [user, redirectUser]);

  return (
    <main style={styles.container}>
      <div style={styles.glassCard}>
        <h1 style={styles.title}>The Calling</h1>
        <p style={styles.subtitle}>System Status & Monorepo Health Dashboard</p>

        {user ? (
          <div style={styles.authBanner}>
            <span style={styles.authText}>
              Logged in as: <strong>{user.email}</strong> ({user.role})
            </span>
            <button style={styles.logoutButton} onClick={() => logout()}>
              Sign Out
            </button>
          </div>
        ) : (
          <Login />
        )}

        <div style={{ ...styles.statusGrid, marginTop: '2rem' }}>
          {/* Gateway Status */}
          <div style={styles.statusItem}>
            <div style={styles.statusHeader}>
              <span style={styles.statusLabel}>API Gateway (Traefik)</span>
              <span style={error ? styles.badgeError : styles.badgeSuccess}>
                {error ? 'UNREACHABLE' : 'ROUTING'}
              </span>
            </div>
            <p style={styles.statusDesc}>Manages entrypoints and routes paths traffic to backend/frontend.</p>
          </div>

          {/* Backend Health */}
          <div style={styles.statusItem}>
            <div style={styles.statusHeader}>
              <span style={styles.statusLabel}>Go Modular Backend</span>
              <span style={healthLoading ? styles.badgeLoading : health?.status === 'ok' ? styles.badgeSuccess : styles.badgeError}>
                {healthLoading ? 'CHECKING...' : health?.status === 'ok' ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <p style={styles.statusDesc}>Clean Architecture API container exposing core domain adapters.</p>
          </div>

          {/* Postgres Health */}
          <div style={styles.statusItem}>
            <div style={styles.statusHeader}>
              <span style={styles.statusLabel}>PostgreSQL Database</span>
              <span style={healthLoading ? styles.badgeLoading : health?.database === 'connected' ? styles.badgeSuccess : styles.badgeError}>
                {healthLoading ? 'CHECKING...' : health?.database === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
            <p style={styles.statusDesc}>Relational primary data storage and ACID entity transactions.</p>
          </div>

          {/* Redis Health */}
          <div style={styles.statusItem}>
            <div style={styles.statusHeader}>
              <span style={styles.statusLabel}>Redis Cache & Queue</span>
              <span style={healthLoading ? styles.badgeLoading : health?.redis === 'connected' ? styles.badgeSuccess : styles.badgeError}>
                {healthLoading ? 'CHECKING...' : health?.redis === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
            <p style={styles.statusDesc}>In-memory cache layer and event-driven asynchronous execution.</p>
          </div>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <strong>Connection Fault:</strong> {error}
          </div>
        )}

        <div style={styles.footer}>
          <button style={styles.button} onClick={fetchHealth} disabled={healthLoading}>
            {healthLoading ? 'Refreshing...' : 'Refresh Status'}
          </button>
          <span style={styles.versionLabel}>Base Version: v1.0.0</span>
        </div>
      </div>
    </main>
  );
}

// Sleek CSS-in-JS object with dark glassmorphic styling
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at center, #1b2030 0%, #0c0f17 100%)',
    fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#e2e8f0',
    padding: '2rem',
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '3rem',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.1rem',
    margin: '0 0 2.5rem 0',
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  statusItem: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '1.5rem',
    transition: 'all 0.3s ease',
  },
  statusHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  statusLabel: {
    fontWeight: 600,
    fontSize: '1.05rem',
    color: '#f8fafc',
  },
  statusDesc: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    margin: 0,
    lineHeight: '1.4',
  },
  badgeSuccess: {
    fontSize: '0.75rem',
    fontWeight: 700,
    background: 'rgba(34, 197, 94, 0.15)',
    color: '#4ade80',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    letterSpacing: '0.05em',
  },
  badgeError: {
    fontSize: '0.75rem',
    fontWeight: 700,
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    letterSpacing: '0.05em',
  },
  badgeLoading: {
    fontSize: '0.75rem',
    fontWeight: 700,
    background: 'rgba(234, 179, 8, 0.15)',
    color: '#facc15',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    border: '1px solid rgba(234, 179, 8, 0.3)',
    letterSpacing: '0.05em',
  },
  errorBanner: {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    color: '#f87171',
    fontSize: '0.95rem',
    marginBottom: '2.5rem',
  },
  authBanner: {
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '16px',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  authText: {
    color: '#c7d2fe',
    fontSize: '0.95rem',
  },
  logoutButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#f1f5f9',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.4rem 0.8rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '1.5rem',
  },
  button: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.2s ease',
  },
  versionLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
  },
};
