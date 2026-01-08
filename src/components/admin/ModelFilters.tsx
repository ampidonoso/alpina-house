import { useState } from 'react';
import { Search, Grid3X3, List, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export type ViewMode = 'grid' | 'list';
export type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'published';
export type FilterStatus = 'all' | 'published' | 'draft';

interface ModelFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filterStatus: FilterStatus;
  onFilterStatusChange: (status: FilterStatus) => void;
  totalCount?: number;
  filteredCount?: number;
}

const sortLabels: Record<SortOption, string> = {
  'newest': 'Más reciente',
  'oldest': 'Más antiguo',
  'name-asc': 'Nombre A-Z',
  'name-desc': 'Nombre Z-A',
  'published': 'Publicados primero',
};

const ModelFilters = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  filterStatus,
  onFilterStatusChange,
  totalCount = 0,
  filteredCount = 0,
}: ModelFiltersProps) => {
  const hasActiveFilters = filterStatus !== 'all' || searchQuery.length > 0;

  const clearFilters = () => {
    onSearchChange('');
    onFilterStatusChange('all');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar modelos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sortLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  !
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select value={filterStatus} onValueChange={(v) => onFilterStatusChange(v as FilterStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="published">Publicados</SelectItem>
                    <SelectItem value="draft">Borradores</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* View Mode Toggle */}
        <div className="flex border border-border rounded-sm">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-r-none"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-l-none"
            onClick={() => onViewModeChange('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results count */}
      {(searchQuery || filterStatus !== 'all') && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Mostrando {filteredCount} de {totalCount} modelos
          </span>
          {hasActiveFilters && (
            <Button variant="link" size="sm" className="h-auto p-0" onClick={clearFilters}>
              Limpiar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelFilters;
