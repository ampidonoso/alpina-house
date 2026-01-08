import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Play, Check, Upload, Palette, X, ExternalLink, Trash2, User, Key, RotateCcw, Image as ImageIcon, ChevronDown } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import alpinaHouseLogo from '@/assets/alpina-house-logo.png';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSiteConfig, useUpdateSiteConfig, SiteConfig } from '@/hooks/useSiteConfig';
import {
  useSiteAssets,
  useUploadSiteAsset,
  useDeleteSiteAsset,
  type SiteAsset,
} from '@/hooks/useSiteAssets';
import {
  imageSlots,
  pageLabels,
  categoryLabels,
  type ImageSlot,
  type AssetPage,
} from '@/config/imageSlots';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ExchangeRatesCard from '@/components/admin/ExchangeRatesCard';

// ============= SHARED TYPES =============
interface SlotWithAsset extends ImageSlot {
  dbAsset: SiteAsset | null;
  currentImage: string;
  isCustom: boolean;
}

// ============= TOGGLE FIELD COMPONENT =============
const ToggleField = ({ 
  label, 
  enabled, 
  onToggle, 
  children 
}: { 
  label: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children: React.ReactNode;
}) => {
  return (
    <div className={`space-y-2 transition-opacity ${!enabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <Label className={!enabled ? 'text-muted-foreground' : ''}>{label}</Label>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
      <div className={!enabled ? 'pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
};

// ============= IMAGE SLOT COMPONENTS =============
const SlotCard = ({
  slot,
  onUpload,
  onRestore,
  isUploading,
}: {
  slot: SlotWithAsset;
  onUpload: (slotKey: string, file: File) => void;
  onRestore: (slot: SlotWithAsset) => void;
  isUploading: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(slot.key, file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <Card className="overflow-hidden group hover:border-primary/30 transition-colors">
        <div 
          className="relative aspect-video bg-muted cursor-pointer"
          onClick={() => setPreviewOpen(true)}
        >
          <img
            src={slot.currentImage}
            alt={slot.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            {slot.isCustom ? (
              <Badge variant="default" className="bg-primary text-primary-foreground text-[10px]">
                <Check className="w-3 h-3 mr-1" />
                Personalizada
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">
                Por defecto
              </Badge>
            )}
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span className="text-white text-xs">Click para ver</span>
          </div>
        </div>
        <CardContent className="p-3 space-y-2">
          <div>
            <h4 className="font-medium text-sm text-foreground">{slot.name}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{slot.description}</p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Upload className="w-3 h-3 mr-1" />
              )}
              Cambiar
            </Button>
            {slot.isCustom && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => onRestore(slot)}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Restaurar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{slot.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <img
              src={slot.currentImage}
              alt={slot.name}
              className="w-full max-h-[60vh] object-contain rounded-lg"
            />
            <p className="text-sm text-muted-foreground">{slot.description}</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded">{slot.key}</code>
              {slot.isCustom ? (
                <Badge variant="default" className="bg-primary">Personalizada</Badge>
              ) : (
                <Badge variant="secondary">Por defecto</Badge>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const GallerySection = ({
  slots,
  onUpload,
  onRestore,
  isUploading,
}: {
  slots: SlotWithAsset[];
  onUpload: (slotKey: string, file: File) => void;
  onRestore: (slot: SlotWithAsset) => void;
  isUploading: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const customCount = slots.filter(s => s.isCustom).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-3">
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
        <h3 className="text-sm font-semibold text-foreground">Galería Casos de Éxito</h3>
        <Badge variant="outline" className="text-xs">
          {customCount}/{slots.length} personalizadas
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {slots.map((slot) => (
            <GalleryThumbnail
              key={slot.key}
              slot={slot}
              onUpload={onUpload}
              onRestore={onRestore}
              isUploading={isUploading}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const GalleryThumbnail = ({
  slot,
  onUpload,
  onRestore,
  isUploading,
}: {
  slot: SlotWithAsset;
  onUpload: (slotKey: string, file: File) => void;
  onRestore: (slot: SlotWithAsset) => void;
  isUploading: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showActions, setShowActions] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(slot.key, file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      className="relative aspect-square rounded overflow-hidden cursor-pointer group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <img
        src={slot.currentImage}
        alt={slot.name}
        className="w-full h-full object-cover"
      />
      {slot.isCustom && (
        <div className="absolute top-1 left-1">
          <div className="w-2 h-2 rounded-full bg-primary" title="Personalizada" />
        </div>
      )}
      <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          size="sm"
          variant="secondary"
          className="h-6 text-[10px] px-2"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={isUploading}
        >
          <Upload className="w-2 h-2 mr-1" />
          Cambiar
        </Button>
        {slot.isCustom && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[10px] px-2 text-white hover:text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onRestore(slot);
            }}
          >
            <RotateCcw className="w-2 h-2 mr-1" />
            Restaurar
          </Button>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
        <p className="text-[9px] text-white truncate">{slot.name.replace('Galería Refugio ', '')}</p>
      </div>
    </div>
  );
};

// ============= IMAGES TAB COMPONENT =============
const ImagesTab = () => {
  const [activeImagePage, setActiveImagePage] = useState<AssetPage>('home');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const { data: dbAssets, isLoading } = useSiteAssets();
  const uploadMutation = useUploadSiteAsset();
  const deleteMutation = useDeleteSiteAsset();

  const slotsWithAssets: SlotWithAsset[] = imageSlots.map(slot => {
    const dbAsset = dbAssets?.find(a => a.key === slot.key && a.is_active) || null;
    return {
      ...slot,
      dbAsset,
      currentImage: dbAsset?.storage_path || slot.defaultImage,
      isCustom: !!dbAsset,
    };
  });

  const currentPageSlots = slotsWithAssets.filter(s => s.page === activeImagePage);
  const gallerySlots = currentPageSlots.filter(s => s.key.startsWith('gallery_'));
  const regularSlots = currentPageSlots.filter(s => !s.key.startsWith('gallery_'));

  const slotsByCategory = regularSlots.reduce((acc, slot) => {
    if (!acc[slot.category]) acc[slot.category] = [];
    acc[slot.category].push(slot);
    return acc;
  }, {} as Record<string, SlotWithAsset[]>);

  const handleUpload = async (slotKey: string, file: File) => {
    const slot = imageSlots.find(s => s.key === slotKey);
    if (!slot) return;

    setUploadingKey(slotKey);
    try {
      await uploadMutation.mutateAsync({
        file,
        key: slotKey,
        category: slot.category,
        page: slot.page,
        altText: slot.name,
      });
      toast.success('Imagen actualizada correctamente');
    } catch (error) {
      toast.error('Error al subir la imagen');
    } finally {
      setUploadingKey(null);
    }
  };

  const handleRestore = async (slot: SlotWithAsset) => {
    if (!slot.dbAsset) return;
    if (!confirm('¿Restaurar a la imagen por defecto? Se eliminará la imagen personalizada.')) return;

    try {
      await deleteMutation.mutateAsync(slot.dbAsset);
      toast.success('Imagen restaurada a la original');
    } catch (error) {
      toast.error('Error al restaurar la imagen');
    }
  };

  const totalSlots = imageSlots.length;
  const customizedSlots = slotsWithAssets.filter(s => s.isCustom).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">
          Gestiona las imágenes estáticas del sitio.
          {' '}<span className="text-foreground font-medium">{customizedSlots}/{totalSlots}</span> personalizadas.
        </p>
      </div>

      <Tabs value={activeImagePage} onValueChange={(v) => setActiveImagePage(v as AssetPage)}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid lg:grid-cols-6">
          {Object.entries(pageLabels).map(([key, label]) => {
            const pageSlots = slotsWithAssets.filter(s => s.page === key);
            const pageCustom = pageSlots.filter(s => s.isCustom).length;
            return (
              <TabsTrigger key={key} value={key} className="relative">
                {label}
                {pageSlots.length > 0 && (
                  <span className="ml-1.5 text-[10px] text-muted-foreground">
                    ({pageCustom}/{pageSlots.length})
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.keys(pageLabels).map((pageKey) => (
          <TabsContent key={pageKey} value={pageKey} className="mt-6 space-y-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : currentPageSlots.length === 0 ? (
              <Card className="py-12">
                <CardContent className="flex flex-col items-center gap-4 text-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">No hay imágenes definidas</h3>
                    <p className="text-sm text-muted-foreground">
                      Esta página no tiene slots de imágenes configurados
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {Object.entries(slotsByCategory).map(([category, slots]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {categoryLabels[category as keyof typeof categoryLabels] || category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {slots.map((slot) => (
                        <SlotCard
                          key={slot.key}
                          slot={slot}
                          onUpload={handleUpload}
                          onRestore={handleRestore}
                          isUploading={uploadingKey === slot.key}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {gallerySlots.length > 0 && (
                  <GallerySection
                    slots={gallerySlots}
                    onUpload={handleUpload}
                    onRestore={handleRestore}
                    isUploading={!!uploadingKey}
                  />
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

// ============= VIDEO SELECTOR COMPONENT =============
const heroVideos: { id: string; path: string; name: string }[] = [];

interface CustomVideo {
  id: string;
  name: string;
  path: string;
}

const MultiVideoSelector = ({ 
  value, 
  onChange 
}: { 
  value: string[]; 
  onChange: (paths: string[]) => void;
}) => {
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [customVideos, setCustomVideos] = useState<CustomVideo[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => {
    fetchCustomVideos();
  }, []);

  const fetchCustomVideos = async () => {
    const { data, error } = await supabase.storage.from('videos').list('hero', {
      sortBy: { column: 'created_at', order: 'desc' }
    });

    if (error) {
      console.error('Error fetching videos:', error);
      return;
    }

    if (data) {
      const videos = data
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => ({
          id: file.id,
          name: file.name.replace(/\.[^/.]+$/, '').replace(/-/g, ' '),
          path: supabase.storage.from('videos').getPublicUrl(`hero/${file.name}`).data.publicUrl
        }));
      setCustomVideos(videos);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
      toast.error('Formato no soportado. Usa MP4, WebM o MOV.');
      return;
    }

    if (file.size > 104857600) {
      toast.error('El video es demasiado grande. Máximo 100MB.');
      return;
    }

    setUploading(true);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    try {
      const { error } = await supabase.storage
        .from('videos')
        .upload(`hero/${fileName}`, file);

      if (error) throw error;

      toast.success('Video subido correctamente');
      await fetchCustomVideos();
      
      const publicUrl = supabase.storage.from('videos').getPublicUrl(`hero/${fileName}`).data.publicUrl;
      onChange([...valueRef.current, publicUrl]);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Error al subir el video: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteCustomVideo = async (video: CustomVideo, e: React.MouseEvent) => {
    e.stopPropagation();
    const urlParts = video.path.split('/');
    const fileName = urlParts[urlParts.length - 1];

    try {
      const { error } = await supabase.storage
        .from('videos')
        .remove([`hero/${fileName}`]);

      if (error) throw error;

      toast.success('Video eliminado del servidor');
      
      if (value.includes(video.path)) {
        onChange(value.filter(v => v !== video.path));
      }
      
      await fetchCustomVideos();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Error al eliminar el video');
    }
  };

  const toggleVideoSelection = (path: string) => {
    if (value.includes(path)) {
      onChange(value.filter(v => v !== path));
    } else {
      onChange([...value, path]);
    }
  };

  const removeFromSelection = (path: string) => {
    onChange(value.filter(v => v !== path));
  };

  const getVideoName = (path: string) => {
    const builtIn = heroVideos.find(v => v.path === path);
    if (builtIn) return builtIn.name;
    
    const custom = customVideos.find(v => v.path === path);
    if (custom) return custom.name;
    
    return path.split('/').pop() || 'Video';
  };

  return (
    <div className="space-y-6">
      {value.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            Videos Seleccionados ({value.length}) {value.length > 1 && '- Se rotarán automáticamente'}
          </Label>
          <div className="space-y-2 bg-muted/30 rounded-lg p-3">
            {value.map((path, index) => (
              <div 
                key={path}
                className="flex items-center gap-3 bg-background rounded-lg p-2 border border-border"
              >
                <span className="text-xs text-muted-foreground font-mono w-5">{index + 1}</span>
                <video src={path} muted className="w-16 h-10 object-cover rounded" />
                <span className="flex-1 text-sm truncate">{getVideoName(path)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromSelection(path)}
                  className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {value.length > 1 
              ? 'Los videos se mostrarán en este orden, rotando cada 10 segundos con transición cinematográfica.'
              : 'Selecciona más videos para activar la rotación automática.'}
          </p>
        </div>
      )}

      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleUpload}
          className="hidden"
          id="video-upload"
        />
        <label htmlFor="video-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
                <span className="text-sm text-muted-foreground">Subiendo video...</span>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground" />
                <span className="text-sm font-medium">Subir video personalizado</span>
                <span className="text-xs text-muted-foreground">MP4, WebM o MOV • Máx. 100MB</span>
              </>
            )}
          </div>
        </label>
      </div>

      {customVideos.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Videos Personalizados ({customVideos.length})
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {customVideos.map((video) => {
              const isSelected = value.includes(video.path);
              return (
                <div key={video.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => toggleVideoSelection(video.path)}
                    onMouseEnter={() => setPreviewVideo(video.path)}
                    onMouseLeave={() => setPreviewVideo(null)}
                    className={`relative aspect-video w-full overflow-hidden border-2 transition-all ${
                      isSelected 
                        ? 'border-primary ring-2 ring-primary/30' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <video
                      src={video.path}
                      muted
                      loop
                      playsInline
                      autoPlay={previewVideo === video.path}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
                    <div className="absolute bottom-1 left-1 right-8">
                      <span className="text-[10px] text-white font-medium truncate block">{video.name}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-stone-950/40">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteCustomVideo(video, e)}
                    className="absolute top-1 left-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90 z-10"
                    title="Eliminar video del servidor"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Play className="w-4 h-4" />
          Videos Predefinidos
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {heroVideos.map((video) => {
            const isSelected = value.includes(video.path);
            return (
              <button
                key={video.id}
                type="button"
                onClick={() => toggleVideoSelection(video.path)}
                onMouseEnter={() => setPreviewVideo(video.path)}
                onMouseLeave={() => setPreviewVideo(null)}
                className={`relative aspect-video overflow-hidden border-2 transition-all ${
                  isSelected 
                    ? 'border-primary ring-2 ring-primary/30' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <video
                  src={video.path}
                  muted
                  loop
                  playsInline
                  autoPlay={previewVideo === video.path}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
                <div className="absolute bottom-1 left-1 right-1">
                  <span className="text-[10px] text-white font-medium">{video.name}</span>
                </div>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-stone-950/40">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {value.length > 0 && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([])}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Quitar todos
          </Button>
        </div>
      )}
    </div>
  );
};

// ============= COLOR PICKER COMPONENT =============
const ColorPicker = ({ 
  value, 
  onChange, 
  label 
}: { 
  value: string; 
  onChange: (color: string) => void;
  label: string;
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-3 items-center">
        <div className="relative">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 cursor-pointer border-2 border-border rounded"
          />
        </div>
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono"
        />
        <div 
          className="w-12 h-12 border border-border rounded"
          style={{ backgroundColor: value || 'transparent' }}
        />
      </div>
    </div>
  );
};

// ============= PROFILE SECTION COMPONENT =============
const ProfileSection = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Contraseña actualizada correctamente');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar la contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Información del Usuario
          </CardTitle>
          <CardDescription>Tu cuenta de administrador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{userEmail || 'Cargando...'}</p>
              <p className="text-sm text-muted-foreground">Administrador</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nueva Contraseña</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirmar Nueva Contraseña</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button 
            onClick={handlePasswordChange} 
            disabled={isChangingPassword || !newPassword || !confirmPassword}
            className="w-full sm:w-auto"
          >
            {isChangingPassword ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Key className="w-4 h-4 mr-2" />
            )}
            Cambiar Contraseña
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Cerrar Sesión</CardTitle>
          <CardDescription>Salir de tu cuenta de administrador</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut}>
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// ============= MAIN ADMIN SETTINGS COMPONENT =============
const AdminSettings = () => {
  const { data: configs, isLoading } = useSiteConfig();
  const updateConfig = useUpdateSiteConfig();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [fieldToggles, setFieldToggles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  useEffect(() => {
    if (configs) {
      const data: Record<string, string> = {};
      const toggles: Record<string, boolean> = {};
      configs.forEach(config => {
        // Convert Json value to string
        const strValue = typeof config.value === 'string' ? config.value : 
                         config.value !== null ? JSON.stringify(config.value) : '';
        data[config.key] = strValue;
        toggles[config.key] = config.value !== null && strValue !== '';
      });
      setFormData(data);
      setFieldToggles(toggles);
    }
  }, [configs]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleToggle = (key: string, enabled: boolean) => {
    setFieldToggles(prev => ({ ...prev, [key]: enabled }));
    if (!enabled) {
      setFormData(prev => ({ ...prev, [key]: '' }));
    }
    setHasChanges(true);
  };

  const isFieldEnabled = (key: string) => fieldToggles[key] ?? true;

  const handleSave = async () => {
    if (!configs) return;

    try {
      const promises = configs
        .filter(config => formData[config.key] !== config.value)
        .map(config => 
          updateConfig.mutateAsync({ key: config.key, value: formData[config.key] })
        );

      await Promise.all(promises);
      setHasChanges(false);
      toast.success('Configuración guardada');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    }
  };

  const getConfigValue = (key: string) => formData[key] || '';

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif text-foreground">Configuración del Sitio</h1>
            <p className="text-muted-foreground mt-1">Personaliza los textos, videos, imágenes y colores del sitio</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || updateConfig.isPending}
            variant="cta"
          >
            {updateConfig.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar Cambios
          </Button>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid grid-cols-5 lg:grid-cols-10 w-full">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="imagenes">Imágenes</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="colores">Colores</TabsTrigger>
            <TabsTrigger value="configurador">Configurador</TabsTrigger>
            <TabsTrigger value="contacto">Contacto</TabsTrigger>
            <TabsTrigger value="redes">Redes</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
          </TabsList>

          {/* HERO TAB */}
          <TabsContent value="hero">
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="w-5 h-5" />
                        Vista Previa del Hero
                      </CardTitle>
                      <CardDescription>
                        Así se verá el hero en la página de inicio
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('/', '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver en vivo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative aspect-[16/7] bg-stone-950 overflow-hidden">
                    {(() => {
                      try {
                        const videos = JSON.parse(getConfigValue('hero_videos') || '[]');
                        const firstVideo = videos[0];
                        if (firstVideo) {
                          return (
                            <video
                              key={firstVideo}
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="absolute inset-0 w-full h-full object-cover"
                              style={{ filter: "saturate(1.08) contrast(1.02) brightness(0.95)" }}
                            >
                              <source src={firstVideo} type="video/mp4" />
                            </video>
                          );
                        }
                        return (
                          <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-950 flex items-center justify-center">
                            <span className="text-stone-500 text-sm">Sin videos seleccionados</span>
                          </div>
                        );
                      } catch {
                        return (
                          <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-950 flex items-center justify-center">
                            <span className="text-stone-500 text-sm">Sin videos seleccionados</span>
                          </div>
                        );
                      }
                    })()}
                    
                    <div className="absolute inset-0 bg-stone-950/30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40" />
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-950/60 via-transparent to-stone-950/60" />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                      <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mb-3" />
                      <span className="text-white/60 text-[8px] tracking-[0.3em] uppercase mb-3">
                        {getConfigValue('hero_preheadline') || 'Proyectos prediseñados listos para construir'}
                      </span>
                      <img 
                        src={alpinaHouseLogo} 
                        alt="ALPINA HOUSE"
                        className="h-10 md:h-14 w-auto opacity-90 mb-4"
                      />
                      <div className="flex gap-2 mt-2">
                        <span className="px-4 py-1.5 bg-white text-stone-950 text-[8px] uppercase tracking-wider">
                          {getConfigValue('hero_btn_primary_text') || 'Ver Modelos'}
                        </span>
                        <span className="px-4 py-1.5 border border-white/30 text-white text-[8px] uppercase tracking-wider">
                          {getConfigValue('hero_cta_text') || 'Cotizar Ahora'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-stone-950/90 backdrop-blur-sm border-t border-white/10 px-4 py-2">
                      <div className="flex justify-center gap-8 text-center">
                        <div>
                          <span className="text-white/50 text-[6px] uppercase tracking-wider block">
                            {getConfigValue('hero_stat_1_label') || 'Modelos'}
                          </span>
                          <span className="text-white text-sm font-serif">
                            {getConfigValue('hero_stat_1_value') || '5'}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/50 text-[6px] uppercase tracking-wider block">
                            {getConfigValue('hero_stat_2_label') || 'Desde'}
                          </span>
                          <span className="text-white text-sm font-serif">
                            {getConfigValue('hero_stat_2_value') || '18 m²'}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/50 text-[6px] uppercase tracking-wider block">
                            {getConfigValue('hero_stat_3_label') || 'Tiempo'}
                          </span>
                          <span className="text-white text-sm font-serif">
                            {getConfigValue('hero_stat_3_value') || '~6 mes'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Videos del Hero
                  </CardTitle>
                  <CardDescription>
                    Selecciona uno o varios videos. Si seleccionas varios, se rotarán automáticamente.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MultiVideoSelector
                    value={(() => {
                      try {
                        const val = getConfigValue('hero_videos');
                        return val ? JSON.parse(val) : [];
                      } catch { return []; }
                    })()}
                    onChange={(paths) => handleChange('hero_videos', JSON.stringify(paths))}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Textos del Hero</CardTitle>
                  <CardDescription>Personaliza los textos que aparecen sobre el video</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ToggleField
                    label="Pre-título"
                    enabled={isFieldEnabled('hero_preheadline')}
                    onToggle={(enabled) => handleToggle('hero_preheadline', enabled)}
                  >
                    <Input
                      value={getConfigValue('hero_preheadline')}
                      onChange={(e) => handleChange('hero_preheadline', e.target.value)}
                      placeholder="Proyectos prediseñados listos para construir"
                    />
                  </ToggleField>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <ToggleField
                      label="Título Principal"
                      enabled={isFieldEnabled('hero_title')}
                      onToggle={(enabled) => handleToggle('hero_title', enabled)}
                    >
                      <Input
                        value={getConfigValue('hero_title')}
                        onChange={(e) => handleChange('hero_title', e.target.value)}
                        placeholder="ALPINA"
                      />
                    </ToggleField>
                    <ToggleField
                      label="Subtítulo"
                      enabled={isFieldEnabled('hero_subtitle')}
                      onToggle={(enabled) => handleToggle('hero_subtitle', enabled)}
                    >
                      <Input
                        value={getConfigValue('hero_subtitle')}
                        onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                        placeholder="HOUSE"
                      />
                    </ToggleField>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Botones del Hero</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ToggleField
                    label="Botón Principal"
                    enabled={isFieldEnabled('hero_btn_primary_text')}
                    onToggle={(enabled) => {
                      handleToggle('hero_btn_primary_text', enabled);
                      handleToggle('hero_btn_primary_link', enabled);
                    }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        value={getConfigValue('hero_btn_primary_text')}
                        onChange={(e) => handleChange('hero_btn_primary_text', e.target.value)}
                        placeholder="Ver Modelos"
                      />
                      <Input
                        value={getConfigValue('hero_btn_primary_link')}
                        onChange={(e) => handleChange('hero_btn_primary_link', e.target.value)}
                        placeholder="/modelos"
                      />
                    </div>
                  </ToggleField>
                  <ToggleField
                    label="Botón Secundario (CTA)"
                    enabled={isFieldEnabled('hero_cta_text')}
                    onToggle={(enabled) => {
                      handleToggle('hero_cta_text', enabled);
                      handleToggle('hero_btn_secondary_link', enabled);
                    }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        value={getConfigValue('hero_cta_text')}
                        onChange={(e) => handleChange('hero_cta_text', e.target.value)}
                        placeholder="Cotizar Ahora"
                      />
                      <Input
                        value={getConfigValue('hero_btn_secondary_link')}
                        onChange={(e) => handleChange('hero_btn_secondary_link', e.target.value)}
                        placeholder="https://calendar.app.google/..."
                      />
                    </div>
                  </ToggleField>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas del Hero</CardTitle>
                  <CardDescription>Los números que aparecen en la barra inferior del hero</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <ToggleField
                      label="Estadística 1"
                      enabled={isFieldEnabled('hero_stat_1_label')}
                      onToggle={(enabled) => {
                        handleToggle('hero_stat_1_label', enabled);
                        handleToggle('hero_stat_1_value', enabled);
                      }}
                    >
                      <Input
                        value={getConfigValue('hero_stat_1_label')}
                        onChange={(e) => handleChange('hero_stat_1_label', e.target.value)}
                        placeholder="Modelos"
                        className="mb-2"
                      />
                      <Input
                        value={getConfigValue('hero_stat_1_value')}
                        onChange={(e) => handleChange('hero_stat_1_value', e.target.value)}
                        placeholder="5"
                      />
                    </ToggleField>
                    <ToggleField
                      label="Estadística 2"
                      enabled={isFieldEnabled('hero_stat_2_label')}
                      onToggle={(enabled) => {
                        handleToggle('hero_stat_2_label', enabled);
                        handleToggle('hero_stat_2_value', enabled);
                      }}
                    >
                      <Input
                        value={getConfigValue('hero_stat_2_label')}
                        onChange={(e) => handleChange('hero_stat_2_label', e.target.value)}
                        placeholder="Desde"
                        className="mb-2"
                      />
                      <Input
                        value={getConfigValue('hero_stat_2_value')}
                        onChange={(e) => handleChange('hero_stat_2_value', e.target.value)}
                        placeholder="18 m²"
                      />
                    </ToggleField>
                    <ToggleField
                      label="Estadística 3"
                      enabled={isFieldEnabled('hero_stat_3_label')}
                      onToggle={(enabled) => {
                        handleToggle('hero_stat_3_label', enabled);
                        handleToggle('hero_stat_3_value', enabled);
                      }}
                    >
                      <Input
                        value={getConfigValue('hero_stat_3_label')}
                        onChange={(e) => handleChange('hero_stat_3_label', e.target.value)}
                        placeholder="Tiempo"
                        className="mb-2"
                      />
                      <Input
                        value={getConfigValue('hero_stat_3_value')}
                        onChange={(e) => handleChange('hero_stat_3_value', e.target.value)}
                        placeholder="~6 mes"
                      />
                    </ToggleField>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* IMAGES TAB - NEW */}
          <TabsContent value="imagenes">
            <ImagesTab />
          </TabsContent>

          {/* GENERAL TAB */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configuración General</CardTitle>
                <CardDescription>Nombre del sitio y logo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre del Sitio</Label>
                  <Input
                    value={getConfigValue('site_name')}
                    onChange={(e) => handleChange('site_name', e.target.value)}
                    placeholder="Alpina"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL del Logo</Label>
                  <Input
                    value={getConfigValue('logo_url')}
                    onChange={(e) => handleChange('logo_url', e.target.value)}
                    placeholder="https://..."
                  />
                  {getConfigValue('logo_url') && (
                    <div className="mt-2 p-4 bg-muted/50 border">
                      <img 
                        src={getConfigValue('logo_url')} 
                        alt="Logo preview" 
                        className="max-h-16 object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Texto Alternativo del Logo</Label>
                  <Input
                    value={getConfigValue('logo_alt')}
                    onChange={(e) => handleChange('logo_alt', e.target.value)}
                    placeholder="Alpina"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COLORS TAB */}
          <TabsContent value="colores">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Colores del Sitio
                </CardTitle>
                <CardDescription>Define los colores principales de la marca</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ColorPicker
                  label="Color Primario"
                  value={getConfigValue('primary_color')}
                  onChange={(color) => handleChange('primary_color', color)}
                />
                <ColorPicker
                  label="Color Secundario"
                  value={getConfigValue('secondary_color')}
                  onChange={(color) => handleChange('secondary_color', color)}
                />
                <ColorPicker
                  label="Color de Acento"
                  value={getConfigValue('accent_color')}
                  onChange={(color) => handleChange('accent_color', color)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONFIGURADOR TAB */}
          <TabsContent value="configurador">
            <div className="space-y-6">
              {/* Exchange Rates Card */}
              <ExchangeRatesCard />
              
              <Card>
                <CardHeader>
                  <CardTitle>Configurador de Casa</CardTitle>
                  <CardDescription>
                    Configura los textos y opciones del configurador "Iniciar Viaje"
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Precio construcción por m²</Label>
                      <Input
                        value={getConfigValue('construction_price_per_m2')}
                        onChange={(e) => handleChange('construction_price_per_m2', e.target.value)}
                        placeholder="30 UF/m²"
                      />
                      <p className="text-xs text-muted-foreground">
                        Precio promedio de construcción (ej: "30 UF/m²")
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Tiempo de construcción</Label>
                      <Input
                        value={getConfigValue('construction_time')}
                        onChange={(e) => handleChange('construction_time', e.target.value)}
                        placeholder="~6 meses"
                      />
                      <p className="text-xs text-muted-foreground">
                        Tiempo estimado de construcción (ej: "~6 meses")
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Texto promedio de construcción</Label>
                    <Input
                      value={getConfigValue('construction_average_text')}
                      onChange={(e) => handleChange('construction_average_text', e.target.value)}
                      placeholder="Tiempo promedio de construcción: 6 meses"
                    />
                    <p className="text-xs text-muted-foreground">
                      Este texto aparece sobre la carta Gantt en el paso de construcción
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Acceso al configurador</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          El configurador está disponible en /configurador
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/configurador', '_blank')}
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir Configurador
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CONTACT TAB */}
          <TabsContent value="contacto">
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email de Contacto</Label>
                  <Input
                    type="email"
                    value={getConfigValue('contact_email')}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder="contacto@alpina.cl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={getConfigValue('contact_phone')}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <Input
                    value={getConfigValue('contact_address')}
                    onChange={(e) => handleChange('contact_address', e.target.value)}
                    placeholder="Santiago, Chile"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link Calendario (Agendar)</Label>
                  <Input
                    value={getConfigValue('calendar_url')}
                    onChange={(e) => handleChange('calendar_url', e.target.value)}
                    placeholder="https://calendar.app.google/..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SOCIAL TAB */}
          <TabsContent value="redes">
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    value={getConfigValue('whatsapp_number')}
                    onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                    placeholder="+56912345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input
                    value={getConfigValue('instagram_url')}
                    onChange={(e) => handleChange('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/alpina"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input
                    value={getConfigValue('facebook_url')}
                    onChange={(e) => handleChange('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/alpina"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FOOTER TAB */}
          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Footer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Descripción del Footer</Label>
                  <Textarea
                    value={getConfigValue('footer_description')}
                    onChange={(e) => handleChange('footer_description', e.target.value)}
                    placeholder="Diseño y construcción de casas prefabricadas..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Texto de Copyright</Label>
                  <Input
                    value={getConfigValue('footer_text')}
                    onChange={(e) => handleChange('footer_text', e.target.value)}
                    placeholder="© 2024 Alpina. Todos los derechos reservados."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO TAB */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO y Meta Tags</CardTitle>
                <CardDescription>Optimización para motores de búsqueda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título SEO</Label>
                  <Input
                    value={getConfigValue('meta_title')}
                    onChange={(e) => handleChange('meta_title', e.target.value)}
                    placeholder="Alpina | Casas Prefabricadas"
                  />
                  <p className="text-xs text-muted-foreground">
                    {getConfigValue('meta_title')?.length || 0}/60 caracteres
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Meta Descripción</Label>
                  <Textarea
                    value={getConfigValue('meta_description')}
                    onChange={(e) => handleChange('meta_description', e.target.value)}
                    placeholder="Diseño y construcción de casas prefabricadas..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {getConfigValue('meta_description')?.length || 0}/160 caracteres
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROFILE TAB */}
          <TabsContent value="perfil">
            <ProfileSection />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
