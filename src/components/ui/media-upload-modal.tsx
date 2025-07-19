import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Image, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, type: 'image' | 'video') => void;
}

export const MediaUploadModal = ({ isOpen, onClose, onUpload }: MediaUploadModalProps) => {
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      onUpload(file, type);
      toast({
        title: `${type === 'image' ? 'Image' : 'Vidéo'} uploadée !`,
        description: "Votre média a été partagé avec succès"
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-gold flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Partager un média
          </DialogTitle>
          <DialogDescription>
            Ajoutez une photo ou une vidéo à votre publication
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="cursor-pointer">
              <div className="p-6 border-2 border-dashed border-border rounded-lg text-center hover:border-primary/50 transition-colors">
                <Image className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-sm font-medium">Photo</p>
              </div>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
            
            <label className="cursor-pointer">
              <div className="p-6 border-2 border-dashed border-border rounded-lg text-center hover:border-primary/50 transition-colors">
                <Video className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="text-sm font-medium">Vidéo</p>
              </div>
              <Input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};