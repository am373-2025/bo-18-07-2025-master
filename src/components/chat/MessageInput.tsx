import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Send, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  message: string;
  setMessage: (value: string) => void;
  onSendMessage: () => void;
  onShowMedia: () => void;
}

export const MessageInput = ({
  message,
  setMessage,
  onSendMessage,
  onShowMedia
}: MessageInputProps) => {
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage();
    }
  };

  const handleAddEmoji = () => {
    const emojis = ["😊", "👍", "❤️", "⚽", "🏆", "🔥", "💪", "😍"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setMessage(message + randomEmoji);
    toast({
      title: `${randomEmoji} Emoji ajouté !`,
      description: "Emoji inséré dans votre message"
    });
  };

  return (
    <div className="bg-card/95 backdrop-blur-md border-t border-border/50 p-4 max-w-md mx-auto w-full">
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onShowMedia}
          className="flex-shrink-0"
        >
          <Camera className="w-5 h-5" />
        </Button>
        
        <div className="flex-1 relative">
          <Input
            placeholder="Tapez votre message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="pr-10"
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0"
            onClick={handleAddEmoji}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          size="sm"
          className="btn-golden flex-shrink-0"
          onClick={handleSendMessage}
          disabled={!message.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};