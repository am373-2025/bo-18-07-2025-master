import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import React from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, register, loading: authLoading } = useAuth();
  const [emailValid, setEmailValid] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [loginEmailValid, setLoginEmailValid] = useState(true);
  const [loginPasswordStrength, setLoginPasswordStrength] = useState(0);

  function isValidEmail(email: string) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }
  function getPasswordStrength(password: string) {
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }
    if (!isValidEmail(email)) {
      toast({
        title: "Erreur",
        description: "L'adresse email n'est pas valide.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await login(email, password);
      
      if (error) {
        throw new Error(error.message);
      }
      
      navigate("/");
      onClose();
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans l'application !",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur est survenue lors de la connexion.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleSignup = async (email: string, password: string, confirmPassword: string) => {
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
      return;
    }
    if (!isValidEmail(email)) {
      toast({
        title: "Erreur",
        description: "L'adresse email n'est pas valide.",
        variant: "destructive"
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive"
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    
    try {
      const { data, error } = await register(email, password, signupForm.name);
      
      if (error) {
        throw new Error(error.message);
      }
      
      navigate("/");
      onClose();
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès !",
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue lors de l'inscription.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-gold flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Connexion
          </DialogTitle>
          <DialogDescription>
            Connectez-vous pour voter et participer à la communauté
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Connexion
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Inscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <form onSubmit={e => { e.preventDefault(); handleLogin(loginForm.email, loginForm.password); }}>
                    <Input
                      type="email"
                      id="login-email"
                      placeholder="Votre email"
                      value={loginForm.email}
                      onChange={e => {
                        setLoginForm({ ...loginForm, email: e.target.value });
                        setLoginEmailValid(isValidEmail(e.target.value));
                      }}
                      className={`pl-10 pr-10 ${!loginEmailValid && loginForm.email ? 'border-red-500' : ''}`}
                    />
                    {loginForm.email && !loginEmailValid && (
                      <div className="text-xs mt-1 text-red-500">Adresse email invalide.</div>
                    )}
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="login-password"
                      placeholder="Votre mot de passe"
                      value={loginForm.password}
                      onChange={e => {
                        setLoginForm({ ...loginForm, password: e.target.value });
                        setLoginPasswordStrength(getPasswordStrength(e.target.value));
                      }}
                      className={`pl-10 pr-10 ${loginPasswordStrength < 2 && loginForm.password ? 'border-red-500' : loginPasswordStrength < 3 && loginForm.password ? 'border-yellow-500' : loginPasswordStrength >= 3 && loginForm.password ? 'border-green-500' : ''}`}
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowPassword(v => !v)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <div className="text-xs mt-1" style={{ color: loginPasswordStrength < 2 ? '#dc2626' : loginPasswordStrength < 3 ? '#eab308' : '#16a34a' }}>
                      {loginForm.password && (
                        loginPasswordStrength < 2
                          ? "Mot de passe faible"
                          : loginPasswordStrength < 3
                          ? "Mot de passe moyen"
                          : "Mot de passe fort !"
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full btn-golden mt-4"
                      disabled={
                        !loginForm.email ||
                        !isValidEmail(loginForm.email) ||
                        loginForm.password.length < 6
                      }
                    >
                      Se connecter
                    </Button>
                  </form>
                </div>
                <Button variant="link" className="w-full text-sm">
                  Mot de passe oublié ?
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Nom complet</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Votre nom"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <form onSubmit={e => { e.preventDefault(); handleSignup(signupForm.email, signupForm.password, signupForm.confirmPassword); }}>
                    <Input
                      type="email"
                      id="signup-email"
                      placeholder="Votre email"
                      value={signupForm.email}
                      onChange={e => {
                        setSignupForm({ ...signupForm, email: e.target.value });
                        setEmailValid(isValidEmail(e.target.value));
                      }}
                      className={`pl-10 pr-10 ${!emailValid && signupForm.email ? 'border-red-500' : ''}`}
                    />
                    {signupForm.email && !emailValid && (
                      <div className="text-xs mt-1 text-red-500">Adresse email invalide.</div>
                    )}
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="signup-password"
                      placeholder="Choisir un mot de passe"
                      value={signupForm.password}
                      onChange={e => {
                        setSignupForm({ ...signupForm, password: e.target.value });
                        setPasswordStrength(getPasswordStrength(e.target.value));
                        setPasswordsMatch(e.target.value === signupForm.confirmPassword);
                      }}
                      className={`pl-10 pr-10 ${passwordStrength < 2 ? 'border-red-500' : passwordStrength < 3 ? 'border-yellow-500' : 'border-green-500'}`}
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowPassword(v => !v)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <div className="text-xs mt-1" style={{ color: passwordStrength < 2 ? '#dc2626' : passwordStrength < 3 ? '#eab308' : '#16a34a' }}>
                      {signupForm.password && (
                        passwordStrength < 2
                          ? "Mot de passe faible (6 caractères, majuscule, chiffre, symbole recommandé)"
                          : passwordStrength < 3
                          ? "Mot de passe moyen"
                          : "Mot de passe fort !"
                      )}
                    </div>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirm-password"
                      placeholder="Confirmer le mot de passe"
                      value={signupForm.confirmPassword}
                      onChange={e => {
                        setSignupForm({ ...signupForm, confirmPassword: e.target.value });
                        setPasswordsMatch(signupForm.password === e.target.value);
                      }}
                      className={`pl-10 pr-10 ${!passwordsMatch && signupForm.confirmPassword ? 'border-red-500' : ''}`}
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowConfirmPassword(v => !v)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    {signupForm.confirmPassword && !passwordsMatch && (
                      <div className="text-xs mt-1 text-red-500">Les mots de passe ne correspondent pas.</div>
                    )}
                    <Button
                      type="submit"
                      className="w-full btn-golden mt-4"
                      disabled={
                        !signupForm.email ||
                        !isValidEmail(signupForm.email) ||
                        signupForm.password.length < 6 ||
                        signupForm.password !== signupForm.confirmPassword
                      }
                    >
                      S'inscrire
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}