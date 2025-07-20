import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string;
  group_id?: string;
  content: string;
  message_type: string;
  media_url?: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    name: string;
    avatar: string;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  return (
    <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-4 overflow-y-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-2xl animate-slide-up overflow-hidden ${
              msg.sender_id === currentUserId
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {msg.sender_id !== currentUserId && msg.sender && (
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={msg.sender.avatar} />
                  <AvatarFallback>{msg.sender.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{msg.sender.name}</span>
              </div>
            )}
            
            <p className="text-sm break-words">{msg.content}</p>
            
            {msg.media_url && (
              <div className="mt-2">
                {msg.message_type === 'image' ? (
                  <img 
                    src={msg.media_url} 
                    alt="Shared media"
                    className="w-full rounded-lg max-w-full h-auto max-h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : msg.message_type === 'video' ? (
                  <video 
                    src={msg.media_url} 
                    className="w-full rounded-lg max-w-full h-auto max-h-48"
                    controls
                    preload="metadata"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
              </div>
            )}
            
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-xs opacity-70">
                {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {msg.sender_id === currentUserId && (
                <span className="text-xs opacity-70">
                  {msg.is_read ? "✓✓" : "✓"}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};