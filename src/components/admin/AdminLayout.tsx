import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, LogOut, Menu, X, Home, Settings, FileText, Users, MessageSquareQuote } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUserRole, useRealUserRole, roleLabels } from '@/hooks/useUserRoles';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import RoleSimulator from './RoleSimulator';
import AdminSearch from './AdminSearch';
import AdminUserAvatar from './AdminUserAvatar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const baseNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/projects', label: 'Modelos', icon: FolderOpen },
  { href: '/admin/quotes', label: 'Cotizaciones', icon: MessageSquareQuote },
  { href: '/admin/content', label: 'Contenido', icon: FileText },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: currentRole } = useCurrentUserRole();
  const { data: realRole } = useRealUserRole();

  // Add users page only for admin
  const navItems = currentRole === 'admin' 
    ? [...baseNavItems, { href: '/admin/users', label: 'Usuarios', icon: Users }]
    : baseNavItems;

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <button onClick={() => setSidebarOpen(true)} className="p-2">
          <Menu className="w-6 h-6 text-foreground" />
        </button>
        <span className="font-serif text-lg text-foreground">Alpina Admin</span>
        <div className="w-10" />
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header with User Info */}
          <div className="p-4 border-b border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl text-foreground">Alpina</span>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {/* User Avatar with Role */}
            <AdminUserAvatar 
              email={user?.email} 
              role={currentRole} 
              showRole 
            />
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <AdminSearch />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-sm transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-3">
            {/* Role Simulator - only for REAL admins */}
            {realRole === 'admin' && (
              <div className="pb-2 border-b border-border">
                <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Simular vista</p>
                <RoleSimulator />
              </div>
            )}
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">Ver Sitio</span>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
