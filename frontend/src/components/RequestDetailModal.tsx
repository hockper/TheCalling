'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiRequestById, listUsers } from '../services/api';
import type { ServiceRequest } from '../services/api/model/serviceRequest';
import type { User } from '../services/api/model/user';

interface RequestDetailModalProps {
  id: string;
  onClose: () => void;
}

const priorityBadge = (priority: string | undefined): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    high: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
    medium: { bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: 'rgba(234, 179, 8, 0.3)' },
    low: { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
  };
  const s = map[priority || ''] || map.low;
  return {
    fontSize: '0.8rem',
    fontWeight: 700,
    background: s.bg,
    color: s.color,
    padding: '0.3rem 0.85rem',
    borderRadius: '20px',
    border: `1px solid ${s.border}`,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
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
    fontSize: '0.8rem',
    fontWeight: 700,
    background: s.bg,
    color: s.color,
    padding: '0.3rem 0.85rem',
    borderRadius: '20px',
    border: `1px solid ${s.border}`,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  };
};

const formatDateTime = (iso: string | undefined) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function RequestDetailModal({ id, onClose }: RequestDetailModalProps) {
  const router = useRouter();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, User>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
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

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeCornerButton} onClick={onClose} aria-label="Close modal">
          &times;
        </button>

        {loading ? (
          <div style={styles.loadingState}>Loading request details...</div>
        ) : error || !request ? (
          <div>
            <div style={styles.errorBanner}>
              <strong>Error:</strong> {error || 'Request not found'}
            </div>
            <div style={styles.bottomActions}>
              <button style={styles.backButtonPrimary} onClick={onClose}>
                ← Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={styles.topActions}>
              <button style={styles.backButtonLink} onClick={onClose}>
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
              <h2 style={styles.title}>{request.title}</h2>
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
          </>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem',
    animation: 'fadeIn 0.2s ease',
  },
  modalCard: {
    background: 'rgba(21, 25, 38, 0.85)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '2.5rem',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    color: '#e2e8f0',
    fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  closeCornerButton: {
    position: 'absolute',
    top: '1.25rem',
    right: '1.5rem',
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '2rem',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    transition: 'color 0.2s ease',
  },
  topActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  bottomActions: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '1.5rem',
  },
  backButtonLink: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: 0,
    transition: 'color 0.2s ease',
    fontFamily: 'inherit',
  },
  backButtonPrimary: {
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
