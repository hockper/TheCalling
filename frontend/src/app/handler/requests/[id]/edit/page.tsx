'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getApiRequestById, patchApiRequest, listUsers } from '../../../../../services/api';
import type { ServiceRequest } from '../../../../../services/api/model/serviceRequest';
import type { UpdateRequest } from '../../../../../services/api/model/updateRequest';
import type { User } from '../../../../../services/api/model/user';

type Priority = 'low' | 'medium' | 'high';
type Status = 'open' | 'in_progress' | 'resolved' | 'closed';

export default function HandlerEditRequestPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('open');
  const [assigneeId, setAssigneeId] = useState('');
  const [handlers, setHandlers] = useState<User[]>([]);
  const [loadingHandlers, setLoadingHandlers] = useState(true);

  // Originals for diffing
  const originals = useRef<{ title: string; description: string; priority: Priority; status: Status; assignee_id: string }>({
    title: '', description: '', priority: 'medium', status: 'open', assignee_id: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, handlersRes] = await Promise.all([
          getApiRequestById(id),
          listUsers({ role: 'handler' }),
        ]);
        const r: ServiceRequest = reqRes.data;
        setTitle(r.title || '');
        setDescription(r.description || '');
        setPriority((r.priority as Priority) || 'medium');
        setStatus((r.status as Status) || 'open');
        setAssigneeId(r.assignee_id || '');
        originals.current = {
          title: r.title || '',
          description: r.description || '',
          priority: (r.priority as Priority) || 'medium',
          status: (r.status as Status) || 'open',
          assignee_id: r.assignee_id || '',
        };
        setHandlers(handlersRes.data || []);
      } catch (err: any) {
        setFetchError(err.response?.data?.error || err.message || 'Failed to load data');
      } finally {
        setLoading(false);
        setLoadingHandlers(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Build patch body with only changed fields
    const body: UpdateRequest = {};
    if (title.trim() !== originals.current.title) body.title = title.trim();
    if (description.trim() !== originals.current.description) body.description = description.trim();
    if (priority !== originals.current.priority) body.priority = priority;
    if (status !== originals.current.status) body.status = status;
    if (assigneeId.trim() !== originals.current.assignee_id) body.assignee_id = assigneeId.trim();

    if (Object.keys(body).length === 0) {
      router.push(`/handler/requests/${id}`);
      return;
    }

    try {
      await patchApiRequest(id, body);
      router.push(`/handler/requests/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main style={styles.container}>
        <div style={styles.glassCard}>
          <div style={styles.loadingState}>Loading request data...</div>
        </div>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main style={styles.container}>
        <div style={styles.glassCard}>
          <button style={styles.backButton} onClick={() => router.push('/handler/dashboard')}>
            ← Back to Dashboard
          </button>
          <div style={styles.errorBanner}>
            <strong>Error:</strong> {fetchError}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.glassCard}>
        <button style={styles.backButton} onClick={() => router.push(`/handler/requests/${id}`)}>
          ← Back to Details
        </button>

        <h1 style={styles.title}>Edit Request</h1>
        <p style={styles.subtitle}>Modify the service request fields below</p>

        {error && (
          <div style={styles.errorBanner}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Title */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              placeholder="Request title"
            />
          </div>

          {/* Description */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...styles.input, ...styles.textarea }}
              placeholder="Request description"
              rows={5}
            />
          </div>

          {/* Priority */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              style={styles.select}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Status */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              style={styles.select}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Assignee Selection */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              style={styles.select}
              disabled={loadingHandlers}
            >
              <option value="">-- Unassigned --</option>
              {handlers.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => router.push(`/handler/requests/${id}`)}
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={styles.submitButton}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
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
    maxWidth: '640px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '1.5rem',
    transition: 'color 0.2s ease',
    fontFamily: 'inherit',
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
    margin: '0 0 2rem 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    fontWeight: 500,
  },
  input: {
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#f8fafc',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',
  },
  textarea: {
    resize: 'vertical' as const,
    minHeight: '120px',
  },
  select: {
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#f8fafc',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
  },
  errorBanner: {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    color: '#f87171',
    fontSize: '0.95rem',
    marginBottom: '1rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '0.5rem',
  },
  cancelButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#94a3b8',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '0.75rem 1.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  submitButton: {
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
  },
  loadingState: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '3rem 0',
    fontSize: '1rem',
  },
};
