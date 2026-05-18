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
  const { toast } = useToast();

  useEffect(() => {
    setTokens(getTokens());
  }, []);

  const handleGenerate = () => {
    generateBulkTokens(selectedClass, count);
    setTokens(getTokens());
    toast({
      title: "Génération Spontanée",
      description: `${count} nouveaux codes d'accès créés pour la classe ${selectedClass}.`
    });
  };

  const currentClassTokens = tokens.filter(t => t.classLevel === selectedClass);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-600 fill-emerald-600" />
            Codes d'Accès Élèves
          </h2>
          <p className="text-sm text-muted-foreground">Générez des codes à distribuer aux élèves pour leur activation spontanée.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 h-10 rounded-xl"><Printer className="w-4 h-4" /> Imprimer</Button>
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
            <Button onClick={handleGenerate} className="bg-emerald-600 hover:bg-emerald-700 gap-2 h-11 px-8 rounded-xl shadow-lg">
              <PlusCircle className="w-4 h-4" /> Générer spontanément
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Codes pour la classe {selectedClass}</CardTitle>
          <CardDescription>Distribuez ces codes aux élèves n'ayant pas encore de compte.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-6 py-4">Code d'Activation</TableHead>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right pr-6">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentClassTokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                    Aucun code pour cette classe. Utilisez le formulaire ci-dessus.
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
                        <Badge variant="secondary" className="gap-1 rounded-full bg-slate-200"><Clock className="w-3 h-3" /> Disponible</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6 text-xs text-muted-foreground">
                      {token.activatedAt ? new Date(token.activatedAt).toLocaleDateString() : '--'}
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
