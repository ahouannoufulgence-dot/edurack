
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ALL_CLASSES, SUBJECTS, User, GradeRecord } from "@/lib/school-types";
import { getFromStorage, saveGrade, getCoefficient } from "@/lib/data-service";
import { calculateMoyenneComplex } from "@/lib/school-logic";
import { FileEdit, Save, CheckCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ScoreState = {
  interros: string[];
  devoirs: string[];
  composition: string;
};

export function GradeManager({ user }: { user: User }) {
  const [selectedClass, setSelectedClass] = useState("3e 1");
  const [selectedSubject, setSelectedSubject] = useState(user.matieresAttribuees?.[0] || "math");
  const [selectedTrimestre, setSelectedTrimestre] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [students, setStudents] = useState<User[]>([]);
  const [scores, setScores] = useState<Record<string, ScoreState>>({});
  const { toast } = useToast();

  useEffect(() => {
    const allUsers = getFromStorage<User>('edutrack_users');
    const filtered = allUsers.filter(u => u.role === 'Eleve' && u.classLevel === selectedClass);
    setStudents(filtered);

    const allGrades = getFromStorage<GradeRecord>('edutrack_grades');
    const newScores: Record<string, ScoreState> = {};
    
    filtered.forEach(student => {
      const existingGrade = allGrades.find(g => 
        g.eleveId === student.id && 
        g.matiereId === selectedSubject && 
        g.trimestre === selectedTrimestre
      );
      
      if (existingGrade) {
        newScores[student.id] = {
          interros: existingGrade.interros.map(n => n?.toString() || ""),
          devoirs: existingGrade.devoirs.map(n => n?.toString() || ""),
          composition: existingGrade.composition?.toString() || ""
        };
      } else {
        newScores[student.id] = { 
          interros: ["", "", ""], 
          devoirs: ["", "", ""], 
          composition: "" 
        };
      }
    });
    setScores(newScores);
  }, [selectedClass, selectedSubject, selectedTrimestre]);

  const handleScoreChange = (id: string, group: 'interros' | 'devoirs' | 'composition', index: number, val: string) => {
    setScores(prev => {
      const current = prev[id] || { interros: ["", "", ""], devoirs: ["", "", ""], composition: "" };
      if (group === 'composition') {
        return { ...prev, [id]: { ...current, composition: val } };
      }
      const newArray = [...current[group]];
      newArray[index] = val;
      return { ...prev, [id]: { ...current, [group]: newArray } };
    });
  };

  const handleSaveAll = () => {
    let count = 0;
    const currentCoeff = getCoefficient(selectedClass, selectedSubject);

    Object.entries(scores).forEach(([studentId, s]) => {
      const interros = s.interros.map(v => v === "" ? null : parseFloat(v));
      const devoirs = s.devoirs.map(v => v === "" ? null : parseFloat(v));
      const comp = s.composition === "" ? null : parseFloat(s.composition);
      
      const moy = calculateMoyenneComplex(interros, devoirs, comp);
      
      saveGrade({
        eleveId: studentId,
        classeId: selectedClass,
        matiereId: selectedSubject,
        enseignantId: user.id,
        trimestre: selectedTrimestre,
        interros,
        devoirs,
        composition: comp,
        moyenne: moy,
        coefficient: currentCoeff
      });
      count++;
    });
    
    toast({ 
      title: "Notes enregistrées", 
      description: `${count} dossiers mis à jour avec coefficient ${currentCoeff}.` 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileEdit className="w-6 h-6 text-emerald-700" /> Saisie Pédagogique (3-3-1)
          </h2>
          <p className="text-xs text-muted-foreground">Coeff. actuel pour cette classe : <span className="font-black text-emerald-700">{getCoefficient(selectedClass, selectedSubject)}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedTrimestre} onValueChange={(v: any) => setSelectedTrimestre(v)}>
            <SelectTrigger className="w-28 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="T1">1er Trim.</SelectItem>
              <SelectItem value="T2">2ème Trim.</SelectItem>
              <SelectItem value="T3">3ème Trim.</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-32 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>{ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>{SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={handleSaveAll} className="bg-emerald-700 hover:bg-emerald-800 gap-2 shadow-md">
            <Save className="w-4 h-4" /> Sauvegarder
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-6 py-4 sticky left-0 bg-slate-50 z-20 w-48">Élève</TableHead>
                <TableHead className="text-center bg-blue-50/30">Interrogations (3)</TableHead>
                <TableHead className="text-center bg-orange-50/30">Devoirs (3)</TableHead>
                <TableHead className="w-24 text-center">Comp.</TableHead>
                <TableHead className="w-24 text-center font-bold">Moyenne</TableHead>
                <TableHead className="text-right pr-6">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                    Aucun élève trouvé pour cette classe.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => {
                  const s = scores[student.id] || { interros: ["", "", ""], devoirs: ["", "", ""], composition: "" };
                  const interros = s.interros.map(v => v === "" ? null : parseFloat(v));
                  const devoirs = s.devoirs.map(v => v === "" ? null : parseFloat(v));
                  const comp = s.composition === "" ? null : parseFloat(s.composition);
                  const moy = calculateMoyenneComplex(interros, devoirs, comp);

                  return (
                    <TableRow key={student.id} className="hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="pl-6 py-4 sticky left-0 bg-white group-hover:bg-emerald-50 transition-colors z-10 border-r">
                        <p className="font-bold text-slate-800 truncate max-w-[150px] uppercase">{student.name}</p>
                        <p className="text-[9px] font-mono text-muted-foreground">{student.id}</p>
                      </TableCell>
                      
                      <TableCell className="bg-blue-50/10">
                        <div className="flex gap-1 justify-center">
                          {[0, 1, 2].map(idx => (
                            <Input 
                              key={idx}
                              type="number" min={0} max={20} step={0.25}
                              value={s.interros[idx]} 
                              onChange={e => handleScoreChange(student.id, 'interros', idx, e.target.value)}
                              className="w-12 h-8 text-center text-xs p-1"
                              placeholder={`I${idx+1}`}
                            />
                          ))}
                        </div>
                      </TableCell>

                      <TableCell className="bg-orange-50/10">
                        <div className="flex gap-1 justify-center">
                          {[0, 1, 2].map(idx => (
                            <Input 
                              key={idx}
                              type="number" min={0} max={20} step={0.25}
                              value={s.devoirs[idx]} 
                              onChange={e => handleScoreChange(student.id, 'devoirs', idx, e.target.value)}
                              className="w-12 h-8 text-center text-xs p-1"
                              placeholder={`D${idx+1}`}
                            />
                          ))}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Input 
                          type="number" min={0} max={20} step={0.25}
                          value={s.composition} 
                          onChange={e => handleScoreChange(student.id, 'composition', 0, e.target.value)}
                          className="w-16 h-8 text-center font-bold"
                          placeholder="C"
                        />
                      </TableCell>

                      <TableCell className="text-center">
                        <span className={`font-black text-base ${moy >= 10 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {moy > 0 ? moy.toFixed(2) : '--'}
                        </span>
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex justify-end">
                                {moy > 0 ? (
                                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <Info className="w-5 h-5 text-slate-300" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {moy > 0 ? "Notes saisies et validées" : "Saisie en attente"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
