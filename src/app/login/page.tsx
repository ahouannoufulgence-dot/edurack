
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
    <div className="min-h-screen w-full flex items-center justify-center lg:justify-end px-4 lg:px-20 relative overflow-hidden font-body bg-slate-100">
      {/* Background Image Wrapper */}
      <div className="absolute inset-0 z-0">
        {bgImage && (
          <div className="relative w-full h-full">
            <Image
              src={bgImage.imageUrl}
              alt={bgImage.description}
              fill
              className="object-cover animate-zoom-slow"
              priority
              data-ai-hint={bgImage.imageHint}
            />
            {/* Soft Veil as per requirement */}
            <div className="absolute inset-0 bg-black/35 z-10" />
          </div>
        )}
      </div>

      {/* Background Text Slogan - Matches the wall in the image */}
      <div className="absolute left-1/4 top-1/4 z-20 hidden xl:flex flex-col gap-1 text-center pointer-events-none">
        <p className="text-[#1A6B4A] text-2xl font-bold tracking-widest drop-shadow-sm uppercase">Apprendre</p>
        <p className="text-orange-500 text-2xl font-bold tracking-widest drop-shadow-sm uppercase">Aujourd'hui</p>
        <p className="text-[#1A6B4A] text-2xl font-bold tracking-widest drop-shadow-sm uppercase">Réussir</p>
        <p className="text-purple-600 text-2xl font-bold tracking-widest drop-shadow-sm uppercase">Demain</p>
      </div>

      {/* Login Card - Styled exactly like the provided image */}
      <Card className="w-full max-w-[480px] border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-white/85 backdrop-blur-[12px] relative z-20 rounded-[24px] overflow-hidden animate-in fade-in zoom-in duration-700">
        <CardHeader className="text-center pt-8 pb-4 flex flex-col items-center">
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <GraduationCap className="w-12 h-12 text-[#1A6B4A]" />
              <div className="absolute -bottom-1 -right-1 bg-orange-500 w-4 h-4 rounded-full border-2 border-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                EduTrack <span className="text-[#1A6B4A]">Pro</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-medium tracking-wider">Gestion Scolaire Intelligente</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
              <div className="h-px w-8 bg-slate-300" />
              <GraduationCap className="w-4 h-4" />
              <div className="h-px w-8 bg-slate-300" />
            </div>
            <h3 className="text-slate-800 font-bold text-lg">Portail d'accès sécurisé</h3>
            <p className="text-slate-500 text-xs">Connectez-vous pour accéder à votre espace</p>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-4 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                id="userId" 
                placeholder="Identifiant Unique" 
                className="pl-12 h-12 bg-white/50 border-slate-200 rounded-xl focus:ring-primary text-slate-900"
                value={formData.userId}
                onChange={e => setFormData({...formData, userId: e.target.value})}
                required 
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Mot de passe"
                required 
                className="pl-12 pr-12 h-12 bg-white/50 border-slate-200 rounded-xl focus:ring-primary text-slate-900"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <Button variant="link" className="px-0 text-[11px] text-[#0066CC] h-auto font-medium">Mot de passe oublié ?</Button>
            </div>

            <Button type="submit" className="w-full bg-[#0066CC] hover:bg-blue-700 h-12 rounded-xl text-white font-bold text-base transition-all active:scale-95 disabled:opacity-70" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Se connecter"}
            </Button>

            <div className="relative flex items-center justify-center py-1">
              <div className="w-full border-t border-slate-200" />
              <span className="bg-transparent px-4 text-[10px] uppercase font-bold text-slate-400 absolute">Ou</span>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 rounded-xl border-slate-200 bg-white/50 text-slate-600 hover:bg-slate-50 gap-3 font-medium transition-all"
            >
              <QrCode className="w-4 h-4" /> Scanner QR Code
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 text-center p-6 pt-0">
          <p className="text-slate-400 text-xs italic">Ensemble, construisons l'avenir 💚</p>
          
          <div className="w-full pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="text-[9px] cursor-pointer hover:bg-emerald-100 py-1" onClick={() => setFormData({userId: 'DIR-001', password: 'Admin2026'})}>Directeur</Badge>
            <Badge variant="secondary" className="text-[9px] cursor-pointer hover:bg-emerald-100 py-1" onClick={() => setFormData({userId: 'ELV-3D-001', password: 'Eleve2026'})}>Élève</Badge>
            <Button variant="ghost" size="sm" className="text-[#1A6B4A] text-[10px] font-bold h-8" onClick={() => router.push('/activate')}>
              <Sparkles className="w-3 h-3 mr-1" /> Activer mon compte
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <div className="absolute bottom-6 left-8 text-white/40 text-[10px] z-20 font-mono hidden lg:block">
        © 2024 EDUTRACK PRO // SÉCURITÉ ACTIVE
      </div>
    </div>
  );
}
