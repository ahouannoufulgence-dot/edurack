
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, GradeRecord, SUBJECTS } from "@/lib/school-types";
import { getFromStorage, getCoefficient } from "@/lib/data-service";
import { FileText, TrendingUp, Award, Trophy, UserRound, BarChart3 } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Legend
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function StudentGradeView({ student }: { student: User }) {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [subjectStats, setSubjectStats] = useState<any[]>([]);
  const [overallStats, setOverallStats] = useState({ first: 0, last: 0, me: 0 });
  const [selectedTrimestre, setSelectedTrimestre] = useState<'T1' | 'T2' | 'T3'>('T1');

  useEffect(() => {
    const allGrades = getFromStorage<GradeRecord>('edutrack_grades');
    const allUsers = getFromStorage<User>('edutrack_users');
    const classLevel = student.classLevel || 'N/A';
    
    // Filtrer les élèves de la même classe
    const classStudents = allUsers.filter(u => u.role === 'Eleve' && u.classLevel === classLevel);
    const classStudentIds = classStudents.map(s => s.id);

    // Grades du trimestre pour toute la classe
    const trimesterGrades = allGrades.filter(g => g.trimestre === selectedTrimestre && classStudentIds.includes(g.eleveId));
    
    // Grades de l'élève actuel
    const myGrades = trimesterGrades.filter(g => g.eleveId === student.id);
    setGrades(myGrades);

    // Calcul par matière (Utilise les coefficients actuels)
    const statsBySubject = SUBJECTS.map(subj => {
      const subjectGrades = trimesterGrades.filter(g => g.matiereId === subj.id);
      const myGrade = myGrades.find(g => g.matiereId === subj.id);
      
      if (subjectGrades.length === 0 && !myGrade) return null;

      const averages = subjectGrades.map(g => g.moyenne);
      const max = averages.length > 0 ? Math.max(...averages) : 0;
      const min = averages.length > 0 ? Math.min(...averages) : 0;
      const me = myGrade ? myGrade.moyenne : 0;

      return {
        subject: subj.name,
        me: parseFloat(me.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        min: parseFloat(min.toFixed(2))
      };
    }).filter(Boolean);

    setSubjectStats(statsBySubject);

    // Calcul global PONDÉRÉ
    const calculateWeightedAvg = (sId: string) => {
      const sGrades = trimesterGrades.filter(g => g.eleveId === sId);
      if (sGrades.length === 0) return 0;
      
      let totalPoints = 0;
      let totalCoeffs = 0;
      
      sGrades.forEach(g => {
        // On récupère le coefficient en temps réel pour être sûr de la cohérence
        const coeff = getCoefficient(classLevel, g.matiereId);
        totalPoints += (g.moyenne * coeff);
        totalCoeffs += coeff;
      });

      return totalCoeffs > 0 ? totalPoints / totalCoeffs : 0;
    };

    const studentAverages = classStudentIds.map(id => calculateWeightedAvg(id)).filter(a => a > 0);

    const first = studentAverages.length > 0 ? Math.max(...studentAverages) : 0;
    const last = studentAverages.length > 0 ? Math.min(...studentAverages) : 0;
    const meOverall = calculateWeightedAvg(student.id);

    setOverallStats({ first, last, me: meOverall });
  }, [student.id, student.classLevel, selectedTrimestre]);

  const chartConfig = {
    me: { label: "Ma Note", color: "hsl(var(--primary))" },
    max: { label: "Meilleure Note", color: "hsl(var(--accent))" },
    min: { label: "Note Minimale", color: "hsl(var(--destructive))" },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-700" /> Mon Relevé de Notes Comparatif
          </h2>
          <p className="text-sm text-muted-foreground">Analyse détaillée de tes performances par matière.</p>
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
              <p className="text-xs font-bold uppercase opacity-80">Moyenne Générale Pondérée</p>
              <h3 className="text-3xl font-black">{overallStats.me.toFixed(2)} / 20</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-accent text-white border-none shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><Trophy className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase opacity-80">Premier de Classe</p>
              <h3 className="text-3xl font-black">{overallStats.first.toFixed(2)} / 20</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 text-white border-none shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><UserRound className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase opacity-80">Mention</p>
              <h3 className="text-2xl font-black">
                {overallStats.me >= 16 ? "Très Bien" : overallStats.me >= 14 ? "Bien" : overallStats.me >= 12 ? "Assez Bien" : overallStats.me >= 10 ? "Passable" : "Insuffisant"}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" /> 
              Comparaison par Matière
            </CardTitle>
            <CardDescription>Visualisation de ta note par rapport aux extrêmes de la classe.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[400px] w-full">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectStats} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="subject" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700 }} 
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar dataKey="min" fill="hsl(var(--destructive))" name="Min Classe" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="me" fill="hsl(var(--primary))" name="Ma Note" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="max" fill="hsl(var(--accent))" name="Max Classe" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Détails Certifiés des Résultats</CardTitle>
          <CardDescription>Notes validées avec comparaison aux performances de la classe.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="pl-6">Matière</TableHead>
                <TableHead className="text-center">Ma Note</TableHead>
                <TableHead className="text-center text-emerald-600">Meilleure</TableHead>
                <TableHead className="text-center text-red-600">Minimale</TableHead>
                <TableHead className="text-center font-bold">Statut</TableHead>
                <TableHead className="text-right pr-6">Coeff. Actuel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjectStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                    Aucun résultat publié pour ce trimestre.
                  </TableCell>
                </TableRow>
              ) : (
                subjectStats.map((stat, idx) => {
                  const matiereId = SUBJECTS.find(s => s.name === stat.subject)?.id || '';
                  const activeCoeff = getCoefficient(student.classLevel || 'N/A', matiereId);
                  
                  return (
                    <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="pl-6 font-bold text-slate-800 group-hover:text-emerald-700">
                        {stat.subject}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={stat.me >= 10 ? "bg-emerald-600 px-3" : "bg-red-600 px-3"}>
                          {stat.me.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold text-emerald-700 bg-emerald-50/30">
                        {stat.max.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center font-bold text-red-700 bg-red-50/30">
                        {stat.min.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-slate-100">
                          {stat.me === stat.max ? "⭐ Major" : stat.me >= 10 ? "Validé" : "À renforcer"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6 text-xs font-black text-emerald-700">
                        x{activeCoeff}
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
