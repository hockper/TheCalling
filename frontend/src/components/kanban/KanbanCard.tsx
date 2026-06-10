import React from 'react';
import type { ServiceRequest } from '../../services/api/model/serviceRequest';

interface KanbanCardProps {
  request: ServiceRequest;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: (id: string) => void;
  assigneeName?: string;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ request, onDragStart, onClick, assigneeName }) => {
  const priorityBadge = (priority: string | undefined) => {
    const map: Record<string, { bg: string; color: string; border: string }> = {
      high: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
      medium: { bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: 'rgba(234, 179, 8, 0.3)' },
      low: { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
    };
    const s = map[priority || ''] || map.low;
    return (
      <span style={{
        fontSize: '0.7rem', fontWeight: 700, background: s.bg, color: s.color,
        padding: '0.2rem 0.5rem', borderRadius: '12px', border: `1px solid ${s.border}`,
        letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>
        {priority}
      </span>
    );
  };

  const formatDate = (iso: string | undefined) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, request.id!)}
      onClick={() => onClick(request.id!)}
      style={styles.card}
      className="kanban-card"
    >
      <h3 style={styles.title}>{request.title}</h3>
      <p style={styles.description}>{request.description}</p>
      
      <div style={styles.footer}>
        <div style={styles.meta}>
          {priorityBadge(request.priority)}
          <span style={styles.date}>{formatDate(request.created_at)}</span>
        </div>
        
        {assigneeName ? (
          <div style={styles.assigneeBadge} title={`Assignee: ${assigneeName}`}>
            <span style={styles.assigneeIcon}>👤</span>
            <span style={styles.assigneeText}>{assigneeName}</span>
          </div>
        ) : request.assignee_id ? (
          <div style={styles.avatar} title={`Assignee: ${request.assignee_id}`}>
            👤
          </div>
        ) : null}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '0.75rem',
    cursor: 'grab',
    transition: 'transform 0.2s, background 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#f8fafc',
    margin: '0 0 0.5rem 0',
  },
  description: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    margin: '0 0 1rem 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: '1.4',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  date: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  avatar: {
    fontSize: '0.9rem',
    background: 'rgba(99, 102, 241, 0.2)',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(99, 102, 241, 0.4)',
  },
  assigneeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    borderRadius: '12px',
    padding: '0.2rem 0.5rem',
    maxWidth: '120px',
  },
  assigneeIcon: {
    fontSize: '0.8rem',
  },
  assigneeText: {
    fontSize: '0.75rem',
    color: '#a5b4fc',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};
