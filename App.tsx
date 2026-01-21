
import React, { useState, useMemo, useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import {
  Project,
  ProjectStatus,
  ViewMode,
  ProjectCategory,
  ChangeLogEntry,
  Milestones,
  PunchListItem
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
  PlusIcon,
  ClipboardIcon
} from './constants';
import { Login } from './components/Login';
import { MilestoneStepper } from './components/MilestoneStepper';
import { ProjectEditModal } from './components/ProjectEditModal';
import { NewProjectModal } from './components/NewProjectModal';
import { supabase } from './supabase';

const App: React.FC = () => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
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
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Sync MSAL auth state with currentUser
  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      const email = accounts[0].username?.toLowerCase() || null;
      setCurrentUser(email);
    }
  }, [isAuthenticated, accounts]);

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
          milestones: p.milestones || { design: false, mat: false, fab: false, fat: false, ship: false },
          punchList: p.punch_list || []
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
        milestones: p.milestones || { design: false, mat: false, fab: false, fat: false, ship: false },
        punchList: p.punch_list || []
      }));
      setProjects(transformedProjects);
    }
  };

  const handleLogin = (email: string) => {
    setCurrentUser(email);
  };

  const handleLogout = async () => {
    try {
      await instance.logoutPopup();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setCurrentUser(null);
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
        milestones: newProject.milestones,
        punch_list: newProject.punchList || []
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
      milestones: projectData.milestones || { design: false, mat: false, fab: false, fat: false, ship: false },
      punchList: projectData.punch_list || []
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

    // Punch list diffs
    const origPunchList = original.punchList || [];
    const updPunchList = updated.punchList || [];

    // Check for added items
    updPunchList.forEach(item => {
      const exists = origPunchList.find(o => o.id === item.id);
      if (!exists) {
        diffs.push(`Punch List: Added "${item.description}"`);
      }
    });

    // Check for removed items
    origPunchList.forEach(item => {
      const exists = updPunchList.find(u => u.id === item.id);
      if (!exists) {
        diffs.push(`Punch List: Removed "${item.description}"`);
      }
    });

    // Check for toggled items
    origPunchList.forEach(origItem => {
      const updItem = updPunchList.find(u => u.id === origItem.id);
      if (updItem && origItem.completed !== updItem.completed) {
        diffs.push(`Punch List: "${updItem.description}" marked as ${updItem.completed ? 'COMPLETED' : 'PENDING'}`);
      }
    });

    // Update project in Supabase
    const updateData: any = {
      category: updated.category,
      utility: updated.utility,
      substation: updated.substation,
      date_created: updated.dateCreated,
      order_number: updated.order,
      landing: updated.landing,
      status: updated.status,
      progress: updated.progress,
      lead: updated.lead,
      description: updated.description,
      comments: updated.comments,
      milestones: updated.milestones,
      punch_list: updated.punchList || []
    };

    console.log('Saving project with punch list:', updated.punchList);
    console.log('Update data being sent to Supabase:', updateData);

    const { error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', updated.id);

    if (updateError) {
      console.error('Error updating project:', updateError);
      alert('Error saving to database: ' + updateError.message + '. Changes saved locally only.');
      // Don't return - still update local state even if Supabase fails
    } else {
      console.log('Project saved successfully to Supabase');
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

  // Delete project
  const handleDeleteProject = async (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Delete from Supabase
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      alert('Error deleting project: ' + deleteError.message);
      return;
    }

    // Log the deletion
    const { data: logData, error: logError } = await supabase
      .from('changelog')
      .insert({
        timestamp: new Date().toLocaleString(),
        user_email: currentUser || 'Unknown',
        project_id: projectId,
        project_info: `${project.utility} - ${project.substation}`,
        action: 'Project Deleted',
        changes: `Deleted project: ${project.utility} / ${project.substation} (Order: ${project.order})`
      })
      .select()
      .single();

    if (!logError && logData) {
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

    // Update local state
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setEditingProject(null);
  };

  // Toggle punch list item completion
  const handleTogglePunchItem = async (projectId: number, itemId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.punchList) return;

    const updatedPunchList = project.punchList.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const toggledItem = project.punchList.find(i => i.id === itemId);
    const newStatus = !toggledItem?.completed;

    // Update in Supabase
    const { error } = await supabase
      .from('projects')
      .update({ punch_list: updatedPunchList })
      .eq('id', projectId);

    if (error) {
      console.error('Error updating punch list:', error);
      return;
    }

    // Update local state
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, punchList: updatedPunchList } : p
    ));

    // Log the change to audit log
    const { data: logData, error: logError } = await supabase
      .from('changelog')
      .insert({
        timestamp: new Date().toLocaleString(),
        user_email: currentUser || 'Unknown',
        project_id: projectId,
        project_info: `${project.utility} - ${project.substation}`,
        action: 'Punch List Updated',
        changes: `"${toggledItem?.description}" marked as ${newStatus ? 'COMPLETED' : 'PENDING'}`
      })
      .select()
      .single();

    if (!logError && logData) {
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

  // Get projects with FAT milestone completed and punch lists
  const fatProjectsWithPunchList = useMemo(() => {
    return projects.filter(p => p.milestones.fat && p.punchList && p.punchList.length > 0);
  }, [projects]);

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

  // Calendar helpers - Parse date to extract month/year for yearly calendar view
  const parseProjectDate = (dateString: string): { month: number; year: number } | null => {
    if (!dateString || dateString === 'TBD' || dateString === 'N/A') return null;
    const cleanStr = dateString.toLowerCase();

    // Try to extract year (2023-2029 or 23-29)
    const yearMatch = cleanStr.match(/(202[3-9]|2[3-9])/);
    if (!yearMatch) return null;
    let year = parseInt(yearMatch[0]);
    if (year < 100) year += 2000;

    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    let monthIndex = -1;

    // Try numeric date format (MM/DD or DD/MM)
    const numericMatch = cleanStr.match(/(\d{1,2})[\/\-](\d{1,2})/);
    if (numericMatch) {
      monthIndex = parseInt(numericMatch[1]) - 1;
    } else {
      // Try month name format
      monthIndex = months.findIndex(m => cleanStr.includes(m));
    }

    if (monthIndex >= 0 && monthIndex <= 11) {
      return { month: monthIndex, year: year };
    }
    return null;
  };

  // Get status color for calendar project cards
  const getStatusColor = (status: string, type: 'badge' | 'border' = 'badge') => {
    if (type === 'border') {
      switch(status) {
        case 'Critical': return 'border-red-500 bg-red-50';
        case 'Late': return 'border-orange-400 bg-orange-50';
        case 'Done': return 'border-green-500 bg-green-50';
        default: return 'border-blue-300 bg-white hover:border-blue-500';
      }
    }
    switch(status) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'Late': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Done': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  // Calendar data grouped by month for 2026 (yearly view)
  const calendarData2026 = useMemo(() => {
    const months: Project[][] = Array(12).fill(null).map(() => []);
    const others: Project[] = [];

    projects.forEach(p => {
      const parsed = parseProjectDate(p.landing);
      if (parsed && parsed.year === 2026) {
        months[parsed.month].push(p);
      } else {
        others.push(p);
      }
    });

    return { months, others };
  }, [projects]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
            { id: 'dashboard', label: 'Pipeline', icon: DashboardIcon, badge: 0 },
            { id: 'list', label: 'Projects', icon: ListIcon, badge: 0 },
            { id: 'calendar', label: 'Calendar', icon: CalendarIcon, badge: 0 },
            { id: 'punchlist', label: 'Punch List', icon: ClipboardIcon, badge: fatProjectsWithPunchList.length },
            { id: 'changelog', label: 'Audit Log', icon: LogIcon, badge: 0 },
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
              {!sidebarCollapsed && (
                <span className="font-medium flex-1 text-left">{item.label}</span>
              )}
              {!sidebarCollapsed && item.badge > 0 && (
                <span className="bg-mac-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
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
              {viewMode === 'punchlist' && 'FAT Punch Lists'}
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

          {/* PUNCH LIST VIEW */}
          {viewMode === 'punchlist' && (
            <div className="space-y-6 view-transition">
              {fatProjectsWithPunchList.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                  <ClipboardIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-600 mb-2">No FAT Punch Lists</h3>
                  <p className="text-slate-400 text-sm">
                    Projects with FAT status and punch list items will appear here.
                    <br />
                    Set a project's status to "FAT" and add punch list items to see them.
                  </p>
                </div>
              ) : (
                fatProjectsWithPunchList.map(project => (
                  <div key={project.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Project Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-mac-navy to-mac-blue text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{project.utility} - {project.substation}</h3>
                          <p className="text-blue-200 text-sm">Order #{project.order} | Lead: {project.lead}</p>
                        </div>
                        <div className="text-right">
                          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                            {project.punchList?.filter(i => i.completed).length} / {project.punchList?.length} Complete
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Punch List Items - Vertical with checkmarks */}
                    <div className="p-6">
                      <div className="space-y-3">
                        {project.punchList?.map((item, idx) => (
                          <div
                            key={item.id}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                              item.completed
                                ? 'bg-green-50 border-green-200'
                                : 'bg-slate-50 border-slate-200 hover:border-mac-accent'
                            }`}
                            onClick={() => handleTogglePunchItem(project.id, item.id)}
                          >
                            {/* Vertical stepper-style checkbox */}
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                  item.completed
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'bg-white border-slate-300 text-slate-400'
                                }`}
                              >
                                {item.completed ? (
                                  <CheckIcon className="w-5 h-5" />
                                ) : (
                                  <span className="text-xs font-bold">{idx + 1}</span>
                                )}
                              </div>
                              {idx < (project.punchList?.length || 0) - 1 && (
                                <div className={`w-0.5 h-6 mt-2 ${item.completed ? 'bg-green-300' : 'bg-slate-200'}`} />
                              )}
                            </div>

                            {/* Item description */}
                            <div className="flex-1 pt-1">
                              <p className={`font-medium ${item.completed ? 'text-green-700 line-through' : 'text-slate-700'}`}>
                                {item.description}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {item.completed ? 'Completed - Click to reopen' : 'Click to mark as complete'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
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

          {/* CALENDAR VIEW - 12 Month Yearly Overview */}
          {viewMode === 'calendar' && (
            <div className="space-y-8 view-transition">
              {/* Year Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-800">2026 Calendar Overview</h3>
                <div className="text-sm text-slate-500">
                  {projects.length} Total Projects
                </div>
              </div>

              {/* 12-Month Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {calendarData2026.months.map((monthProjects, index) => (
                  <div
                    key={index}
                    className={`bg-white rounded-xl shadow-sm border ${
                      monthProjects.length > 0
                        ? 'border-slate-300 shadow-md ring-1 ring-slate-100'
                        : 'border-slate-100 opacity-80'
                    }`}
                  >
                    {/* Month Header */}
                    <div className="bg-slate-50 p-3 rounded-t-xl border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-700">{monthNames[index]} 2026</h3>
                      <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500 font-medium">
                        {monthProjects.length}
                      </span>
                    </div>

                    {/* Projects in Month */}
                    <div className="p-3 min-h-[140px] space-y-2">
                      {monthProjects.map(p => (
                        <div
                          key={p.id}
                          onClick={() => setEditingProject(p)}
                          className={`p-2 rounded border cursor-pointer hover:shadow-md transition-all text-xs relative group ${getStatusColor(p.status, 'border')}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-800 truncate pr-2">{p.utility}</span>
                            <span className="text-[10px] font-mono bg-slate-100 px-1 rounded text-slate-500 flex-shrink-0">{p.landing}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-600 truncate">{p.substation}</span>
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ml-1 ${
                              p.status === 'Critical' ? 'bg-red-500' :
                              p.status === 'Late' ? 'bg-orange-400' :
                              p.status === 'Done' ? 'bg-green-500' : 'bg-blue-500'
                            }`}></div>
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{width: `${p.progress}%`}}></div>
                          </div>
                        </div>
                      ))}
                      {monthProjects.length === 0 && (
                        <div className="text-center text-slate-300 text-xs py-8">No landings</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Other Projects (TBD / Past Due / Future Years) */}
              {calendarData2026.others.length > 0 && (
                <div className="bg-slate-100 rounded-xl p-6 border-2 border-dashed border-slate-300">
                  <h3 className="font-bold text-slate-500 uppercase text-sm mb-4">
                    Other Projects (TBD / Past Due / Future Years)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {calendarData2026.others.map(p => (
                      <div
                        key={p.id}
                        onClick={() => setEditingProject(p)}
                        className={`bg-white p-3 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-all text-sm ${getStatusColor(p.status, 'border')}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800">{p.utility}</span>
                          <span className="text-xs font-mono bg-slate-100 px-1 rounded">{p.landing}</span>
                        </div>
                        <div className="text-slate-600 text-xs mb-2">{p.substation}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(p.status)}`}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <h4 className="font-bold text-slate-700 text-sm mb-3">Status Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-slate-600">Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span className="text-slate-600">Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-600">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-600">Done</span>
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
          onDelete={handleDeleteProject}
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
