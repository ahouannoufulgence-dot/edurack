
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ALL_CLASSES, SUBJECTS, CoefficientEntry } from "@/lib/school-types";
import { getFromStorage, saveToStorage, getCoefficient } from "@/lib/data-service";
import { Save, RotateCcw, Settings2, ShieldCheck, Database, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STORAGE_KEY = 'edutrack_coeffs';

export function CoefficientConfig() {
  const [coeffs, setCoeffs] = useState<CoefficientEntry[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(ALL_CLASSES[0]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCoeffs(getFromStorage<CoefficientEntry>(STORAGE_KEY));
  }, []);

  const handleSave = () => {
    saveToStorage(STORAGE_KEY, coeffs);
    setHasUnsavedChanges(false);
    toast({ 
      title: "Configuration enregistrée", 
      description: "Les coefficients sont maintenant verrouillés dans la base de données de l'établissement." 
    });
  };

  const handleReset = () => {
    if (confirm("Voulez-vous restaurer les coefficients standards béninois pour cette classe ?")) {
      const filtered = coeffs.filter(c => c.classLevel !== selectedClass);
      setCoeffs(filtered);
      saveToStorage(STORAGE_KEY, filtered);
      setHasUnsavedChanges(false);
      toast({ title: "Réinitialisation réussie", description: "Valeurs par défaut restaurées." });
    }
  };

  const updateCoeff = (subjectId: string, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num) && val !== "") return;
    
    setHasUnsavedChanges(true);
    setCoeffs(prev => {
      const otherCoeffs = prev.filter(c => !(c.classLevel === selectedClass && c.subjectId === subjectId));
      if (val === "") return otherCoeffs;
      return [...otherCoeffs, { classLevel: selectedClass, subjectId, value: num }];
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings2 className="w-8 h-8 text-emerald-700" />
            Configuration Pédagogique
          </h2>
          <p className="text-muted-foreground">Ajustez la puissance des matières. Ces réglages sont persistants même après déploiement.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={handleReset} className="flex-1 md:flex-none gap-2 rounded-xl h-11">
            <RotateCcw className="w-4 h-4" /> Restaurer
          </Button>
          <Button 
            onClick={handleSave} 
            className={cn(
              "flex-1 md:flex-none gap-2 h-11 px-8 rounded-xl shadow-lg transition-all",
              hasUnsavedChanges ? "bg-orange-600 hover:bg-orange-700" : "bg-emerald-700 hover:bg-emerald-800"
            )}
          >
            <Save className="w-4 h-4" /> 
            {hasUnsavedChanges ? "Enregistrer les modifications" : "Configuration à jour"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-700">Paramètres de Classe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Sélectionner un niveau</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full bg-slate-50 border-none h-12 rounded-xl focus:ring-2 focus:ring-emerald-500">
                    <SelectValue placeholder="Choisir une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                <p className="text-[10px] text-blue-700 font-bold uppercase flex items-center gap-1">
                  <Database className="w-3 h-3" /> État du Stockage
                </p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Toute modification ici impacte immédiatement le calcul des bulletins et des moyennes générales.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-slate-900 text-white">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-300 leading-tight">
                Pour les séries C et D, les coefficients scientifiques sont automatiquement suggérés par le système selon les normes du Ministère.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-3 border-none shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6 py-4">Matière</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="w-40 text-center">Coefficient</TableHead>
                  <TableHead className="text-right pr-6">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SUBJECTS.map((subject) => {
                  const customEntry = coeffs.find(c => c.classLevel === selectedClass && c.subjectId === subject.id);
                  const currentValue = customEntry ? customEntry.value : getCoefficient(selectedClass, subject.id);
                  const isCustom = !!customEntry;
                  
                  return (
                    <TableRow key={subject.id} className="hover:bg-slate-50/50 group transition-colors">
                      <TableCell className="pl-6">
                        <p className="font-bold text-slate-800">{subject.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{subject.id.toUpperCase()}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-[9px] uppercase px-2">
                          {subject.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex justify-center py-3">
                        <Input 
                          type="number" 
                          value={currentValue} 
                          onChange={(e) => updateCoeff(subject.id, e.target.value)}
                          className={cn(
                            "w-24 text-center font-black h-10 rounded-xl transition-all",
                            isCustom 
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100" 
                              : "bg-white border-slate-200"
                          )}
                          min={1}
                          max={10}
                        />
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {isCustom ? (
                          <Badge className="bg-emerald-600 border-none gap-1">
                            <ShieldCheck className="w-3 h-3" /> Direction
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-400 border-none">
                            Standard
                          </Badge>
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
