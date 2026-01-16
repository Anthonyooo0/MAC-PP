
import React, { useState } from 'react';
import { Project, ProjectCategory, ProjectStatus, Milestones } from '../types';

interface NewProjectModalProps {
  onSave: (project: Project) => void;
  onCancel: () => void;
  nextId: number;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ onSave, onCancel, nextId }) => {
  const [formData, setFormData] = useState({
    category: 'Pumping' as ProjectCategory,
    utility: '',
    substation: '',
    order: '',
    fatDate: '',
    landing: '',
    status: 'Active' as ProjectStatus,
    progress: 0,
    lead: '',
    description: '',
    comments: '',
  });

  const [milestones, setMilestones] = useState<Milestones>({
    design: false,
    mat: false,
    fab: false,
    fat: false,
    ship: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProject: Project = {
      id: nextId,
      category: formData.category,
      utility: formData.utility,
      substation: formData.substation,
      dateCreated: new Date().toLocaleDateString(),
      order: formData.order,
      fatDate: formData.fatDate || 'N/A',
      landing: formData.landing || 'TBD',
      status: formData.status,
      progress: formData.progress,
      lead: formData.lead || 'TBD',
      description: formData.description,
      comments: formData.comments,
      milestones: milestones,
    };

    onSave(newProject);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-mac-navy text-white px-6 py-4 rounded-t-2xl">
          <h2 className="text-xl font-bold">Add New Project</h2>
          <p className="text-blue-200 text-sm">Fill in the project details below</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
                required
              >
                <option value="Pumping">Pumping</option>
                <option value="Field Service">Field Service</option>
                <option value="EHV">EHV</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
                required
              >
                <option value="Active">Active</option>
                <option value="Critical">Critical</option>
                <option value="Late">Late</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          {/* Utility & Substation Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Utility *</label>
              <input
                type="text"
                value={formData.utility}
                onChange={(e) => setFormData({ ...formData, utility: e.target.value })}
                placeholder="e.g., Con Edison"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Substation *</label>
              <input
                type="text"
                value={formData.substation}
                onChange={(e) => setFormData({ ...formData, substation: e.target.value })}
                placeholder="e.g., Farragut/Gowanus"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
                required
              />
            </div>
          </div>

          {/* Order & Lead Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Order # *</label>
              <input
                type="text"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                placeholder="e.g., 169187"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Project Lead</label>
              <input
                type="text"
                value={formData.lead}
                onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                placeholder="e.g., Jason"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
              />
            </div>
          </div>

          {/* FAT Date & Landing Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">FAT Date</label>
              <input
                type="text"
                value={formData.fatDate}
                onChange={(e) => setFormData({ ...formData, fatDate: e.target.value })}
                placeholder="e.g., 12/29/2025 or N/A"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Landing Date</label>
              <input
                type="text"
                value={formData.landing}
                onChange={(e) => setFormData({ ...formData, landing: e.target.value })}
                placeholder="e.g., Mar-26 or Dec. 2025"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
              />
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Progress: {formData.progress}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-mac-accent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project scope and requirements..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none resize-none"
              required
            />
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Comments</label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Additional notes or updates..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none resize-none"
            />
          </div>

          {/* Milestones */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Milestones</label>
            <div className="grid grid-cols-5 gap-2">
              {(['design', 'mat', 'fab', 'fat', 'ship'] as (keyof Milestones)[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMilestones({ ...milestones, [key]: !milestones[key] })}
                  className={`py-3 px-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                    milestones[key]
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-mac-navy text-white font-bold hover:bg-mac-blue transition-all shadow-lg"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
