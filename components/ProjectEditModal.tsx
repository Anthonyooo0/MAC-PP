
import React, { useState, useRef, useEffect } from 'react';
import { Project, Milestones, PunchListItem } from '../types';
import { MilestoneStepper } from './MilestoneStepper';
import { SaveIcon as SaveSvg, PlusIcon, CheckIcon } from '../constants';

interface ProjectEditModalProps {
  project: Project;
  onSave: (updatedProject: Project) => void;
  onCancel: () => void;
  onDelete: (projectId: number) => void;
}

export const ProjectEditModal: React.FC<ProjectEditModalProps> = ({ project, onSave, onCancel, onDelete }) => {
  const [form, setForm] = useState<Project>({ ...project });
  const [newPunchItem, setNewPunchItem] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const punchListRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to punch list section when FAT milestone is checked
  useEffect(() => {
    if (form.milestones.fat && !project.milestones.fat) {
      // Wait for the punch list section to render, then scroll to it
      setTimeout(() => {
        if (punchListRef.current && modalContentRef.current) {
          punchListRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [form.milestones.fat, project.milestones.fat]);

  const handleFieldChange = (field: keyof Project, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMilestoneChange = (key: keyof Milestones, value: boolean) => {
    setForm(prev => ({
      ...prev,
      milestones: { ...prev.milestones, [key]: value }
    }));
  };

  const handleAddPunchItem = () => {
    if (!newPunchItem.trim()) return;
    const newItem: PunchListItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: newPunchItem.trim(),
      completed: false
    };
    setForm(prev => ({
      ...prev,
      punchList: [...(prev.punchList || []), newItem]
    }));
    setNewPunchItem('');
  };

  const handleRemovePunchItem = (itemId: string) => {
    setForm(prev => ({
      ...prev,
      punchList: (prev.punchList || []).filter(item => item.id !== itemId)
    }));
  };

  const handleTogglePunchItem = (itemId: string) => {
    setForm(prev => ({
      ...prev,
      punchList: (prev.punchList || []).map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div ref={modalContentRef} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

          {/* Punch List Section - Shows when FAT milestone is checked */}
          {form.milestones.fat && (
            <div
              ref={punchListRef}
              className="p-4 rounded-xl border-2 bg-slate-50 border-slate-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">FAT Punch List</h4>
                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded font-semibold">
                  {(form.punchList || []).filter(i => i.completed).length} / {(form.punchList || []).length} Complete
                </span>
              </div>

              {/* Add new item */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newPunchItem}
                  onChange={(e) => setNewPunchItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPunchItem()}
                  placeholder="Add punch list item..."
                  className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:border-mac-accent outline-none"
                />
                <button
                  onClick={handleAddPunchItem}
                  className="px-4 py-2 bg-mac-accent hover:bg-mac-blue text-white rounded-lg font-bold text-sm flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" /> Add
                </button>
              </div>

              {/* Punch list items */}
              <div className="space-y-2">
                {(form.punchList || []).length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No punch list items yet. Add items that need to be addressed after FAT.</p>
                ) : (
                  (form.punchList || []).map((item, idx) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        item.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <button
                        onClick={() => handleTogglePunchItem(item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          item.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-white border-slate-300 hover:border-mac-accent'
                        }`}
                      >
                        {item.completed && <CheckIcon className="w-4 h-4" />}
                      </button>
                      <span className={`flex-1 text-sm ${item.completed ? 'text-green-700 line-through' : 'text-slate-700'}`}>
                        {item.description}
                      </span>
                      <button
                        onClick={() => handleRemovePunchItem(item.id)}
                        className="text-slate-400 hover:text-red-500 text-lg font-bold"
                      >
                        &times;
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-slate-50 flex justify-between rounded-b-xl">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg"
          >
            Delete Project
          </button>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white border border-slate-200 rounded-lg">Cancel</button>
            <button
              onClick={() => onSave(form)}
              className="px-4 py-2 text-sm font-bold text-white bg-mac-accent hover:bg-mac-blue rounded-lg shadow-sm flex items-center gap-2"
            >
              <SaveSvg className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Project?</h3>
              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to delete <strong>{project.utility} / {project.substation}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
