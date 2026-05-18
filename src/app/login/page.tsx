
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Loader2, Sparkles, User, QrCode, Lock, GraduationCap } from "lucide-react";
import { useRouter } from 'next/navigation';
import { login, getCurrentUser } from '@/lib/auth-service';
import { useToast } from '@/hooks/use-toast';
import imagesData from '@/app/lib/placeholder-images.json';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ userId: '', password: '' });
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
    
    // Simulate API call
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
    <div className="min-h-screen w-full flex items-center justify-center lg:justify-end px-4 lg:px-20 relative overflow-hidden font-body bg-slate-900">
      {/* Background Image Wrapper */}
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
            {/* Voile sombre transparent rgba(0,0,0,0.35) */}
            <div className="absolute inset-0 bg-black/35 z-10" />
          </div>
        )}
      </div>

      {/* Slogan motivant sur le fond */}
      <div className="absolute left-12 bottom-12 z-20 hidden xl:block animate-in fade-in slide-in-from-left duration-1000">
        <h2 className="text-white text-4xl font-bold drop-shadow-lg max-w-md leading-tight">
          Apprendre aujourd'hui,<br />
          <span className="text-accent">réussir demain.</span>
        </h2>
      </div>

      {/* Login Card - Glassmorphism style */}
      <Card className="w-full max-w-[440px] border-white/20 shadow-2xl bg-white/70 backdrop-blur-[12px] relative z-20 rounded-[24px] overflow-hidden animate-in fade-in zoom-in duration-700">
        <CardHeader className="text-center pt-10 pb-4 flex flex-col items-center">
          <div className="mb-6">
            <div className="relative w-20 h-20 flex items-center justify-center bg-white rounded-2xl shadow-sm mb-4">
              <GraduationCap className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              EduTrack <span className="text-primary">Pro</span>
            </h1>
            <p className="text-slate-600 text-sm mt-1">Gestion Scolaire Intelligente</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-slate-800 font-bold text-xl">Portail d'accès sécurisé</h3>
            <p className="text-slate-500 text-sm">Connectez-vous pour accéder à votre espace</p>
          </div>
        </CardHeader>

        <CardContent className="px-10 pb-6 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  id="userId" 
                  placeholder="Identifiant Unique (DIR-001...)" 
                  className="pl-12 h-14 bg-white/50 border-slate-200 rounded-xl focus:ring-primary text-slate-900 text-base"
                  value={formData.userId}
                  onChange={e => setFormData({...formData, userId: e.target.value})}
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Mot de passe"
                  required 
                  className="pl-12 pr-12 h-14 bg-white/50 border-slate-200 rounded-xl focus:ring-primary text-slate-900 text-base"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary p-2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="link" className="px-0 text-sm text-primary h-auto font-semibold">Mot de passe oublié ?</Button>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-14 rounded-xl text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70" disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Se connecter"}
            </Button>

            <div className="relative flex items-center justify-center py-2">
              <div className="w-full border-t border-slate-200" />
              <span className="bg-white/0 backdrop-blur-none px-4 text-xs font-bold text-slate-400 absolute">OU</span>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-14 rounded-xl border-slate-200 bg-white/50 text-slate-700 hover:bg-white gap-3 font-semibold transition-all"
            >
              <QrCode className="w-5 h-5" /> Scanner QR Code
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 text-center p-8 pt-0">
          <p className="text-slate-600 text-sm font-medium">Ensemble, construisons l'avenir 💚</p>
          
          <div className="w-full pt-6 border-t border-slate-200/50 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-emerald-100 py-1" onClick={() => setFormData({userId: 'DIR-001', password: 'Admin2026'})}>Directeur</Badge>
            <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-emerald-100 py-1" onClick={() => setFormData({userId: 'ELV-3D-001', password: 'Eleve2026'})}>Élève</Badge>
            <Button variant="ghost" size="sm" className="text-primary text-[11px] font-bold h-8" onClick={() => router.push('/activate')}>
              <Sparkles className="w-3 h-3 mr-1" /> Activer mon compte
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <div className="absolute bottom-6 left-8 text-white/60 text-[10px] z-20 font-mono hidden lg:block tracking-widest">
        © 2024 EDUTRACK PRO // SYSTÈME SÉCURISÉ
      </div>
    </div>
  );
}
