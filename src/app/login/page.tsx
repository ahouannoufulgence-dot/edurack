
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  User, 
  Lock, 
  GraduationCap, 
  ShieldCheck, 
  BarChart3, 
  MessageSquare, 
  UserCircle 
} from "lucide-react";
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
    
    // Simulation d'une latence réseau pour le feedback visuel
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center md:items-end md:pr-24 py-12 px-4 relative overflow-hidden font-body bg-slate-900">
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
            {/* Voile sombre de protection rgba(0,0,0,0.35) */}
            <div className="absolute inset-0 bg-black/35 z-10" />
          </div>
        )}
      </div>

      {/* Slogan Supérieur (Centré sur Desktop, haut de page) */}
      <div className="absolute top-12 left-0 right-0 z-20 text-center hidden md:block animate-in fade-in slide-in-from-top duration-1000">
        <h2 className="text-white text-4xl lg:text-5xl font-extrabold drop-shadow-2xl tracking-tight leading-tight">
          Apprendre aujourd'hui,<br />
          <span className="text-emerald-400">réussir demain.</span>
        </h2>
      </div>

      {/* Login Card - Ultra Glassmorphism */}
      <Card className="w-full max-w-[460px] border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] bg-white/10 backdrop-blur-[16px] relative z-20 rounded-[32px] overflow-hidden animate-in fade-in zoom-in duration-700">
        <CardContent className="p-10 md:p-14 flex flex-col items-center">
          {/* Logo Section */}
          <div className="mb-8 flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-600/90 rounded-[24px] flex items-center justify-center shadow-2xl mb-5 ring-1 ring-white/40 rotate-3">
              <GraduationCap className="w-12 h-12 text-white -rotate-3" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white mb-1">
              EduTrack <span className="text-emerald-400">Pro</span>
            </h1>
            <p className="text-white/50 text-[10px] tracking-[0.3em] font-bold uppercase">Système d'identité centralisé</p>
          </div>
          
          <form onSubmit={handleLogin} className="w-full space-y-6">
            <div className="space-y-2">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                <Input 
                  id="userId" 
                  placeholder="ID (ex: DIR-001)" 
                  className="pl-12 h-14 bg-white/10 border-white/20 rounded-2xl focus:ring-emerald-500 text-white placeholder:text-white/30 text-base transition-all hover:bg-white/15"
                  value={formData.userId}
                  onChange={e => setFormData({...formData, userId: e.target.value})}
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Mot de passe"
                  required 
                  className="pl-12 pr-12 h-14 bg-white/10 border-white/20 rounded-2xl focus:ring-emerald-500 text-white placeholder:text-white/30 text-base transition-all hover:bg-white/15"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-emerald-400 p-2 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="border-white/20 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
                <label htmlFor="remember" className="text-xs text-white/70 font-medium cursor-pointer hover:text-white transition-colors">
                  Rester connecté
                </label>
              </div>
              <Button variant="link" className="px-0 text-emerald-400 text-xs h-auto font-bold hover:text-emerald-300">
                Mot de passe oublié ?
              </Button>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 h-15 rounded-[20px] text-white font-black text-lg shadow-[0_10px_30px_-5px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98] disabled:opacity-70 mt-2" disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "ACCÉDER AU PORTAIL"}
            </Button>
          </form>

          <p className="text-white/30 text-[9px] mt-12 font-bold tracking-widest uppercase">
            © 2026 EduTrack Pro • Sécurité & Excellence
          </p>
        </CardContent>
      </Card>

      {/* Pied de page - Pillars of Trust */}
      <div className="fixed bottom-8 left-8 right-8 z-20 flex flex-wrap justify-center gap-4 md:justify-start">
        {[
          { icon: ShieldCheck, title: "Sécurité", desc: "Données chiffrées" },
          { icon: BarChart3, title: "Analyse", desc: "Suivi par IA" },
          { icon: MessageSquare, title: "Lien", desc: "École-Parents" },
          { icon: UserCircle, title: "Accès", desc: "Multi-device" },
        ].map((feat, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all cursor-default group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/40 transition-all">
              <feat.icon className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-xs leading-none">{feat.title}</p>
              <p className="text-white/40 text-[9px] leading-tight mt-1">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Demo shortcuts - Glassy style */}
      <div className="fixed top-6 right-6 z-30 opacity-40 hover:opacity-100 transition-opacity hidden md:block">
        <div className="bg-black/20 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex gap-2">
          <Badge variant="outline" className="text-white cursor-pointer py-1.5 border-white/20 hover:bg-white/10" onClick={() => setFormData({userId: 'DIR-001', password: 'Admin2026'})}>Directeur</Badge>
          <Badge variant="outline" className="text-white cursor-pointer py-1.5 border-white/20 hover:bg-white/10" onClick={() => setFormData({userId: 'ELV-3D-001', password: 'Eleve2026'})}>Élève</Badge>
        </div>
      </div>
    </div>
  );
}
