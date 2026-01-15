
import React, { useState } from 'react';
import { Project, Milestones } from '../types';
// Fixed: Removed non-existent SaveIcon import from MilestoneStepper
import { MilestoneStepper } from './MilestoneStepper';
// Reuse MilestoneStepper and Icons
import { SaveIcon as SaveSvg } from '../constants';

interface ProjectEditModalProps {
  project: Project;
  onSave: (updatedProject: Project) => void;
  onCancel: () => void;
}

export const ProjectEditModal: React.FC<ProjectEditModalProps> = ({ project, onSave, onCancel }) => {
  const [form, setForm] = useState<Project>({ ...project });

  const handleFieldChange = (field: keyof Project, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMilestoneChange = (key: keyof Milestones, value: boolean) => {
    setForm(prev => ({
      ...prev,
      milestones: { ...prev.milestones, [key]: value }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Edit Project</h3>
            <p className="text-sm text-slate-500">{form.utility} / {form.substation}</p>
          </div>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>
        <div className="p-5 space-y-5">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Billable Phases</h4>
              <span className="text-[10px] text-mac-accent bg-blue-50 px-2 py-1 rounded font-semibold">Click to toggle</span>
            </div>
            <div className="flex justify-center">
              <MilestoneStepper 
                milestones={form.milestones} 
                readOnly={false} 
                onChange={handleMilestoneChange} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
              <select 
                value={form.status} 
                onChange={(e) => handleFieldChange('status', e.target.value)} 
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:border-mac-accent outline-none"
              >
                <option value="Active">Active</option>
                <option value="Critical">Critical</option>
                <option value="Late">Late</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lead / PM</label>
              <input type="text" value={form.lead} onChange={(e) => handleFieldChange('lead', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">FAT Date</label>
              <input type="text" value={form.fatDate} onChange={(e) => handleFieldChange('fatDate', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Landing Date</label>
              <input type="text" value={form.landing} onChange={(e) => handleFieldChange('landing', e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Progress: {form.progress}%</label>
            <input type="range" min="0" max="100" value={form.progress || 0} onChange={(e) => handleFieldChange('progress', parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-mac-accent" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => handleFieldChange('description', e.target.value)} rows={3} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Comments / Notes</label>
            <textarea value={form.comments} onChange={(e) => handleFieldChange('comments', e.target.value)} rows={3} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
        </div>
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-2 rounded-b-xl">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white border border-slate-200 rounded-lg">Cancel</button>
          <button 
            onClick={() => onSave(form)} 
            className="px-4 py-2 text-sm font-bold text-white bg-mac-accent hover:bg-mac-blue rounded-lg shadow-sm flex items-center gap-2"
          >
            <SaveSvg className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
