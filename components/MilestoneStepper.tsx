
import React from 'react';
import { Milestones } from '../types';
import { CheckIcon } from '../constants';

interface MilestoneStepperProps {
  milestones: Milestones;
  readOnly?: boolean;
  onChange?: (key: keyof Milestones, value: boolean) => void;
}

export const MilestoneStepper: React.FC<MilestoneStepperProps> = ({ milestones, readOnly = true, onChange }) => {
  const steps: { key: keyof Milestones; label: string; short: string }[] = [
    { key: 'design', label: 'Design', short: 'DES' },
    { key: 'mat', label: 'Material', short: 'MAT' },
    { key: 'fab', label: 'Fabrication', short: 'FAB' },
    { key: 'fat', label: 'FAT', short: 'FAT' },
    { key: 'ship', label: 'Ship', short: 'SHIP' },
  ];

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const isComplete = milestones[step.key];
        const isLast = i === steps.length - 1;

        return (
          <div key={step.key} className="flex items-center">
            {readOnly ? (
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold transition-all
                  ${isComplete
                    ? 'bg-mac-accent text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                title={step.label}
              >
                {isComplete ? <CheckIcon className="w-3 h-3" /> : step.short}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onChange?.(step.key, !isComplete)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer hover:scale-110
                  ${isComplete
                    ? 'bg-mac-accent text-white shadow-md'
                    : 'bg-slate-100 text-slate-400 border-2 border-dashed border-slate-300 hover:border-mac-accent hover:text-mac-accent'
                  }`}
                title={`${step.label} - Click to toggle`}
              >
                {isComplete ? <CheckIcon className="w-4 h-4" /> : step.short}
              </button>
            )}
            {!isLast && (
              <div className={`w-3 h-0.5 mx-0.5 ${isComplete ? 'bg-mac-accent' : 'bg-slate-200'}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};
