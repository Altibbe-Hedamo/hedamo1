import React from 'react';

// Define valid status types
type StatusType =
  | 'pending'
  | 'active'
  | 'info_requested'
  | 'none'
  | 'intake_pending'
  | 'intake_completed'
  | 'ground_pending'
  | 'ground_completed';

interface StatusBadgeProps {
  status: string; // Changed to string only
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // Map statuses to display text and colors
  const statusConfig: Record<StatusType, { text: string; bgColor: string; textColor: string }> = {
    pending: { text: 'Pending', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
    active: { text: 'Active', bgColor: 'bg-green-100', textColor: 'text-green-800' },
    info_requested: { text: 'Info Requested', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
    none: { text: 'None', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
    intake_pending: { text: 'Intake Pending', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
    intake_completed: { text: 'Intake Completed', bgColor: 'bg-teal-100', textColor: 'text-teal-800' },
    ground_pending: { text: 'Ground Pending', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
    ground_completed: { text: 'Ground Completed', bgColor: 'bg-green-200', textColor: 'text-green-900' },
  };

  // Safely access statusConfig with type assertion or fallback
  const config = statusConfig[status as StatusType] || {
    text: 'Unknown',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
    >
      {config.text}
    </span>
  );
};

export default StatusBadge;