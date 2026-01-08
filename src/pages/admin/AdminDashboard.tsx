import { Link } from 'react-router-dom';
import { FolderOpen, Plus, Eye, EyeOff, TrendingUp, Clock, LayoutDashboard } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { StatCardSkeleton, ProjectCardSkeleton } from '@/components/admin/AdminSkeleton';
import { useAdminProjects } from '@/hooks/useAdminProjects';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const { data: projects, isLoading } = useAdminProjects();

  const publishedCount = projects?.filter(p => p.is_published).length || 0;
  const draftCount = projects?.filter(p => !p.is_published).length || 0;
  const totalCount = projects?.length || 0;
  const featuredCount = projects?.filter(p => p.is_featured).length || 0;

  // Get last updated project
  const lastUpdated = projects?.reduce((latest, project) => {
    if (!latest) return project;
    return new Date(project.updated_at || project.created_at) > new Date(latest.updated_at || latest.created_at) 
      ? project 
      : latest;
  }, projects[0]);

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <AdminPageHeader 
          title="Dashboard"
          description="Bienvenido al panel de administración de Alpina."
          icon={LayoutDashboard}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-card border border-border p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-sm">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif text-foreground">{totalCount}</p>
                    <p className="text-sm text-muted-foreground">Total Modelos</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-sm">
                    <Eye className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif text-foreground">{publishedCount}</p>
                    <p className="text-sm text-muted-foreground">Publicados</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 rounded-sm">
                    <EyeOff className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif text-foreground">{draftCount}</p>
                    <p className="text-sm text-muted-foreground">Borradores</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-sm">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif text-foreground">{featuredCount}</p>
                    <p className="text-sm text-muted-foreground">Destacados</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="font-serif text-xl text-foreground mb-4">Acciones Rápidas</h2>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="cta">
              <Link to="/admin/projects/new">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Modelo
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/projects">
                Ver Todos los Modelos
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/content">
                Gestionar Contenido
              </Link>
            </Button>
          </div>
        </div>

        {/* Last Activity */}
        {lastUpdated && !isLoading && (
          <div className="mb-8 p-4 bg-muted/30 border border-border rounded-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span>Última actividad</span>
            </div>
            <Link 
              to={`/admin/projects/${lastUpdated.id}`}
              className="text-foreground hover:text-primary transition-colors"
            >
              <span className="font-medium">{lastUpdated.name}</span>
              <span className="text-muted-foreground ml-2">
                — actualizado {new Date(lastUpdated.updated_at || lastUpdated.created_at).toLocaleDateString('es-CL', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </Link>
          </div>
        )}

        {/* Recent Projects */}
        <div>
          <h2 className="font-serif text-xl text-foreground mb-4">Modelos Recientes</h2>
          {isLoading ? (
            <div className="grid gap-4">
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid gap-4">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  to={`/admin/projects/${project.id}`}
                  className="flex items-center gap-4 p-4 bg-card border border-border hover:border-primary/50 transition-all hover:shadow-sm group"
                >
                  {project.images[0] ? (
                    <img
                      src={project.images[0].storage_path}
                      alt={project.name}
                      className="w-16 h-16 object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {project.area_m2 ? `${project.area_m2} m²` : 'Sin especificar'}
                      <span className="mx-2">•</span>
                      <span className={project.is_published ? 'text-green-500' : 'text-amber-500'}>
                        {project.is_published ? 'Publicado' : 'Borrador'}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card border border-border">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No hay modelos todavía</p>
              <Button asChild variant="cta">
                <Link to="/admin/projects/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Modelo
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
