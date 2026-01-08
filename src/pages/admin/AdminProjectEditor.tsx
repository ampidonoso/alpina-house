import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Palette, Mountain, Hammer, Plus, Trash2, Upload } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminProject, useCreateProject, useUpdateProject } from '@/hooks/useAdminProjects';
import { 
  useProjectFinishes, useCreateFinish, useDeleteFinish,
  useProjectTerrains, useCreateTerrain, useDeleteTerrain,
  useProjectStages, useUpsertStage, useDeleteStage,
  DEFAULT_STAGES
} from '@/hooks/useProjectCustomizations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAutosave } from '@/hooks/useAutosave';
import { AutosaveIndicator } from '@/components/admin/AutosaveIndicator';
import GalleryManager from '@/components/admin/GalleryManager';

const projectSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  slug: z.string().min(1, 'Slug requerido').max(100).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  area_m2: z.coerce.number().positive().optional().or(z.literal('')),
  bedrooms: z.coerce.number().int().min(0).optional().or(z.literal('')),
  bathrooms: z.coerce.number().int().min(0).optional().or(z.literal('')),
  construction_time: z.string().max(50).optional(),
  price_clp: z.string().max(50).optional(),
  price_uf: z.string().max(50).optional(),
  price_usd: z.string().max(50).optional(),
  features: z.string().optional(),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface PriceData {
  clp?: string;
  uf?: string;
  usd?: string;
}

const parsePriceRange = (priceRange: string | null): PriceData => {
  if (!priceRange) return {};
  try {
    return JSON.parse(priceRange);
  } catch {
    // Legacy format - assume USD
    return { usd: priceRange };
  }
};

const formatPriceRange = (prices: PriceData): string | null => {
  const hasValue = prices.clp || prices.uf || prices.usd;
  if (!hasValue) return null;
  return JSON.stringify(prices);
};

const AdminProjectEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const { data: project, isLoading } = useAdminProject(id || '');
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  
  // Customizations hooks
  const { data: finishes = [] } = useProjectFinishes(id || '');
  const { data: terrains = [] } = useProjectTerrains(id || '');
  const { data: stages = [] } = useProjectStages(id || '');
  const createFinish = useCreateFinish();
  const deleteFinish = useDeleteFinish();
  const createTerrain = useCreateTerrain();
  const deleteTerrain = useDeleteTerrain();
  const upsertStage = useUpsertStage();
  const deleteStage = useDeleteStage();
  
  const [newFinishName, setNewFinishName] = useState('');
  const [newFinishPrice, setNewFinishPrice] = useState('');
  const [newTerrainName, setNewTerrainName] = useState('');
  const [newTerrainPrice, setNewTerrainPrice] = useState('');

  const { register, handleSubmit, setValue, watch, getValues, formState: { errors, isDirty } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      location: '',
      area_m2: '',
      bedrooms: '',
      bathrooms: '',
      construction_time: '',
      price_clp: '',
      price_uf: '',
      price_usd: '',
      features: '',
      is_published: false,
      is_featured: false,
    },
  });

  const name = watch('name');

  // Autosave function
  const handleAutosave = useCallback(async (data: ProjectFormData) => {
    if (isNew || !id) return; // Don't autosave new projects

    const priceRange = formatPriceRange({
      clp: data.price_clp || undefined,
      uf: data.price_uf || undefined,
      usd: data.price_usd || undefined,
    });

    const projectData = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      location: data.location || null,
      area_m2: data.area_m2 ? Number(data.area_m2) : null,
      bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
      bathrooms: data.bathrooms ? Number(data.bathrooms) : null,
      construction_time: data.construction_time || null,
      price_range: priceRange,
      features: data.features ? data.features.split(',').map(f => f.trim()).filter(Boolean) : null,
      is_published: data.is_published,
      is_featured: data.is_featured,
    };

    await updateProject.mutateAsync({ id, data: projectData });
  }, [id, isNew, updateProject]);

  // Autosave hook
  const { status: autosaveStatus, lastSaved, triggerSave, reset: resetAutosave } = useAutosave({
    watch,
    getValues,
    onSave: handleAutosave,
    interval: 30000, // 30 seconds
    enabled: !isNew && !!id && !!project, // Only enable for existing projects
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (isNew && name) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  }, [name, isNew, setValue]);

  // Load project data
  useEffect(() => {
    if (project) {
      setValue('name', project.name);
      setValue('slug', project.slug);
      setValue('description', project.description || '');
      setValue('location', project.location || '');
      setValue('area_m2', project.area_m2 || '');
      setValue('bedrooms', project.bedrooms || '');
      setValue('bathrooms', project.bathrooms || '');
      setValue('construction_time', project.construction_time_months ? String(project.construction_time_months) : '');
      
      const prices = parsePriceRange(project.price_range as string);
      setValue('price_clp', prices.clp || '');
      setValue('price_uf', prices.uf || '');
      setValue('price_usd', prices.usd || '');
      
      setValue('features', project.features?.join(', ') || '');
      setValue('is_published', project.is_published);
      setValue('is_featured', project.is_featured);
    }
  }, [project, setValue]);

  const onSubmit = async (data: ProjectFormData) => {
    const priceRange = formatPriceRange({
      clp: data.price_clp || undefined,
      uf: data.price_uf || undefined,
      usd: data.price_usd || undefined,
    });

    const projectData = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      location: data.location || null,
      area_m2: data.area_m2 ? Number(data.area_m2) : null,
      bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
      bathrooms: data.bathrooms ? Number(data.bathrooms) : null,
      construction_time: data.construction_time || null,
      price_range: priceRange,
      features: data.features ? data.features.split(',').map(f => f.trim()).filter(Boolean) : null,
      is_published: data.is_published,
      is_featured: data.is_featured,
    };

    try {
      if (isNew) {
        const newProject = await createProject.mutateAsync(projectData);
        toast.success('Proyecto creado');
        navigate(`/admin/projects/${newProject.id}`);
      } else {
        await updateProject.mutateAsync({ id: id!, data: projectData });
        toast.success('Proyecto actualizado');
      }
    } catch (error: any) {
      toast.error('Error al guardar', { description: error.message });
    }
  };


  if (!isNew && isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/projects')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-serif text-2xl text-foreground">
                {isNew ? 'Nuevo Modelo' : 'Editar Modelo'}
              </h1>
            </div>
          </div>
          
          {/* Autosave indicator */}
          {!isNew && (
            <AutosaveIndicator 
              status={autosaveStatus} 
              lastSaved={lastSaved}
              onManualSave={triggerSave}
            />
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-card border border-border p-6 space-y-4">
            <h2 className="font-serif text-lg text-foreground mb-4">Información Básica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" {...register('name')} placeholder="Casa Refugio" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" {...register('slug')} placeholder="casa-refugio" />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" {...register('description')} rows={4} placeholder="Descripción del proyecto..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" {...register('location')} placeholder="Pucón, Chile" />
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-card border border-border p-6 space-y-4">
            <h2 className="font-serif text-lg text-foreground mb-4">Especificaciones</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area_m2">Área (m²)</Label>
                <Input id="area_m2" type="number" {...register('area_m2')} placeholder="120" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Dormitorios</Label>
                <Input id="bedrooms" type="number" {...register('bedrooms')} placeholder="3" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Baños</Label>
                <Input id="bathrooms" type="number" {...register('bathrooms')} placeholder="2" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="construction_time">Tiempo construcción</Label>
                <Input id="construction_time" {...register('construction_time')} placeholder="4-6 meses" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Precios</Label>
              <Tabs defaultValue="clp" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="clp">CLP</TabsTrigger>
                  <TabsTrigger value="uf">UF</TabsTrigger>
                  <TabsTrigger value="usd">USD</TabsTrigger>
                </TabsList>
                <TabsContent value="clp" className="mt-3">
                  <Input id="price_clp" {...register('price_clp')} placeholder="$45.000.000" />
                </TabsContent>
                <TabsContent value="uf" className="mt-3">
                  <Input id="price_uf" {...register('price_uf')} placeholder="1.200 UF" />
                </TabsContent>
                <TabsContent value="usd" className="mt-3">
                  <Input id="price_usd" {...register('price_usd')} placeholder="$45,000" />
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Características (separadas por coma)</Label>
              <Input id="features" {...register('features')} placeholder="Planta abierta, Terraza, Vista panorámica" />
            </div>
          </div>

          {/* Bulk Image Manager - Only show after project is created */}
          {!isNew && id && (
            <>
              <GalleryManager 
                projectId={id} 
                images={project?.images || []}
                finishes={finishes}
                terrains={terrains}
              />

              {/* Finishes/Terminaciones */}
              <div className="bg-card border border-border p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-primary" />
                  <h2 className="font-serif text-lg text-foreground">Terminaciones / Fachada</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Opciones de colores y materiales con precio adicional
                </p>
                
                {/* Add new finish */}
                <div className="flex gap-2 flex-wrap items-end">
                  <Input 
                    placeholder="Nombre (ej: Zinc Negro)" 
                    value={newFinishName}
                    onChange={(e) => setNewFinishName(e.target.value)}
                    className="flex-1 min-w-[150px]"
                  />
                  <Input 
                    placeholder="+ USD" 
                    value={newFinishPrice}
                    onChange={(e) => setNewFinishPrice(e.target.value)}
                    className="w-24"
                    type="number"
                  />
                  <input
                    type="file"
                    id="finish-file-input"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!newFinishName.trim()) {
                        toast.error('Ingresa un nombre primero');
                        e.target.value = '';
                        return;
                      }
                      try {
                        await createFinish.mutateAsync({ 
                          projectId: id!, 
                          name: newFinishName.trim(),
                          priceModifier: parseFloat(newFinishPrice) || 0,
                          file 
                        });
                        setNewFinishName('');
                        setNewFinishPrice('');
                        e.target.value = '';
                        toast.success('Terminación agregada');
                      } catch (error: any) {
                        console.error('Error creating finish:', error);
                        toast.error('Error al agregar terminación', { description: error?.message });
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={createFinish.isPending || !newFinishName.trim()}
                    onClick={async () => {
                      if (!newFinishName.trim()) {
                        toast.error('Ingresa un nombre');
                        return;
                      }
                      try {
                        await createFinish.mutateAsync({ 
                          projectId: id!, 
                          name: newFinishName.trim(),
                          priceModifier: parseFloat(newFinishPrice) || 0,
                        });
                        setNewFinishName('');
                        setNewFinishPrice('');
                        toast.success('Terminación agregada');
                      } catch (error: any) {
                        console.error('Error creating finish:', error);
                        toast.error('Error al agregar terminación', { description: error?.message });
                      }
                    }}
                  >
                    {createFinish.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                    Agregar
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    disabled={createFinish.isPending || !newFinishName.trim()}
                    onClick={() => document.getElementById('finish-file-input')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Con Imagen
                  </Button>
                </div>

                {/* Existing finishes */}
                {finishes.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                    {finishes.map((finish) => (
                      <div key={finish.id} className="relative group border border-border rounded overflow-hidden">
                        {finish.storage_path ? (
                          <img 
                            src={finish.storage_path} 
                            alt={finish.name} 
                            className="aspect-square object-cover w-full"
                          />
                        ) : (
                          <div className="aspect-square bg-muted flex items-center justify-center">
                            <Palette className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-background/90 p-2">
                          <span className="text-sm font-medium block">{finish.name}</span>
                          {(finish.price_modifier || 0) > 0 && (
                            <span className="text-xs text-primary">+${(finish.price_modifier || 0).toLocaleString()} USD</span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteFinish.mutate({ id: finish.id, projectId: id!, storagePath: finish.storage_path })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Terrains */}
              <div className="bg-card border border-border p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Mountain className="w-5 h-5 text-primary" />
                  <h2 className="font-serif text-lg text-foreground">Terrenos</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Opciones de entorno con ajuste de precio (ej: Bosque, Playa, Montaña)
                </p>
                
                {/* Add new terrain */}
                <div className="flex gap-2 flex-wrap">
                  <Input 
                    placeholder="Nombre (ej: Bosque)" 
                    value={newTerrainName}
                    onChange={(e) => setNewTerrainName(e.target.value)}
                    className="flex-1 min-w-[150px]"
                  />
                  <Input 
                    placeholder="+ USD" 
                    value={newTerrainPrice}
                    onChange={(e) => setNewTerrainPrice(e.target.value)}
                    className="w-24"
                    type="number"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !newTerrainName.trim()) {
                          toast.error('Ingresa un nombre primero');
                          return;
                        }
                        try {
                          await createTerrain.mutateAsync({ 
                            projectId: id!, 
                            name: newTerrainName.trim(),
                            priceModifier: parseFloat(newTerrainPrice) || 0,
                            file 
                          });
                          setNewTerrainName('');
                          setNewTerrainPrice('');
                          toast.success('Terreno agregado');
                        } catch (error) {
                          toast.error('Error al agregar terreno');
                        }
                      }}
                    />
                    <Button type="button" variant="outline" asChild disabled={createTerrain.isPending}>
                      <span>
                        {createTerrain.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                        Agregar
                      </span>
                    </Button>
                  </label>
                </div>

                {/* Existing terrains */}
                {terrains.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                    {terrains.map((terrain) => (
                      <div key={terrain.id} className="relative group border border-border rounded overflow-hidden">
                        {terrain.storage_path ? (
                          <img 
                            src={terrain.storage_path} 
                            alt={terrain.name} 
                            className="aspect-square object-cover w-full"
                          />
                        ) : (
                          <div className="aspect-square bg-muted flex items-center justify-center">
                            <Mountain className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-background/90 p-2">
                          <span className="text-sm font-medium block">{terrain.name}</span>
                          {(terrain.price_modifier || 0) > 0 && (
                            <span className="text-xs text-primary">+${(terrain.price_modifier || 0).toLocaleString()} USD</span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteTerrain.mutate({ id: terrain.id, projectId: id!, storagePath: terrain.storage_path })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Construction Stages */}
              <div className="bg-card border border-border p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Hammer className="w-5 h-5 text-primary" />
                  <h2 className="font-serif text-lg text-foreground">Etapas de Construcción (Carta Gantt)</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Define las 6 etapas del proceso de construcción. Configura mes de inicio y duración para cada hito.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DEFAULT_STAGES.map((defaultStage) => {
                    const existingStage = stages.find(s => s.display_order === defaultStage.number);
                    const currentStartMonth = existingStage?.start_month ?? defaultStage.start_month;
                    const currentDuration = existingStage?.duration_months ?? defaultStage.duration_months;
                    
                    return (
                      <div key={defaultStage.number} className="border border-border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-primary">Hito {defaultStage.number}</span>
                          {existingStage && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => deleteStage.mutate({ 
                                id: existingStage.id, 
                                projectId: id!, 
                                storagePath: existingStage.storage_path 
                              })}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        
                        <Input 
                          placeholder={defaultStage.name}
                          defaultValue={existingStage?.name || defaultStage.name}
                          className="text-sm"
                          onBlur={(e) => {
                            const name = e.target.value.trim() || defaultStage.name;
                            if (existingStage?.name !== name) {
                              upsertStage.mutate({
                                projectId: id!,
                                stageNumber: defaultStage.number,
                                name,
                                startMonth: currentStartMonth,
                                durationMonths: currentDuration,
                                existingId: existingStage?.id
                              });
                            }
                          }}
                        />

                        {/* Timeline controls */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Mes inicio</Label>
                            <select
                              className="w-full h-9 px-2 bg-background border border-border rounded text-sm"
                              defaultValue={currentStartMonth}
                              onChange={(e) => {
                                const startMonth = parseInt(e.target.value);
                                upsertStage.mutate({
                                  projectId: id!,
                                  stageNumber: defaultStage.number,
                                  name: existingStage?.name || defaultStage.name,
                                  startMonth,
                                  durationMonths: currentDuration,
                                  existingId: existingStage?.id
                                });
                              }}
                            >
                              {[0, 1, 2, 3, 4, 5, 6].map(m => (
                                <option key={m} value={m}>Mes {m}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Duración</Label>
                            <select
                              className="w-full h-9 px-2 bg-background border border-border rounded text-sm"
                              defaultValue={currentDuration}
                              onChange={(e) => {
                                const durationMonths = parseInt(e.target.value);
                                upsertStage.mutate({
                                  projectId: id!,
                                  stageNumber: defaultStage.number,
                                  name: existingStage?.name || defaultStage.name,
                                  startMonth: currentStartMonth,
                                  durationMonths,
                                  existingId: existingStage?.id
                                });
                              }}
                            >
                              {[1, 2, 3].map(m => (
                                <option key={m} value={m}>{m} mes{m > 1 ? 'es' : ''}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        {existingStage?.storage_path ? (
                          <div className="relative group aspect-video">
                            <img 
                              src={existingStage.storage_path} 
                              alt={existingStage.name}
                              className="w-full h-full object-cover"
                            />
                            <label className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                              <input
                                type="file"
                                accept="image/jpeg,image/png"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  try {
                                    await upsertStage.mutateAsync({
                                      projectId: id!,
                                      stageNumber: defaultStage.number,
                                      name: existingStage?.name || defaultStage.name,
                                      startMonth: currentStartMonth,
                                      durationMonths: currentDuration,
                                      file,
                                      existingId: existingStage?.id
                                    });
                                    toast.success('Imagen actualizada');
                                  } catch (error) {
                                    toast.error('Error al subir imagen');
                                  }
                                }}
                              />
                              <span className="text-sm text-foreground">Cambiar imagen</span>
                            </label>
                          </div>
                        ) : (
                          <label className="block aspect-video border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/30">
                            <input
                              type="file"
                              accept="image/jpeg,image/png"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  await upsertStage.mutateAsync({
                                    projectId: id!,
                                    stageNumber: defaultStage.number,
                                    name: existingStage?.name || defaultStage.name,
                                    startMonth: currentStartMonth,
                                    durationMonths: currentDuration,
                                    file,
                                    existingId: existingStage?.id
                                  });
                                  toast.success('Etapa guardada');
                                } catch (error) {
                                  toast.error('Error al guardar etapa');
                                }
                              }}
                            />
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                              <span className="text-xs text-muted-foreground">Subir imagen</span>
                            </div>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Publishing */}
          <div className="bg-card border border-border p-6 space-y-4">
            <h2 className="font-serif text-lg text-foreground mb-4">Publicación</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Publicado</Label>
                <p className="text-sm text-muted-foreground">El proyecto será visible en la web pública</p>
              </div>
              <Switch
                checked={watch('is_published')}
                onCheckedChange={(checked) => setValue('is_published', checked, { shouldDirty: true })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Destacado</Label>
                <p className="text-sm text-muted-foreground">Aparecerá primero en la lista</p>
              </div>
              <Switch
                checked={watch('is_featured')}
                onCheckedChange={(checked) => setValue('is_featured', checked, { shouldDirty: true })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" variant="cta" disabled={createProject.isPending || updateProject.isPending}>
              {(createProject.isPending || updateProject.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isNew ? 'Crear Modelo' : 'Guardar Cambios'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/admin/projects')}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminProjectEditor;