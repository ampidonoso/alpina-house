import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, VolumeX, Paintbrush, TreePine } from "lucide-react";
import LazyImage from "@/components/ui/LazyImage";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  url: string;
  type: 'image' | 'video';
}

interface LinkedImageInfo {
  finishName?: string;
  terrainName?: string;
}

interface GallerySectionProps {
  images?: string[];
  items?: GalleryItem[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect?: (index: number) => void;
  projectName: string;
  aspectRatio?: string;
  compact?: boolean;
  // New props for linked images
  linkedImages?: Map<string, LinkedImageInfo>;
  selectedFinishName?: string;
  selectedTerrainName?: string;
}

const GallerySection = ({ 
  images,
  items,
  currentIndex, 
  onPrev, 
  onNext, 
  onSelect,
  projectName,
  aspectRatio = "aspect-[16/10]",
  compact = false,
  linkedImages,
  selectedFinishName,
  selectedTerrainName
}: GallerySectionProps) => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Convert legacy images array to items format
  const galleryItems: GalleryItem[] = items || (images?.map(url => ({ url, type: 'image' as const })) || []);
  
  const currentItem = galleryItems[currentIndex];
  const currentLinkedInfo = linkedImages?.get(currentItem?.url);

  const handleThumbnailClick = (index: number) => {
    if (onSelect) {
      onSelect(index);
    } else {
      const diff = index - currentIndex;
      if (diff > 0) {
        for (let j = 0; j < diff; j++) onNext();
      } else {
        for (let j = 0; j < Math.abs(diff); j++) onPrev();
      }
    }
  };

  const handleVideoClick = (url: string) => {
    setSelectedVideoUrl(url);
    setVideoModalOpen(true);
  };

  const isVideo = (item: GalleryItem) => item.type === 'video';

  // Check if an image is linked to the currently selected finish/terrain
  const isHighlighted = (url: string) => {
    const info = linkedImages?.get(url);
    if (!info) return false;
    return (selectedFinishName && info.finishName === selectedFinishName) ||
           (selectedTerrainName && info.terrainName === selectedTerrainName);
  };

  return (
    <>
      <div className="relative">
        {/* Main Content */}
        <div className={`relative ${aspectRatio} overflow-hidden rounded-lg`}>
          {currentItem?.type === 'video' ? (
            <div 
              className="relative w-full h-full cursor-pointer group"
              onClick={() => handleVideoClick(currentItem.url)}
            >
              <video
                src={currentItem.url}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
              {/* Play overlay for video */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-8 h-8 text-stone-900 ml-1" />
                </div>
              </div>
              {/* Video indicator */}
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-white text-xs flex items-center gap-1">
                <VolumeX size={14} />
                Click para sonido
              </div>
            </div>
          ) : (
            <LazyImage
              src={currentItem?.url || ''}
              alt={projectName}
              aspectRatio={aspectRatio}
            />
          )}
          
          {/* Linked image indicator on main image */}
          {currentLinkedInfo && (currentLinkedInfo.finishName || currentLinkedInfo.terrainName) && (
            <div className="absolute top-3 left-3 flex gap-2 z-10">
              {currentLinkedInfo.finishName && (
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur transition-all",
                  selectedFinishName === currentLinkedInfo.finishName 
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" 
                    : "bg-amber-500/80 text-white"
                )}>
                  <Paintbrush size={12} />
                  {currentLinkedInfo.finishName}
                </div>
              )}
              {currentLinkedInfo.terrainName && (
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur transition-all",
                  selectedTerrainName === currentLinkedInfo.terrainName 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                    : "bg-emerald-500/80 text-white"
                )}>
                  <TreePine size={12} />
                  {currentLinkedInfo.terrainName}
                </div>
              )}
            </div>
          )}
          
          {/* Navigation arrows */}
          {galleryItems.length > 1 && (
            <>
              <button 
                onClick={onPrev} 
                className={`absolute left-2 top-1/2 -translate-y-1/2 ${compact ? 'p-2' : 'p-3'} bg-stone-950/50 backdrop-blur text-white rounded-full hover:bg-stone-950/70 transition-colors z-10`}
              >
                <ChevronLeft size={compact ? 18 : 24} />
              </button>
              <button 
                onClick={onNext} 
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${compact ? 'p-2' : 'p-3'} bg-stone-950/50 backdrop-blur text-white rounded-full hover:bg-stone-950/70 transition-colors z-10`}
              >
                <ChevronRight size={compact ? 18 : 24} />
              </button>
            </>
          )}
          
          {/* Counter */}
          <div className={`absolute bottom-3 left-3 text-white ${compact ? 'text-xs' : 'text-sm'} bg-stone-950/50 backdrop-blur px-2 py-1 rounded z-10`}>
            {currentIndex + 1} / {galleryItems.length}
          </div>
        </div>
        
        {/* Thumbnails */}
        {galleryItems.length > 1 && (
          <div className={`flex gap-2 ${compact ? 'mt-3' : 'mt-4'} overflow-x-auto pb-2`}>
            {galleryItems.map((item, i) => {
              const itemLinkedInfo = linkedImages?.get(item.url);
              const hasLink = itemLinkedInfo?.finishName || itemLinkedInfo?.terrainName;
              const highlighted = isHighlighted(item.url);
              
              return (
                <button 
                  key={i}
                  onClick={() => handleThumbnailClick(i)}
                  className={cn(
                    `flex-shrink-0 ${compact ? 'w-16 h-12' : 'w-20 h-14'} rounded overflow-hidden border-2 transition-all relative`,
                    i === currentIndex ? 'border-primary' : 'border-transparent',
                    highlighted ? 'opacity-100 ring-2 ring-offset-1 ring-offset-stone-900' : '',
                    highlighted && itemLinkedInfo?.finishName ? 'ring-amber-500' : '',
                    highlighted && itemLinkedInfo?.terrainName ? 'ring-emerald-500' : '',
                    !highlighted && i !== currentIndex ? 'opacity-60 hover:opacity-100' : ''
                  )}
                >
                  {isVideo(item) ? (
                    <>
                      <video 
                        src={item.url} 
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play size={12} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  )}
                  
                  {/* Thumbnail link indicator dots */}
                  {hasLink && (
                    <div className="absolute bottom-0.5 right-0.5 flex gap-0.5">
                      {itemLinkedInfo?.finishName && (
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          highlighted && selectedFinishName === itemLinkedInfo.finishName 
                            ? "bg-amber-400 animate-pulse" 
                            : "bg-amber-500/80"
                        )} />
                      )}
                      {itemLinkedInfo?.terrainName && (
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          highlighted && selectedTerrainName === itemLinkedInfo.terrainName 
                            ? "bg-emerald-400 animate-pulse" 
                            : "bg-emerald-500/80"
                        )} />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none overflow-hidden">
          <div className="relative aspect-video">
            <video
              ref={videoRef}
              src={selectedVideoUrl || ''}
              className="w-full h-full object-contain"
              autoPlay
              controls
              playsInline
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GallerySection;