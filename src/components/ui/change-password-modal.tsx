import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { Input } from "./input";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChange: (current: string, next: string) => Promise<void>;
}

export const ChangePasswordModal = ({ isOpen, onClose, onPasswordChange }: ChangePasswordModalProps) => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!current || !next || !confirm) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (next !== confirm) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (next.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    try {
      await onPasswordChange(current, next);
      setSuccess(true);
      toast({
        title: "Mot de passe changé !",
        description: "Votre mot de passe a été mis à jour avec succès.",
        variant: "success"
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Erreur lors du changement de mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-gold flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Changer le mot de passe
          </DialogTitle>
          <DialogDescription>
            Saisissez votre mot de passe actuel et le nouveau mot de passe.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium">Mot de passe actuel</label>
            <div className="relative mt-1">
              <Input
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={e => setCurrent(e.target.value)}
                className="pr-10"
                autoFocus
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-auto p-1"
                onClick={() => setShowCurrent(v => !v)}
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Nouveau mot de passe</label>
            <div className="relative mt-1">
              <Input
                type={showNext ? "text" : "password"}
                value={next}
                onChange={e => setNext(e.target.value)}
                className="pr-10"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-auto p-1"
                onClick={() => setShowNext(v => !v)}
                tabIndex={-1}
              >
                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
            <div className="relative mt-1">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="pr-10"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-auto p-1"
                onClick={() => setShowConfirm(v => !v)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
              <XCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-green-500 text-sm mt-2">
              <CheckCircle2 className="w-4 h-4" />
              Mot de passe changé avec succès !
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1 btn-golden" disabled={loading}>
              {loading ? "Changement..." : "Changer le mot de passe"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 