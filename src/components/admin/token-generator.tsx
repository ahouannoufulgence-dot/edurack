
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClassLevel, ActivationToken, ALL_CLASSES } from "@/lib/school-types";
import { generateBulkTokens, getTokens } from "@/lib/activation";
import { ShieldCheck, Download, Printer, PlusCircle, Trash2, CheckCircle, Clock } from "lucide-react";
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
    const newTokens = generateBulkTokens(selectedClass, count);
    setTokens(getTokens());
    toast({
      title: "Jetons générés",
      description: `${newTokens.length} codes d'accès créés pour la classe ${selectedClass}.`
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-deep" />
            Gestion des Accès Élèves
          </h2>
          <p className="text-sm text-muted-foreground">Génération de codes d'activation pour l'inscription semi-automatique.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Printer className="w-4 h-4" /> Imprimer les fiches</Button>
          <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> Export CSV</Button>
        </div>
      </div>

      <Card className="border-emerald-100 bg-emerald-50/20">
        <CardContent className="p-6">
          <div className="flex items-end gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Classe cible</label>
              <Select value={selectedClass} onValueChange={v => setSelectedClass(v as ClassLevel)}>
                <SelectTrigger className="w-48 bg-white">
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
              <label className="text-xs font-bold uppercase text-muted-foreground">Nombre d'accès</label>
              <Input 
                type="number" 
                value={count} 
                onChange={e => setCount(parseInt(e.target.value))} 
                className="w-32 bg-white"
                min={1}
                max={100}
              />
            </div>
            <Button onClick={handleGenerate} className="bg-emerald-deep gap-2 h-10 px-6">
              <PlusCircle className="w-4 h-4" /> Générer les accès
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Derniers codes générés</CardTitle>
          <CardDescription>Liste des identifiants à distribuer aux élèves.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/20">
              <TableRow>
                <TableHead className="pl-6">Identifiant Unique</TableHead>
                <TableHead>Élève (Provisionné)</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                    Aucun code généré pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                tokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="pl-6 font-mono font-bold text-emerald-700">{token.id}</TableCell>
                    <TableCell>{token.studentName}</TableCell>
                    <TableCell><Badge variant="outline">{token.classLevel}</Badge></TableCell>
                    <TableCell>
                      {token.status === 'activated' ? (
                        <Badge className="bg-emerald-600 gap-1"><CheckCircle className="w-3 h-3" /> Activé</Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> En attente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
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
