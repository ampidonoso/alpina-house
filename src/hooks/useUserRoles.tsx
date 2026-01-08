import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Match DB enum exactly: 'admin' | 'editor' | 'viewer'
export type AppRole = 'admin' | 'editor' | 'viewer';

// Helper to get simulated role from localStorage
function getSimulatedRole(): AppRole | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('admin_simulated_role');
  if (stored && ['admin', 'editor', 'viewer'].includes(stored)) {
    return stored as AppRole;
  }
  return null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  role: AppRole | null;
  created_at: string;
}

// Get current user's role (respects simulated role for testing)
export function useCurrentUserRole() {
  return useQuery({
    queryKey: ['current-user-role'],
    queryFn: async () => {
      // Check for simulated role first (dev/testing feature)
      const simulatedRole = getSimulatedRole();
      if (simulatedRole) {
        return simulatedRole;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      const roles = (data ?? []).map((r) => r.role as AppRole);
      if (roles.length === 0) return null;

      const roleHierarchy: Record<AppRole, number> = {
        admin: 3,
        editor: 2,
        viewer: 1,
      };

      const highest = roles.reduce<AppRole>((acc, curr) =>
        roleHierarchy[curr] > roleHierarchy[acc] ? curr : acc,
      roles[0]);

      return highest;
    },
  });
}

// Get the REAL user role (ignores simulation - used for showing simulator UI)
export function useRealUserRole() {
  return useQuery({
    queryKey: ['real-user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching real user role:', error);
        return null;
      }

      const roles = (data ?? []).map((r) => r.role as AppRole);
      if (roles.length === 0) return null;

      const roleHierarchy: Record<AppRole, number> = {
        admin: 3,
        editor: 2,
        viewer: 1,
      };

      return roles.reduce<AppRole>((acc, curr) =>
        roleHierarchy[curr] > roleHierarchy[acc] ? curr : acc,
      roles[0]);
    },
  });
}

// Check if current user has specific role
export function useHasRole(role: AppRole) {
  const { data: currentRole, isLoading } = useCurrentUserRole();
  
  const hasRole = () => {
    if (!currentRole) return false;
    
    const roleHierarchy: Record<AppRole, number> = {
      admin: 3,
      editor: 2,
      viewer: 1,
    };
    
    return roleHierarchy[currentRole] >= roleHierarchy[role];
  };

  return { hasRole: hasRole(), isLoading };
}

// Get all users with their roles (for admin)
export function useAdminUsers() {
  const queryClient = useQueryClient();

  const users = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get all user roles
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      // Map to expected format
      return (userRoles ?? []).map(role => ({
        id: role.user_id,
        email: '', // Email not available without RPC function
        role: role.role as AppRole,
        created_at: role.created_at,
      }));
    },
  });

  const addUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Delete existing role and insert new one
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      const { error } = await supabase
        .from('user_roles')
        .insert([{ 
          user_id: userId, 
          role
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const removeUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return { users, addUserRole, updateUserRole, removeUser };
}

// Role display helpers
export const roleLabels: Record<AppRole, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visor',
};

export const roleDescriptions: Record<AppRole, string> = {
  admin: 'Control total: usuarios, configuración y contenido',
  editor: 'Edición de contenido y proyectos',
  viewer: 'Solo lectura',
};

export const roleColors: Record<AppRole, string> = {
  admin: 'bg-red-500/10 text-red-500 border-red-500/20',
  editor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  viewer: 'bg-green-500/10 text-green-500 border-green-500/20',
};
