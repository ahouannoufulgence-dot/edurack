
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ALL_CLASSES, SUBJECTS, User, GradeRecord } from "@/lib/school-types";
import { getFromStorage, saveGrade } from "@/lib/data-service";
import { calculateMoyenne } from "@/lib/school-logic";
import { FileEdit, Save, CheckCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function GradeManager({ user }: { user: User }) {
  const [selectedClass, setSelectedClass] = useState("3e 1");
  const [selectedSubject, setSelectedSubject] = useState(user.matieresAttribuees?.[0] || "math");
  const [students, setStudents] = useState<User[]>([]);
  const [scores, setScores] = useState<Record<string, { devoir: string, composition: string }>>({});
  const { toast } = useToast();

  useEffect(() => {
    // Charger les élèves de la classe
    const allUsers = getFromStorage<User>('edutrack_users');
    const filtered = allUsers.filter(u => u.role === 'Eleve' && u.classLevel === selectedClass);
    setStudents(filtered);

    // Charger les notes déjà existantes
    const allGrades = getFromStorage<GradeRecord>('edutrack_grades');
    const newScores: Record<string, { devoir: string, composition: string }> = {};
    
    filtered.forEach(student => {
      const existingGrade = allGrades.find(g => 
        g.eleveId === student.id && 
        g.matiereId === selectedSubject && 
        g.trimestre === 'T1'
      );
      if (existingGrade) {
        newScores[student.id] = {
          devoir: existingGrade.devoir.toString(),
          composition: existingGrade.composition?.toString() || ""
        };
      } else {
        newScores[student.id] = { devoir: "", composition: "" };
      }
    });
    setScores(newScores);
  }, [selectedClass, selectedSubject]);

  const handleScoreChange = (id: string, field: 'devoir' | 'composition', val: string) => {
    setScores(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: val }
    }));
  };

  const handleSaveAll = () => {
    let count = 0;
    Object.entries(scores).forEach(([studentId, vals]) => {
      const dev = parseFloat(vals.devoir);
      const comp = vals.composition ? parseFloat(vals.composition) : undefined;
      
      if (!isNaN(dev)) {
        const moy = calculateMoyenne(dev, comp);
        saveGrade({
          eleveId: studentId,
          classeId: selectedClass,
          matiereId: selectedSubject,
          enseignantId: user.id,
          trimestre: 'T1',
          devoir: dev,
          composition: comp,
          moyenne: moy,
          coefficient: SUBJECTS.find(s => s.id === selectedSubject)?.coefficient || 1
        });
        count++;
      }
    });
    
    toast({ 
      title: "Notes enregistrées", 
      description: `${count} notes ont été mises à jour pour la classe ${selectedClass}.` 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileEdit className="w-6 h-6 text-emerald-700" /> Saisie des Notes
        </h2>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-32 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>{ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>{SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={handleSaveAll} className="bg-emerald-700 hover:bg-emerald-800 gap-2 shadow-md">
            <Save className="w-4 h-4" /> Enregistrer la saisie
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-6 py-4">Élève</TableHead>
                <TableHead className="w-32 text-center">Devoir (/20)</TableHead>
                <TableHead className="w-32 text-center">Composition (/20)</TableHead>
                <TableHead className="w-32 text-center">Moyenne</TableHead>
                <TableHead className="text-right pr-6">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                    Aucun élève trouvé dans cette classe.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => {
                  const s = scores[student.id] || { devoir: "", composition: "" };
                  const dev = parseFloat(s.devoir);
                  const comp = s.composition ? parseFloat(s.composition) : undefined;
                  const moy = calculateMoyenne(dev, comp);

                  return (
                    <TableRow key={student.id} className="hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <p className="font-bold text-slate-800">{student.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{student.id}</p>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          min={0} max={20} step={0.25}
                          value={s.devoir} 
                          onChange={e => handleScoreChange(student.id, 'devoir', e.target.value)}
                          className="text-center font-bold bg-white"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          min={0} max={20} step={0.25}
                          value={s.composition} 
                          onChange={e => handleScoreChange(student.id, 'composition', e.target.value)}
                          className="text-center font-bold bg-white"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {(!isNaN(dev)) ? (
                          <span className={`font-black text-lg ${moy >= 10 ? 'text-emerald-700' : 'text-red-600'}`}>
                            {moy.toFixed(2)}
                          </span>
                        ) : '--'}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {(!isNaN(dev)) ? (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none gap-1">
                            <CheckCircle className="w-3 h-3" /> Prêt
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400 gap-1 border-dashed">
                             Saisie attendue
                          </Badge>
                        )}
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
