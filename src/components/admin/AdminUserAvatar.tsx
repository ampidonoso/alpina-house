import { cn } from '@/lib/utils';
import { roleColors, AppRole } from '@/hooks/useUserRoles';

interface AdminUserAvatarProps {
  email?: string | null;
  role?: AppRole | null;
  size?: 'sm' | 'md' | 'lg';
  showRole?: boolean;
}

const getInitials = (email?: string | null): string => {
  if (!email) return '?';
  const parts = email.split('@')[0];
  if (parts.length >= 2) {
    return parts.slice(0, 2).toUpperCase();
  }
  return parts[0]?.toUpperCase() || '?';
};

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const AdminUserAvatar = ({ 
  email, 
  role, 
  size = 'md', 
  showRole = false 
}: AdminUserAvatarProps) => {
  const initials = getInitials(email);
  
  return (
    <div className="flex items-center gap-3">
      <div 
        className={cn(
          "rounded-full bg-primary/10 flex items-center justify-center font-medium text-primary",
          sizeClasses[size]
        )}
      >
        {initials}
      </div>
      
      {showRole && role && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
            {email}
          </span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full w-fit",
            roleColors[role]
          )}>
            {role === 'admin' ? 'Admin' : role === 'editor' ? 'Editor' : 'Visor'}
          </span>
        </div>
      )}
    </div>
  );
};

export default AdminUserAvatar;
