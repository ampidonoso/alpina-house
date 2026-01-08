import { useState, useCallback } from 'react';
import { ProjectImage } from '@/hooks/useProjects';
import { ProjectFinish, ProjectTerrain } from '@/hooks/useProjectCustomizations';
import { 
  useUploadProjectImage, 
  useDeleteProjectImage, 
  useReorderProjectImages,
  useSetCoverImage
} from '@/hooks/useAdminProjects';
import {
  useReorderFinishes,
  useReorderTerrains,
  useUpdateFinishPriceModifier,
  useUpdateTerrainPriceModifier
} from '@/hooks/useGalleryManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  Trash2, 
  Loader2, 
  Image, 
  LayoutGrid, 
  FileText,
  GripVertical,
  Video,
  Play,
  Palette,
  TreePine,
  DollarSign,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface GalleryManagerProps {
  projectId: string;
  images: ProjectImage[];
  finishes: ProjectFinish[];
  terrains: ProjectTerrain[];
}

type ImageType = 'cover' | 'gallery' | 'floor_plan';
type MediaType = 'image' | 'video';

type ImageTypeOption = {
  value: ImageType;
  label: string;
  icon: React.ElementType;
  color: string;
};

const IMAGE_TYPES: ImageTypeOption[] = [
  { value: 'cover', label: 'Portada', icon: Image, color: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
  { value: 'gallery', label: 'Galería', icon: LayoutGrid, color: 'bg-blue-500/20 text-blue-600 border-blue-500/30' },
  { value: 'floor_plan', label: 'Plano', icon: FileText, color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' },
];

interface PendingMedia {
  id: string;
  file: File;
  preview: string;
  type: ImageType;
  mediaType: MediaType;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

const GalleryManager = ({ projectId, images, finishes, terrains }: GalleryManagerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [dragOverImageId, setDragOverImageId] = useState<string | null>(null);
  
  const uploadImage = useUploadProjectImage();
  const deleteImage = useDeleteProjectImage();
  const reorderImages = useReorderProjectImages();
  const setCoverImage = useSetCoverImage();
  const reorderFinishes = useReorderFinishes();
  const reorderTerrains = useReorderTerrains();
  const updateFinishPrice = useUpdateFinishPriceModifier();
  const updateTerrainPrice = useUpdateTerrainPriceModifier();
  
  // Local state for price editing
  const [editingFinishPrice, setEditingFinishPrice] = useState<string | null>(null);
  const [editingTerrainPrice, setEditingTerrainPrice] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const isVideoFile = (file: File) => file.type.startsWith('video/');
  const isImageFile = (file: File) => file.type === 'image/jpeg' || file.type === 'image/png';
  const isValidFile = (file: File) => isImageFile(file) || isVideoFile(file);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(isValidFile);
    
    if (files.length === 0) {
      toast.error('Solo se permiten archivos JPG, PNG o videos MP4/WebM');
      return;
    }

    const newPending: PendingMedia[] = files.map(file => ({
      id: `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
      type: 'gallery' as ImageType,
      mediaType: isVideoFile(file) ? 'video' : 'image' as MediaType,
      uploading: false,
      uploaded: false,
    }));

    setPendingMedia(prev => [...prev, ...newPending]);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(isValidFile);
    
    if (files.length === 0) return;

    const newPending: PendingMedia[] = files.map(file => ({
      id: `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
      type: 'gallery' as ImageType,
      mediaType: isVideoFile(file) ? 'video' : 'image' as MediaType,
      uploading: false,
      uploaded: false,
    }));

    setPendingMedia(prev => [...prev, ...newPending]);
    e.target.value = '';
  }, []);

  const uploadSingleMedia = useCallback(async (pending: PendingMedia) => {
    setPendingMedia(prev => prev.map(item => 
      item.id === pending.id ? { ...item, uploading: true } : item
    ));

    try {
      const existingOfType = images.filter(img => img.image_type === pending.type);
      await uploadImage.mutateAsync({
        projectId,
        file: pending.file,
        imageType: pending.type,
        mediaType: pending.mediaType,
        displayOrder: existingOfType.length,
      });

      setPendingMedia(prev => prev.map(item => 
        item.id === pending.id ? { ...item, uploading: false, uploaded: true } : item
      ));

      setTimeout(() => {
        setPendingMedia(prev => {
          const item = prev.find(i => i.id === pending.id);
          if (item) URL.revokeObjectURL(item.preview);
          return prev.filter(i => i.id !== pending.id);
        });
      }, 1000);
    } catch (error: any) {
      const errorMessage = error?.message?.includes('row-level security') 
        ? 'Error de permisos: configura las políticas RLS del bucket'
        : 'Error al subir archivo';
      
      setPendingMedia(prev => prev.map(item => 
        item.id === pending.id ? { ...item, uploading: false, error: errorMessage } : item
      ));
      
      toast.error(errorMessage);
    }
  }, [projectId, images, uploadImage]);

  const uploadAll = useCallback(async () => {
    const toUpload = pendingMedia.filter(item => !item.uploaded && !item.uploading);
    for (const pending of toUpload) {
      await uploadSingleMedia(pending);
    }
    toast.success(`${toUpload.length} archivos subidos`);
  }, [pendingMedia, uploadSingleMedia]);

  const handleDeleteExisting = async (image: ProjectImage) => {
    try {
      await deleteImage.mutateAsync({ 
        imageId: image.id, 
        storagePath: image.storage_path, 
        projectId 
      });
      toast.success('Imagen eliminada');
    } catch (error) {
      toast.error('Error al eliminar imagen');
    }
  };

  const handleSetAsCover = async (image: ProjectImage) => {
    try {
      await setCoverImage.mutateAsync({ imageId: image.id, projectId });
      toast.success('Imagen establecida como portada');
    } catch (error) {
      toast.error('Error al establecer portada');
    }
  };

  const handleStartEditFinishPrice = (finish: ProjectFinish) => {
    setEditingFinishPrice(finish.id);
    setTempPrice((finish.price_modifier ?? 0).toString());
  };

  const handleSaveFinishPrice = async (finish: ProjectFinish) => {
    const newPrice = parseFloat(tempPrice) || 0;
    if (newPrice !== (finish.price_modifier ?? 0)) {
      try {
        await updateFinishPrice.mutateAsync({
          finishId: finish.id,
          priceModifier: newPrice,
          projectId
        });
        toast.success('Precio actualizado');
      } catch (error) {
        toast.error('Error al actualizar precio');
      }
    }
    setEditingFinishPrice(null);
    setTempPrice('');
  };

  const handleStartEditTerrainPrice = (terrain: ProjectTerrain) => {
    setEditingTerrainPrice(terrain.id);
    setTempPrice((terrain.price_modifier ?? 0).toString());
  };

  const handleSaveTerrainPrice = async (terrain: ProjectTerrain) => {
    const newPrice = parseFloat(tempPrice) || 0;
    if (newPrice !== (terrain.price_modifier ?? 0)) {
      try {
        await updateTerrainPrice.mutateAsync({
          terrainId: terrain.id,
          priceModifier: newPrice,
          projectId
        });
        toast.success('Precio actualizado');
      } catch (error) {
        toast.error('Error al actualizar precio');
      }
    }
    setEditingTerrainPrice(null);
    setTempPrice('');
  };

  // Drag and drop handlers for reordering existing images
  const handleDragStartExisting = (e: React.DragEvent, imageId: string) => {
    setDraggedImageId(imageId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', imageId);
  };

  const handleDragOverExisting = (e: React.DragEvent, imageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedImageId && imageId !== draggedImageId) {
      setDragOverImageId(imageId);
    }
  };

  const handleDragLeaveExisting = () => {
    setDragOverImageId(null);
  };

  const handleDropExisting = async (e: React.DragEvent, targetImageId: string, imageList: ProjectImage[]) => {
    e.preventDefault();
    setDragOverImageId(null);
    
    if (!draggedImageId || draggedImageId === targetImageId) {
      setDraggedImageId(null);
      return;
    }

    const draggedIndex = imageList.findIndex(img => img.id === draggedImageId);
    const targetIndex = imageList.findIndex(img => img.id === targetImageId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedImageId(null);
      return;
    }

    const newList = [...imageList];
    const [draggedItem] = newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, draggedItem);

    try {
      await reorderImages.mutateAsync({
        projectId,
        imageIds: newList.map(img => img.id),
      });
      toast.success('Orden actualizado');
    } catch (error) {
      toast.error('Error al reordenar');
    }
    
    setDraggedImageId(null);
  };

  const handleDragEndExisting = () => {
    setDraggedImageId(null);
    setDragOverImageId(null);
  };

  // Group existing images by type (sorted by display_order)
  const coverImage = images.find(img => img.image_type === 'cover' || img.is_cover);
  const galleryImages = images
    .filter(img => img.image_type === 'gallery' && !img.is_cover)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const floorPlanImages = images
    .filter(img => img.image_type === 'floor_plan')
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  const pendingCount = pendingMedia.filter(item => !item.uploaded && !item.uploading).length;

  const renderImageCard = (image: ProjectImage, imageList: ProjectImage[]) => {
    return (
      <div 
        key={image.id}
        draggable
        onDragStart={(e) => handleDragStartExisting(e, image.id)}
        onDragOver={(e) => handleDragOverExisting(e, image.id)}
        onDragLeave={handleDragLeaveExisting}
        onDrop={(e) => handleDropExisting(e, image.id, imageList)}
        onDragEnd={handleDragEndExisting}
        className={cn(
          "relative group aspect-video rounded-lg overflow-hidden border transition-all cursor-grab",
          draggedImageId === image.id && "opacity-50 scale-95",
          dragOverImageId === image.id && "ring-2 ring-primary",
          "border-border hover:border-primary/50"
        )}
      >
        {image.media_type === 'video' ? (
          <div className="w-full h-full bg-muted relative">
            <video src={image.storage_path} className="w-full h-full object-cover" muted />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
        ) : (
          <img src={image.storage_path} alt="" className="w-full h-full object-cover" />
        )}
        
        {/* Cover indicator */}
        {image.is_cover && (
          <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1 z-10">
            <Star size={12} /> Portada
          </div>
        )}
        
        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <GripVertical className="absolute top-2 left-2 text-white/50" size={16} />
          
          {/* Set as cover button - only for images, not videos, and not already cover */}
          {image.media_type !== 'video' && !image.is_cover && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-amber-400 hover:bg-amber-500/20"
              onClick={() => handleSetAsCover(image)}
              title="Establecer como portada"
            >
              <Star size={16} />
            </Button>
          )}
          
          {/* Delete button */}
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-destructive hover:bg-destructive/20"
            onClick={() => handleDeleteExisting(image)}
            disabled={deleteImage.isPending}
          >
            {deleteImage.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="images" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image size={16} />
            Imágenes ({images.length})
          </TabsTrigger>
          <TabsTrigger value="finishes" className="flex items-center gap-2">
            <Palette size={16} />
            Terminaciones ({finishes.length})
          </TabsTrigger>
          <TabsTrigger value="terrains" className="flex items-center gap-2">
            <TreePine size={16} />
            Terrenos ({terrains.length})
          </TabsTrigger>
        </TabsList>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4 mt-4">
          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
          >
            <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              Arrastra imágenes o videos aquí
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              JPG, PNG, MP4, WebM (máx. 50MB)
            </p>
            <label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,video/mp4,video/webm"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <span>Seleccionar archivos</span>
              </Button>
            </label>
          </div>

          {/* Pending uploads */}
          <AnimatePresence>
            {pendingMedia.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {pendingCount} archivo(s) pendiente(s)
                  </span>
                  {pendingCount > 0 && (
                    <Button size="sm" onClick={uploadAll}>
                      Subir todo
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {pendingMedia.map(pending => (
                    <div 
                      key={pending.id}
                      className={cn(
                        "relative aspect-video rounded-lg overflow-hidden border",
                        pending.uploaded && "ring-2 ring-green-500",
                        pending.error && "ring-2 ring-destructive"
                      )}
                    >
                      {pending.mediaType === 'video' ? (
                        <div className="w-full h-full bg-muted relative">
                          <video src={pending.preview} className="w-full h-full object-cover" muted />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <img src={pending.preview} alt="" className="w-full h-full object-cover" />
                      )}
                      
                      {pending.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="animate-spin text-white" />
                        </div>
                      )}
                      
                      {pending.uploaded && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            ✓
                          </div>
                        </div>
                      )}
                      
                      {!pending.uploading && !pending.uploaded && (
                        <div className="absolute bottom-2 right-2">
                          <Button size="sm" onClick={() => uploadSingleMedia(pending)}>
                            <Upload size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Existing images by type */}
          {coverImage && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Star size={14} className="text-amber-500" /> Portada
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {renderImageCard(coverImage, [coverImage])}
              </div>
            </div>
          )}

          {galleryImages.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <LayoutGrid size={14} className="text-blue-500" /> Galería ({galleryImages.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {galleryImages.map(img => renderImageCard(img, galleryImages))}
              </div>
            </div>
          )}

          {floorPlanImages.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText size={14} className="text-emerald-500" /> Planos ({floorPlanImages.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {floorPlanImages.map(img => renderImageCard(img, floorPlanImages))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Finishes Tab */}
        <TabsContent value="finishes" className="space-y-4 mt-4">
          {finishes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hay terminaciones configuradas</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {finishes.map(finish => (
                <div 
                  key={finish.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  {finish.storage_path ? (
                    <img 
                      src={finish.storage_path} 
                      alt={finish.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      <Palette className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{finish.name}</h4>
                    {finish.description && (
                      <p className="text-sm text-muted-foreground">{finish.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {editingFinishPrice === finish.id ? (
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-muted-foreground" />
                        <Input
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          className="w-24"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveFinishPrice(finish);
                            if (e.key === 'Escape') setEditingFinishPrice(null);
                          }}
                        />
                        <Button size="sm" onClick={() => handleSaveFinishPrice(finish)}>
                          Guardar
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleStartEditFinishPrice(finish)}
                      >
                        <DollarSign size={14} className="mr-1" />
                        +${(finish.price_modifier ?? 0).toLocaleString()}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Terrains Tab */}
        <TabsContent value="terrains" className="space-y-4 mt-4">
          {terrains.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TreePine className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hay terrenos configurados</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {terrains.map(terrain => (
                <div 
                  key={terrain.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  {terrain.storage_path ? (
                    <img 
                      src={terrain.storage_path} 
                      alt={terrain.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      <TreePine className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{terrain.name}</h4>
                    {terrain.description && (
                      <p className="text-sm text-muted-foreground">{terrain.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {editingTerrainPrice === terrain.id ? (
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-muted-foreground" />
                        <Input
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          className="w-24"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTerrainPrice(terrain);
                            if (e.key === 'Escape') setEditingTerrainPrice(null);
                          }}
                        />
                        <Button size="sm" onClick={() => handleSaveTerrainPrice(terrain)}>
                          Guardar
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleStartEditTerrainPrice(terrain)}
                      >
                        <DollarSign size={14} className="mr-1" />
                        +${(terrain.price_modifier ?? 0).toLocaleString()}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GalleryManager;
