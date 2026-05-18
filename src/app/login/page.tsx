
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Eye, EyeOff, Loader2, Sparkles, UserCircle, QrCode, Lock } from "lucide-react";
import { useRouter } from 'next/navigation';
import { login, getCurrentUser } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

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
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050335392-9bef867a0571?q=80&w=2070')" }}
      data-ai-hint="classroom students"
    >
      {/* Overlay dégradé pour la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-blue-900/20 to-transparent backdrop-blur-[2px]" />

      <Card className="w-full max-w-md border-white/20 shadow-2xl bg-white/85 backdrop-blur-xl relative z-10 rounded-[2rem] overflow-hidden animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto bg-emerald-deep p-4 rounded-2xl w-fit mb-4 shadow-lg shadow-emerald-900/20">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-800">EduTrack <span className="text-emerald-deep">Pro</span></CardTitle>
          <CardDescription className="text-slate-500 font-medium mt-1">Gestion Scolaire Intelligente</CardDescription>
          
          <div className="mt-6">
            <h3 className="text-emerald-900 font-bold">Portail d'accès sécurisé</h3>
            <p className="text-xs text-slate-500 mt-1">Connectez-vous pour accéder à votre espace</p>
          </div>
        </CardHeader>

        <CardContent className="px-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  id="userId" 
                  placeholder="Identifiant Unique" 
                  className="pl-10 h-12 bg-white/50 border-slate-200 rounded-xl focus:ring-emerald-500"
                  value={formData.userId}
                  onChange={e => setFormData({...formData, userId: e.target.value})}
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Mot de passe"
                  required 
                  className="pl-10 pr-10 h-12 bg-white/50 border-slate-200 rounded-xl focus:ring-emerald-500"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-deep transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-end">
                <Button variant="link" className="px-0 text-[11px] text-emerald-700 h-auto font-bold">Mot de passe oublié ?</Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-deep hover:bg-emerald-700 h-12 rounded-xl text-white font-bold text-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-95" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Se connecter
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white/85 px-2 text-slate-400 font-bold">Ou</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 rounded-xl border-slate-200 bg-white/30 text-slate-700 hover:bg-emerald-50 gap-3"
            >
              <QrCode className="w-5 h-5" /> Scanner QR Code
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-emerald-900/60 italic font-medium">Ensemble, construisons l'avenir 💚</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 text-center bg-emerald-50/50 p-6 border-t border-white/50">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Accès rapides (Démo)</p>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              <Badge variant="outline" className="text-[9px] cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => setFormData({userId: 'DIR-001', password: 'Admin2026'})}>Directeur</Badge>
              <Badge variant="outline" className="text-[9px] cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => setFormData({userId: 'ENS-MATH-001', password: 'Prof2026'})}>Professeur</Badge>
              <Badge variant="outline" className="text-[9px] cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => setFormData({userId: 'ELV-3D-001', password: 'Eleve2026'})}>Élève</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-emerald-800 text-xs font-bold hover:bg-emerald-100/50 rounded-lg" onClick={() => router.push('/activate')}>
            <Sparkles className="w-4 h-4 mr-2" /> Activer mon compte scolaire
          </Button>
        </CardFooter>
      </Card>
      
      {/* Éléments de design flottants inspirés de l'image */}
      <div className="absolute bottom-4 right-6 text-white/40 text-[10px] z-20 pointer-events-none hidden sm:block">
        © 2024 EduTrack Pro - Système Anti-Fraude Actif
      </div>
    </div>
  );
}

function Badge({ children, variant, className, onClick }: any) {
  return (
    <span 
      onClick={onClick}
      className={cn(
        "px-2 py-0.5 rounded-full border text-slate-600 font-medium",
        variant === 'outline' ? 'border-slate-300' : 'bg-slate-100',
        className
      )}
    >
      {children}
    </span>
  );
}
