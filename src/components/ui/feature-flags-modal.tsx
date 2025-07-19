import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Switch } from "./switch";
import { Label } from "./label";
import { Crown, Settings } from "lucide-react";

interface FeatureFlagsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FeatureFlagsModal = ({ open, onOpenChange }: FeatureFlagsModalProps) => {
  const { flags, updateFlag, isAdmin, setIsAdmin } = useFeatureFlags();

  const flagLabels = {
    showChat: "Chat & Messages",
    showLegends: "Page Légendes",
    showClub: "Page Club",
    showRanking: "Classements",
    showMyTop: "Page MyTop (Swipe)",
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full mx-auto bg-background rounded-2xl shadow-xl p-4 md:p-8 overflow-y-auto max-h-[90vh] flex flex-col pb-24">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Feature Flags Admin
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <Label>Mode Admin</Label>
            </div>
            <Switch 
              checked={isAdmin} 
              onCheckedChange={setIsAdmin}
            />
          </div>

          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Fonctionnalités de l'application</h3>
            <div className="grid gap-3">
              {Object.entries(flags).map(([key, value]) => (
                flagLabels[key as keyof typeof flagLabels] && (
                  <div key={key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <Label htmlFor={key} className="cursor-pointer">
                      {flagLabels[key as keyof typeof flagLabels]}
                    </Label>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => updateFlag(key as keyof typeof flags, checked)}
                    />
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};