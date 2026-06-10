'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getApiRequestById, listUsers } from '../../../../services/api';
import type { ServiceRequest } from '../../../../services/api/model/serviceRequest';
import type { User } from '../../../../services/api/model/user';

const priorityBadge = (priority: string | undefined): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    high: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
    medium: { bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: 'rgba(234, 179, 8, 0.3)' },
    low: { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
  };
  const s = map[priority || ''] || map.low;
  return {
    fontSize: '0.8rem', fontWeight: 700, background: s.bg, color: s.color,
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
    fontSize: '0.8rem', fontWeight: 700, background: s.bg, color: s.color,
    padding: '0.3rem 0.85rem', borderRadius: '20px', border: `1px solid ${s.border}`,
    letterSpacing: '0.05em', textTransform: 'uppercase',
  };
};

const formatDateTime = (iso: string | undefined) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export default function HandlerRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, User>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, usersRes] = await Promise.all([
          getApiRequestById(id),
          listUsers(),
        ]);
        setRequest(reqRes.data);
        const userMap: Record<string, User> = {};
        if (usersRes.data) {
          usersRes.data.forEach((u) => {
            if (u.id) {
              userMap[u.id] = u;
            }
          });
        }
        setUsers(userMap);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to load request data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <main style={styles.container}>
        <div style={styles.glassCard}>
          <div style={styles.loadingState}>Loading request details...</div>
        </div>
      </main>
    );
  }

  if (error || !request) {
    return (
      <main style={styles.container}>
        <div style={styles.glassCard}>
          <button style={styles.backButton} onClick={() => router.push('/handler/dashboard')}>
            ← Back to Dashboard
          </button>
          <div style={styles.errorBanner}>
            <strong>Error:</strong> {error || 'Request not found'}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.glassCard}>
        <div style={styles.topActions}>
          <button style={styles.backButton} onClick={() => router.push('/handler/dashboard')}>
            ← Back to Dashboard
          </button>
          <button
            style={styles.editActionButton}
            onClick={() => router.push(`/handler/requests/${id}/edit`)}
          >
            ✎ Edit Request
          </button>
        </div>

        <div style={styles.headerRow}>
          <h1 style={styles.title}>{request.title}</h1>
          <div style={styles.badges}>
            <span style={priorityBadge(request.priority)}>{request.priority || 'low'}</span>
            <span style={statusBadge(request.status)}>{(request.status || 'open').replace('_', ' ')}</span>
          </div>
        </div>

        <div style={styles.detailGrid}>
          <div style={styles.detailSection}>
            <h3 style={styles.sectionLabel}>Description</h3>
            <p style={styles.descriptionText}>{request.description}</p>
          </div>

          <div style={styles.metaGrid}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Request ID</span>
              <span style={styles.metaValue}>{request.id}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Creator</span>
              <span style={styles.metaValue}>
                {request.creator_id && users[request.creator_id]
                  ? `${users[request.creator_id].name} (${users[request.creator_id].email})`
                  : request.creator_id || 'Unknown'}
              </span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Assignee</span>
              <span style={styles.metaValue}>
                {request.assignee_id && users[request.assignee_id]
                  ? `${users[request.assignee_id].name} (${users[request.assignee_id].email})`
                  : request.assignee_id || 'Unassigned'}
              </span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Priority</span>
              <span style={styles.metaValue}>{request.priority || 'low'}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Status</span>
              <span style={styles.metaValue}>{(request.status || 'open').replace('_', ' ')}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Created</span>
              <span style={styles.metaValue}>{formatDateTime(request.created_at)}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Last Updated</span>
              <span style={styles.metaValue}>{formatDateTime(request.updated_at)}</span>
            </div>
          </div>
        </div>
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
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  },
  topActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: 0,
    transition: 'color 0.2s ease',
    fontFamily: 'inherit',
  },
  editActionButton: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.6rem 1.25rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  badges: {
    display: 'flex',
    gap: '0.5rem',
    flexShrink: 0,
  },
  detailGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  detailSection: {},
  sectionLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: '0 0 0.75rem 0',
  },
  descriptionText: {
    color: '#e2e8f0',
    fontSize: '1rem',
    lineHeight: '1.7',
    margin: 0,
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
    padding: '1.25rem',
    whiteSpace: 'pre-wrap',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.25rem',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
  },
  metaLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  metaValue: {
    color: '#f8fafc',
    fontSize: '0.9rem',
    fontWeight: 500,
    wordBreak: 'break-all',
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
};
