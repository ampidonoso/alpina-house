import { ReactNode } from 'react';
import AdminBreadcrumb from './AdminBreadcrumb';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: React.ElementType;
}

const AdminPageHeader = ({ 
  title, 
  description, 
  actions,
  icon: Icon 
}: AdminPageHeaderProps) => {
  return (
    <div className="mb-8">
      <AdminBreadcrumb />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-primary/10 rounded-sm">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPageHeader;
