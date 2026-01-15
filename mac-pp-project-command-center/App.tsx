
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Project, 
  ProjectStatus, 
  ViewMode, 
  ProjectCategory, 
  ChangeLogEntry,
  Milestones
} from './types';
import { 
  INITIAL_DATA, 
  DashboardIcon, 
  ListIcon, 
  CalendarIcon, 
  LogIcon,
  SearchIcon, 
  FilterIcon, 
  ChevronDownIcon,
  AlertIcon,
  CheckIcon,
  TruckIcon,
  ToolIcon,
  ZapIcon,
  EditIcon,
  LogoutIcon
} from './constants';
import { Login } from './components/Login';
import { MilestoneStepper } from './components/MilestoneStepper';
import { ProjectEditModal } from './components/ProjectEditModal';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(INITIAL_DATA);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [activeTab, setActiveTab] = useState<ProjectCategory>('Pumping');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Authentication persistence (mock)
  useEffect(() => {
    const savedUser = localStorage.getItem('mac_user');
    if (savedUser) setCurrentUser(savedUser);
  }, []);

  const handleLogin = (email: string) => {
    setCurrentUser(email);
    localStorage.setItem('mac_user', email);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mac_user');
  };

  const handleSaveProject = (updated: Project) => {
    const original = projects.find(p => p.id === updated.id);
    if (!original) return;

    // Record change log for ALL fields
    const diffs: string[] = [];
    
    // Check top-level fields
    const fieldsToTrack: (keyof Project)[] = [
      'status', 'progress', 'lead', 'fatDate', 'landing', 'description', 'comments'
    ];

    fieldsToTrack.forEach(field => {
      if (original[field] !== updated[field]) {
        const label = field.charAt(0).toUpperCase() + field.slice(1);
        diffs.push(`${label}: "${original[field]}" -> "${updated[field]}"`);
      }
    });
    
    // Milestone diffs
    const mKeys = Object.keys(original.milestones) as (keyof Milestones)[];
    mKeys.forEach(k => {
      if (original.milestones[k] !== updated.milestones[k]) {
        const statusOrig = original.milestones[k] ? 'Done' : 'Pending';
        const statusUpd = updated.milestones[k] ? 'Done' : 'Pending';
        diffs.push(`${k.toUpperCase()}: ${statusOrig} -> ${statusUpd}`);
      }
    });

    if (diffs.length > 0) {
      const newLog: ChangeLogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleString(),
        userEmail: currentUser || 'Unknown',
        projectId: updated.id,
        projectInfo: `${updated.utility} - ${updated.substation}`,
        action: 'Updated Project Details',
        changes: diffs.join(' | ')
      };
      setChangeLog(prev => [newLog, ...prev]);
    }

    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditingProject(null);
  };

  // --- Filtering ---
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (viewMode === 'dashboard') return true;
      if (viewMode === 'calendar') return true;
      const matchesTab = p.category === activeTab;
      const matchesSearch = 
        p.utility.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.substation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.order.includes(searchTerm);
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
      return matchesTab && matchesSearch && matchesStatus;
    });
  }, [projects, activeTab, searchTerm, filterStatus, viewMode]);

  const stats = useMemo(() => {
    const critical = projects.filter(p => p.status === 'Critical').length;
    const fatReady = projects.filter(p => p.milestones.fab && !p.milestones.fat).length;
    const shipReady = projects.filter(p => p.milestones.fat && !p.milestones.ship).length;
    const done = projects.filter(p => p.status === 'Done').length;
    return { total: projects.length, critical, fatReady, shipReady, done };
  }, [projects]);

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-mac-light">
      {/* SIDEBAR */}
      <aside className={`sidebar flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex-shrink-0 text-white`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-mac-navy font-black text-sm">MAC</span>
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-sm truncate">PROJECT CENTER</h1>
                <p className="text-blue-200 text-[10px] truncate uppercase font-bold tracking-tighter">{currentUser}</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <div className={`px-3 mb-2 ${sidebarCollapsed ? 'hidden' : ''}`}>
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Navigation</span>
          </div>
          {[
            { id: 'dashboard', label: 'Pipeline', icon: DashboardIcon },
            { id: 'list', label: 'Projects', icon: ListIcon },
            { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
            { id: 'changelog', label: 'Audit Log', icon: LogIcon },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setViewMode(item.id as ViewMode)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all
                ${viewMode === item.id 
                  ? 'nav-active text-white bg-white/10' 
                  : 'text-blue-200 hover:text-white hover:bg-white/5'
                }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-blue-200 hover:text-white hover:bg-white/5 rounded-lg transition-all`}
          >
            <LogoutIcon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>

        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-3 border-t border-white/10 text-blue-200 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronDownIcon className={`w-5 h-5 mx-auto transition-transform ${sidebarCollapsed ? 'rotate-90' : '-rotate-90'}`} />
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
              {viewMode === 'dashboard' && 'Operations Pipeline'}
              {viewMode === 'list' && `${activeTab} Inventory`}
              {viewMode === 'calendar' && 'Project Schedule'}
              {viewMode === 'changelog' && 'System Audit Log'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             {viewMode === 'list' && (
               <div className="relative">
                 <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search..."
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-mac-accent w-48"
                 />
               </div>
             )}
             <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">V2.1.0</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {/* PIPELINE / DASHBOARD */}
          {viewMode === 'dashboard' && (
            <div className="space-y-6 view-transition">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border-l-4 border-l-red-500 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Critical Blockers</div>
                    <div className="text-3xl font-bold text-slate-800">{stats.critical}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border-l-4 border-l-mac-accent shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">FAT Pending</div>
                    <div className="text-3xl font-bold text-slate-800">{stats.fatReady}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border-l-4 border-l-green-500 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Ready to Ship</div>
                    <div className="text-3xl font-bold text-slate-800">{stats.shipReady}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border-l-4 border-l-slate-300 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Completed</div>
                    <div className="text-3xl font-bold text-slate-800">{stats.done}</div>
                  </div>
               </div>

               <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 text-sm">Financial Tracking Pipeline</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {projects.map(p => (
                      <div key={p.id} className="p-4 hover:bg-slate-50 flex items-center gap-4 cursor-pointer" onClick={() => setEditingProject(p)}>
                        <div className={`w-2 h-2 rounded-full ${p.status === 'Critical' ? 'bg-red-500' : 'bg-mac-accent'}`} />
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-800">{p.utility} - {p.substation}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Order: {p.order}</div>
                        </div>
                        <MilestoneStepper milestones={p.milestones} />
                        <div className="w-24 text-right">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded border ${p.status === 'Critical' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-blue-50 border-blue-200 text-mac-accent'}`}>{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {/* PROJECT LIST */}
          {viewMode === 'list' && (
            <div className="space-y-6 view-transition">
               <div className="flex gap-4 border-b border-slate-200 pb-2">
                  {['Pumping', 'Field Service', 'EHV'].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveTab(cat as ProjectCategory)}
                      className={`px-4 py-2 text-sm font-bold transition-all ${activeTab === cat ? 'text-mac-accent border-b-2 border-mac-accent' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {cat}
                    </button>
                  ))}
               </div>
               <div className="grid grid-cols-1 gap-4">
                 {filteredProjects.map(p => (
                    <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-mac-accent transition-all cursor-pointer" onClick={() => setEditingProject(p)}>
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-bold text-slate-800">{p.utility} / {p.substation}</h3>
                          <span className="text-xs font-mono text-slate-400">#{p.order}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{p.description}</p>
                        <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg text-[11px]">
                          <div><span className="text-slate-400 uppercase font-bold block">Lead</span>{p.lead}</div>
                          <div><span className="text-slate-400 uppercase font-bold block">Landing</span>{p.landing}</div>
                          <div><span className="text-slate-400 uppercase font-bold block">FAT</span>{p.fatDate}</div>
                        </div>
                      </div>
                      <div className="w-48 flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${p.status === 'Critical' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-mac-accent border-blue-200'}`}>{p.status}</span>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                          <div className="bg-mac-accent h-full" style={{width: `${p.progress}%`}} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{p.progress}% Progress</span>
                      </div>
                    </div>
                 ))}
               </div>
            </div>
          )}

          {/* AUDIT LOG */}
          {viewMode === 'changelog' && (
            <div className="space-y-4 view-transition">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-bold text-slate-600">Timestamp</th>
                      <th className="px-6 py-4 font-bold text-slate-600">User</th>
                      <th className="px-6 py-4 font-bold text-slate-600">Project</th>
                      <th className="px-6 py-4 font-bold text-slate-600">Action</th>
                      <th className="px-6 py-4 font-bold text-slate-600">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {changeLog.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No changes recorded in this session.</td>
                      </tr>
                    ) : (
                      changeLog.map(entry => (
                        <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-xs text-slate-500 font-mono">{entry.timestamp}</td>
                          <td className="px-6 py-4 font-medium text-slate-800">{entry.userEmail}</td>
                          <td className="px-6 py-4 text-slate-600">{entry.projectInfo}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-blue-50 text-mac-accent rounded text-[10px] font-bold uppercase">{entry.action}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 italic max-w-xs">{entry.changes}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CALENDAR PLACEHOLDER */}
          {viewMode === 'calendar' && (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 view-transition">
                <CalendarIcon className="w-16 h-16 mb-4 opacity-20" />
                <p>Calendar visualization pending development.</p>
                <p className="text-sm">Filter projects in List View to see landing dates.</p>
             </div>
          )}
        </div>
      </main>

      {/* EDIT MODAL */}
      {editingProject && (
        <ProjectEditModal 
          project={editingProject}
          onSave={handleSaveProject}
          onCancel={() => setEditingProject(null)}
        />
      )}
    </div>
  );
};

export default App;
