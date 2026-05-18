
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, GradeRecord, SUBJECTS } from "@/lib/school-types";
import { getFromStorage } from "@/lib/data-service";
import { FileText, TrendingUp, Award, Trophy, UserRound, ArrowDown } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Cell,
  LabelList
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function StudentGradeView({ student }: { student: User }) {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [classStats, setClassStats] = useState({ first: 0, last: 0, me: 0 });
  const [selectedTrimestre, setSelectedTrimestre] = useState<'T1' | 'T2' | 'T3'>('T1');

  useEffect(() => {
    const allGrades = getFromStorage<GradeRecord>('edutrack_grades');
    const myGrades = allGrades.filter(g => g.eleveId === student.id);
    setGrades(myGrades);

    // Calculer les statistiques de classe
    const allUsers = getFromStorage<User>('edutrack_users');
    const classStudents = allUsers.filter(u => u.role === 'Eleve' && u.classLevel === student.classLevel);
    
    const trimesterGrades = allGrades.filter(g => g.trimestre === selectedTrimestre);
    
    const studentAverages = classStudents.map(s => {
      const sGrades = trimesterGrades.filter(g => g.eleveId === s.id);
      if (sGrades.length === 0) return 0;
      return sGrades.reduce((acc, curr) => acc + curr.moyenne, 0) / sGrades.length;
    }).filter(a => a > 0);

    const first = studentAverages.length > 0 ? Math.max(...studentAverages) : 0;
    const last = studentAverages.length > 0 ? Math.min(...studentAverages) : 0;
    const me = myGrades.filter(g => g.trimestre === selectedTrimestre).length > 0
      ? myGrades.filter(g => g.trimestre === selectedTrimestre).reduce((acc, curr) => acc + curr.moyenne, 0) / myGrades.filter(g => g.trimestre === selectedTrimestre).length
      : 0;

    setClassStats({ first, last, me });
  }, [student.id, student.classLevel, selectedTrimestre]);

  const currentGrades = grades.filter(g => g.trimestre === selectedTrimestre);
  
  const chartData = [
    { name: "Dernier", average: classStats.last, fill: "hsl(var(--destructive))" },
    { name: "Moi", average: classStats.me, fill: "hsl(var(--primary))" },
    { name: "Premier", average: classStats.first, fill: "hsl(var(--accent))" },
  ];

  const chartConfig = {
    average: {
      label: "Moyenne",
      color: "hsl(var(--primary))",
    },
  };

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
        <Card className="bg-emerald-700 text-white border-none shadow-lg transform transition-transform hover:scale-[1.02]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase opacity-80">Ma Moyenne</p>
              <h3 className="text-3xl font-black">{classStats.me.toFixed(2)} / 20</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-accent text-white border-none shadow-lg transform transition-transform hover:scale-[1.02]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><Trophy className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase opacity-80">Moy. du Premier</p>
              <h3 className="text-3xl font-black">{classStats.first.toFixed(2)} / 20</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive text-white border-none shadow-lg transform transition-transform hover:scale-[1.02]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><ArrowDown className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase opacity-80">Moy. du Dernier</p>
              <h3 className="text-3xl font-black">{classStats.last.toFixed(2)} / 20</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> 
              Positionnement en Classe
            </CardTitle>
            <CardDescription>Comparaison visuelle de ton niveau par rapport à ta classe.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 700 }} 
                    />
                    <YAxis domain={[0, 20]} hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="average" radius={[8, 8, 0, 0]} barSize={60}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <LabelList 
                        dataKey="average" 
                        position="top" 
                        formatter={(v: number) => v.toFixed(2)}
                        style={{ fontSize: 12, fontWeight: 900, fill: "currentColor" }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Récapitulatif
            </CardTitle>
            <CardDescription>Ton évaluation pour le {selectedTrimestre === 'T1' ? '1er' : selectedTrimestre === 'T2' ? '2ème' : '3ème'} trimestre.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-bold text-slate-600 uppercase">Mention</span>
                <h4 className="text-xl font-black text-emerald-700">
                   {classStats.me >= 16 ? "Très Bien" : classStats.me >= 14 ? "Bien" : classStats.me >= 12 ? "Assez Bien" : classStats.me >= 10 ? "Passable" : "Insuffisant"}
                </h4>
              </div>
              <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-800 uppercase">Écart au premier</span>
                </div>
                <h4 className="text-xl font-black text-emerald-900">
                  -{ (classStats.first - classStats.me).toFixed(2) } pts
                </h4>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl overflow-hidden bg-white">
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
                  const validInterros = g.interros.filter(n => n !== null);
                  const mi = validInterros.length > 0 
                    ? validInterros.reduce((a, b) => a! + b!, 0) / validInterros.length 
                    : 0;
                  
                  const validDevoirs = g.devoirs.filter(n => n !== null);
                  const md = validDevoirs.length > 0 
                    ? validDevoirs.reduce((a, b) => a! + b!, 0) / validDevoirs.length 
                    : 0;
                  
                  return (
                    <TableRow key={g.noteId} className="hover:bg-slate-50/50 group">
                      <TableCell className="pl-6 font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                        {subject?.name || g.matiereId}
                      </TableCell>
                      <TableCell className="text-center text-slate-500 font-mono text-xs">{mi.toFixed(2)}</TableCell>
                      <TableCell className="text-center text-slate-500 font-mono text-xs">{md.toFixed(2)}</TableCell>
                      <TableCell className="text-center font-medium font-mono text-xs">{g.composition !== null && g.composition !== undefined ? g.composition.toFixed(2) : '--'}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={g.moyenne >= 10 ? "bg-emerald-600 px-3" : "bg-red-600 px-3"}>
                          {g.moyenne.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 text-xs font-black text-slate-400">x{g.coefficient}</TableCell>
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
