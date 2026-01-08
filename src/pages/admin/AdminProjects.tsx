import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff, FolderOpen, Star } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ModelFilters, { ViewMode, SortOption, FilterStatus } from '@/components/admin/ModelFilters';
import { TableRowSkeleton } from '@/components/admin/AdminSkeleton';
import { useAdminProjects, useDeleteProject, useUpdateProject } from '@/hooks/useAdminProjects';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AdminProjects = () => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  
  const { data: projects, isLoading } = useAdminProjects();
  const deleteProject = useDeleteProject();
  const updateProject = useUpdateProject();

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    let result = [...projects];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.location?.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (filterStatus === 'published') {
      result = result.filter(p => p.is_published);
    } else if (filterStatus === 'draft') {
      result = result.filter(p => !p.is_published);
    }
    
    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'published':
        result.sort((a, b) => (b.is_published ? 1 : 0) - (a.is_published ? 1 : 0));
        break;
    }
    
    return result;
  }, [projects, searchQuery, filterStatus, sortBy]);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteProject.mutateAsync(deleteId);
      toast.success('Modelo eliminado');
    } catch (error) {
      toast.error('Error al eliminar modelo');
    }
    setDeleteId(null);
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await updateProject.mutateAsync({
        id,
        data: { is_published: !currentStatus }
      });
      toast.success(currentStatus ? 'Modelo despublicado' : 'Modelo publicado');
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <AdminPageHeader 
          title="Modelos"
          description="Gestiona los modelos de casa."
          icon={FolderOpen}
          actions={
            <Button asChild variant="cta">
              <Link to="/admin/projects/new">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Modelo
              </Link>
            </Button>
          }
        />

        {/* Filters */}
        <div className="mb-6">
          <ModelFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            totalCount={projects?.length || 0}
            filteredCount={filteredProjects.length}
          />
        </div>

        {isLoading ? (
          <div className="bg-card border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Imagen</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Nombre</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Área</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Estado</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
              </tbody>
            </table>
          </div>
        ) : filteredProjects.length > 0 ? (
          viewMode === 'list' ? (
            // List/Table View
            <div className="bg-card border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Imagen</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Nombre</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Área</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Estado</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          {project.images[0] ? (
                            <img
                              src={project.images[0].storage_path}
                              alt={project.name}
                              className="w-12 h-12 object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted flex items-center justify-center">
                              <FolderOpen className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium text-foreground">{project.name}</p>
                              <p className="text-sm text-muted-foreground sm:hidden">
                                {project.area_m2 ? `${project.area_m2} m²` : '-'}
                              </p>
                            </div>
                            {project.is_featured && (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <span className="text-muted-foreground">
                            {project.area_m2 ? `${project.area_m2} m²` : '-'}
                          </span>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium ${
                            project.is_published 
                              ? 'bg-green-500/10 text-green-500' 
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {project.is_published ? (
                              <>
                                <Eye className="w-3 h-3" />
                                Publicado
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                Borrador
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => togglePublish(project.id, project.is_published)}
                              title={project.is_published ? 'Despublicar' : 'Publicar'}
                            >
                              {project.is_published ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button asChild variant="ghost" size="icon">
                              <Link to={`/admin/projects/${project.id}`}>
                                <Pencil className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(project.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/admin/projects/${project.id}`}
                  className="group bg-card border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {project.images[0] ? (
                      <img
                        src={project.images[0].storage_path}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <FolderOpen className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Status badges */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {project.is_featured && (
                        <span className="p-1.5 bg-amber-500/90 rounded-sm">
                          <Star className="w-3 h-3 text-white fill-white" />
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium ${
                        project.is_published 
                          ? 'bg-green-500/90 text-white' 
                          : 'bg-amber-500/90 text-white'
                      }`}>
                        {project.is_published ? 'Publicado' : 'Borrador'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {project.area_m2 ? `${project.area_m2} m²` : 'Sin especificar'}
                      {project.bedrooms && ` • ${project.bedrooms} hab.`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16 bg-card border border-border">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== 'all' 
                ? 'No se encontraron modelos con los filtros aplicados'
                : 'No hay modelos todavía'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button asChild variant="cta">
                <Link to="/admin/projects/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Modelo
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar modelo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todas las imágenes asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminProjects;
