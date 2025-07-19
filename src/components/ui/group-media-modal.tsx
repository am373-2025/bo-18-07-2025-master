import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Video, FileText, Download, Share2 } from "lucide-react";

interface GroupMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
}

// Données factices des médias
const mediaData = {
  images: [
    {
      id: "1",
      type: "image",
      url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=200&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&h=100&fit=crop",
      name: "but_mbappe.jpg",
      sender: "Alex Martin",
      date: "Il y a 2 jours",
      size: "2.3 MB"
    },
    {
      id: "2",
      type: "image", 
      url: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=300&h=200&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=150&h=100&fit=crop",
      name: "celebration_real.jpg",
      sender: "Sophie Durand",
      date: "Il y a 3 jours",
      size: "1.8 MB"
    },
    {
      id: "3",
      type: "image",
      url: "https://images.unsplash.com/photo-1551038442-8e68eae1c3b9?w=300&h=200&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1551038442-8e68eae1c3b9?w=150&h=100&fit=crop",
      name: "equipe_france.jpg", 
      sender: "Marco Silva",
      date: "Il y a 1 semaine",
      size: "3.1 MB"
    }
  ],
  videos: [
    {
      id: "4",
      type: "video",
      thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&h=100&fit=crop",
      name: "resume_match.mp4",
      sender: "Emma Garcia",
      date: "Il y a 1 jour",
      size: "15.2 MB",
      duration: "2:34"
    },
    {
      id: "5", 
      type: "video",
      thumbnail: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=150&h=100&fit=crop",
      name: "interview_haaland.mp4",
      sender: "Lucas Moreau", 
      date: "Il y a 4 jours",
      size: "8.7 MB",
      duration: "1:12"
    }
  ],
  documents: [
    {
      id: "6",
      type: "document",
      name: "stats_ballon_or_2024.pdf",
      sender: "Sophie Durand",
      date: "Il y a 1 semaine",
      size: "892 KB"
    },
    {
      id: "7",
      type: "document",
      name: "calendrier_matchs.xlsx",
      sender: "Alex Martin",
      date: "Il y a 2 semaines", 
      size: "156 KB"
    }
  ]
};

export const GroupMediaModal = ({ isOpen, onClose, groupName }: GroupMediaModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-gold flex items-center gap-2">
            <Image className="w-5 h-5" />
            Médias partagés
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Contenus partagés dans {groupName}
          </p>
        </DialogHeader>

        <Tabs defaultValue="images" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Vidéos
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Docs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {mediaData.images.map((image) => (
                <div key={image.id} className="space-y-2">
                  <div className="relative group">
                    <img
                      src={image.thumbnail}
                      alt={image.name}
                      className="w-full h-24 object-cover rounded-lg border border-border/50"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" className="p-2">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary" className="p-2">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium truncate">{image.name}</p>
                    <p className="text-xs text-muted-foreground">{image.sender}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{image.date}</p>
                      <Badge variant="outline" className="text-xs">{image.size}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-3">
            {mediaData.videos.map((video) => (
              <div key={video.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.name}
                    className="w-16 h-12 object-cover rounded border border-border/50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                  <Badge className="absolute -top-1 -right-1 text-xs px-1">
                    {video.duration}
                  </Badge>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{video.name}</h4>
                  <p className="text-xs text-muted-foreground">{video.sender}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{video.date}</p>
                    <Badge variant="outline" className="text-xs">{video.size}</Badge>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="p-2">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="p-2">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="documents" className="space-y-3">
            {mediaData.documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="w-12 h-12 rounded border border-border/50 flex items-center justify-center bg-muted">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                  <p className="text-xs text-muted-foreground">{doc.sender}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{doc.date}</p>
                    <Badge variant="outline" className="text-xs">{doc.size}</Badge>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="p-2">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="p-2">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};