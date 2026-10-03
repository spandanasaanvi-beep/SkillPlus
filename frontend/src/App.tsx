import { useEffect, useMemo, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Database, Gauge, LayoutDashboard, LogOut, Menu, Settings, UserCircle2, X } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import GraphsPage from './pages/GraphsPage';
import OverallDataPage from './pages/OverallDataPage';
import { getHealth, getProfile } from './services/api';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/graphs', label: 'Graphs', icon: BarChart3 },
  { to: '/overall-data', label: 'Overall Data', icon: Database },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function AppShell({ onLogout }: { onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const profile = useMemo(() => getProfile(), [location.pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!profile) {
    return <Navigate to="/" replace />;
  }

  const sidebar = (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-slate-950 text-slate-100 shadow-lg">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
        <div className="rounded-xl bg-blue-600 p-2.5 shadow-sm">
          <Gauge className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-semibold text-white">SkillPlus</div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Labour Signal</div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 px-3 py-4">
        <div className="mb-2 rounded-xl bg-slate-900 px-3 py-2 text-xs text-slate-300">
          <div className="font-semibold text-slate-100">{profile?.name || 'New user'}</div>
          <div>{profile?.state || 'Profile pending'}</div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <div className="hidden md:block">{sidebar}</div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-950/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 z-40 transition-transform duration-200 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebar}
      </div>

      <div className="flex min-w-0 flex-1 flex-col md:ml-0">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg border border-slate-200 p-2 text-slate-700">
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm font-semibold text-slate-800">SkillPlus</div>
            <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg border border-slate-200 p-2 text-slate-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/graphs" element={<GraphsPage />} />
            <Route path="/overall-data" element={<OverallDataPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('offline');
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    getHealth().then((status) => {
      if (mounted) {
        setBackendStatus(status.status === 'ok' ? 'online' : 'offline');
      }
    });
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('skillplus-profile');
    localStorage.removeItem('skillplus-settings');
    navigate('/');
  };

  return (
    <>
      <div className="absolute right-4 top-4 z-50 hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm md:flex">
        <span className={`h-2.5 w-2.5 rounded-full ${backendStatus === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        {backendStatus === 'online' ? 'Backend Connected' : 'Backend Offline'}
      </div>

      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/*" element={<AppShell onLogout={handleLogout} />} />
      </Routes>
    </>
  );
}

export default App;
