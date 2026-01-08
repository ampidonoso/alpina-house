import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn("animate-pulse bg-muted rounded", className)} />
);

// Card skeleton for dashboard stats
export const StatCardSkeleton = () => (
  <div className="bg-card border border-border p-6">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-sm" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  </div>
);

// Row skeleton for tables
export const TableRowSkeleton = () => (
  <tr className="border-b border-border">
    <td className="p-4"><Skeleton className="w-12 h-12" /></td>
    <td className="p-4"><Skeleton className="h-5 w-32" /></td>
    <td className="p-4 hidden sm:table-cell"><Skeleton className="h-4 w-16" /></td>
    <td className="p-4 hidden md:table-cell"><Skeleton className="h-6 w-20" /></td>
    <td className="p-4">
      <div className="flex justify-end gap-2">
        <Skeleton className="w-8 h-8" />
        <Skeleton className="w-8 h-8" />
        <Skeleton className="w-8 h-8" />
      </div>
    </td>
  </tr>
);

// Project card skeleton for recent projects
export const ProjectCardSkeleton = () => (
  <div className="flex items-center gap-4 p-4 bg-card border border-border">
    <Skeleton className="w-16 h-16" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

// User row skeleton
export const UserRowSkeleton = () => (
  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Skeleton className="w-40 h-10" />
      <Skeleton className="w-10 h-10" />
    </div>
  </div>
);

// Content card skeleton
export const ContentCardSkeleton = () => (
  <div className="bg-card border border-border rounded-lg p-4">
    <div className="flex items-start gap-3">
      <Skeleton className="w-5 h-5 mt-1" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="w-10 h-6 rounded-full" />
        <Skeleton className="w-8 h-8" />
        <Skeleton className="w-8 h-8" />
      </div>
    </div>
  </div>
);

// Form skeleton
export const FormSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-card border border-border p-6 space-y-4">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  </div>
);

export default Skeleton;
