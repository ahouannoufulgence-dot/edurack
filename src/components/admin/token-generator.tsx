
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClassLevel, ActivationToken, ALL_CLASSES } from "@/lib/school-types";
import { generateBulkTokens, getTokens } from "@/lib/activation";
import { ShieldCheck, Download, Printer, PlusCircle, CheckCircle, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function TokenGenerator() {
  const [tokens, setTokens] = useState<ActivationToken[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('3e 1');
  const [count, setCount] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
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

  const handleDownloadList = async () => {
    const classTokens = tokens.filter(t => t.classLevel === selectedClass);
    if (classTokens.length === 0) {
      toast({ variant: "destructive", title: "Erreur", description: "Aucun identifiant à exporter pour cette classe." });
      return;
    }

    setIsExporting(true);
    toast({ title: "Génération PDF", description: "Veuillez patienter..." });

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const element = document.createElement('div');
      element.style.padding = '40px';
      element.style.width = '800px';
      element.style.backgroundColor = 'white';
      element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1A6B4A; padding-bottom: 10px;">
          <h1 style="color: #1A6B4A; margin-bottom: 5px;">EDUTRACK PRO - LISTE D'ACTIVATION</h1>
          <p>CLASSE : <strong>${selectedClass}</strong> | DATE : ${new Date().toLocaleDateString('fr-BJ')}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #f4f7f6;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">ID DE CONNEXION</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">NOM DE L'ÉLÈVE</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">STATUT</th>
            </tr>
          </thead>
          <tbody>
            ${classTokens.map(t => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; font-family: monospace; font-weight: bold; color: #1A6B4A;">${t.id}</td>
                <td style="border: 1px solid #ddd; padding: 12px;">${t.studentName || 'Libre'}</td>
                <td style="border: 1px solid #ddd; padding: 12px;">${t.status === 'activated' ? 'Activé' : 'Disponible'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      document.body.appendChild(element);
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Liste_Activation_${selectedClass.replace(/\s+/g, '_')}.pdf`);
      document.body.removeChild(element);

      toast({ title: "Succès", description: "La liste PDF a été téléchargée." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erreur", description: "Échec de l'exportation PDF." });
    } finally {
      setIsExporting(false);
    }
  };

  const currentClassTokens = tokens.filter(t => t.classLevel === selectedClass);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-600 fill-emerald-600" />
            Provisionnement des Identifiants
          </h2>
          <p className="text-sm text-muted-foreground">Générez les identifiants à remettre aux élèves pour leur première connexion.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadList} disabled={isExporting} variant="outline" className="gap-2 h-10 rounded-xl border-emerald-200 text-emerald-700">
            <Download className="w-4 h-4" /> Télécharger PDF
          </Button>
          <Button variant="outline" className="gap-2 h-10 rounded-xl"><Printer className="w-4 h-4" /> Imprimer</Button>
        </div>
      </div>

      <Card className="border-none shadow-md bg-emerald-50/50">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-500">Classe</label>
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
              <label className="text-xs font-black uppercase text-slate-500">Nombre d'élèves</label>
              <Input 
                type="number" 
                value={count} 
                onChange={e => setCount(parseInt(e.target.value))} 
                className="w-32 bg-white h-11 rounded-xl"
                min={1} max={50}
              />
            </div>
            <Button onClick={handleGenerate} className="bg-emerald-600 hover:bg-emerald-700 gap-2 h-11 px-8 rounded-xl shadow-lg">
              <PlusCircle className="w-4 h-4" /> Générer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Liste des Identifiants - {selectedClass}</CardTitle>
          <CardDescription>Remettez ces codes aux élèves pour qu'ils activent leur dossier.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-6 py-4">Identifiant de Connexion</TableHead>
                <TableHead>Propriétaire Actuel</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right pr-6">Date d'Activation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentClassTokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                    Aucun identifiant provisionné pour cette classe.
                  </TableCell>
                </TableRow>
              ) : (
                currentClassTokens.map((token) => (
                  <TableRow key={token.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="pl-6 font-mono font-black text-emerald-700 text-lg">{token.id}</TableCell>
                    <TableCell className="font-bold text-slate-700">{token.studentName}</TableCell>
                    <TableCell>
                      {token.status === 'activated' ? (
                        <Badge className="bg-emerald-600 gap-1 rounded-full"><CheckCircle className="w-3 h-3" /> Activé</Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 rounded-full bg-slate-200"><Clock className="w-3 h-3" /> Libre</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6 text-xs text-muted-foreground">
                      {token.activatedAt ? new Date(token.activatedAt).toLocaleDateString('fr-BJ') : '--'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
