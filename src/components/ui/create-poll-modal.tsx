import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (pollData: {
    question: string;
    options: string[];
  }) => void;
}

export const CreatePollModal = ({ isOpen, onClose, onCreatePoll }: CreatePollModalProps) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const { toast } = useToast();

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const resetForm = () => {
    setQuestion("");
    setOptions(["", ""]);
  };

  const handleCreate = () => {
    const validOptions = options.filter(option => option.trim() !== "");
    
    if (!question.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une question"
      });
      return;
    }

    if (validOptions.length < 2) {
      toast({
        title: "Erreur", 
        description: "Veuillez saisir au moins 2 options"
      });
      return;
    }

    onCreatePoll({
      question: question.trim(),
      options: validOptions
    });

    resetForm();
    onClose();
    
    toast({
      title: "Sondage créé !",
      description: "Votre sondage a été publié avec succès."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-gold">Créer un sondage</DialogTitle>
          <DialogDescription>
            Créez un sondage pour recueillir les opinions de la communauté
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="question">Question du sondage</Label>
            <Input
              id="question"
              placeholder="Posez votre question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Options de réponse</Label>
            <div className="space-y-2 mt-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                  />
                  {options.length > 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {options.length < 6 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-2 w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une option
              </Button>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleCreate} className="flex-1 btn-golden">
              Créer le sondage
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};