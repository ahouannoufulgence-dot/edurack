
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ALL_CLASSES, SUBJECTS, User, GradeRecord } from "@/lib/school-types";
import { getFromStorage, saveGrade } from "@/lib/data-service";
import { FileEdit, Save, CheckCircle, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function GradeManager({ user }: { user: User }) {
  const [selectedClass, setSelectedClass] = useState("3e 1");
  const [selectedSubject, setSelectedSubject] = useState(user.subjectId || "math");
  const [students, setStudents] = useState<User[]>([]);
  const [scores, setScores] = useState<Record<string, { devoir: string, composition: string }>>({});
  const { toast } = useToast();

  useEffect(() => {
    const data = getFromStorage<User>('edutrack_users').filter(u => u.role === 'Eleve' && u.classLevel === selectedClass);
    setStudents(data);
  }, [selectedClass]);

  const handleScoreChange = (id: string, field: 'devoir' | 'composition', val: string) => {
    setScores(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: val }
    }));
  };

  const handleSaveAll = () => {
    Object.entries(scores).forEach(([studentId, vals]) => {
      const dev = parseFloat(vals.devoir);
      const comp = parseFloat(vals.composition);
      
      if (!isNaN(dev)) {
        const moyenne = !isNaN(comp) ? (dev + 2 * comp) / 3 : dev;
        saveGrade({
          eleveId: studentId,
          classeId: selectedClass,
          matiereId: selectedSubject,
          enseignantId: user.id,
          trimestre: 'T1',
          devoir: dev,
          composition: isNaN(comp) ? undefined : comp,
          moyenne: parseFloat(moyenne.toFixed(2)),
          coefficient: 4
        });
      }
    });
    toast({ title: "Notes enregistrées", description: "Les moyennes ont été recalculées." });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileEdit className="w-6 h-6" /> Saisie des Notes
        </h2>
        <div className="flex gap-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>{ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>{SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={handleSaveAll} className="bg-emerald-deep gap-2"><Save className="w-4 h-4" /> Valider la saisie</Button>
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Élève</TableHead>
                <TableHead className="w-32 text-center">Devoir (/20)</TableHead>
                <TableHead className="w-32 text-center">Composition (/20)</TableHead>
                <TableHead className="w-32 text-center">Moyenne Actuelle</TableHead>
                <TableHead className="text-right pr-6">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const s = scores[student.id] || { devoir: "", composition: "" };
                const dev = parseFloat(s.devoir);
                const comp = parseFloat(s.composition);
                const moy = !isNaN(dev) ? (!isNaN(comp) ? (dev + 2 * comp) / 3 : dev) : 0;

                return (
                  <TableRow key={student.id}>
                    <TableCell className="pl-6">
                      <p className="font-bold">{student.name}</p>
                      <p className="text-[10px] text-muted-foreground">{student.id}</p>
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={s.devoir} 
                        onChange={e => handleScoreChange(student.id, 'devoir', e.target.value)}
                        className="text-center"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={s.composition} 
                        onChange={e => handleScoreChange(student.id, 'composition', e.target.value)}
                        className="text-center"
                      />
                    </TableCell>
                    <TableCell className="text-center font-black text-emerald-700">
                      {moy > 0 ? moy.toFixed(2) : '--'}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge variant="outline" className="gap-1"><CheckCircle className="w-3 h-3" /> Prêt</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
