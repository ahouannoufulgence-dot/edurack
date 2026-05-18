
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  GraduationCap,
  Activity,
  Lock,
  Copy,
  UserCog,
  BookOpen
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { ALL_CLASSES, SUBJECTS, Role } from '@/lib/school-types';
import { registerUser } from '@/lib/data-service';
import { useToast } from '@/hooks/use-toast';
import imagesData from '@/app/lib/placeholder-images.json';
import { cn } from "@/lib/utils";

export default function RegistrationPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [formData, setFormData] = useState({
    role: 'Eleve' as Role,
    nom: '',
    prenom: '',
    sexe: 'M' as 'M' | 'F',
    classeId: '3e 1',
    subjectId: 'math',
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
    
    // Délai simulé pour l'expérience utilisateur
    setTimeout(() => {
      try {
        const resultId = registerUser({
          role: formData.role,
          nom: formData.nom,
          prenom: formData.prenom,
          sexe: formData.sexe,
          classLevel: formData.role === 'Eleve' ? formData.classeId : undefined,
          subjectId: formData.role === 'Enseignant' ? formData.subjectId : undefined,
          password: formData.password,
          secretQuestion: formData.secretQuestion,
          secretAnswer: formData.secretAnswer
        });
        
        setGeneratedId(resultId);
        setStep(3);
        toast({ title: "Inscription réussie", description: "Votre compte a été créé avec succès." });
      } catch (error) {
        toast({ variant: "destructive", title: "Erreur technique", description: "Impossible de finaliser l'inscription." });
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const copyId = () => {
    navigator.clipboard.writeText(generatedId);
    toast({ title: "Copié !", description: "Identifiant copié dans le presse-papier." });
  };

  const getRoleIcon = () => {
    if (formData.role === 'Directeur') return <UserCog className="w-10 h-10 text-white" />;
    if (formData.role === 'Enseignant') return <BookOpen className="w-10 h-10 text-white" />;
    return <GraduationCap className="w-10 h-10 text-white" />;
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
          </div>
        )}
      </div>

      <Card className="w-full max-w-[550px] border-white/20 shadow-2xl bg-white/80 backdrop-blur-[16px] relative z-20 rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in duration-700">
        <div className="h-2 bg-emerald-500 w-full" />
        
        <CardHeader className="text-center pt-8">
          <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 transition-transform hover:scale-110">
            {getRoleIcon()}
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-slate-800">
            Inscription <span className="text-emerald-600">{formData.role}</span>
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Étape {step} sur 3 • Création de profil sécurisé
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">Type de compte</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Eleve', label: 'Élève', icon: GraduationCap },
                    { id: 'Enseignant', label: 'Professeur', icon: BookOpen },
                    { id: 'Directeur', label: 'Directeur', icon: UserCog }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData({...formData, role: r.id as Role})}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1",
                        formData.role === r.id 
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
                          : "bg-white/50 border-slate-100 text-slate-400 hover:border-emerald-200"
                      )}
                    >
                      <r.icon className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1">Nom</Label>
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
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.role === 'Eleve' && (
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold ml-1">Classe</Label>
                    <Select value={formData.classeId} onValueChange={(v) => setFormData({...formData, classeId: v})}>
                      <SelectTrigger className="h-12 bg-white/50 border-slate-200 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.role === 'Enseignant' && (
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold ml-1">Matière</Label>
                    <Select value={formData.subjectId} onValueChange={(v) => setFormData({...formData, subjectId: v})}>
                      <SelectTrigger className="h-12 bg-white/50 border-slate-200 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-13 rounded-xl text-white font-bold shadow-lg gap-2">
                Continuer <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleFinalize} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-black text-xl text-slate-800">Sécurité du compte</h3>
                <p className="text-sm text-slate-500 font-medium">Définissez vos identifiants de connexion.</p>
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
                  <Label className="text-slate-700 font-bold ml-1">Confirmation</Label>
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
                <Label className="text-slate-700 font-bold ml-1">Question secrète</Label>
                <Input 
                  placeholder="Ex: Nom de votre premier école ?" 
                  className="h-12 bg-white/50 border-slate-200 rounded-xl"
                  value={formData.secretQuestion} 
                  onChange={e => setFormData({...formData, secretQuestion: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-bold ml-1">Réponse</Label>
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
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Terminer l'inscription"}
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
                <h2 className="text-2xl font-black text-slate-800">Inscription Terminée !</h2>
                <p className="text-slate-500 font-medium mt-2">
                  Voici votre identifiant unique généré par le système :
                </p>
              </div>

              <div className="bg-slate-100/80 p-6 rounded-3xl border-2 border-dashed border-emerald-200 group relative">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Votre ID Officiel</p>
                <p className="text-3xl font-mono font-black text-emerald-700 tracking-tighter">{generatedId}</p>
                <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-slate-400 hover:text-emerald-600" onClick={copyId}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <Button className="w-full bg-slate-900 hover:bg-black h-14 rounded-2xl text-white font-bold shadow-lg gap-2 text-lg" onClick={() => router.push('/login')}>
                Se connecter <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-slate-50/80 border-t p-4 flex justify-center items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Système d'Identité Dynamique v2</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
