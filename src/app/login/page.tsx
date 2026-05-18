
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
  AlertCircle,
  UserPlus,
  ArrowRight
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
              data-ai-hint="african students happy"
            />
            <div className="absolute inset-0 bg-black/40 z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-emerald-900/30 z-15" />
          </div>
        )}
      </div>

      <div className="absolute top-12 left-12 z-20 hidden md:block animate-in fade-in slide-in-from-left duration-1000">
        <div className="space-y-2">
          <p className="text-white/80 text-sm font-bold tracking-[0.3em] uppercase mb-4">Vision Excellence</p>
          <h2 className="text-emerald-500 font-black text-4xl uppercase tracking-tighter">Apprendre</h2>
          <h2 className="text-orange-400 font-black text-4xl uppercase tracking-tighter">Aujourd'hui</h2>
          <h2 className="text-blue-400 font-black text-4xl uppercase tracking-tighter">Réussir</h2>
          <h2 className="text-purple-400 font-black text-4xl uppercase tracking-tighter">Demain</h2>
        </div>
      </div>

      <Card className="w-full max-w-[480px] border-white/20 shadow-2xl bg-white/75 backdrop-blur-[16px] relative z-20 rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in duration-700">
        <CardContent className="p-8 md:p-10 flex flex-col items-center">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 rotate-3 hover:rotate-0 transition-transform ring-4 ring-white/50">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-800">
              EduTrack <span className="text-emerald-600">Pro</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Portail d'Accès Sécurisé</p>
          </div>
          
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  id="userId" 
                  placeholder="ID (ex: DIR-001, ELV-001)" 
                  className="pl-12 h-13 bg-white/50 border-slate-200 rounded-xl focus:ring-emerald-500 text-slate-800 font-medium"
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
                  className="pl-12 pr-12 h-13 bg-white/50 border-slate-200 rounded-xl focus:ring-emerald-500 text-slate-800"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {attemptsRemaining !== null && attemptsRemaining < 5 && (
                <div className="flex items-center gap-2 text-[10px] text-orange-600 font-bold px-1">
                  <AlertCircle className="w-3 h-3" />
                  Sécurité : {attemptsRemaining} tentatives restantes
                </div>
              )}
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-13 rounded-xl text-white font-bold shadow-lg transition-all active:scale-[0.98]" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Se connecter maintenant"}
            </Button>

            <div className="flex items-center justify-between px-1">
               <Button variant="link" className="px-0 text-slate-500 text-xs h-auto font-medium hover:text-emerald-600">
                  Identifiant oublié ?
               </Button>
               <Button variant="link" className="px-0 text-emerald-600 text-xs h-auto font-bold" onClick={() => router.push('/activate')}>
                  Activer mon compte <ArrowRight className="w-3 h-3 ml-1" />
               </Button>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200/50" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                <span className="bg-white/10 px-2">Nouveau sur la plateforme ?</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-13 rounded-xl border-emerald-200 text-emerald-700 gap-3 hover:bg-emerald-50 font-bold shadow-sm"
              onClick={() => router.push('/activate')}
            >
              <UserPlus className="w-5 h-5" />
              Première connexion (Inscription)
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1 justify-center uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> 
              Ensemble, construisons l'avenir 💚
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-6 left-6 z-30 opacity-50 hover:opacity-100 transition-opacity hidden md:block">
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[8px] text-white font-bold">SÉCURISÉ</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <QrCode className="w-4 h-4 text-blue-400" />
            <span className="text-[8px] text-white font-bold">QR SCAN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
