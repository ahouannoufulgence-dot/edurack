
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ALL_CLASSES, SUBJECTS, CoefficientEntry } from "@/lib/school-types";
import { getFromStorage, saveToStorage, getCoefficient } from "@/lib/data-service";
import { Save, RotateCcw, Settings2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const STORAGE_KEY = 'edutrack_coeffs';

export function CoefficientConfig() {
  const [coeffs, setCoeffs] = useState<CoefficientEntry[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(ALL_CLASSES[0]);
  const { toast } = useToast();

  useEffect(() => {
    setCoeffs(getFromStorage<CoefficientEntry>(STORAGE_KEY));
  }, []);

  const handleSave = () => {
    saveToStorage(STORAGE_KEY, coeffs);
    toast({ 
      title: "Coefficients mis à jour", 
      description: "Les modifications ont été appliquées au système de calcul des moyennes." 
    });
  };

  const handleReset = () => {
    if (confirm("Voulez-vous restaurer les coefficients standards béninois pour cette classe ?")) {
      const filtered = coeffs.filter(c => c.classLevel !== selectedClass);
      setCoeffs(filtered);
      saveToStorage(STORAGE_KEY, filtered);
      toast({ title: "Réinitialisé", description: "Paramètres par défaut restaurés." });
    }
  };

  const updateCoeff = (subjectId: string, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num) && val !== "") return;
    
    setCoeffs(prev => {
      const otherCoeffs = prev.filter(c => !(c.classLevel === selectedClass && c.subjectId === subjectId));
      if (val === "") return otherCoeffs;
      return [...otherCoeffs, { classLevel: selectedClass, subjectId, value: num }];
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings2 className="w-8 h-8 text-emerald-700" />
            Paramétrage des Coefficients
          </h2>
          <p className="text-muted-foreground">Définissez la pondération des matières selon les séries et niveaux.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2 rounded-xl">
            <RotateCcw className="w-4 h-4" /> Défaut
          </Button>
          <Button onClick={handleSave} className="gap-2 bg-emerald-700 hover:bg-emerald-800 rounded-xl px-8 shadow-lg">
            <Save className="w-4 h-4" /> Appliquer les changements
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 border-none shadow-md h-fit">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-700">Sélection Classe</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full bg-slate-50 border-none h-12 rounded-xl">
                <SelectValue placeholder="Choisir une classe" />
              </SelectTrigger>
              <SelectContent>
                {ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[10px] text-blue-700 font-bold uppercase mb-2 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Info Système
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">
                Les coefficients modifiés ici impactent immédiatement le calcul des moyennes trimestrielles et les bulletins.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6 py-4">Matière</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="w-40 text-center">Coefficient Actuel</TableHead>
                  <TableHead className="text-right pr-6">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SUBJECTS.map((subject) => {
                  const currentValue = getCoefficient(selectedClass, subject.id);
                  const isCustom = coeffs.some(c => c.classLevel === selectedClass && c.subjectId === subject.id);
                  
                  return (
                    <TableRow key={subject.id} className="hover:bg-slate-50/50">
                      <TableCell className="pl-6 font-bold text-slate-800">{subject.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-[10px] uppercase">{subject.category}</Badge>
                      </TableCell>
                      <TableCell className="flex justify-center py-3">
                        <Input 
                          type="number" 
                          value={currentValue} 
                          onChange={(e) => updateCoeff(subject.id, e.target.value)}
                          className={cn(
                            "w-20 text-center font-black h-10 rounded-xl",
                            isCustom ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "bg-white"
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {isCustom ? (
                          <Badge className="bg-emerald-600">Personnalisé</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-400">Standard</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
