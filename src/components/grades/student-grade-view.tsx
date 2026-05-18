
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, GradeRecord, SUBJECTS } from "@/lib/school-types";
import { getFromStorage } from "@/lib/data-service";
import { FileText, TrendingUp, Award } from "lucide-react";

export function StudentGradeView({ student }: { student: User }) {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [selectedTrimestre, setSelectedTrimestre] = useState<'T1' | 'T2' | 'T3'>('T1');

  useEffect(() => {
    const allGrades = getFromStorage<GradeRecord>('edutrack_grades');
    setGrades(allGrades.filter(g => g.eleveId === student.id));
  }, [student.id]);

  const currentGrades = grades.filter(g => g.trimestre === selectedTrimestre);
  const average = currentGrades.length > 0 
    ? currentGrades.reduce((acc, curr) => acc + curr.moyenne, 0) / currentGrades.length 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-700" /> Mon Relevé de Notes
          </h2>
          <p className="text-sm text-muted-foreground">Consultation sécurisée des résultats de {student.name}</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border">
          {['T1', 'T2', 'T3'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTrimestre(t as any)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${selectedTrimestre === t ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {t === 'T1' ? '1er Trim.' : t === 'T2' ? '2ème Trim.' : '3ème Trim.'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-700 text-white border-none shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase opacity-80">Moyenne Trimestrielle</p>
              <h3 className="text-3xl font-black">{average.toFixed(2)} / 20</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 text-white border-none shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><Award className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase opacity-80">Mention</p>
              <h3 className="text-2xl font-black">
                {average >= 16 ? "Très Bien" : average >= 14 ? "Bien" : average >= 12 ? "Assez Bien" : average >= 10 ? "Passable" : "Insuffisant"}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Détails par Matière</CardTitle>
          <CardDescription>Notes certifiées et validées par les professeurs.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="pl-6">Matière</TableHead>
                <TableHead className="text-center">Interros (Moy.)</TableHead>
                <TableHead className="text-center">Devoirs (Moy.)</TableHead>
                <TableHead className="text-center">Comp.</TableHead>
                <TableHead className="text-center font-bold">Moyenne</TableHead>
                <TableHead className="text-right pr-6">Coeff.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentGrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                    Aucune note n'a encore été publiée pour ce trimestre.
                  </TableCell>
                </TableRow>
              ) : (
                currentGrades.map((g) => {
                  const subject = SUBJECTS.find(s => s.id === g.matiereId);
                  const mi = g.interros.filter(n => n !== null).reduce((a, b) => a! + b!, 0) / (g.interros.filter(n => n !== null).length || 1);
                  const md = g.devoirs.filter(n => n !== null).reduce((a, b) => a! + b!, 0) / (g.devoirs.filter(n => n !== null).length || 1);
                  
                  return (
                    <TableRow key={g.noteId} className="hover:bg-slate-50/50">
                      <TableCell className="pl-6 font-bold text-slate-800">{subject?.name || g.matiereId}</TableCell>
                      <TableCell className="text-center text-slate-500">{mi.toFixed(2)}</TableCell>
                      <TableCell className="text-center text-slate-500">{md.toFixed(2)}</TableCell>
                      <TableCell className="text-center font-medium">{g.composition?.toFixed(2) || '--'}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={g.moyenne >= 10 ? "bg-emerald-600" : "bg-red-600"}>
                          {g.moyenne.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 text-xs font-mono">x{g.coefficient}</TableCell>
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
