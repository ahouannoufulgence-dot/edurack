"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  User, 
  Lock, 
  GraduationCap, 
  QrCode,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { login, getCurrentUser } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';
import imagesData from '@/app/lib/placeholder-images.json';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ userId: '', password: '' });
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const bgImage = imagesData.placeholderImages.find(img => img.id === 'login-bg');

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
        // Simulation de suivi des tentatives pour feedback visuel
        const lockoutData = JSON.parse(localStorage.getItem('edutrack_lockout') || '{}');
        const attempts = lockoutData[formData.userId] || 0;
        setAttemptsRemaining(Math.max(0, 5 - attempts));
        
        toast({ variant: "destructive", title: "Erreur d'accès", description: result.message });
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center md:justify-end md:pr-12 lg:pr-32 py-12 px-4 relative overflow-hidden font-body bg-slate-900">
      <div className="absolute inset-0 z-0">
        {bgImage && (
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={bgImage.imageUrl}
              alt={bgImage.description}
              fill
              className="object-cover animate-zoom-slow"
              priority
              data-ai-hint={bgImage.imageHint}
            />
            <div className="absolute inset-0 bg-black/35 z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-emerald-900/20 z-15" />
          </div>
        )}
      </div>

      <div className="absolute top-12 left-12 z-20 hidden md:block animate-in fade-in slide-in-from-left duration-1000">
        <div className="space-y-1">
          <h2 className="text-emerald-500 font-bold text-xl uppercase tracking-wider">Apprendre</h2>
          <h2 className="text-orange-400 font-bold text-xl uppercase tracking-wider">Aujourd'hui</h2>
          <h2 className="text-blue-400 font-bold text-xl uppercase tracking-wider">Réussir</h2>
          <h2 className="text-purple-400 font-bold text-xl uppercase tracking-wider">Demain</h2>
        </div>
      </div>

      <Card className="w-full max-w-[480px] border-white/20 shadow-2xl bg-white/80 backdrop-blur-[16px] relative z-20 rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in duration-700">
        <CardContent className="p-8 md:p-12 flex flex-col items-center">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg mb-4 ring-4 ring-white/50">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-800 flex items-center gap-1">
              EduTrack <span className="text-emerald-600">Pro</span>
            </h1>
            <p className="text-slate-500 text-xs font-medium">Gestion Scolaire Intelligente</p>
            
            <div className="mt-8 mb-4">
              <div className="flex items-center justify-center gap-2 text-emerald-600 mb-1">
                <div className="w-8 h-px bg-emerald-200" />
                <ShieldCheck className="w-4 h-4" />
                <div className="w-8 h-px bg-emerald-200" />
              </div>
              <h3 className="text-slate-800 font-bold text-lg">Accès Sécurisé</h3>
              <p className="text-slate-400 text-xs mt-1 italic">Votre connexion est chiffrée</p>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="userId" 
                  placeholder="Identifiant Unique (ex: DIR-001)" 
                  className="pl-12 h-13 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-blue-500 text-slate-800"
                  value={formData.userId}
                  onChange={e => setFormData({...formData, userId: e.target.value})}
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Mot de passe"
                  required 
                  className="pl-12 pr-12 h-13 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-blue-500 text-slate-800"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {attemptsRemaining !== null && attemptsRemaining < 5 && (
                <div className="flex items-center gap-2 text-[10px] text-orange-600 font-bold animate-pulse px-1">
                  <AlertCircle className="w-3 h-3" />
                  Attention : {attemptsRemaining} tentative(s) restante(s)
                </div>
              )}

              <div className="text-right">
                <Button variant="link" className="px-0 text-blue-600 text-xs h-auto font-medium">
                  Identifiant oublié ?
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-13 rounded-xl text-white font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-70" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Vérifier & Se connecter"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-slate-400 font-bold">Méthodes alternatives</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full h-13 rounded-xl border-slate-200 text-slate-700 gap-3 hover:bg-slate-50 font-medium">
              <QrCode className="w-5 h-5 text-blue-600" />
              Scanner Badge Élève
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-xs font-medium flex items-center gap-1 justify-center">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> 
              Propulsé par EduTrack Security v2.0
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="fixed top-6 right-6 z-30 opacity-20 hover:opacity-100 transition-opacity hidden md:block">
        <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg border border-white/10 flex flex-col gap-2">
          <p className="text-[9px] text-white/70 uppercase font-bold text-center">Accès Démo</p>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-white border-white/20 cursor-pointer hover:bg-white/10" onClick={() => setFormData({userId: 'DIR-001', password: 'Admin2026'})}>Directeur</Badge>
            <Badge variant="outline" className="text-white border-white/20 cursor-pointer hover:bg-white/10" onClick={() => setFormData({userId: 'ELV-3D-001', password: 'Eleve2026'})}>Élève</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
