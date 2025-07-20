import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Image, Video, BarChart3, X } from "lucide-react";

interface CreatePostFormProps {
  isOpen: boolean;
  onClose: () => void;
  post: string;
  setPost: (value: string) => void;
  onSubmit: () => void;
  onShowMedia: () => void;
  onShowPoll: () => void;
  loading: boolean;
  selectedFile: File | null;
  selectedFileType: 'image' | 'video' | null;
  onRemoveFile: () => void;
  editingPost: any;
}

export const CreatePostForm = ({
  isOpen,
  onClose,
  post,
  setPost,
  onSubmit,
  onShowMedia,
  onShowPoll,
  loading,
  selectedFile,
  selectedFileType,
  onRemoveFile,
  editingPost
}: CreatePostFormProps) => {
  if (!isOpen) return null;

  return (
    <Card className="card-golden overflow-hidden">
      <CardHeader>
        <h3 className="font-semibold text-gradient-gold">
          {editingPost ? "Modifier la publication" : "Créer une publication"}
        </h3>
      </CardHeader>
      <CardContent className="space-y-4 overflow-hidden">
        <Textarea
          placeholder="Quoi de neuf dans le monde du football ?"
          value={post}
          onChange={(e) => setPost(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        
        {/* Aperçu du fichier sélectionné */}
        {selectedFile && (
          <div className="border rounded-lg p-3 bg-muted/50 overflow-hidden">
            <div className="flex items-center gap-3">
              {selectedFileType === 'image' ? (
                <Image className="w-5 h-5 text-blue-500 flex-shrink-0" />
              ) : (
                <Video className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onRemoveFile}
                className="flex-shrink-0 w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Aperçu image/vidéo */}
            {selectedFileType === 'image' && (
              <img 
                src={URL.createObjectURL(selectedFile)} 
                alt="Aperçu"
                className="w-full h-32 object-cover rounded mt-2"
                onError={(e) => {
                  console.error('Preview image failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {selectedFileType === 'video' && (
              <video 
                src={URL.createObjectURL(selectedFile)} 
                className="w-full h-32 object-cover rounded mt-2"
                preload="metadata"
                controls
                onError={(e) => {
                  console.error('Preview video failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex gap-1 flex-wrap min-w-0">
            <Button
              size="sm"
              variant="outline"
              onClick={onShowMedia}
              className="text-xs flex-shrink-0"
            >
              <Image className="w-4 h-4 mr-1" />
              Média
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onShowPoll}
              className="text-xs flex-shrink-0"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Sondage
            </Button>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="text-xs"
            >
              Annuler
            </Button>
            <Button
              size="sm"
              className="btn-golden text-xs"
              onClick={onSubmit}
              disabled={(!post.trim() && !selectedFile) || loading}
            >
              {loading ? "..." : (editingPost ? "Modifier" : "Publier")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};