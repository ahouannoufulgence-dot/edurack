
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Eye, EyeOff, Smartphone, Mail, Loader2, Sparkles } from "lucide-react";
import { useRouter } from 'next/navigation';
import { createAuditLog } from '@/lib/audit';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulation de connexion
    setTimeout(() => {
      createAuditLog('user_123', 'Directeur', 'LOGIN', 'Connexion réussie via interface web');
      router.push('/');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-emerald-deep p-3 rounded-2xl w-fit mb-4">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">EduTrack Pro</CardTitle>
          <CardDescription>Système de Gestion Scolaire Sécurisé</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="email" className="gap-2"><Mail className="w-4 h-4" /> Email</TabsTrigger>
              <TabsTrigger value="phone" className="gap-2"><Smartphone className="w-4 h-4" /> Téléphone</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Identifiant ou Email</Label>
                  <Input id="email" placeholder="directeur@ecole.bj" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Button variant="link" className="px-0 text-xs text-emerald-deep h-auto">Mot de passe oublié ?</Button>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      required 
                      className="pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-emerald-deep transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-emerald-deep" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Se connecter
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone (Bénin)</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center bg-secondary px-3 rounded-md text-sm font-bold">+229</div>
                    <Input id="phone" type="tel" placeholder="00 00 00 00" required className="flex-1" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-emerald-deep" disabled={loading}>
                  Recevoir le code OTP
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground mb-4">Nouvel élève ?</p>
            <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => router.push('/activate')}>
              <Sparkles className="w-4 h-4 mr-2" /> Activer mon compte scolaire
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground">
          <p>© 2024 EduTrack Pro - Système Anti-Fraude Actif</p>
          <p>Toute tentative d'accès non autorisé est enregistrée.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
