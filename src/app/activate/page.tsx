"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShieldCheck, 
  UserPlus, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Activity,
  Lock,
  User,
  Info,
  Copy
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { ALL_CLASSES } from '@/lib/school-types';
import { registerStudent } from '@/lib/data-service';
import { useToast } from '@/hooks/use-toast';
import imagesData from '@/app/lib/placeholder-images.json';

export default function RegistrationPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    sexe: 'M' as 'M' | 'F',
    classeId: '3e 1',
    password: '',
    confirmPassword: '',
    secretQuestion: '',
    secretAnswer: ''
  });
  
  const { toast } = useToast();
  const router = useRouter();

  const bgImage = imagesData.placeholderImages.find(img => img.id === 'login-bg');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.nom || !formData.prenom) {
        toast({ variant: "destructive", title: "Erreur", description: "Veuillez remplir tous les champs d'identité." });
        return;
      }
      setStep(2);
    }
  };

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ variant: "destructive", title: "Erreur", description: "Les mots de passe ne correspondent pas." });
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      try {
        const resultId = registerStudent({
          nom: formData.nom,
          prenom: formData.prenom,
          sexe: formData.sexe,
          classLevel: formData.classeId,
          password: formData.password,
          secretQuestion: formData.secretQuestion,
          secretAnswer: formData.secretAnswer
        });
        
        setGeneratedId(resultId);
        setStep(3);
        toast({ title: "Inscription réussie", description: "Votre identifiant a été généré avec succès." });
      } catch (error) {
        toast({ variant: "destructive", title: "Erreur technique", description: "Impossible de finaliser l'inscription." });
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  const copyId = () => {
    navigator.clipboard.writeText(generatedId);
    toast({ title: "Copié !", description: "Identifiant copié dans le presse-papier." });
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
          Rejoignez l'excellence académique
        </p>
      </div>

      <Card className="w-full max-w-[500px] border-white/20 shadow-2xl bg-white/80 backdrop-blur-[16px] relative z-20 rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in duration-700">
        <div className="h-2 bg-emerald-500 w-full" />
        
        <CardHeader className="text-center pt-8">
          <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 rotate-3 hover:rotate-0 transition-transform">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-slate-800">
            Inscription <span className="text-emerald-600">Élève</span>
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Étape {step} sur 3 • Création de compte
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="bg-emerald-50/90 border border-emerald-100 p-4 rounded-2xl space-y-2 mb-2">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    Saisissez vos informations réelles. Votre identifiant sera généré selon l'ordre alphabétique de votre classe.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1">Nom (Famille)</Label>
                  <Input 
                    placeholder="ex: ADEBAYO" 
                    className="h-12 bg-white/50 border-slate-200 rounded-xl uppercase"
                    value={formData.nom} 
                    onChange={e => setFormData({...formData, nom: e.target.value.toUpperCase()})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1">Prénom</Label>
                  <Input 
                    placeholder="ex: Koffi" 
                    className="h-12 bg-white/50 border-slate-200 rounded-xl"
                    value={formData.prenom} 
                    onChange={e => setFormData({...formData, prenom: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1">Sexe</Label>
                  <Select value={formData.sexe} onValueChange={(v: 'M'|'F') => setFormData({...formData, sexe: v})}>
                    <SelectTrigger className="h-12 bg-white/50 border-slate-200 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin (M)</SelectItem>
                      <SelectItem value="F">Féminin (F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1">Classe / Niveau</Label>
                  <Select value={formData.classeId} onValueChange={(v) => setFormData({...formData, classeId: v})}>
                    <SelectTrigger className="h-12 bg-white/50 border-slate-200 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-13 rounded-xl text-white font-bold shadow-lg transition-all active:scale-[0.98]">
                Continuer vers la sécurité <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleFinalize} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-black text-xl text-slate-800">Sécurisez votre compte</h3>
                <p className="text-sm text-slate-500 font-medium">Définissez vos informations de connexion.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1">Mot de passe</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    className="h-12 bg-white/50 border-slate-200 rounded-xl"
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1">Confirmer</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    className="h-12 bg-white/50 border-slate-200 rounded-xl"
                    value={formData.confirmPassword} 
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">Question de sécurité (récupération)</Label>
                <Input 
                  placeholder="Ex: Nom de votre premier animal ?" 
                  className="h-12 bg-white/50 border-slate-200 rounded-xl"
                  value={formData.secretQuestion} 
                  onChange={e => setFormData({...formData, secretQuestion: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">Réponse secrète</Label>
                <Input 
                  placeholder="Votre réponse" 
                  className="h-12 bg-white/50 border-slate-200 rounded-xl"
                  value={formData.secretAnswer} 
                  onChange={e => setFormData({...formData, secretAnswer: e.target.value})}
                  required 
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 h-13 rounded-xl font-bold" onClick={() => setStep(1)} disabled={loading}>
                  Retour
                </Button>
                <Button type="submit" className="flex-[2] bg-emerald-600 hover:bg-emerald-700 h-13 rounded-xl text-white font-bold shadow-lg" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                  Finaliser l'inscription
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-6 animate-in zoom-in duration-500">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25" />
                <div className="relative bg-emerald-600 w-20 h-20 rounded-full flex items-center justify-center shadow-xl">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-black text-slate-800">Bienvenue à bord !</h2>
                <p className="text-slate-500 font-medium mt-2 leading-relaxed">
                  Votre compte a été créé. Voici votre identifiant unique généré par le système :
                </p>
              </div>

              <div className="bg-slate-100/80 p-6 rounded-3xl border-2 border-dashed border-emerald-200 group relative">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Votre Identifiant Officiel</p>
                <p className="text-3xl font-mono font-black text-emerald-700 tracking-tighter">{generatedId}</p>
                <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-slate-400 hover:text-emerald-600" onClick={copyId}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-orange-50 p-4 rounded-2xl flex items-start gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-orange-800 font-medium">
                  <strong>Important :</strong> Notez bien cet identifiant. Il est nécessaire pour toutes vos futures connexions et correspond à votre rang alphabétique en classe.
                </p>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-white font-bold shadow-lg gap-2 text-lg" onClick={() => router.push('/login')}>
                Se connecter maintenant <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-slate-50/80 border-t p-4 flex justify-center items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Génération Identité Sécurisée</span>
          </div>
        </CardFooter>
      </Card>

      <div className="absolute bottom-8 left-0 right-0 z-20 text-center">
        <p className="text-white/50 text-[10px] font-medium flex items-center justify-center gap-2">
          <ShieldCheck className="w-3 h-3" /> Système EduTrack Pro • République du Bénin
        </p>
      </div>
    </div>
  );
}
