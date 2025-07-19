import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Link, Camera, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onAvatarChange: (newAvatar: string) => void;
}

const presetAvatars = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1556506751-69a7d6fb64dd?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=100&h=100&fit=crop",
];

export const AvatarUploadModal = ({ 
  isOpen, 
  onClose, 
  currentAvatar, 
  onAvatarChange 
}: AvatarUploadModalProps) => {
  const [customUrl, setCustomUrl] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const { toast } = useToast();

  const handleSave = () => {
    onAvatarChange(selectedAvatar);
    toast({
      title: "Avatar mis à jour !",
      description: "Votre photo de profil a été modifiée avec succès."
    });
    onClose();
  };

  const handleCustomUrl = () => {
    if (customUrl.trim() && (customUrl.includes('http') || customUrl.includes('data:'))) {
      setSelectedAvatar(customUrl);
      setCustomUrl("");
      toast({
        title: "URL ajoutée",
        description: "L'image personnalisée a été chargée."
      });
    } else {
      toast({
        title: "URL invalide",
        description: "Veuillez entrer une URL d'image valide."
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-gold flex items-center gap-2">
            <User className="w-5 h-5" />
            Modifier votre avatar
          </DialogTitle>
          <DialogDescription>
            Choisissez un nouvel avatar pour personnaliser votre profil
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Aperçu actuel */}
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-3">
              <AvatarImage src={selectedAvatar} alt="Aperçu avatar" />
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">Aperçu de votre nouvel avatar</p>
          </div>

          {/* URL personnalisée */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ajouter une URL d'image</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://exemple.com/image.jpg"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleCustomUrl}
                disabled={!customUrl.trim()}
              >
                <Link className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Avatars prédéfinis */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Choisir un avatar prédéfini</label>
            <div className="grid grid-cols-3 gap-3">
              {presetAvatars.map((avatar, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-auto p-2 ${
                    selectedAvatar === avatar ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                    <AvatarFallback>A{index + 1}</AvatarFallback>
                  </Avatar>
                </Button>
              ))}
            </div>
          </div>

          {/* Upload de fichier */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Télécharger une image</label>
            <Button
              variant="outline"
              className="w-full h-12 border-dashed"
              onClick={() => toast({
                title: "Fonctionnalité à venir",
                description: "L'upload de fichiers sera bientôt disponible."
              })}
            >
              <Upload className="w-5 h-5 mr-2" />
              Télécharger depuis votre appareil
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 btn-golden"
              disabled={!selectedAvatar}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};