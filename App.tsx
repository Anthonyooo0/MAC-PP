
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
  LogoutIcon,
  PlusIcon
} from './constants';
import { Login } from './components/Login';
import { MilestoneStepper } from './components/MilestoneStepper';
import { ProjectEditModal } from './components/ProjectEditModal';
import { NewProjectModal } from './components/NewProjectModal';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [activeTab, setActiveTab] = useState<ProjectCategory>('Pumping');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Authentication persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('mac_user');
    if (savedUser) setCurrentUser(savedUser);
  }, []);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: true });

      if (projectsError) {
        console.error('Error loading projects:', projectsError);
      } else if (projectsData && projectsData.length > 0) {
        // Transform database format to app format
        const transformedProjects = projectsData.map(p => ({
          id: p.id,
          category: p.category,
          utility: p.utility,
          substation: p.substation,
          dateCreated: p.date_created,
          order: p.order_number,
          fatDate: p.fat_date || 'N/A',
          landing: p.landing || 'TBD',
          status: p.status,
          progress: p.progress,
          lead: p.lead || 'TBD',
          description: p.description || '',
          comments: p.comments || '',
          milestones: p.milestones || { design: false, mat: false, fab: false, fat: false, ship: false }
        }));
        setProjects(transformedProjects);
      } else {
        // If no projects in database, seed with initial data
        await seedInitialData();
      }

      // Load changelog
      const { data: changelogData, error: changelogError } = await supabase
        .from('changelog')
        .select('*')
        .order('created_at', { ascending: false });

      if (changelogError) {
        console.error('Error loading changelog:', changelogError);
      } else if (changelogData) {
        const transformedChangelog = changelogData.map(c => ({
          id: c.id,
          timestamp: c.timestamp,
          userEmail: c.user_email,
          projectId: c.project_id,
          projectInfo: c.project_info,
          action: c.action,
          changes: c.changes
        }));
        setChangeLog(transformedChangelog);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  // Seed initial data to Supabase
  const seedInitialData = async () => {
    const projectsToInsert = INITIAL_DATA.map(p => ({
      id: p.id,
      category: p.category,
      utility: p.utility,
      substation: p.substation,
      date_created: p.dateCreated,
      order_number: p.order,
      fat_date: p.fatDate,
      landing: p.landing,
      status: p.status,
      progress: p.progress,
      lead: p.lead,
      description: p.description,
      comments: p.comments,
      milestones: p.milestones
    }));

    const { data, error } = await supabase
      .from('projects')
      .insert(projectsToInsert)
      .select();

    if (error) {
      console.error('Error seeding data:', error);
    } else if (data) {
      const transformedProjects = data.map(p => ({
        id: p.id,
        category: p.category,
        utility: p.utility,
        substation: p.substation,
        dateCreated: p.date_created,
        order: p.order_number,
        fatDate: p.fat_date || 'N/A',
        landing: p.landing || 'TBD',
        status: p.status,
        progress: p.progress,
        lead: p.lead || 'TBD',
        description: p.description || '',
        comments: p.comments || '',
        milestones: p.milestones || { design: false, mat: false, fab: false, fat: false, ship: false }
      }));
      setProjects(transformedProjects);
    }
  };

  const handleLogin = (email: string) => {
    setCurrentUser(email);
    localStorage.setItem('mac_user', email);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mac_user');
  };

  const handleAddProject = async (newProject: Project) => {
    // Insert project to Supabase
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        category: newProject.category,
        utility: newProject.utility,
        substation: newProject.substation,
        date_created: newProject.dateCreated,
        order_number: newProject.order,
        fat_date: newProject.fatDate,
        landing: newProject.landing,
        status: newProject.status,
        progress: newProject.progress,
        lead: newProject.lead,
        description: newProject.description,
        comments: newProject.comments,
        milestones: newProject.milestones
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error adding project:', projectError);
      return;
    }

    // Transform and add to local state
    const transformedProject = {
      id: projectData.id,
      category: projectData.category,
      utility: projectData.utility,
      substation: projectData.substation,
      dateCreated: projectData.date_created,
      order: projectData.order_number,
      fatDate: projectData.fat_date || 'N/A',
      landing: projectData.landing || 'TBD',
      status: projectData.status,
      progress: projectData.progress,
      lead: projectData.lead || 'TBD',
      description: projectData.description || '',
      comments: projectData.comments || '',
      milestones: projectData.milestones || { design: false, mat: false, fab: false, fat: false, ship: false }
    };

    setProjects(prev => [...prev, transformedProject]);
    setShowNewProjectModal(false);

    // Log the creation to Supabase
    const { data: logData, error: logError } = await supabase
      .from('changelog')
      .insert({
        timestamp: new Date().toLocaleString(),
        user_email: currentUser || 'Unknown',
        project_id: projectData.id,
        project_info: `${newProject.utility} - ${newProject.substation}`,
        action: 'Created New Project',
        changes: `Order: ${newProject.order} | Category: ${newProject.category} | Status: ${newProject.status}`
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging change:', logError);
    } else if (logData) {
      const newLog: ChangeLogEntry = {
        id: logData.id,
        timestamp: logData.timestamp,
        userEmail: logData.user_email,
        projectId: logData.project_id,
        projectInfo: logData.project_info,
        action: logData.action,
        changes: logData.changes
      };
      setChangeLog(prev => [newLog, ...prev]);
    }
  };

  const handleSaveProject = async (updated: Project) => {
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

    // Update project in Supabase
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        category: updated.category,
        utility: updated.utility,
        substation: updated.substation,
        date_created: updated.dateCreated,
        order_number: updated.order,
        fat_date: updated.fatDate,
        landing: updated.landing,
        status: updated.status,
        progress: updated.progress,
        lead: updated.lead,
        description: updated.description,
        comments: updated.comments,
        milestones: updated.milestones
      })
      .eq('id', updated.id);

    if (updateError) {
      console.error('Error updating project:', updateError);
      return;
    }

    if (diffs.length > 0) {
      // Log changes to Supabase
      const { data: logData, error: logError } = await supabase
        .from('changelog')
        .insert({
          timestamp: new Date().toLocaleString(),
          user_email: currentUser || 'Unknown',
          project_id: updated.id,
          project_info: `${updated.utility} - ${updated.substation}`,
          action: 'Updated Project Details',
          changes: diffs.join(' | ')
        })
        .select()
        .single();

      if (logError) {
        console.error('Error logging change:', logError);
      } else if (logData) {
        const newLog: ChangeLogEntry = {
          id: logData.id,
          timestamp: logData.timestamp,
          userEmail: logData.user_email,
          projectId: logData.project_id,
          projectInfo: logData.project_info,
          action: logData.action,
          changes: logData.changes
        };
        setChangeLog(prev => [newLog, ...prev]);
      }
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

  // Calendar helpers
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr === 'N/A' || dateStr === 'TBD') return null;

    // Handle various date formats
    const formats = [
      // "Dec. 2025", "Mar-26"
      /^([A-Za-z]{3})\.?\s*(\d{4})$/,
      /^([A-Za-z]{3})-(\d{2})$/,
      // "12/16/2025", "09/26/24"
      /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/,
      // "02/19/25"
      /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
    ];

    const monthMap: {[key: string]: number} = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    // Try month-year formats
    const match1 = dateStr.match(formats[0]);
    if (match1) {
      const month = monthMap[match1[1].toLowerCase().substring(0, 3)];
      const year = parseInt(match1[2]);
      return new Date(year, month, 15); // Mid-month
    }

    const match2 = dateStr.match(formats[1]);
    if (match2) {
      const month = monthMap[match2[1].toLowerCase().substring(0, 3)];
      const year = 2000 + parseInt(match2[2]);
      return new Date(year, month, 15);
    }

    // Try MM/DD/YYYY formats
    const match3 = dateStr.match(formats[2]);
    if (match3) {
      const month = parseInt(match3[1]) - 1;
      const day = parseInt(match3[2]);
      let year = parseInt(match3[3]);
      if (year < 100) year += 2000;
      return new Date(year, month, day);
    }

    return null;
  };

  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getProjectsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return projects.filter(p => {
      const landing = parseDate(p.landing);
      const fat = parseDate(p.fatDate);

      return (landing && landing.toDateString() === dateStr) ||
             (fat && fat.toDateString() === dateStr);
    });
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-mac-light">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <img src="/mac_logo.png" alt="MAC Logo" className="w-full h-full object-contain animate-pulse" />
          </div>
          <p className="text-slate-600 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-mac-light">
      {/* SIDEBAR */}
      <aside className={`sidebar flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex-shrink-0 text-white`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <img src="/mac_logo.png" alt="MAC Logo" className="w-full h-full object-contain" />
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
                    <button
                      onClick={() => setShowNewProjectModal(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-mac-navy hover:bg-mac-blue text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      <PlusIcon className="w-4 h-4" />
                      New Project
                    </button>
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

          {/* CALENDAR VIEW */}
          {viewMode === 'calendar' && (
            <div className="space-y-6 view-transition">
              {/* Calendar Header */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => changeMonth(-1)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setCurrentMonth(new Date())}
                      className="px-4 py-2 bg-mac-accent hover:bg-mac-blue text-white rounded-lg font-medium transition-all"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => changeMonth(1)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <div key={day} className="text-center font-bold text-slate-600 text-sm py-2">
                      {day.substring(0, 3)}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                  {getCalendarDays(currentMonth).map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} className="aspect-square bg-slate-50 rounded-lg" />;
                    }

                    const dayProjects = getProjectsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={idx}
                        className={`aspect-square border rounded-lg p-2 flex flex-col ${
                          isToday
                            ? 'bg-mac-accent/10 border-mac-accent'
                            : dayProjects.length > 0
                              ? 'bg-white border-slate-300 hover:border-mac-accent hover:shadow-md cursor-pointer'
                              : 'bg-slate-50 border-slate-200'
                        } transition-all`}
                      >
                        <div className={`text-sm font-bold mb-1 ${isToday ? 'text-mac-accent' : 'text-slate-600'}`}>
                          {day.getDate()}
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1">
                          {dayProjects.map(project => {
                            const hasLanding = parseDate(project.landing)?.toDateString() === day.toDateString();
                            const hasFat = parseDate(project.fatDate)?.toDateString() === day.toDateString();

                            return (
                              <div
                                key={project.id}
                                onClick={() => setEditingProject(project)}
                                className={`text-[9px] px-1.5 py-1 rounded font-bold truncate ${
                                  project.status === 'Critical'
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : project.status === 'Done'
                                      ? 'bg-green-100 text-green-700 border border-green-200'
                                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}
                                title={`${project.utility} - ${project.substation}${hasLanding ? ' (Landing)' : ''}${hasFat ? ' (FAT)' : ''}`}
                              >
                                {hasLanding && '📦 '}
                                {hasFat && '✓ '}
                                {project.utility}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <h4 className="font-bold text-slate-700 text-sm mb-3">Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                    <span className="text-slate-600">Critical Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                    <span className="text-slate-600">Active Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                    <span className="text-slate-600">Completed Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">📦 = Landing | ✓ = FAT</span>
                  </div>
                </div>
              </div>
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

      {/* NEW PROJECT MODAL */}
      {showNewProjectModal && (
        <NewProjectModal
          onSave={handleAddProject}
          onCancel={() => setShowNewProjectModal(false)}
          nextId={Math.max(...projects.map(p => p.id)) + 1}
        />
      )}
    </div>
  );
};

export default App;
