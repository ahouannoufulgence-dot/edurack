
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Loader2, Sparkles, UserCircle, QrCode, Lock, GraduationCap } from "lucide-react";
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
    <div className="min-h-screen w-full flex items-center justify-center md:justify-end px-4 md:px-24 relative overflow-hidden font-body bg-slate-900">
      {/* Background Image with requested strict CSS properties via next/image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {bgImage && (
          <Image
            src={bgImage.imageUrl}
            alt={bgImage.description}
            fill
            className="object-cover animate-zoom-slow"
            priority
            data-ai-hint={bgImage.imageHint}
          />
        )}
        {/* Voile sombre transparent : rgba(0,0,0,0.35) */}
        <div className="absolute inset-0 bg-black/35 z-10" />
      </div>

      {/* Discreet Motivational Slogan */}
      <div className="absolute left-12 bottom-12 z-20 hidden lg:block animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
        <p className="text-white/80 text-2xl font-light italic tracking-wide drop-shadow-md">
          "Apprendre aujourd'hui, réussir demain."
        </p>
      </div>

      {/* Mobile Slogan */}
      <div className="absolute top-12 left-0 right-0 z-20 text-center lg:hidden animate-in fade-in slide-in-from-top-4 duration-700">
        <p className="text-white text-sm font-bold uppercase tracking-widest drop-shadow-md">
          Apprendre aujourd'hui, réussir demain.
        </p>
      </div>

      {/* Login Card with Advanced Glassmorphism */}
      <Card className="w-full max-w-[440px] border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white/80 backdrop-blur-[12px] relative z-20 rounded-[24px] overflow-hidden animate-in fade-in zoom-in duration-700 flex flex-col">
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto flex flex-col items-center gap-3 mb-4">
            <div className="bg-emerald-deep p-3 rounded-2xl shadow-lg shadow-emerald-900/20">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 flex items-center gap-1">
                EduTrack <span className="text-emerald-deep">Pro</span>
              </h1>
              <p className="text-slate-600 text-[10px] font-semibold tracking-widest uppercase">Gestion Scolaire Intelligente</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-1">
            <h3 className="text-slate-900 font-bold text-lg">Accès Sécurisé</h3>
            <p className="text-slate-500 text-sm">Connectez-vous à votre espace</p>
          </div>
        </CardHeader>

        <CardContent className="px-10 pb-6 space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <div className="relative group">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input 
                  id="userId" 
                  placeholder="Identifiant Unique" 
                  className="pl-12 h-13 bg-white/50 border-slate-200 rounded-xl focus:ring-emerald-500 text-slate-900 font-medium transition-all"
                  value={formData.userId}
                  onChange={e => setFormData({...formData, userId: e.target.value})}
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Mot de passe"
                  required 
                  className="pl-12 pr-12 h-13 bg-white/50 border-slate-200 rounded-xl focus:ring-emerald-500 text-slate-900 font-medium transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-deep transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-end">
                <Button variant="link" className="px-0 text-[11px] text-emerald-800 h-auto font-semibold hover:text-emerald-600">Mot de passe oublié ?</Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-deep hover:bg-emerald-700 h-13 rounded-xl text-white font-bold text-lg shadow-xl shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-70" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Se connecter"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400 px-2">
                <span className="bg-[#f8fafc]/80 backdrop-blur-sm px-3 rounded-full">Ou</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-13 rounded-xl border-slate-200 bg-white/40 text-slate-700 hover:bg-emerald-50 gap-3 font-semibold transition-all"
            >
              <QrCode className="w-5 h-5" /> Scanner QR Code
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 text-center bg-slate-50/50 p-6 border-t border-slate-100">
          <div className="w-full space-y-3">
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-emerald-100 transition-colors py-1 px-3 rounded-full font-bold text-slate-700" onClick={() => setFormData({userId: 'DIR-001', password: 'Admin2026'})}>Directeur</Badge>
              <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-emerald-100 transition-colors py-1 px-3 rounded-full font-bold text-slate-700" onClick={() => setFormData({userId: 'ELV-3D-001', password: 'Eleve2026'})}>Élève</Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-emerald-900 text-xs font-bold hover:bg-white/40 rounded-lg w-full" onClick={() => router.push('/activate')}>
              <Sparkles className="w-4 h-4 mr-2" /> Activer mon compte scolaire
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <div className="absolute bottom-6 right-8 text-white/40 text-[10px] z-20 pointer-events-none hidden sm:block font-mono">
        © 2024 EDUTRACK PRO // SÉCURITÉ ACTIVE
      </div>
    </div>
  );
}
