import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppRole, roleLabels } from '@/hooks/useUserRoles';
import { cn } from '@/lib/utils';

const SIMULATED_ROLE_KEY = 'admin_simulated_role';

export function getSimulatedRole(): AppRole | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(SIMULATED_ROLE_KEY);
  if (stored && ['super_admin', 'admin', 'editor'].includes(stored)) {
    return stored as AppRole;
  }
  return null;
}

export function setSimulatedRole(role: AppRole | null) {
  if (role) {
    localStorage.setItem(SIMULATED_ROLE_KEY, role);
  } else {
    localStorage.removeItem(SIMULATED_ROLE_KEY);
  }
  // Dispatch event to notify other components
  window.dispatchEvent(new CustomEvent('simulated-role-change', { detail: role }));
}

export default function RoleSimulator() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole>('editor');

  useEffect(() => {
    const stored = getSimulatedRole();
    if (stored) {
      setIsSimulating(true);
      setSelectedRole(stored);
    }
  }, []);

  const handleToggle = () => {
    if (isSimulating) {
      setSimulatedRole(null);
      setIsSimulating(false);
    } else {
      setSimulatedRole(selectedRole);
      setIsSimulating(true);
    }
    // Force page reload to apply role change
    window.location.reload();
  };

  const handleRoleChange = (role: AppRole) => {
    setSelectedRole(role);
    if (isSimulating) {
      setSimulatedRole(role);
      window.location.reload();
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs",
      isSimulating 
        ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400" 
        : "bg-muted/50 border-border text-muted-foreground"
    )}>
      <Select value={selectedRole} onValueChange={(v) => handleRoleChange(v as AppRole)}>
        <SelectTrigger className="h-7 w-28 text-xs border-0 bg-transparent p-0 focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(['super_admin', 'admin', 'editor'] as AppRole[]).map((role) => (
            <SelectItem key={role} value={role} className="text-xs">
              {roleLabels[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={handleToggle}
      >
        {isSimulating ? (
          <>
            <EyeOff className="w-3 h-3 mr-1" />
            Desactivar
          </>
        ) : (
          <>
            <Eye className="w-3 h-3 mr-1" />
            Simular
          </>
        )}
      </Button>
    </div>
  );
}
