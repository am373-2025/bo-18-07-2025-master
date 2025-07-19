import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Facebook, Twitter, MessageCircle, Mail, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    title: string;
    description: string;
    url: string;
  };
}

export const ShareModal = ({ isOpen, onClose, content }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(content.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Lien copié !",
        description: "Le lien a été copié dans votre presse-papiers."
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien."
      });
    }
  };

  const handleShare = (platform: string) => {
    const encodedTitle = encodeURIComponent(content.title);
    const encodedUrl = encodeURIComponent(content.url);
    const encodedDescription = encodeURIComponent(content.description);

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      toast({
        title: "Partage en cours",
        description: `Partage sur ${platform} ouvert dans un nouvel onglet.`
      });
    }
  };

  const shareOptions = [
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100"
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: Twitter,
      color: "text-sky-500",
      bgColor: "bg-sky-50 hover:bg-sky-100"
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: MessageCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100"
    },
    {
      id: "email",
      name: "Email",
      icon: Mail,
      color: "text-gray-600",
      bgColor: "bg-gray-50 hover:bg-gray-100"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-gold flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Partager
          </DialogTitle>
          <DialogDescription>
            Partagez ce contenu avec vos amis et votre communauté
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Aperçu du contenu */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-1">{content.title}</h3>
            <p className="text-xs text-muted-foreground">{content.description}</p>
          </div>

          {/* Options de partage */}
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  className={`h-auto p-3 flex flex-col gap-2 ${option.bgColor} border-border/50`}
                  onClick={() => handleShare(option.id)}
                >
                  <Icon className={`w-6 h-6 ${option.color}`} />
                  <span className="text-xs font-medium">{option.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Copier le lien */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ou copiez le lien</label>
            <div className="flex gap-2">
              <Input
                value={content.url}
                readOnly
                className="text-xs"
              />
              <Button
                size="sm"
                className={`btn-golden ${copied ? 'bg-green-500 hover:bg-green-600' : ''}`}
                onClick={handleCopyLink}
              >
                {copied ? '✓' : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};