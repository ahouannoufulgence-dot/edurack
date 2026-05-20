
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClassLevel, ActivationToken, ALL_CLASSES } from "@/lib/school-types";
import { generateBulkTokens, getTokens } from "@/lib/activation";
import { ShieldCheck, Download, Printer, PlusCircle, CheckCircle, Clock, Zap, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function TokenGenerator() {
  const [tokens, setTokens] = useState<ActivationToken[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('3e 1');
  const [count, setCount] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    setTokens(getTokens());
  }, []);

  const handleGenerate = () => {
    generateBulkTokens(selectedClass, count);
    setTokens(getTokens());
    toast({
      title: "Identifiants générés",
      description: `${count} identifiants élèves créés pour la classe ${selectedClass}.`
    });
  };

  const handleDownloadWord = () => {
    const classTokens = tokens.filter(t => t.classLevel === selectedClass);
    if (classTokens.length === 0) {
      toast({ variant: "destructive", title: "Erreur", description: "Aucun identifiant à exporter pour cette classe." });
      return;
    }

    // Génération du contenu HTML pour Word
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export Word EduTrack</title>
      <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
        th, td { border: 1px solid black; padding: 10px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        h1 { color: #1A6B4A; text-align: center; font-size: 24pt; }
        .class-info { margin-bottom: 20px; font-size: 14pt; }
      </style>
      </head><body>`;
    const footer = "</body></html>";
    
    const tableHtml = `
      <h1>EDUTRACK PRO - LISTE D'ACTIVATION</h1>
      <div class="class-info">
        <p><b>ÉTABLISSEMENT :</b> EduTrack Academy</p>
        <p><b>CLASSE :</b> ${selectedClass}</p>
        <p><b>DATE DE GÉNÉRATION :</b> ${new Date().toLocaleDateString('fr-BJ')}</p>
      </div>
      <table>
        <thead>
          <tr style="background-color: #1A6B4A; color: white;">
            <th>ID DE CONNEXION</th>
            <th>NOM DE L'ÉLÈVE (À COMPLÉTER)</th>
            <th>STATUT</th>
          </tr>
        </thead>
        <tbody>
          ${classTokens.map(t => `
            <tr>
              <td><b>${t.id}</b></td>
              <td>${t.studentName === 'Libre - Prêt pour activation' ? '____________________' : t.studentName}</td>
              <td>${t.status === 'activated' ? 'DÉJÀ ACTIVÉ' : 'DISPONIBLE'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="font-size: 10pt; font-style: italic; margin-top: 30px; text-align: center;">
        Ce document contient des informations confidentielles. Remettez chaque code individuellement aux parents.
      </p>
    `;

    const source = header + tableHtml + footer;
    const blob = new Blob(['\ufeff', source], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Identifiants_EduTrack_${selectedClass.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({ title: "Export Word réussi", description: "Le fichier .doc a été téléchargé." });
  };

  const currentClassTokens = tokens.filter(t => t.classLevel === selectedClass);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-600 fill-emerald-600" />
            Provisionnement des Identifiants
          </h2>
          <p className="text-sm text-muted-foreground">Gérez les codes d'accès uniques pour vos élèves.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleDownloadWord} 
            variant="outline" 
            className="gap-2 h-11 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold"
          >
            <FileText className="w-4 h-4" /> Télécharger (Word)
          </Button>
          <Button variant="outline" className="gap-2 h-11 rounded-xl font-bold">
            <Printer className="w-4 h-4" /> Imprimer
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-md bg-emerald-50/50">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500">Classe cible</label>
              <Select value={selectedClass} onValueChange={v => setSelectedClass(v as ClassLevel)}>
                <SelectTrigger className="w-48 bg-white h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CLASSES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500">Nombre de codes</label>
              <Input 
                type="number" 
                value={count} 
                onChange={e => setCount(parseInt(e.target.value))} 
                className="w-32 bg-white h-11 rounded-xl"
                min={1} max={100}
              />
            </div>
            <Button onClick={handleGenerate} className="bg-emerald-600 hover:bg-emerald-700 gap-2 h-11 px-8 rounded-xl shadow-lg font-bold">
              <PlusCircle className="w-4 h-4" /> Générer les codes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="bg-white border-b">
          <CardTitle className="text-lg">Registre des Codes - {selectedClass}</CardTitle>
          <CardDescription>Liste exhaustive des identifiants générés pour cette classe.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="pl-6 py-4">Identifiant de Connexion</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right pr-6">Date d'Activation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentClassTokens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">
                      Aucun code n'a encore été généré pour la classe {selectedClass}.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentClassTokens.map((token) => (
                    <TableRow key={token.id} className="hover:bg-emerald-50/20 transition-colors">
                      <TableCell className="pl-6 font-mono font-black text-emerald-700 text-lg tracking-wider">{token.id}</TableCell>
                      <TableCell className="font-bold text-slate-700">{token.studentName}</TableCell>
                      <TableCell>
                        {token.status === 'activated' ? (
                          <Badge className="bg-emerald-600 gap-1 rounded-full"><CheckCircle className="w-3 h-3" /> Activé</Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 rounded-full bg-slate-200 text-slate-500 font-bold"><Clock className="w-3 h-3" /> Disponible</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6 text-xs text-muted-foreground">
                        {token.activatedAt ? new Date(token.activatedAt).toLocaleDateString('fr-BJ', { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
