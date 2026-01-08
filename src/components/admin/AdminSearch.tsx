import { useState, useEffect, useCallback } from 'react';
import { Search, FileText, FolderOpen, Settings, Users, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useAdminProjects } from '@/hooks/useAdminProjects';
import { useCurrentUserRole } from '@/hooks/useUserRoles';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  icon: React.ElementType;
  category: 'models' | 'pages' | 'settings';
}

const AdminSearch = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: projects } = useAdminProjects();
  const { data: currentRole } = useCurrentUserRole();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((href: string) => {
    setOpen(false);
    navigate(href);
  }, [navigate]);

  // Build search results
  const modelResults: SearchResult[] = (projects || []).map(project => ({
    id: project.id,
    title: project.name,
    subtitle: project.is_published ? 'Publicado' : 'Borrador',
    href: `/admin/projects/${project.id}`,
    icon: FolderOpen,
    category: 'models',
  }));

  const pageResults: SearchResult[] = [
    { id: 'dashboard', title: 'Dashboard', href: '/admin/dashboard', icon: FileText, category: 'pages' },
    { id: 'models', title: 'Modelos', subtitle: 'Ver todos los modelos', href: '/admin/projects', icon: FolderOpen, category: 'pages' },
    { id: 'content', title: 'Contenido', subtitle: 'FAQs, pasos, testimonios', href: '/admin/content', icon: FileText, category: 'pages' },
    { id: 'settings', title: 'Configuración', subtitle: 'Ajustes del sitio', href: '/admin/settings', icon: Settings, category: 'pages' },
  ];

  if (currentRole === 'admin') {
    pageResults.push({ 
      id: 'users', 
      title: 'Usuarios', 
      subtitle: 'Gestión de roles', 
      href: '/admin/users', 
      icon: Users, 
      category: 'pages' 
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-sm transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border rounded">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar modelos, páginas..." />
        <CommandList>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          
          {modelResults.length > 0 && (
            <CommandGroup heading="Modelos">
              {modelResults.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.title}
                  onSelect={() => handleSelect(result.href)}
                  className="flex items-center gap-3"
                >
                  <result.icon className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <span>{result.title}</span>
                    {result.subtitle && (
                      <span className="ml-2 text-xs text-muted-foreground">{result.subtitle}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Páginas">
            {pageResults.map((result) => (
              <CommandItem
                key={result.id}
                value={result.title}
                onSelect={() => handleSelect(result.href)}
                className="flex items-center gap-3"
              >
                <result.icon className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <span>{result.title}</span>
                  {result.subtitle && (
                    <span className="ml-2 text-xs text-muted-foreground">{result.subtitle}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default AdminSearch;
