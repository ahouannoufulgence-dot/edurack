"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Activity,
  Lock,
  Smartphone,
  Info
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { verifyActivation, completeActivation } from '@/lib/activation';
import { useToast } from '@/hooks/use-toast';
import imagesData from '@/app/lib/placeholder-images.json';

export default function ActivationPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tokenId: '',
    birthDate: '',
    parentPhone: '',
    password: '',
    email: '',
    secretQuestion: ''
  });
  const { toast } = useToast();
  const router = useRouter();

  const bgImage = imagesData.placeholderImages.find(img => img.id === 'login-bg');

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const result = verifyActivation(formData.tokenId, formData.birthDate, formData.parentPhone);
      if (result.success) {
        setStep(2);
        toast({ title: "Identité confirmée", description: "Veuillez maintenant configurer vos accès personnels." });
      } else {
        toast({ variant: "destructive", title: "Erreur de vérification", description: result.message });
      }
      setLoading(false);
    }, 1500);
  };

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      completeActivation(formData.tokenId, {
        email: formData.email,
        photoUrl: 'https://picsum.photos/seed/user/200/200',
        secretQuestion: formData.secretQuestion,
        password: formData.password
      });
      setStep(3);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 z-0">
        {bgImage && (
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={bgImage.imageUrl}
              alt={bgImage.description}
              fill
              className="object-cover animate-zoom-slow"
              priority
            />
            <div className="absolute inset-0 bg-black/40 z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-transparent to-blue-900/40 z-15" />
          </div>
        )}
      </div>

      <div className="absolute top-8 left-0 right-0 z-20 text-center animate-in fade-in slide-in-from-top duration-1000">
        <p className="text-white/90 text-sm font-bold tracking-[0.2em] uppercase">
          Apprendre aujourd'hui, réussir demain
        </p>
      </div>

      <Card className="w-full max-w-[500px] border-white/20 shadow-2xl bg-white/80 backdrop-blur-[16px] relative z-20 rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in duration-700">
        <div className="h-2 bg-emerald-500 w-full" />
        
        <CardHeader className="text-center pt-8">
          <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 rotate-3 hover:rotate-0 transition-transform">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-slate-800">
            Activation <span className="text-emerald-600">Compte</span>
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Étape {step} sur 3 • Espace Sécurisé
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-5">
              <div className="bg-emerald-50/90 border border-emerald-100 p-4 rounded-2xl space-y-2 mb-2">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    Saisissez l'identifiant remis par l'école (ex: EDP-2026-...).
                  </p>
                </div>
                <div className="flex gap-3 pt-2 border-t border-emerald-100/50">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <p className="text-[10px] text-blue-800 italic">
                    Prototype : Utilisez <strong>2010-01-01</strong> et <strong>00000000</strong> pour tester avec n'importe quel code généré.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">Identifiant Scolaire</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Ex: EDP-2026-3A-001" 
                    className="pl-12 h-12 bg-white/50 border-slate-200 rounded-xl focus:ring-emerald-500"
                    value={formData.tokenId} 
                    onChange={e => setFormData({...formData, tokenId: e.target.value.toUpperCase()})}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1">Date de naissance</Label>
                  <Input 
                    type="date" 
                    className="h-12 bg-white/50 border-slate-200 rounded-xl"
                    value={formData.birthDate} 
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1">Téléphone Parent</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Numéro enregistré" 
                      className="pl-12 h-12 bg-white/50 border-slate-200 rounded-xl"
                      value={formData.parentPhone} 
                      onChange={e => setFormData({...formData, parentPhone: e.target.value})}
                      required 
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-13 rounded-xl text-white font-bold shadow-lg transition-all active:scale-[0.98]" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5 mr-2" />}
                Vérifier mon identité
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleFinalize} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-black text-xl text-slate-800">C'est presque fini !</h3>
                <p className="text-sm text-slate-500 font-medium">Définissez vos informations de connexion personnelles.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">Email de récupération</Label>
                <Input 
                  type="email" 
                  placeholder="eleve@email.com" 
                  className="h-12 bg-white/50 border-slate-200 rounded-xl"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="password" 
                    placeholder="Minimum 8 caractères"
                    className="pl-12 h-12 bg-white/50 border-slate-200 rounded-xl"
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">Question de sécurité</Label>
                <Input 
                  placeholder="Ex: Quel était votre premier animal ?" 
                  className="h-12 bg-white/50 border-slate-200 rounded-xl"
                  value={formData.secretQuestion} 
                  onChange={e => setFormData({...formData, secretQuestion: e.target.value})}
                  required 
                />
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-13 rounded-xl text-white font-bold shadow-lg" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                Activer mon compte maintenant
              </Button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-10 space-y-8 animate-in zoom-in duration-500">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
                <div className="relative bg-emerald-600 w-24 h-24 rounded-full flex items-center justify-center shadow-xl">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-black text-slate-800">Compte Activé !</h2>
                <p className="text-slate-500 font-medium mt-3 leading-relaxed">
                  Félicitations ! Votre compte est maintenant créé. Vous pouvez vous connecter avec votre identifiant <strong>{formData.tokenId}</strong>.
                </p>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-xl text-white font-bold shadow-lg gap-2 text-lg" onClick={() => router.push('/login')}>
                Se connecter maintenant <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-slate-50/80 border-t p-4 flex justify-center items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Protection Active v2.0</span>
          </div>
        </CardFooter>
      </Card>

      <div className="absolute bottom-8 left-0 right-0 z-20 text-center">
        <p className="text-white/50 text-[10px] font-medium flex items-center justify-center gap-2">
          <ShieldCheck className="w-3 h-3" /> Système de gestion sécurisé EduTrack Pro
        </p>
      </div>
    </div>
  );
}
