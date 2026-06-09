'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { postApiRequests, listUsers } from '../../../../services/api';
import type { NewRequestPriority } from '../../../../services/api/model/newRequestPriority';
import type { User } from '../../../../services/api/model/user';

export default function NewRequestPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<NewRequestPriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [handlers, setHandlers] = useState<User[]>([]);
  const [loadingHandlers, setLoadingHandlers] = useState(true);

  useEffect(() => {
    const fetchHandlers = async () => {
      try {
        const res = await listUsers({ role: 'handler' });
        setHandlers(res.data || []);
      } catch (err: any) {
        console.error('Failed to load handlers', err);
        setError('Failed to load available handlers');
      } finally {
        setLoadingHandlers(false);
      }
    };
    fetchHandlers();
  }, []);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    try {
      await postApiRequests({
        title: title.trim(),
        description: description.trim(),
        priority,
        ...(assigneeId ? { assignee_id: assigneeId } : {}),
      });
      router.push('/requester/requests');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.glassCard}>
        <button style={styles.backButton} onClick={() => router.push('/requester/requests')}>
          ← Back to My Requests
        </button>

        <h1 style={styles.title}>New Service Request</h1>
        <p style={styles.subtitle}>Submit a new request to the handler team</p>

        {error && (
          <div style={styles.errorBanner}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Title */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Title <span style={styles.required}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setFieldErrors((p) => ({ ...p, title: '' })); }}
              style={{ ...styles.input, ...(fieldErrors.title ? styles.inputError : {}) }}
              placeholder="Brief summary of the request"
            />
            {fieldErrors.title && <span style={styles.fieldError}>{fieldErrors.title}</span>}
          </div>

          {/* Description */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Description <span style={styles.required}>*</span></label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setFieldErrors((p) => ({ ...p, description: '' })); }}
              style={{ ...styles.input, ...styles.textarea, ...(fieldErrors.description ? styles.inputError : {}) }}
              placeholder="Detailed description of what you need..."
              rows={5}
            />
            {fieldErrors.description && <span style={styles.fieldError}>{fieldErrors.description}</span>}
          </div>

          {/* Priority */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Priority <span style={styles.required}>*</span></label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as NewRequestPriority)}
              style={styles.select}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
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
              <option value="">-- Automatic Distribution --</option>
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
              onClick={() => router.push('/requester/requests')}
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={styles.submitButton}>
              {submitting ? 'Submitting...' : 'Submit Request'}
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
  required: {
    color: '#f87171',
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
  inputError: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
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
  fieldError: {
    color: '#f87171',
    fontSize: '0.8rem',
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
};
