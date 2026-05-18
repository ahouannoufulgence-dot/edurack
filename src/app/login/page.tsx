
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
      {/* Background Image Wrapper with Zoom Animation */}
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

      {/* Slogan Supérieur (Haut de page, centré) */}
      <div className="absolute top-12 left-0 right-0 z-20 text-center animate-in fade-in slide-in-from-top duration-1000">
        <h2 className="text-white text-3xl md:text-5xl font-extrabold drop-shadow-2xl tracking-tight leading-tight px-4">
          Apprendre aujourd'hui, <br className="md:hidden" />
          <span className="text-emerald-400">réussir demain.</span>
        </h2>
      </div>

      {/* Login Card - Glassmorphism Premium */}
      <Card className="w-full max-w-[460px] border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] bg-white/10 backdrop-blur-[12px] relative z-20 rounded-[24px] overflow-hidden animate-in fade-in zoom-in duration-700">
        <CardContent className="p-8 md:p-12 flex flex-col items-center">
          {/* Logo Section */}
          <div className="mb-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 ring-1 ring-white/30">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white mb-1">
              EduTrack <span className="text-emerald-400">Pro</span>
            </h1>
            <p className="text-white/60 text-[10px] tracking-[0.2em] font-bold uppercase">Système d'identité centralisé</p>
          </div>
          
          <form onSubmit={handleLogin} className="w-full space-y-6">
            <div className="space-y-1.5">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-emerald-400 transition-colors" />
                <Input 
                  id="userId" 
                  placeholder="ID (ex: DIR-001)" 
                  className="pl-12 h-13 bg-white/10 border-white/20 rounded-xl focus:ring-emerald-500 text-white placeholder:text-white/40 text-base transition-all"
                  value={formData.userId}
                  onChange={e => setFormData({...formData, userId: e.target.value})}
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-emerald-400 transition-colors" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Mot de passe"
                  required 
                  className="pl-12 pr-12 h-13 bg-white/10 border-white/20 rounded-xl focus:ring-emerald-500 text-white placeholder:text-white/40 text-base transition-all"
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
                <label htmlFor="remember" className="text-xs text-white/80 font-medium cursor-pointer">
                  Rester connecté
                </label>
              </div>
              <Button variant="link" className="px-0 text-emerald-400 text-xs h-auto font-bold">
                Besoin d'aide ?
              </Button>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 h-14 rounded-xl text-white font-bold text-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-70" disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "SE CONNECTER"}
            </Button>
          </form>

          <p className="text-white/40 text-[9px] mt-10 font-bold tracking-widest uppercase">
            © 2026 EduTrack Pro • Excellence Africaine
          </p>
        </CardContent>
      </Card>

      {/* Piliers de confiance en bas de page */}
      <div className="fixed bottom-8 left-8 right-8 z-20 flex flex-wrap justify-center gap-4 md:justify-start pointer-events-none">
        {[
          { icon: ShieldCheck, title: "Sécurité", desc: "Données protégées" },
          { icon: BarChart3, title: "Performance", desc: "Suivi en temps réel" },
          { icon: MessageSquare, title: "Connecté", desc: "Lien École-Parents" },
          { icon: UserCircle, title: "Accessible", desc: "Multi-supports" },
        ].map((feat, i) => (
          <div key={i} className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10 transition-all opacity-80">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <feat.icon className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-[10px] leading-none">{feat.title}</p>
              <p className="text-white/40 text-[8px] leading-tight mt-1">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Demo shortcuts - Glassy style */}
      <div className="fixed top-6 right-6 z-30 opacity-40 hover:opacity-100 transition-opacity hidden md:block">
        <div className="bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10 flex gap-2">
          <Badge variant="outline" className="text-white cursor-pointer py-1 border-white/20 hover:bg-white/10" onClick={() => setFormData({userId: 'DIR-001', password: 'Admin2026'})}>Directeur</Badge>
          <Badge variant="outline" className="text-white cursor-pointer py-1 border-white/20 hover:bg-white/10" onClick={() => setFormData({userId: 'ELV-3D-001', password: 'Eleve2026'})}>Élève</Badge>
        </div>
      </div>
    </div>
  );
}
