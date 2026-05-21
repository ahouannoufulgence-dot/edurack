
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ALL_CLASSES, SUBJECTS, User, GradeRecord } from "@/lib/school-types";
import { getFromStorage, saveGrade, getCoefficient } from "@/lib/data-service";
import { calculateMoyenneComplex } from "@/lib/school-logic";
import { FileEdit, Save, CheckCircle, Info, Eye, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StudentGradeView } from "./student-grade-view";
import { RemediationReport } from "@/components/ai/remediation-report";

type ScoreState = {
  interros: string[];
  devoirs: string[];
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
          interros: existingGrade.interros.map(n => n !== null ? n.toString() : ""),
          devoirs: existingGrade.devoirs.map(n => n !== null ? n.toString() : ""),
        };
      } else {
        newScores[student.id] = { interros: ["", "", ""], devoirs: ["", "", ""] };
      }
    });
    setScores(newScores);
  }, [selectedClass, selectedSubject, selectedTrimestre]);

  const handleScoreChange = (id: string, group: 'interros' | 'devoirs', index: number, val: string) => {
    setScores(prev => {
      const current = prev[id] || { interros: ["", "", ""], devoirs: ["", "", ""] };
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
      const moy = calculateMoyenneComplex(interros, devoirs);
      
      saveGrade({
        gradeId: `GRD-${Date.now()}-${studentId}`,
        eleveId: studentId,
        classeId: selectedClass,
        matiereId: selectedSubject,
        enseignantId: user.id,
        trimestre: selectedTrimestre,
        interros,
        devoirs,
        moyenne: moy,
        coefficient: currentCoeff,
        dateAjout: new Date().toISOString()
      });
      count++;
    });
    
    toast({ title: "Notes enregistrées", description: `${count} élèves mis à jour (40/60 appliqué).` });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-emerald-900">
            <FileEdit className="w-5 h-5" /> Registre d'Évaluation
          </h2>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            SYSTÈME : 40% INTERROS | 60% DEVOIRS | 0% COMPOSITION
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <Select value={selectedTrimestre} onValueChange={(v: any) => setSelectedTrimestre(v)}>
            <SelectTrigger className="bg-white h-11 w-32 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="T1">1er Trim.</SelectItem>
              <SelectItem value="T2">2ème Trim.</SelectItem>
              <SelectItem value="T3">3ème Trim.</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="bg-white h-11 w-32 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="bg-white h-11 w-44 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={handleSaveAll} className="bg-emerald-800 hover:bg-emerald-900 h-11 px-8 rounded-xl font-bold shadow-md text-white gap-2">
            <Save className="w-4 h-4" /> Enregistrer tout
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-100/50">
                <TableRow>
                  <TableHead className="pl-6 py-4 w-64">Élève</TableHead>
                  <TableHead className="text-center">Interrogations (x3)</TableHead>
                  <TableHead className="text-center">Devoirs (x3)</TableHead>
                  <TableHead className="w-24 text-center font-black">Moyenne</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const s = scores[student.id] || { interros: ["", "", ""], devoirs: ["", "", ""] };
                  const interros = s.interros.map(v => v === "" ? null : parseFloat(v));
                  const devoirs = s.devoirs.map(v => v === "" ? null : parseFloat(v));
                  const moy = calculateMoyenneComplex(interros, devoirs);

                  return (
                    <TableRow key={student.id} className="hover:bg-emerald-50/20 group">
                      <TableCell className="pl-6 py-3">
                        <p className="font-bold text-slate-800 uppercase text-xs">{student.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{student.id}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 justify-center">
                          {[0, 1, 2].map(idx => (
                            <input 
                              key={idx} type="number" 
                              value={s.interros[idx]} 
                              onChange={e => handleScoreChange(student.id, 'interros', idx, e.target.value)}
                              className="w-11 h-9 text-center p-1 border rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white/80"
                              placeholder="00"
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 justify-center">
                          {[0, 1, 2].map(idx => (
                            <input 
                              key={idx} type="number" 
                              value={s.devoirs[idx]} 
                              onChange={e => handleScoreChange(student.id, 'devoirs', idx, e.target.value)}
                              className="w-11 h-9 text-center p-1 border rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white/80"
                              placeholder="00"
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-black text-sm px-2 py-1 rounded-lg ${moy >= 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                          {moy > 0 ? moy.toFixed(2) : '--'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6 space-x-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-100">
                              <Eye className="w-4 h-4 text-emerald-600" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl h-[90vh]">
                            <DialogHeader>
                              <DialogTitle>Aperçu du Bulletin : {student.name}</DialogTitle>
                            </DialogHeader>
                            <StudentGradeView student={student} />
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-100">
                              <Sparkles className="w-4 h-4 text-orange-600" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Analyste IA de Remédiation</DialogTitle>
                            </DialogHeader>
                            <RemediationReport student={student} />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
