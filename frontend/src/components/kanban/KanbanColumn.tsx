import React from 'react';
import type { ServiceRequest } from '../../services/api/model/serviceRequest';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  title: string;
  status: string;
  requests: ServiceRequest[];
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: string) => void;
  onCardClick: (id: string) => void;
  usersMap?: Record<string, string>;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  requests,
  onDragStart,
  onDragOver,
  onDrop,
  onCardClick,
  usersMap,
}) => {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
      style={styles.column}
    >
      <div style={styles.header}>
        <h2 style={styles.title}>{title}</h2>
        <span style={styles.badge}>{requests.length}</span>
      </div>
      <div style={styles.cardList} className="custom-scrollbar">
        {requests.map((req) => (
          <KanbanCard
            key={req.id}
            request={req}
            onDragStart={onDragStart}
            onClick={onCardClick}
            assigneeName={req.assignee_id && usersMap ? usersMap[req.assignee_id] : undefined}
          />
        ))}
        {requests.length === 0 && (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No items</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  column: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '230px',
    flex: 1,
    height: '600px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#e2e8f0',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  badge: {
    fontSize: '0.75rem',
    fontWeight: 700,
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#94a3b8',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
  },
  cardList: {
    overflowY: 'auto',
    flex: 1,
    paddingRight: '2px',
  },
  empty: {
    border: '2px dashed rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    padding: '2rem 1rem',
    textAlign: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: '0.85rem',
    margin: 0,
  },
};
