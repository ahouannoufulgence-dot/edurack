
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClassLevel, ActivationToken, ALL_CLASSES } from "@/lib/school-types";
import { generateBulkTokens, getTokens, deleteToken } from "@/lib/activation";
import { Printer, PlusCircle, CheckCircle, Clock, Zap, FileText, Trash2 } from "lucide-react";
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
      title: "Identifiants générés",
      description: `${count} codes créés pour la classe ${selectedClass}.`
    });
  };

  const handleDeleteToken = (id: string) => {
    deleteToken(id);
    refreshTokens();
    toast({
      variant: "destructive",
      title: "Supprimé",
      description: `L'identifiant ${id} a été retiré.`
    });
  };

  const handleDownloadWord = () => {
    const classTokens = tokens.filter(t => t.classLevel === selectedClass);
    if (classTokens.length === 0) {
      toast({ variant: "destructive", title: "Erreur", description: "Aucun identifiant pour cette classe." });
      return;
    }

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>EduTrack Pro - Identifiants</title>
      <style>
        table { border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        th, td { border: 1px solid #1A6B4A; padding: 12px; text-align: left; }
        th { background-color: #1A6B4A; color: white; }
        h1 { color: #1A6B4A; text-align: center; }
      </style>
      </head><body>`;
    
    const tableHtml = `
      <h1>LISTE D'ACTIVATION - CLASSE ${selectedClass}</h1>
      <table>
        <thead>
          <tr>
            <th>IDENTIFIANT UNIQUE</th>
            <th>NOM DE L'ÉLÈVE (À REMPLIR)</th>
            <th>STATUT</th>
          </tr>
        </thead>
        <tbody>
          ${classTokens.map(t => `
            <tr>
              <td><b>${t.id}</b></td>
              <td>${t.studentName === 'Libre - Prêt pour activation' ? '____________________' : t.studentName}</td>
              <td>${t.status === 'activated' ? 'ACTIVÉ' : 'DISPONIBLE'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const source = header + tableHtml + "</body></html>";
    const blob = new Blob(['\ufeff', source], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Identifiants_${selectedClass.replace(/\s+/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Succès", description: "Fichier Word généré." });
  };

  const currentClassTokens = tokens.filter(t => t.classLevel === selectedClass);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-emerald-100">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-600 fill-emerald-600" />
            Inscriptions & Identifiants
          </h2>
          <p className="text-xs text-muted-foreground">Gérez les codes de première connexion.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button 
            onClick={handleDownloadWord} 
            className="flex-1 md:flex-none gap-2 h-12 rounded-xl bg-emerald-800 hover:bg-emerald-900 font-bold shadow-lg text-white"
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
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="space-y-2 w-full sm:w-48">
              <label className="text-[10px] font-black uppercase text-slate-500">Classe cible</label>
              <Select value={selectedClass} onValueChange={v => setSelectedClass(v as ClassLevel)}>
                <SelectTrigger className="w-full bg-white h-11 rounded-xl shadow-sm border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 w-full sm:w-32">
              <label className="text-[10px] font-black uppercase text-slate-500">Quantité</label>
              <Input 
                type="number" 
                value={count} 
                onChange={e => setCount(parseInt(e.target.value))} 
                className="w-full bg-white h-11 rounded-xl shadow-sm border-none"
                min={1} max={100}
              />
            </div>
            <Button onClick={handleGenerate} className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 gap-2 h-11 px-8 rounded-xl shadow-lg font-bold">
              <PlusCircle className="w-4 h-4" /> Générer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="text-lg">Registre des Codes - {selectedClass}</CardTitle>
          <CardDescription className="text-xs">Identifiants à remettre aux élèves pour leur activation.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 py-4">ID de Connexion</TableHead>
                  <TableHead>Propriétaire</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentClassTokens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic text-xs">
                      Aucun identifiant disponible.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentClassTokens.map((token) => (
                    <TableRow key={token.id} className="hover:bg-emerald-50/20">
                      <TableCell className="pl-6 font-mono font-bold text-emerald-700 text-xs">{token.id}</TableCell>
                      <TableCell className="font-bold text-xs">{token.studentName}</TableCell>
                      <TableCell>
                        {token.status === 'activated' ? (
                          <Badge className="bg-emerald-600 gap-1 rounded-full text-[9px] px-3"><CheckCircle className="w-2 h-2" /> Activé</Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 rounded-full text-[9px] font-bold px-3"><Clock className="w-2 h-2" /> Prêt</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-black">Supprimer l'identifiant ?</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-500 py-2">
                                Êtes-vous sûr de vouloir supprimer définitivement le code <b>{token.id}</b> ? 
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                              <AlertDialogCancel className="rounded-xl h-11">Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteToken(token.id)} className="bg-red-600 hover:bg-red-700 rounded-xl h-11 text-white">
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
