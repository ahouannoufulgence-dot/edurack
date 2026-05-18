
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
    <div className="min-h-screen w-full flex flex-col items-center justify-between py-12 px-4 relative overflow-hidden font-body bg-slate-900">
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

      {/* Slogan Supérieur */}
      <div className="relative z-20 text-center mt-4 animate-in fade-in slide-in-from-top duration-1000">
        <h2 className="text-white text-3xl md:text-5xl font-bold drop-shadow-lg leading-tight">
          Apprendre aujourd'hui,<br />réussir demain
        </h2>
      </div>

      {/* Login Card - Glassmorphism style */}
      <Card className="w-full max-w-[480px] border-white/20 shadow-2xl bg-white/10 backdrop-blur-[12px] relative z-20 rounded-[24px] overflow-hidden animate-in fade-in zoom-in duration-700">
        <CardContent className="p-8 md:p-12 flex flex-col items-center">
          {/* Logo Section */}
          <div className="mb-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-700/80 rounded-2xl flex items-center justify-center shadow-lg mb-4 ring-1 ring-white/30">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-1">
              EduTrack <span className="text-emerald-400">Pro</span>
            </h1>
            <p className="text-white/60 text-[10px] tracking-[0.2em] font-bold uppercase">Portail d'accès sécurisé</p>
          </div>
          
          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div className="space-y-2">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                <Input 
                  id="userId" 
                  placeholder="Identifiant (ex: DIR-001)" 
                  className="pl-12 h-14 bg-white/10 border-white/20 rounded-2xl focus:ring-emerald-500 text-white placeholder:text-white/30 text-base transition-all"
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
                  className="pl-12 pr-12 h-14 bg-white/10 border-white/20 rounded-2xl focus:ring-emerald-500 text-white placeholder:text-white/30 text-base transition-all"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="border-white/20 data-[state=checked]:bg-emerald-600" />
                <label htmlFor="remember" className="text-xs text-white/70 font-medium cursor-pointer">
                  Rester connecté
                </label>
              </div>
              <Button variant="link" className="px-0 text-emerald-400 text-xs h-auto font-medium hover:text-emerald-300">
                Mot de passe oublié ?
              </Button>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 rounded-2xl text-white font-bold text-lg shadow-xl shadow-emerald-900/40 transition-all active:scale-[0.98] disabled:opacity-70 mt-2" disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Se connecter"}
            </Button>
          </form>

          <p className="text-white/30 text-[10px] mt-12 font-medium">
            © 2026 EduTrack Pro - Système de Gestion Scolaire Intelligente
          </p>
        </CardContent>
      </Card>

      {/* Pied de page - Caractéristiques */}
      <div className="relative z-20 w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6 px-4 mb-4">
        {[
          { icon: ShieldCheck, title: "Sécurisé", desc: "Données protégées" },
          { icon: BarChart3, title: "Performant", desc: "Suivi en temps réel" },
          { icon: MessageSquare, title: "Connecté", desc: "Lien école-parents" },
          { icon: UserCircle, title: "Accessible", desc: "Partout, tout le temps" },
        ].map((feat, i) => (
          <div key={i} className="flex items-center gap-3 group bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center ring-1 ring-white/10 group-hover:bg-emerald-500/30 transition-all">
              <feat.icon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{feat.title}</p>
              <p className="text-white/40 text-[10px] leading-tight">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Demo shortcuts */}
      <div className="absolute bottom-4 right-4 z-30 opacity-20 hover:opacity-100 transition-opacity hidden md:block">
        <div className="flex gap-2">
          <Badge variant="outline" className="text-white cursor-pointer py-1 border-white/20" onClick={() => setFormData({userId: 'DIR-001', password: 'Admin2026'})}>Directeur</Badge>
          <Badge variant="outline" className="text-white cursor-pointer py-1 border-white/20" onClick={() => setFormData({userId: 'ELV-3D-001', password: 'Eleve2026'})}>Élève</Badge>
        </div>
      </div>
    </div>
  );
}
