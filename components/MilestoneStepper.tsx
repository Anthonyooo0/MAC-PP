
import React from 'react';
import { Milestones, MilestoneStatus } from '../types';
import { CheckIcon } from '../constants';

interface MilestoneStepperProps {
  milestones: Milestones;
  readOnly?: boolean;
  onChange?: (key: keyof Milestones, value: MilestoneStatus) => void;
}

// Helper to normalize boolean to MilestoneStatus (for backwards compatibility)
const normalizeStatus = (value: MilestoneStatus | boolean): MilestoneStatus => {
  if (typeof value === 'boolean') {
    return value ? 'completed' : 'not_started';
  }
  return value;
};

// Get next status in cycle: not_started -> started -> stuck -> completed -> not_started
const getNextStatus = (current: MilestoneStatus): MilestoneStatus => {
  const cycle: MilestoneStatus[] = ['not_started', 'started', 'stuck', 'completed'];
  const currentIndex = cycle.indexOf(current);
  return cycle[(currentIndex + 1) % cycle.length];
};

// Get status colors and styles
const getStatusStyle = (status: MilestoneStatus, isReadOnly: boolean) => {
  const baseSize = isReadOnly ? 'w-7 h-7' : 'w-9 h-9';

  switch (status) {
    case 'started':
      return {
        bg: 'bg-blue-500',
        text: 'text-white',
        border: '',
        lineColor: 'bg-blue-500',
        className: `${baseSize} ${isReadOnly ? '' : 'shadow-md hover:scale-110'}`,
      };
    case 'stuck':
      return {
        bg: 'bg-yellow-400',
        text: 'text-yellow-900',
        border: '',
        lineColor: 'bg-yellow-400',
        className: `${baseSize} ${isReadOnly ? '' : 'shadow-md hover:scale-110'}`,
      };
    case 'completed':
      return {
        bg: 'bg-green-500',
        text: 'text-white',
        border: '',
        lineColor: 'bg-green-500',
        className: `${baseSize} ${isReadOnly ? '' : 'shadow-md hover:scale-110'}`,
      };
    default: // not_started
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-400',
        border: isReadOnly ? 'border border-slate-200' : 'border-2 border-dashed border-slate-300 hover:border-blue-400 hover:text-blue-400',
        lineColor: 'bg-slate-200',
        className: `${baseSize} ${isReadOnly ? '' : 'hover:scale-110'}`,
      };
  }
};

// Get icon or text for status
const getStatusContent = (status: MilestoneStatus, shortLabel: string) => {
  switch (status) {
    case 'completed':
      return <CheckIcon className="w-4 h-4" />;
    case 'started':
      return <span className="text-[10px]">●</span>;
    case 'stuck':
      return <span className="text-[10px] font-bold">!</span>;
    default:
      return <span className="text-[9px]">{shortLabel}</span>;
  }
};

export const MilestoneStepper: React.FC<MilestoneStepperProps> = ({ milestones, readOnly = true, onChange }) => {
  const steps: { key: keyof Milestones; label: string; short: string }[] = [
    { key: 'design', label: 'Design', short: 'DES' },
    { key: 'mat', label: 'Material', short: 'MAT' },
    { key: 'fab', label: 'Fabrication', short: 'FAB' },
    { key: 'fat', label: 'FAT', short: 'FAT' },
    { key: 'ship', label: 'Ship', short: 'SHIP' },
  ];

  // Status labels for tooltip
  const statusLabels: Record<MilestoneStatus, string> = {
    not_started: 'Not Started',
    started: 'Started',
    stuck: 'Stuck',
    completed: 'Completed',
  };

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const status = normalizeStatus(milestones[step.key]);
        const style = getStatusStyle(status, readOnly);
        const isLast = i === steps.length - 1;

        return (
          <div key={step.key} className="flex items-center">
            {readOnly ? (
              <div
                className={`${style.className} ${style.bg} ${style.text} ${style.border} rounded-full flex items-center justify-center font-bold transition-all`}
                title={`${step.label}: ${statusLabels[status]}`}
              >
                {getStatusContent(status, step.short)}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onChange?.(step.key, getNextStatus(status))}
                className={`${style.className} ${style.bg} ${style.text} ${style.border} rounded-full flex items-center justify-center font-bold transition-all cursor-pointer`}
                title={`${step.label}: ${statusLabels[status]} - Click to change`}
              >
                {getStatusContent(status, step.short)}
              </button>
            )}
            {!isLast && (
              <div className={`w-3 h-0.5 mx-0.5 ${style.lineColor}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};
