import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Heart, MessageCircle, Trophy, Users, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "like" | "comment" | "vote" | "trophy" | "follow";
  user?: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  action?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "like",
    user: {
      name: "Sophie Martin",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop"
    },
    content: "a aimé votre publication sur Mbappé",
    timestamp: "il y a 5 min",
    isRead: false
  },
  {
    id: "2",
    type: "comment",
    user: {
      name: "Alex Dubois",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
    },
    content: "a commenté votre post : 'Totalement d'accord !'",
    timestamp: "il y a 15 min",
    isRead: false
  },
  {
    id: "3",
    type: "trophy",
    content: "Félicitations ! Vous avez atteint 100 votes",
    timestamp: "il y a 1h",
    isRead: true
  },
  {
    id: "4",
    type: "follow",
    user: {
      name: "Marco Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    content: "a commencé à vous suivre",
    timestamp: "il y a 2h",
    isRead: true
  },
  {
    id: "5",
    type: "vote",
    content: "Votre vote pour Haaland a été comptabilisé",
    timestamp: "il y a 3h",
    isRead: true
  }
];

export const NotificationCenter = ({ isOpen, onClose }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "vote":
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case "trophy":
        return <Trophy className="w-5 h-5 text-primary" />;
      case "follow":
        return <Users className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    toast({
      title: "Notifications marquées comme lues",
      description: "Toutes vos notifications ont été marquées comme lues."
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast({
      title: "Notification supprimée",
      description: "La notification a été supprimée."
    });
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "social") return ["like", "comment", "follow"].includes(n.type);
    return true;
  });

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div 
      className={`flex gap-3 p-3 rounded-lg border transition-all hover:bg-muted/50 ${
        !notification.isRead ? 'bg-primary/5 border-primary/20' : 'border-border/50'
      }`}
    >
      <div className="flex-shrink-0">
        {notification.user ? (
          <Avatar className="w-10 h-10">
            <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
            <AvatarFallback>{notification.user.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {getIcon(notification.type)}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm">
              {notification.user && (
                <span className="font-semibold">{notification.user.name} </span>
              )}
              {notification.content}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {notification.timestamp}
            </p>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {!notification.isRead && (
              <Button
                size="sm"
                variant="ghost"
                className="w-6 h-6 p-0"
                onClick={() => markAsRead(notification.id)}
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => deleteNotification(notification.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {!notification.isRead && (
        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-gradient-gold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {unreadCount}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Restez informé des dernières actualités et interactions
          </DialogDescription>
          <div className="flex justify-end">
            {unreadCount > 0 && (
              <Button size="sm" variant="ghost" onClick={markAllAsRead}>
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="all" className="text-xs">
              Toutes ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Non lues ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="social" className="text-xs">
              Sociales
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-2 pr-2">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune notification</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};