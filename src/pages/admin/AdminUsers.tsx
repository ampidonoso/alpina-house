import { useState, useMemo } from 'react';
import { Users, Plus, Shield, Trash2, Loader2, Mail, Clock, Search } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useAdminUsers,
  useCurrentUserRole,
  AppRole,
  roleLabels,
  roleDescriptions,
  roleColors,
} from '@/hooks/useUserRoles';
import { useUserEmails } from '@/hooks/useUserEmails';
import { supabase } from '@/integrations/supabase/client';
import { UserRowSkeleton } from '@/components/admin/AdminSkeleton';
import AdminUserAvatar from '@/components/admin/AdminUserAvatar';

export default function AdminUsers() {
  const { data: currentRole } = useCurrentUserRole();
  const { users, addUserRole, updateUserRole, removeUser } = useAdminUsers();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newUserRole, setNewUserRole] = useState<AppRole>('editor');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<AppRole | 'all'>('all');

  const isAdmin = currentRole === 'admin';

  // Get user IDs to fetch emails
  const userIds = useMemo(() => 
    users.data?.map(u => u.id) || [], 
    [users.data]
  );
  
  const { data: userEmails, isLoading: emailsLoading } = useUserEmails(userIds);

  // Filter users based on search and role
  const filteredUsers = useMemo(() => {
    if (!users.data) return [];
    
    return users.data.filter(userRole => {
      // Role filter
      if (roleFilter !== 'all' && userRole.role !== roleFilter) return false;
      
      // Search filter (by email or user ID)
      if (searchQuery) {
        const email = userEmails?.[userRole.id]?.email?.toLowerCase() || '';
        const userId = userRole.id.toLowerCase();
        const query = searchQuery.toLowerCase();
        
        if (!email.includes(query) && !userId.includes(query)) return false;
      }
      
      return true;
    });
  }, [users.data, userEmails, searchQuery, roleFilter]);

  const handleAddUser = async () => {
    if (!newUserId) {
      toast.error('Ingresa el ID del usuario');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ 
          user_id: newUserId, 
          role: newUserRole
        }]);
      
      if (error) throw error;
      
      toast.success('Usuario agregado correctamente');
      setIsAddOpen(false);
      setNewUserId('');
      setNewUserRole('editor');
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar usuario');
    }
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    try {
      await updateUserRole.mutateAsync({ userId, role: newRole });
      toast.success('Rol actualizado');
    } catch (error) {
      toast.error('Error al actualizar rol');
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('¿Eliminar este usuario del panel de administración?')) return;
    
    try {
      await removeUser.mutateAsync(userId);
      toast.success('Usuario eliminado');
    } catch (error) {
      toast.error('Error al eliminar usuario');
    }
  };

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <Shield className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium text-foreground mb-2">Acceso Restringido</h2>
          <p className="text-muted-foreground">
            Solo los Administradores pueden gestionar usuarios.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif text-foreground flex items-center gap-2">
              <Users className="w-6 h-6" />
              Gestión de Usuarios
            </h1>
            <p className="text-muted-foreground mt-1">
              Administra los usuarios y sus permisos en el panel
            </p>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Usuario Existente</DialogTitle>
                <DialogDescription>
                  El usuario debe registrarse primero en /admin/login. Luego ingresa su ID de usuario aquí.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>ID de Usuario (UUID)</Label>
                  <Input
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Puedes obtener el ID del usuario en Cloud → Users
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as AppRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['editor', 'admin', 'super_admin'] as AppRole[]).map((role) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex flex-col">
                            <span>{roleLabels[role]}</span>
                            <span className="text-xs text-muted-foreground">
                              {roleDescriptions[role]}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddUser} disabled={addUserRole.isPending}>
                  {addUserRole.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Agregar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Role Legend */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Roles Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {(['super_admin', 'admin', 'editor'] as AppRole[]).map((role) => (
                <div key={role} className={`p-3 rounded-lg border ${roleColors[role]}`}>
                  <div className="font-medium text-sm">{roleLabels[role]}</div>
                  <div className="text-xs opacity-80 mt-1">{roleDescriptions[role]}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as AppRole | 'all')}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {(['super_admin', 'admin', 'editor'] as AppRole[]).map((role) => (
                    <SelectItem key={role} value={role}>{roleLabels[role]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios con Acceso</CardTitle>
            <CardDescription>
              {filteredUsers.length} de {users.data?.length || 0} usuario(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.isLoading ? (
              <div className="space-y-3">
                <UserRowSkeleton />
                <UserRowSkeleton />
                <UserRowSkeleton />
              </div>
            ) : users.error ? (
              <div className="text-center py-8 text-destructive">
                Error al cargar usuarios. Verifica que hayas ejecutado el SQL de configuración.
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || roleFilter !== 'all' 
                  ? 'No hay usuarios que coincidan con los filtros'
                  : 'No hay usuarios configurados'
                }
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((userRole) => {
                  const emailData = userEmails?.[userRole.id];
                  const email = emailData?.email || 'Cargando...';
                  const lastSignIn = emailData?.last_sign_in_at;
                  
                  return (
                    <div
                      key={userRole.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <AdminUserAvatar email={emailsLoading ? undefined : email} role={userRole.role} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm truncate flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            {emailsLoading ? (
                              <span className="text-muted-foreground">Cargando...</span>
                            ) : (
                              email
                            )}
                          </p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                            <span>
                              Agregado: {new Date(userRole.created_at).toLocaleDateString()}
                            </span>
                            {lastSignIn && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Último acceso: {formatDistanceToNow(new Date(lastSignIn), { addSuffix: true, locale: es })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:flex-shrink-0">
                        <Select
                          value={userRole.role}
                          onValueChange={(v) => handleRoleChange(userRole.id, v as AppRole)}
                          disabled={updateUserRole.isPending}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(['viewer', 'editor', 'admin'] as AppRole[]).map((role) => (
                              <SelectItem key={role} value={role}>
                                {roleLabels[role]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(userRole.id)}
                          disabled={removeUser.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
