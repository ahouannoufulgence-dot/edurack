"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClassLevel, ActivationToken, ALL_CLASSES } from "@/lib/school-types";
import { generateBulkTokens, getTokens, deleteToken } from "@/lib/activation";
import { ShieldCheck, Download, Printer, PlusCircle, CheckCircle, Clock, Zap, FileText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function TokenGenerator() {
  const [tokens, setTokens] = useState<ActivationToken[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('3e 1');
  const [count, setCount] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    setTokens(getTokens());
  }, []);

  const refreshTokens = () => {
    setTokens(getTokens());
  };

  const handleGenerate = () => {
    generateBulkTokens(selectedClass, count);
    refreshTokens();
    toast({
      title: "Codes générés",
      description: `${count} nouveaux identifiants créés pour la classe ${selectedClass}.`
    });
  };

  const handleDelete = (id: string) => {
    deleteToken(id);
    refreshTokens();
    toast({
      variant: "destructive",
      title: "Identifiant supprimé",
      description: `Le code ${id} a été retiré du système.`
    });
  };

  const handleDownloadWord = () => {
    const classTokens = tokens.filter(t => t.classLevel === selectedClass);
    if (classTokens.length === 0) {
      toast({ variant: "destructive", title: "Erreur", description: "Aucun identifiant à exporter pour cette classe." });
      return;
    }

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export Word EduTrack</title>
      <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
        th, td { border: 1px solid black; padding: 10px; text-align: left; }
        th { background-color: #1A6B4A; color: white; font-weight: bold; }
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
          <tr>
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
    `;

    const source = header + tableHtml + footer;
    const blob = new Blob(['\ufeff', source], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Identifiants_${selectedClass.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({ title: "Export Word réussi", description: "Le fichier .doc a été téléchargé." });
  };

  const currentClassTokens = tokens.filter(t => t.classLevel === selectedClass);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-emerald-100">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-600 fill-emerald-600" />
            Provisionnement des Identifiants
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">Générez et gérez les codes d'accès uniques pour vos élèves.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button 
            onClick={handleDownloadWord} 
            className="flex-1 md:flex-none gap-2 h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 font-bold shadow-lg text-white"
          >
            <FileText className="w-4 h-4" /> Télécharger (Word)
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none gap-2 h-12 rounded-xl font-bold border-emerald-200 text-emerald-700">
            <Printer className="w-4 h-4" /> Imprimer
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-md bg-emerald-50/50">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-end gap-4 md:gap-6">
            <div className="space-y-2 w-full sm:w-48">
              <label className="text-[10px] font-black uppercase text-slate-500">Classe cible</label>
              <Select value={selectedClass} onValueChange={v => setSelectedClass(v as ClassLevel)}>
                <SelectTrigger className="w-full bg-white h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CLASSES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 w-full sm:w-32">
              <label className="text-[10px] font-black uppercase text-slate-500">Quantité</label>
              <Input 
                type="number" 
                value={count} 
                onChange={e => setCount(parseInt(e.target.value))} 
                className="w-full bg-white h-11 rounded-xl"
                min={1} max={100}
              />
            </div>
            <Button onClick={handleGenerate} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 gap-2 h-11 px-8 rounded-xl shadow-lg font-bold">
              <PlusCircle className="w-4 h-4" /> Générer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl overflow-hidden bg-white">
        <CardHeader className="border-b p-4 md:p-6 bg-slate-50/50">
          <CardTitle className="text-base md:text-lg">Registre des Codes - {selectedClass}</CardTitle>
          <CardDescription className="text-xs">Identifiants disponibles ou activés pour cette classe. Supprimez les codes inutilisés si besoin.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white">
                <TableRow>
                  <TableHead className="pl-6 py-4">ID de Connexion</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentClassTokens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic text-xs">
                      Aucun identifiant pour la classe {selectedClass}.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentClassTokens.map((token) => (
                    <TableRow key={token.id} className="hover:bg-emerald-50/20 transition-colors">
                      <TableCell className="pl-6 font-mono font-bold text-emerald-700 text-xs">{token.id}</TableCell>
                      <TableCell className="font-bold text-xs">{token.studentName}</TableCell>
                      <TableCell>
                        {token.status === 'activated' ? (
                          <Badge className="bg-emerald-600 gap-1 rounded-full text-[9px]"><CheckCircle className="w-2 h-2" /> Activé</Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 rounded-full text-[9px] font-bold"><Clock className="w-2 h-2" /> Libre</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-3xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'identifiant ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action supprimera définitivement le code <b>{token.id}</b>. 
                                {token.status === 'activated' && " Attention : cet identifiant est déjà rattaché à un compte élève."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(token.id)} className="bg-red-600 hover:bg-red-700 rounded-xl">
                                Confirmer la suppression
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
