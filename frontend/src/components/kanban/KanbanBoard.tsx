import React from 'react';
import type { ServiceRequest } from '../../services/api/model/serviceRequest';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  requests: ServiceRequest[];
  onStatusChange: (id: string, newStatus: string) => void;
  onCardClick: (id: string) => void;
  usersMap?: Record<string, string>;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  requests,
  onStatusChange,
  onCardClick,
  usersMap,
}) => {
  const columns = [
    { title: 'Open', status: 'open' },
    { title: 'In Progress', status: 'in_progress' },
    { title: 'Resolved', status: 'resolved' },
    { title: 'Closed', status: 'closed' },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      onStatusChange(id, status);
    }
  };

  const getRequestsByStatus = (status: string) => {
    return requests.filter((req) => req.status === status);
  };

  return (
    <div style={styles.board} className="kanban-board">
      {columns.map((col) => (
        <KanbanColumn
          key={col.status}
          title={col.title}
          status={col.status}
          requests={getRequestsByStatus(col.status)}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onCardClick={onCardClick}
          usersMap={usersMap}
        />
      ))}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  board: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
    overflowX: 'auto',
    paddingBottom: '1rem',
  },
};
