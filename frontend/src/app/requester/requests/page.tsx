'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getApiRequests } from '../../../services/api';
import type { ServiceRequest } from '../../../services/api/model/serviceRequest';

const PAGE_SIZE = 10;

const priorityBadge = (priority: string | undefined): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    high: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
    medium: { bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: 'rgba(234, 179, 8, 0.3)' },
    low: { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
  };
  const s = map[priority || ''] || map.low;
  return {
    fontSize: '0.75rem', fontWeight: 700, background: s.bg, color: s.color,
    padding: '0.3rem 0.85rem', borderRadius: '20px', border: `1px solid ${s.border}`,
    letterSpacing: '0.05em', textTransform: 'uppercase',
  };
};

const statusBadge = (status: string | undefined): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    open: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
    in_progress: { bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: 'rgba(234, 179, 8, 0.3)' },
    resolved: { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
    closed: { bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)' },
  };
  const s = map[status || ''] || map.open;
  return {
    fontSize: '0.75rem', fontWeight: 700, background: s.bg, color: s.color,
    padding: '0.3rem 0.85rem', borderRadius: '20px', border: `1px solid ${s.border}`,
    letterSpacing: '0.05em', textTransform: 'uppercase',
  };
};

const formatDate = (iso: string | undefined) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function RequesterRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const fetchRequests = useCallback(async (currentOffset: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getApiRequests({ limit: PAGE_SIZE, offset: currentOffset });
      setRequests(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(offset);
  }, [offset, fetchRequests]);

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main style={styles.container}>
      <div style={styles.glassCard}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Requests</h1>
            <p style={styles.subtitle}>Track the status of your submitted service requests</p>
          </div>
          <button style={styles.newButton} onClick={() => router.push('/requester/requests/new')}>
            + New Request
          </button>
        </div>

        {loading && <div style={styles.loadingState}>Loading requests...</div>}

        {error && (
          <div style={styles.errorBanner}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No requests yet</p>
            <p style={styles.emptySubtext}>Submit your first request to get started</p>
          </div>
        )}

        {!loading && requests.length > 0 && (
          <>
            <div style={styles.list}>
              {requests.map((req) => (
                <div
                  key={req.id}
                  style={styles.card}
                  onClick={() => router.push(`/requester/requests/${req.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && router.push(`/requester/requests/${req.id}`)}
                >
                  <div style={styles.cardTop}>
                    <span style={styles.cardTitle}>{req.title}</span>
                    <div style={styles.badges}>
                      <span style={priorityBadge(req.priority)}>{req.priority || 'low'}</span>
                      <span style={statusBadge(req.status)}>{(req.status || 'open').replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div style={styles.cardMeta}>
                    <span style={styles.metaText}>Created {formatDate(req.created_at)}</span>
                    <span style={styles.viewLink}>View details →</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  style={{ ...styles.pageButton, ...(offset === 0 ? styles.pageButtonDisabled : {}) }}
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                >
                  ← Previous
                </button>
                <span style={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  style={{ ...styles.pageButton, ...(offset + PAGE_SIZE >= total ? styles.pageButtonDisabled : {}) }}
                  disabled={offset + PAGE_SIZE >= total}
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    background: 'radial-gradient(circle at center, #1b2030 0%, #0c0f17 100%)',
    fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#e2e8f0',
    padding: '2rem',
    paddingTop: '4rem',
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '3rem',
    maxWidth: '900px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
    margin: 0,
  },
  newButton: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  loadingState: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '3rem 0',
    fontSize: '1rem',
  },
  errorBanner: {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    color: '#f87171',
    fontSize: '0.95rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 0',
  },
  emptyText: {
    color: '#f8fafc',
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: '0 0 0.5rem 0',
  },
  emptySubtext: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    margin: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '16px',
    padding: '1.25rem 1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: '1.05rem',
    color: '#f8fafc',
  },
  badges: {
    display: 'flex',
    gap: '0.5rem',
    flexShrink: 0,
  },
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    color: '#64748b',
    fontSize: '0.85rem',
  },
  viewLink: {
    color: '#818cf8',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1.5rem',
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  pageButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#e2e8f0',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.5rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  pageButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  pageInfo: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
};
