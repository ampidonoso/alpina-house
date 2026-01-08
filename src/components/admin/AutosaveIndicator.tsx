import { Check, Loader2, AlertCircle, Cloud } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AutosaveStatus } from '@/hooks/useAutosave';

interface AutosaveIndicatorProps {
  status: AutosaveStatus;
  lastSaved: Date | null;
  onManualSave?: () => void;
}

const statusConfig = {
  saved: {
    icon: Check,
    text: 'Guardado',
    className: 'text-green-500',
  },
  saving: {
    icon: Loader2,
    text: 'Guardando...',
    className: 'text-muted-foreground',
    animate: true,
  },
  unsaved: {
    icon: Cloud,
    text: 'Sin guardar',
    className: 'text-amber-500',
  },
  error: {
    icon: AlertCircle,
    text: 'Error al guardar',
    className: 'text-destructive',
  },
};

export function AutosaveIndicator({ status, lastSaved, onManualSave }: AutosaveIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity",
        config.className
      )}
      onClick={status === 'unsaved' || status === 'error' ? onManualSave : undefined}
      title={status === 'unsaved' || status === 'error' ? 'Click para guardar ahora' : undefined}
    >
      <Icon className={cn("w-4 h-4", 'animate' in config && config.animate && "animate-spin")} />
      <span className="hidden sm:inline">{config.text}</span>
      {status === 'saved' && lastSaved && (
        <span className="hidden md:inline text-muted-foreground text-xs">
          · {formatDistanceToNow(lastSaved, { addSuffix: true, locale: es })}
        </span>
      )}
    </div>
  );
}
