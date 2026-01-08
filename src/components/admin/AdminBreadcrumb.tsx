import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAdminProject } from '@/hooks/useAdminProjects';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Modelos',
  content: 'Contenido',
  settings: 'Configuración',
  users: 'Usuarios',
  new: 'Nuevo',
};

const AdminBreadcrumb = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Get project name if we're on a project page
  const { data: project } = useAdminProject(id && id !== 'new' ? id : '');
  
  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip 'admin' in the display
    if (segment === 'admin') return;
    
    // Handle project ID
    if (id && segment === id) {
      breadcrumbs.push({
        label: project?.name || 'Cargando...',
        href: index < pathSegments.length - 1 ? currentPath : undefined,
      });
      return;
    }
    
    breadcrumbs.push({
      label: routeLabels[segment] || segment,
      href: index < pathSegments.length - 1 ? currentPath : undefined,
    });
  });

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
      <Link 
        to="/admin/dashboard" 
        className="p-1 hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4" />
          {crumb.href ? (
            <Link 
              to={crumb.href} 
              className="hover:text-foreground transition-colors px-1"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium px-1">
              {crumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default AdminBreadcrumb;
