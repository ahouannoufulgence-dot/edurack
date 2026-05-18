
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShieldCheck, UserPlus, BrainCircuit, Key, Lock, History } from "lucide-react";

export function UserGuide() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-emerald-deep" />
          Guide EduTrack Pro
        </h2>
        <p className="text-muted-foreground">Comprendre le fonctionnement du système intégré.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Key className="w-5 h-5" /> Accès & Identité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">
              EduTrack Pro utilise un système d'identifiants préfixés pour une sécurité maximale :
            </p>
            <ul className="text-xs space-y-2">
              <li className="flex gap-2"><strong>DIR-xxx :</strong> Directeur (Contrôle Total)</li>
              <li className="flex gap-2"><strong>ENS-xxx :</strong> Enseignant (Gestion des classes/matières)</li>
              <li className="flex gap-2"><strong>ELV-xxx :</strong> Élève (Consultation des résultats)</li>
              <li className="flex gap-2"><strong>PAR-xxx :</strong> Parent (Suivi de l'enfant)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <UserPlus className="w-5 h-5" /> Inscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              L'école ne crée pas les comptes. Elle distribue des <strong>Jetons d'Activation</strong>. 
              L'élève doit "Activer son compte" sur la page d'accueil avec son jeton, sa date de naissance et le numéro de téléphone de son parent.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Détails des Modules</CardTitle>
          <CardDescription>Comment utiliser les fonctionnalités clés</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="hover:text-emerald-deep">
                <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Protection des Notes</div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Toute note saisie est modifiable tant qu'elle est en "Brouillon". Une fois "Validée", elle est verrouillée. 
                Seul le Directeur peut déverrouiller une note pour modification. Chaque changement est enregistré dans le journal d'audit.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="hover:text-emerald-deep">
                <div className="flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> Analyse IA</div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                L'analyste IA examine les moyennes par matière, la conduite et le rang. Il génère un rapport de remédiation 
                qui propose des conseils spécifiques pour améliorer les résultats, par exemple en suggérant des méthodes d'étude 
                particulières pour les matières scientifiques.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="hover:text-emerald-deep">
                <div className="flex items-center gap-2"><History className="w-4 h-4" /> Anti-Fraude & Audit</div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Le système surveille les comportements suspects (ex: 3 échecs de connexion, modification massive de notes en peu de temps). 
                Le Directeur reçoit des alertes et peut consulter l'historique complet "Qui a fait quoi et quand".
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
