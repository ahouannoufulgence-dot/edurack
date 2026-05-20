
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, GradeRecord, SUBJECTS } from "@/lib/school-types";
import { getFromStorage, getCoefficient } from "@/lib/data-service";
import { FileText, TrendingUp, Trophy, UserRound, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";

export function StudentGradeView({ student }: { student: User }) {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [subjectStats, setSubjectStats] = useState<any[]>([]);
  const [overallStats, setOverallStats] = useState({ first: 0, last: 0, me: 0 });
  const [selectedTrimestre, setSelectedTrimestre] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const allGrades = getFromStorage<GradeRecord>('edutrack_grades');
    const allUsers = getFromStorage<User>('edutrack_users');
    const classLevel = student.classLevel || 'N/A';
    
    const classStudents = allUsers.filter(u => u.role === 'Eleve' && u.classLevel === classLevel);
    const classStudentIds = classStudents.map(s => s.id);

    const trimesterGrades = allGrades.filter(g => g.trimestre === selectedTrimestre && classStudentIds.includes(g.eleveId));
    const myGrades = trimesterGrades.filter(g => g.eleveId === student.id);
    setGrades(myGrades);

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

    const calculateWeightedAvg = (sId: string) => {
      const sGrades = trimesterGrades.filter(g => g.eleveId === sId);
      if (sGrades.length === 0) return 0;
      
      let totalPoints = 0;
      let totalCoeffs = 0;
      
      sGrades.forEach(g => {
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

  const handleDownloadBulletin = async () => {
    if (subjectStats.length === 0) {
      toast({ variant: "destructive", title: "Erreur", description: "Aucune note disponible pour générer un bulletin." });
      return;
    }

    setIsDownloading(true);
    toast({ title: "Génération PDF", description: "Veuillez patienter..." });

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      const element = document.createElement('div');
      element.style.padding = '40px';
      element.style.width = '800px';
      element.style.backgroundColor = 'white';
      element.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #1A6B4A; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #1A6B4A; font-size: 28px; margin: 0;">EDUTRACK PRO - BÉNIN</h1>
          <h2 style="font-size: 20px; margin-top: 10px; text-transform: uppercase;">Bulletin de Notes - ${selectedTrimestre}</h2>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
            <strong>ÉLÈVE :</strong> ${student.name}<br>
            <strong>ID :</strong> ${student.id}<br>
            <strong>GENRE :</strong> ${student.sexe}
          </div>
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
            <strong>CLASSE :</strong> ${student.classLevel || 'N/A'}<br>
            <strong>ANNÉE :</strong> 2025-2026<br>
            <strong>STATUT :</strong> Régulier
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f4f7f6;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">MATIÈRE</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">COEFF.</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">MOYENNE</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">MIN CLASSE</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">MAX CLASSE</th>
            </tr>
          </thead>
          <tbody>
            ${subjectStats.map(stat => {
              const matiereId = SUBJECTS.find(s => s.name === stat.subject)?.id || '';
              const coeff = getCoefficient(student.classLevel || 'N/A', matiereId);
              return `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 12px;">${stat.subject}</td>
                  <td style="border: 1px solid #ddd; padding: 12px;">${coeff}</td>
                  <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">${stat.me.toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 12px;">${stat.min.toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 12px;">${stat.max.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #1A6B4A;">
          <strong style="font-size: 18px; color: #1A6B4A;">MOYENNE GÉNÉRALE PONDÉRÉE : ${overallStats.me.toFixed(2)} / 20</strong><br>
          <span>Mention : ${overallStats.me >= 16 ? "Très Bien" : overallStats.me >= 14 ? "Bien" : overallStats.me >= 12 ? "Assez Bien" : overallStats.me >= 10 ? "Passable" : "Insuffisant"}</span> | 
          <span>Premier de classe : ${overallStats.first.toFixed(2)}</span>
        </div>

        <div style="margin-top: 50px; text-align: right; font-style: italic; font-size: 12px;">
          Document Certifié par EduTrack Pro - Vision Scolaire Bénin
        </div>
      `;
      
      document.body.appendChild(element);
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bulletin_${selectedTrimestre}_${student.name.replace(/\s+/g, '_')}.pdf`);
      document.body.removeChild(element);

      toast({ title: "Téléchargement terminé", description: "Le bulletin PDF est prêt." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erreur PDF", description: "Échec de la génération du fichier." });
    } finally {
      setIsDownloading(false);
    }
  };

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
        <div className="flex gap-3">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border h-11 items-center">
            {['T1', 'T2', 'T3'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTrimestre(t as any)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedTrimestre === t ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <Button onClick={handleDownloadBulletin} disabled={isDownloading} className="bg-slate-900 hover:bg-slate-800 gap-2 h-11 rounded-xl font-bold shadow-lg">
            <Download className="w-4 h-4" /> Bulletin PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-700 text-white border-none shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase opacity-80">Moyenne Générale</p>
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
    </div>
  );
}
