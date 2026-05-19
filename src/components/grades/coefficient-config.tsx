
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ALL_CLASSES, SUBJECTS, CoefficientEntry } from "@/lib/school-types";
import { getFromStorage, saveToStorage, getCoefficient } from "@/lib/data-service";
import { Save, RotateCcw, Settings2, ShieldCheck, Database, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const STORAGE_KEY = 'edutrack_coeffs';

export function CoefficientConfig() {
  const [coeffs, setCoeffs] = useState<CoefficientEntry[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(ALL_CLASSES[0]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isMobile = useIsMobile();
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

  const handleClearAll = () => {
    if (confirm("Voulez-vous remettre TOUS les coefficients à zéro pour cette classe ?")) {
      const filtered = coeffs.filter(c => c.classLevel !== selectedClass);
      setCoeffs(filtered);
      saveToStorage(STORAGE_KEY, filtered);
      setHasUnsavedChanges(false);
      toast({ title: "Remise à zéro réussie", description: "Tous les coefficients de cette classe sont maintenant à 0." });
    }
  };

  const updateCoeff = (subjectId: string, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num) && val !== "") return;
    
    setHasUnsavedChanges(true);
    setCoeffs(prev => {
      const otherCoeffs = prev.filter(c => !(c.classLevel === selectedClass && c.subjectId === subjectId));
      if (val === "" || num === 0) return otherCoeffs;
      return [...otherCoeffs, { classLevel: selectedClass, subjectId, value: num }];
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings2 className="w-6 h-6 md:w-8 md:h-8 text-emerald-700" />
            Configuration des Coefficients
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground italic">Remis à zéro. Veuillez saisir les valeurs pour la classe <span className="font-bold">{selectedClass}</span>.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={handleClearAll} className="flex-1 md:flex-none gap-2 rounded-xl h-11 text-xs border-red-200 text-red-600 hover:bg-red-50">
            <Trash2 className="w-3 h-3" /> Tout effacer
          </Button>
          <Button 
            onClick={handleSave} 
            className={cn(
              "flex-1 md:flex-none gap-2 h-11 px-4 md:px-8 rounded-xl shadow-lg transition-all text-xs font-bold",
              hasUnsavedChanges ? "bg-orange-600 hover:bg-orange-700" : "bg-emerald-700 hover:bg-emerald-800"
            )}
          >
            <Save className="w-3 h-3" /> 
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Sélection</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Choisir une classe</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full bg-slate-50 border-none h-12 rounded-xl focus:ring-2 focus:ring-emerald-500">
                    <SelectValue placeholder="Choisir une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-[10px] text-orange-700 font-bold uppercase flex items-center gap-1 mb-1">
                  <Database className="w-3 h-3" /> Note importante
                </p>
                <p className="text-[10px] text-orange-800 leading-tight">
                  Par défaut, toutes les matières sont à coefficient 0. Saisissez les valeurs réelles pour permettre le calcul des moyennes générales.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {isMobile ? (
            <div className="grid gap-3">
              {SUBJECTS.map((subject) => {
                const customEntry = coeffs.find(c => c.classLevel === selectedClass && c.subjectId === subject.id);
                const currentValue = customEntry ? customEntry.value : 0;
                const isConfigured = !!customEntry;
                
                return (
                  <Card key={subject.id} className="border-none shadow-sm overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-slate-800 text-sm truncate">{subject.name}</p>
                          {isConfigured && (
                            <Badge className="bg-emerald-600 h-4 text-[8px] px-1.5 border-none">
                              <ShieldCheck className="w-2 h-2 mr-1" /> OK
                            </Badge>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{subject.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Coeff.</span>
                        <Input 
                          type="number" 
                          inputMode="decimal"
                          value={currentValue === 0 && !isConfigured ? "" : currentValue} 
                          placeholder="0"
                          onChange={(e) => updateCoeff(subject.id, e.target.value)}
                          className={cn(
                            "w-16 text-center font-black h-12 rounded-xl text-lg",
                            isConfigured ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "bg-slate-50 border-none text-slate-400"
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-none shadow-xl overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="pl-6 py-4">Matière</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="w-40 text-center">Coefficient</TableHead>
                      <TableHead className="text-right pr-6">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SUBJECTS.map((subject) => {
                      const customEntry = coeffs.find(c => c.classLevel === selectedClass && c.subjectId === subject.id);
                      const currentValue = customEntry ? customEntry.value : 0;
                      const isConfigured = !!customEntry;
                      
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
                              value={currentValue === 0 && !isConfigured ? "" : currentValue} 
                              placeholder="0"
                              onChange={(e) => updateCoeff(subject.id, e.target.value)}
                              className={cn(
                                "w-24 text-center font-black h-10 rounded-xl transition-all",
                                isConfigured 
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100" 
                                  : "bg-white border-slate-200 text-slate-400"
                              )}
                              min={0}
                              max={20}
                            />
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            {isConfigured ? (
                              <Badge className="bg-emerald-600 border-none gap-1">
                                <ShieldCheck className="w-3 h-3" /> Configuré
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-slate-100 text-slate-400 border-none">
                                À définir (0)
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
          )}
        </div>
      </div>
    </div>
  );
}
