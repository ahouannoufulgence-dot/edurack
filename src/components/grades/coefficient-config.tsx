
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClassLevel, SUBJECTS, CoefficientEntry, ALL_CLASSES } from "@/lib/school-types";
import { Save, RotateCcw, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = 'edutrack_coeffs';

const DEFAULT_COEFFS: CoefficientEntry[] = [
  { classLevel: 'Tle D', subjectId: 'math', value: 4 },
  { classLevel: 'Tle D', subjectId: 'pc', value: 4 },
  { classLevel: 'Tle D', subjectId: 'svt', value: 5 },
  { classLevel: 'Tle D', subjectId: 'fr', value: 3 },
  { classLevel: '6e 1', subjectId: 'math', value: 4 },
  { classLevel: '6e 1', subjectId: 'fr', value: 4 },
];

export function CoefficientConfig() {
  const [coeffs, setCoeffs] = useState<CoefficientEntry[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('Tle D');
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCoeffs(JSON.parse(saved));
    } else {
      setCoeffs(DEFAULT_COEFFS);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coeffs));
    toast({ title: "Sauvegardé", description: "Les coefficients ont été enregistrés localement." });
  };

  const handleReset = () => {
    setCoeffs(DEFAULT_COEFFS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COEFFS));
    toast({ title: "Réinitialisé", description: "Les coefficients par défaut ont été restaurés." });
  };

  const updateCoeff = (subjectId: string, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    
    setCoeffs(prev => {
      const existing = prev.find(c => c.classLevel === selectedClass && c.subjectId === subjectId);
      if (existing) {
        return prev.map(c => (c.classLevel === selectedClass && c.subjectId === subjectId) ? { ...c, value: num } : c);
      } else {
        return [...prev, { classLevel: selectedClass, subjectId, value: num }];
      }
    });
  };

  const removeEntry = (subjectId: string) => {
    setCoeffs(prev => prev.filter(c => !(c.classLevel === selectedClass && c.subjectId === subjectId)));
  };

  const currentClassCoeffs = coeffs.filter(c => c.classLevel === selectedClass);

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Configurateur de Coefficients</CardTitle>
          <CardDescription>Gérez les coefficients par série et matière.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Réinitialiser
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-2 bg-emerald-deep">
            <Save className="w-4 h-4" /> Enregistrer
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-lg">
          <div className="space-y-1">
            <p className="text-sm font-medium">Sélectionner la classe/série</p>
            <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v as ClassLevel)}>
              <SelectTrigger className="w-64 bg-white">
                <SelectValue placeholder="Choisir une classe" />
              </SelectTrigger>
              <SelectContent>
                {ALL_CLASSES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1" />
          <Button variant="secondary" className="gap-2">
            <Plus className="w-4 h-4" /> Ajouter une matière
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matière</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead className="w-32 text-center">Coefficient</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SUBJECTS.map((subject) => {
              const coeff = currentClassCoeffs.find(c => c.subjectId === subject.id);
              return (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{subject.category}</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      value={coeff?.value || ''} 
                      onChange={(e) => updateCoeff(subject.id, e.target.value)}
                      placeholder="Non déf."
                      className="text-center h-8"
                    />
                  </TableCell>
                  <TableCell>
                    {coeff && (
                      <Button variant="ghost" size="icon" onClick={() => removeEntry(subject.id)} className="h-8 w-8 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
