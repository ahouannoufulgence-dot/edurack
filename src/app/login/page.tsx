
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Eye, EyeOff, Loader2, Sparkles, UserCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import { login, getCurrentUser } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ userId: '', password: '' });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (getCurrentUser()) {
      router.push('/');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const result = login(formData.userId, formData.password);
      if (result.success) {
        toast({ title: "Bienvenue", description: `Connecté en tant que ${result.user?.role}` });
        router.push('/');
      } else {
        toast({ variant: "destructive", title: "Erreur", description: result.message });
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-emerald-deep" />
        <CardHeader className="text-center pb-6">
          <div className="mx-auto bg-emerald-deep p-3 rounded-2xl w-fit mb-4">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">EduTrack Pro</CardTitle>
          <CardDescription>Portail d'Accès Sécurisé Béninois</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Identifiant Unique</Label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="userId" 
                  placeholder="DIR-001, ENS-..., ELV-..." 
                  className="pl-10"
                  value={formData.userId}
                  onChange={e => setFormData({...formData, userId: e.target.value})}
                  required 
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Le rôle est détecté automatiquement selon le préfixe.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Button variant="link" className="px-0 text-xs text-emerald-deep h-auto">Mot de passe oublié ?</Button>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="pr-10"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-emerald-deep transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-deep h-11" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Accéder à mon espace
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground mb-4">Nouvel élève ?</p>
            <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => router.push('/activate')}>
              <Sparkles className="w-4 h-4 mr-2" /> Activer mon compte scolaire
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-[10px] text-muted-foreground bg-slate-50 p-4 border-t">
          <p>© 2024 EduTrack Pro - Système Anti-Fraude Actif</p>
          <div className="mt-2 text-[9px] space-y-1 italic bg-emerald-50 p-2 rounded border border-emerald-100">
            <p>Directeur : DIR-001 / Admin2026</p>
            <p>Professeur : ENS-MATH-001 / Prof2026</p>
            <p>Élève : ELV-3D-001 / Eleve2026</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
