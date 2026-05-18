
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, UserCheck, Sparkles, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
    photoUrl: 'https://picsum.photos/seed/new/200/200',
    secretQuestion: ''
  });
  const { toast } = useToast();
  const router = useRouter();

  const bgImage = imagesData.placeholderImages.find(img => img.id === 'activation-bg');

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const result = verifyActivation(formData.tokenId, formData.birthDate, formData.parentPhone);
      if (result.success) {
        setStep(2);
        toast({ title: "Succès", description: "Identité vérifiée. Passons à la configuration." });
      } else {
        toast({ variant: "destructive", title: "Erreur", description: result.message });
      }
      setLoading(false);
    }, 1000);
  };

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      completeActivation(formData.tokenId, {
        email: formData.email,
        photoUrl: formData.photoUrl,
        secretQuestion: formData.secretQuestion
      });
      setStep(3);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image Optimized */}
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={bgImage.imageHint}
        />
      )}
      
      <div className="absolute inset-0 bg-emerald-900/70 backdrop-blur-sm" />
      
      <Card className="w-full max-w-lg relative z-10 border-none shadow-2xl overflow-hidden rounded-[1.5rem]">
        <div className="h-2 bg-accent" />
        <CardHeader className="text-center">
          <div className="mx-auto bg-emerald-100 p-3 rounded-2xl w-fit mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-deep" />
          </div>
          <CardTitle className="text-2xl font-bold">Activation EduTrack Pro</CardTitle>
          <CardDescription>Espace Élève & Parent Sécurisé</CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-lg flex gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-800">Utilisez l'identifiant EDP-2026 fourni par votre établissement sur votre fiche d'inscription.</p>
              </div>
              <div className="space-y-2">
                <Label>Identifiant Scolaire Unique</Label>
                <Input 
                  placeholder="EDP-2026-3A-001" 
                  value={formData.tokenId} 
                  onChange={e => setFormData({...formData, tokenId: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de naissance</Label>
                  <Input 
                    type="date" 
                    value={formData.birthDate} 
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Numéro Parent</Label>
                  <Input 
                    placeholder="Numéro enregistré" 
                    value={formData.parentPhone} 
                    onChange={e => setFormData({...formData, parentPhone: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nouveau mot de passe</Label>
                <Input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required 
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-deep" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
                Vérifier mon identité
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleFinalize} className="space-y-4">
              <div className="text-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-bold text-lg">Identité Confirmée !</h3>
                <p className="text-sm text-muted-foreground">Complétez votre profil pour terminer.</p>
              </div>
              <div className="space-y-2">
                <Label>Adresse Email (pour la récupération)</Label>
                <Input 
                  type="email" 
                  placeholder="eleve@email.com" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Question secrète de sécurité</Label>
                <Input 
                  placeholder="Nom de votre premier animal ?" 
                  value={formData.secretQuestion} 
                  onChange={e => setFormData({...formData, secretQuestion: e.target.value})}
                  required 
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-deep" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Finaliser l'activation
              </Button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-8 space-y-6">
              <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">Compte Activé !</h2>
                <p className="text-muted-foreground mt-2">Bienvenue sur EduTrack Pro. Votre espace est maintenant prêt.</p>
              </div>
              <Button className="w-full bg-emerald-deep" onClick={() => router.push('/login')}>
                Aller vers la connexion <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-slate-50 border-t p-4 justify-center">
          <p className="text-[10px] text-muted-foreground">© 2024 EduTrack Pro - Système d'Activation Sécurisé</p>
        </CardFooter>
      </Card>
    </div>
  );
}
