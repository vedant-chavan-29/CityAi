import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Activity, Shield, Zap, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/monitoring', label: 'Monitoring', icon: Activity },
  { to: '/admin', label: 'Admin', icon: Shield },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { profile, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-primary">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight">CITYAI</h1>
            <p className="text-[11px] text-primary leading-none truncate max-w-[140px]">{displayName}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.filter(l => l.to !== '/admin' || isAdmin).map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-secondary text-primary glow-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {label}
              </NavLink>
            );
          })}

          <NavLink
            to="/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/profile'
                ? 'bg-secondary text-primary glow-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <Settings className="w-4.5 h-4.5" />
            Profile
          </NavLink>
        </nav>

        <div className="px-4 py-4 border-t border-border space-y-3">
          <div className="rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-foreground text-sm">CITYAI</span>
              <p className="text-[10px] text-primary leading-none">{displayName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>

        <nav className="md:hidden flex items-center justify-around border-t border-border bg-sidebar py-2">
          {links.filter(l => l.to !== '/admin' || isAdmin).map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            );
          })}
          <NavLink
            to="/profile"
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] ${
              location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <User className="w-5 h-5" />
            Profile
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
