"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClassLevel, ActivationToken, ALL_CLASSES } from "@/lib/school-types";
import { generateBulkTokens, getTokens, deleteToken } from "@/lib/activation";
import { FileText, PlusCircle, CheckCircle, Clock, Trash2, ShieldAlert } from "lucide-react";
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

  const handleGenerate = () => {
    generateBulkTokens(selectedClass, count);
    setTokens(getTokens());
    toast({ title: "Codes générés", description: `${count} identifiants sécurisés créés pour la ${selectedClass}.` });
  };

  const handleDelete = (id: string) => {
    deleteToken(id);
    setTokens(getTokens());
    toast({ title: "Code supprimé", description: "L'identifiant a été invalidé avec succès." });
  };

  const handleDownloadWord = () => {
    const classTokens = tokens.filter(t => t.classLevel === selectedClass);
    if (classTokens.length === 0) {
      toast({ variant: "destructive", title: "Aucune donnée", description: "Veuillez d'abord générer des codes pour cette classe." });
      return;
    }

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>EduTrack Pro - Liste d'Activation</title>
      <style>
        table { border-collapse: collapse; width: 100%; font-family: 'Segoe UI', sans-serif; }
        th, td { border: 1px solid #1A6B4A; padding: 12px; text-align: left; }
        th { background-color: #1A6B4A; color: white; text-transform: uppercase; font-size: 12px; }
        .title { text-align: center; color: #1A6B4A; margin-bottom: 20px; }
      </style>
      </head><body>
      <div class="title">
        <h1>ÉCOLE VISION EXCELLENCE</h1>
        <h2>LISTE D'ACTIVATION DES COMPTES - CLASSE ${selectedClass}</h2>
      </div>
      <table>
        <thead><tr><th>CODE D'ACTIVATION</th><th>NOM DE L'ÉLÈVE</th><th>STATUT</th></tr></thead>
        <tbody>
          ${classTokens.map(t => `<tr><td style="font-family: monospace; font-weight: bold; font-size: 14px;">${t.id}</td><td>___________________________</td><td>${t.status === 'activated' ? 'DÉJÀ ACTIVÉ' : 'À REMETTRE'}</td></tr>`).join('')}
        </tbody>
      </table>
      <p style="margin-top: 30px; font-style: italic; font-size: 10px;">Document généré par EduTrack Pro - Système Anti-Fraude</p>
      </body></html>`;
    
    const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Identifiants_${selectedClass.replace(/\s+/g, '_')}_EduTrack.doc`;
    link.click();
    toast({ title: "Export Word réussi", description: "La liste est prête à être imprimée." });
  };

  const filtered = tokens.filter(t => t.classLevel === selectedClass);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-100">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-emerald-900">
            <PlusCircle className="w-7 h-7" /> Gestion des Inscriptions
          </h2>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Identifiants de Première Connexion</p>
        </div>
        <Button onClick={handleDownloadWord} className="bg-emerald-800 hover:bg-emerald-900 h-11 rounded-xl font-bold gap-2 w-full sm:w-auto text-white shadow-lg">
          <FileText className="w-4 h-4" /> Télécharger (Word)
        </Button>
      </div>

      <Card className="border-none shadow-md bg-emerald-50/50 rounded-[2rem]">
        <CardContent className="p-6 flex flex-col md:flex-row items-end gap-4">
          <div className="space-y-2 flex-1 w-full">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Classe Cible</label>
            <Select value={selectedClass} onValueChange={v => setSelectedClass(v as ClassLevel)}>
              <SelectTrigger className="bg-white h-11 rounded-xl border-emerald-100"><SelectValue /></SelectTrigger>
              <SelectContent>{ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2 w-full md:w-32">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Quantité</label>
            <Input type="number" value={count} onChange={e => setCount(parseInt(e.target.value))} className="bg-white h-11 rounded-xl border-emerald-100" />
          </div>
          <Button onClick={handleGenerate} className="bg-emerald-700 hover:bg-emerald-800 h-11 px-8 rounded-xl font-bold w-full md:w-auto shadow-lg text-white">
            Générer les Codes
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl overflow-hidden bg-white rounded-[2.5rem]">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-8">Code de Sécurité</TableHead>
              <TableHead>Propriétaire</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right pr-8">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">
                  Aucun code généré pour cette classe.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(token => (
                <TableRow key={token.id} className="hover:bg-emerald-50/20 group">
                  <TableCell className="pl-8 font-mono font-bold text-emerald-700 text-sm">{token.id}</TableCell>
                  <TableCell className="font-bold text-xs text-slate-600">{token.studentName}</TableCell>
                  <TableCell>
                    {token.status === 'activated' ? (
                      <Badge className="bg-emerald-600 text-white gap-1 px-3 border-none">
                        <CheckCircle className="w-3 h-3" /> Activé
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 gap-1 px-3 border-none">
                        <Clock className="w-3 h-3" /> En attente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-black text-slate-800">Invalider ce code ?</AlertDialogTitle>
                          <AlertDialogDescription className="space-y-4 pt-2">
                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-3 text-red-800">
                              <ShieldAlert className="w-6 h-6 shrink-0" />
                              <p className="text-sm font-medium">
                                Êtes-vous sûr de vouloir supprimer définitivement le code <b>{token.id}</b> ? 
                                Si ce code a été imprimé, il ne fonctionnera plus pour aucune inscription.
                              </p>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2 pt-4">
                          <AlertDialogCancel className="rounded-xl h-11 border-slate-200">Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(token.id)} className="bg-red-600 hover:bg-red-700 rounded-xl h-11 text-white shadow-lg">
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
      </Card>
    </div>
  );
}
