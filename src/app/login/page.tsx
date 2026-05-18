"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Eye, EyeOff, Loader2, Sparkles, UserCircle, QrCode, Lock } from "lucide-react";
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
    <div className="min-h-screen w-full flex items-center justify-center md:justify-end px-4 md:px-24 relative overflow-hidden font-body">
      {/* Background Image Container with Slow Zoom */}
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
        {/* Dark Overlay Veil */}
        <div className="absolute inset-0 bg-black/35 z-10" />
      </div>

      {/* Motivational Text - Only visible on medium screens and up */}
      <div className="absolute left-12 bottom-12 z-20 hidden md:block max-w-md animate-in fade-in slide-in-from-left-8 duration-1000">
        <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
          Apprendre aujourd'hui, réussir demain.
        </h2>
        <div className="mt-4 w-24 h-1 bg-accent rounded-full shadow-lg" />
      </div>

      {/* Login Card with Glassmorphism */}
      <Card className="w-full max-w-md border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] bg-white/70 backdrop-blur-[12px] relative z-20 rounded-[24px] overflow-hidden animate-in fade-in zoom-in duration-700">
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto bg-emerald-deep p-4 rounded-2xl w-fit mb-4 shadow-xl shadow-emerald-900/20">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">EduTrack <span className="text-emerald-deep">Pro</span></CardTitle>
          <CardDescription className="text-slate-600 font-medium mt-1">Gestion Scolaire Intelligente</CardDescription>
          
          <div className="mt-6">
            <h3 className="text-emerald-900 font-bold uppercase tracking-wider text-xs">Accès Sécurisé</h3>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <div className="relative group">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-600 transition-colors" />
                <Input 
                  id="userId" 
                  placeholder="Identifiant Unique (ex: DIR-001)" 
                  className="pl-10 h-12 bg-white/40 border-white/50 rounded-xl focus:ring-emerald-500 text-slate-900 placeholder:text-slate-500"
                  value={formData.userId}
                  onChange={e => setFormData({...formData, userId: e.target.value})}
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-600 transition-colors" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Mot de passe"
                  required 
                  className="pl-10 pr-10 h-12 bg-white/40 border-white/50 rounded-xl focus:ring-emerald-500 text-slate-900 placeholder:text-slate-500"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-deep transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-end">
                <Button variant="link" className="px-0 text-[11px] text-emerald-800 h-auto font-bold hover:text-emerald-600">Mot de passe oublié ?</Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-deep hover:bg-emerald-700 h-12 rounded-xl text-white font-bold text-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-95" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Se connecter
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-transparent px-2 text-slate-600 font-bold">Ou</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 rounded-xl border-slate-300 bg-white/20 text-slate-800 hover:bg-emerald-50 gap-3"
            >
              <QrCode className="w-5 h-5" /> Scanner QR Code
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 text-center bg-white/30 p-6 border-t border-white/30">
          <div className="flex flex-col gap-1 w-full">
            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest mb-2">Comptes de démo</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="text-[9px] cursor-pointer hover:bg-emerald-100 transition-colors py-1" onClick={() => setFormData({userId: 'DIR-001', password: 'Admin2026'})}>DIR-001</Badge>
              <Badge variant="secondary" className="text-[9px] cursor-pointer hover:bg-emerald-100 transition-colors py-1" onClick={() => setFormData({userId: 'ENS-MATH-001', password: 'Prof2026'})}>ENS-MATH-001</Badge>
              <Badge variant="secondary" className="text-[9px] cursor-pointer hover:bg-emerald-100 transition-colors py-1" onClick={() => setFormData({userId: 'ELV-3D-001', password: 'Eleve2026'})}>ELV-3D-001</Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-emerald-900 text-xs font-bold hover:bg-white/40 rounded-lg w-full" onClick={() => router.push('/activate')}>
            <Sparkles className="w-4 h-4 mr-2" /> Activer mon compte scolaire
          </Button>
        </CardFooter>
      </Card>
      
      <div className="absolute bottom-4 right-6 text-white/60 text-[10px] z-20 pointer-events-none hidden sm:block">
        © 2024 EduTrack Pro - Système Anti-Fraude Actif
      </div>
    </div>
  );
}