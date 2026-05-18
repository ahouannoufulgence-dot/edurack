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
  Key,
  Lock,
  Copy,
  UserCog,
  BookOpen,
  ShieldCheck
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { verifyActivation, completeActivation } from '@/lib/activation';
import { registerUser } from '@/lib/data-service';
import { useToast } from '@/hooks/use-toast';
import imagesData from '@/app/lib/placeholder-images.json';
import { cn } from "@/lib/utils";

export default function RegistrationPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [activationToken, setActivationToken] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    tokenId: '',
    role: 'Eleve' as 'Eleve' | 'Enseignant' | 'Directeur',
    nom: '',
    prenom: '',
    sexe: 'M' as 'M' | 'F',
    password: '',
    confirmPassword: '',
    secretQuestion: '',
    secretAnswer: '',
    subjectId: 'math'
  });
  
  const { toast } = useToast();
  const router = useRouter();
  const bgImage = imagesData.placeholderImages.find(img => img.id === 'login-bg');

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === 'Eleve') {
      const result = verifyActivation(formData.tokenId);
      if (result.success) {
        setActivationToken(result.token);
        setStep(2);
      } else {
        toast({ variant: "destructive", title: "Erreur", description: result.message });
      }
    } else {
      // Pour les profs/directeurs, on passe directement à l'étape identité
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
        let finalId = '';
        if (formData.role === 'Eleve') {
          finalId = completeActivation(formData.tokenId, {
            nom: formData.nom,
            prenom: formData.prenom,
            sexe: formData.sexe,
            password: formData.password,
            secretQuestion: formData.secretQuestion,
            secretAnswer: formData.secretAnswer
          });
        } else {
          finalId = registerUser({
            role: formData.role,
            nom: formData.nom,
            prenom: formData.prenom,
            sexe: formData.sexe,
            subjectId: formData.role === 'Enseignant' ? formData.subjectId : undefined,
            password: formData.password,
            secretQuestion: formData.secretQuestion,
            secretAnswer: formData.secretAnswer
          });
        }
        
        setGeneratedId(finalId);
        setStep(3);
        toast({ title: "Activation réussie", description: "Votre compte est désormais opérationnel." });
      } catch (error) {
        toast({ variant: "destructive", title: "Erreur", description: "Échec de la création du compte." });
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const copyId = () => {
    navigator.clipboard.writeText(generatedId);
    toast({ title: "Copié !", description: "Identifiant copié." });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 z-0">
        {bgImage && (
          <div className="relative w-full h-full">
            <Image src={bgImage.imageUrl} alt="" fill className="object-cover opacity-40 animate-zoom-slow" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </div>
        )}
      </div>

      <Card className="w-full max-w-[500px] border-none shadow-2xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="h-2 bg-emerald-600 w-full" />
        
        <CardHeader className="text-center pt-8">
          <div className="mx-auto w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            {formData.role === 'Eleve' ? <GraduationCap className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />}
          </div>
          <CardTitle className="text-2xl font-black text-slate-800">Activation de Compte</CardTitle>
          <CardDescription>Étape {step} sur 3 • Suivez les instructions</CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {step === 1 && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-3">
                <Label className="font-bold">Je suis un...</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Eleve', label: 'Élève', icon: GraduationCap },
                    { id: 'Enseignant', label: 'Prof.', icon: BookOpen },
                    { id: 'Directeur', label: 'Dir.', icon: UserCog }
                  ].map((r) => (
                    <button
                      key={r.id} type="button"
                      onClick={() => setFormData({...formData, role: r.id as any})}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-2xl border-2 transition-all",
                        formData.role === r.id ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-100 text-slate-400"
                      )}
                    >
                      <r.icon className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold uppercase">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.role === 'Eleve' ? (
                <div className="space-y-2">
                  <Label className="font-bold">Code d'activation (fourni par l'école)</Label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="EDP-2025-XXXX-XXX" 
                      className="h-12 pl-12 uppercase font-mono"
                      value={formData.tokenId} 
                      onChange={e => setFormData({...formData, tokenId: e.target.value})}
                      required 
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Exemple: EDP-2025-6E1-001</p>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-xs text-blue-700 font-medium leading-relaxed">
                    Les personnels administratifs et enseignants peuvent s'inscrire directement. Leurs identifiants seront générés automatiquement.
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full bg-emerald-600 h-12 rounded-xl font-bold shadow-lg gap-2">
                Continuer <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleFinalize} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="font-bold">Nom</Label>
                  <Input value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value.toUpperCase()})} required className="uppercase" />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold">Prénom</Label>
                  <Input value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="font-bold">Sexe</Label>
                  <Select value={formData.sexe} onValueChange={(v: any) => setFormData({...formData, sexe: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role === 'Enseignant' && (
                  <div className="space-y-1">
                    <Label className="font-bold">Matière</Label>
                    <Select value={formData.subjectId} onValueChange={v => setFormData({...formData, subjectId: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">Mathématiques</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="pc">Physique-Chimie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="font-bold">Mot de passe</Label>
                  <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold">Confirmation</Label>
                  <Input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="font-bold">Question secrète (Récupération)</Label>
                <Input placeholder="Ex: Mon premier animal ?" value={formData.secretQuestion} onChange={e => setFormData({...formData, secretQuestion: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <Label className="font-bold">Réponse</Label>
                <Input value={formData.secretAnswer} onChange={e => setFormData({...formData, secretAnswer: e.target.value})} required />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="flex-1">Retour</Button>
                <Button type="submit" className="flex-[2] bg-emerald-600 font-bold" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer mon compte"}
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-6">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">Bienvenue dans EduTrack Pro !</h2>
                <p className="text-sm text-slate-500 mt-2">Votre identifiant de connexion est prêt :</p>
              </div>
              <div className="bg-slate-100 p-6 rounded-3xl border-2 border-dashed border-emerald-200 group relative">
                <p className="text-3xl font-mono font-black text-emerald-700">{generatedId}</p>
                <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={copyId}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Button className="w-full bg-slate-900 h-12 rounded-xl font-bold" onClick={() => router.push('/login')}>
                Se connecter maintenant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
