'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getApiRequests, updateRequest, listUsers } from '../../../services/api';
import { KanbanBoard } from '../../../components/kanban/KanbanBoard';
import { ToggleSwitch } from '../../../components/common/ToggleSwitch';
import type { ServiceRequest } from '../../../services/api/model/serviceRequest';

const PAGE_SIZE = 500;

export default function HandlerDashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewAll, setViewAll] = useState(false);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});

  const fetchData = useCallback(async (all: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getApiRequests({ 
        limit: PAGE_SIZE, 
        scope: all ? 'all' : 'me' 
      });
      setRequests(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(viewAll);
  }, [viewAll, fetchData]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await listUsers({ role: 'handler' });
        if (res.data) {
          const map: Record<string, string> = {};
          res.data.forEach((u: any) => {
            if (u.id && u.name) {
              map[u.id] = u.name;
            }
          });
          setUsersMap(map);
        }
      } catch (err) {
        console.error('Failed to load users for assignee mapping:', err);
      }
    }
    fetchUsers();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      // Optimistically update status locally
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: newStatus as any } : req))
      );
      await updateRequest(id, { status: newStatus as any });
      fetchData(viewAll);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update status');
      fetchData(viewAll);
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.glassCard}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Handler Dashboard</h1>
            <p style={styles.subtitle}>
              Service requests &mdash; {total} total
            </p>
          </div>
          <div>
            <ToggleSwitch
              checked={viewAll}
              onChange={(val) => setViewAll(val)}
              label="Show All Requests"
            />
          </div>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && <div style={styles.loadingState}>Loading requests...</div>}

        {!loading && !error && requests.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No requests found</p>
            <p style={styles.emptySubtext}>There are no service requests in the system yet</p>
          </div>
        )}

        {!loading && requests.length > 0 && (
          <KanbanBoard
            requests={requests}
            onStatusChange={handleStatusChange}
            onCardClick={(id) => router.push(`/handler/requests/${id}`)}
            usersMap={usersMap}
          />
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
    maxWidth: '1100px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: '1.5rem',
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
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '1rem 1.25rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  tr: {
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  td: {
    padding: '1rem 1.25rem',
    verticalAlign: 'middle',
  },
  cellTitle: {
    fontWeight: 600,
    fontSize: '0.95rem',
    color: '#f8fafc',
  },
  dateText: {
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  editButton: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '8px',
    padding: '0.35rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
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
