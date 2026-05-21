
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, FileCheck, BrainCircuit, ArrowRight, Download, AlertCircle } from "lucide-react";
import { generateRemediationReport, GenerateRemediationReportOutput } from "@/ai/flows/generate-remediation-report";
import { User, GradeRecord, SUBJECTS } from "@/lib/school-types";
import { getFromStorage, getCoefficient } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AIReportProps {
  student: User;
}

export function RemediationReport({ student }: AIReportProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GenerateRemediationReportOutput | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const allGrades = getFromStorage<GradeRecord>('edutrack_grades');
      const studentGrades = allGrades.filter(g => g.eleveId === student.id);
      const classLevel = student.classLevel || 'N/A';

      if (studentGrades.length === 0) {
        throw new Error("Aucune note trouvée pour cet élève. Veuillez d'abord saisir des notes dans le module 'Notes'.");
      }

      const trimesters = ['T1', 'T2', 'T3'] as const;
      const academicPerformances = trimesters.map(t => {
        const tGrades = studentGrades.filter(g => g.trimestre === t);
        
        let totalPoints = 0;
        let totalCoeffs = 0;

        const subjects = tGrades.map(g => {
          const coeff = getCoefficient(classLevel, g.matiereId);
          totalPoints += (g.moyenne * coeff);
          totalCoeffs += coeff;
          
          return {
            name: SUBJECTS.find(s => s.id === g.matiereId)?.name || g.matiereId,
            average: g.moyenne
          };
        });
        
        const overallAverage = totalCoeffs > 0 ? totalPoints / totalCoeffs : 0;

        return {
          trimester: t,
          subjects,
          overallAverage: parseFloat(overallAverage.toFixed(2)),
          rank: "Analyse en cours..."
        };
      }).filter(p => p.subjects.length > 0);

      const result = await generateRemediationReport({
        studentName: student.name,
        className: classLevel,
        conductGrade: 'Bien',
        academicPerformances
      });
      setReport(result);
      toast({ title: "Analyse terminée", description: "Le rapport pédagogique a été généré avec succès." });
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Analyse impossible', 
        description: error.message || 'Une erreur est survenue lors de la génération.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!report) return;

    setIsDownloading(true);
    toast({ title: "Génération PDF", description: "Votre rapport est en préparation..." });

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      // Création d'un élément temporaire optimisé pour le rendu mobile/desktop
      const element = document.createElement('div');
      element.className = "p-10 bg-white text-slate-900 font-sans";
      element.style.width = '800px';
      element.style.position = 'fixed';
      element.style.left = '-9999px';
      element.style.top = '0';
      
      element.innerHTML = `
        <div style="border-top: 15px solid #1A6B4A; padding: 30px; border-bottom: 2px solid #eee;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1A6B4A; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: -1px;">EduTrack Pro - Analyse IA</h1>
            <p style="font-weight: 700; color: #666; margin-top: 5px;">Rapport de Remédiation Pédagogique</p>
          </div>
          
          <div style="margin: 30px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 800;">Élève</p>
              <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1e293b;">${student.name}</p>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 800;">Classe</p>
              <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1e293b;">${student.classLevel}</p>
            </div>
          </div>

          <div style="margin-bottom: 40px;">
            <h2 style="color: #1A6B4A; font-size: 20px; border-bottom: 2px solid #1A6B4A; padding-bottom: 8px; display: inline-block;">${report.title}</h2>
            <p style="font-style: italic; color: #475569; line-height: 1.6; margin-top: 15px;">"${report.overallAssessment}"</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
            <div style="background: #f0fdf4; padding: 20px; border-radius: 16px; border: 1px solid #bbf7d0;">
              <h3 style="color: #166534; font-size: 16px; margin-top: 0; display: flex; align-items: center; gap: 8px;">Points Forts</h3>
              <ul style="padding-left: 20px; color: #166534; font-size: 14px; margin-bottom: 0;">
                ${report.strengths.map(s => `<li style="margin-bottom: 8px;">${s}</li>`).join('')}
              </ul>
            </div>
            <div style="background: #fff7ed; padding: 20px; border-radius: 16px; border: 1px solid #ffedd5;">
              <h3 style="color: #9a3412; font-size: 16px; margin-top: 0;">Axes d'Amélioration</h3>
              ${report.areasForImprovement.map(area => `
                <div style="margin-bottom: 12px;">
                  <p style="margin: 0; font-weight: 700; font-size: 14px; color: #7c2d12;">${area.subject}</p>
                  <p style="margin: 0; font-size: 12px; color: #9a3412; line-height: 1.4;">${area.details}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="background: #f1f5f9; padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0;">
            <h3 style="color: #334155; font-size: 16px; margin-top: 0;">Recommandations Finales</h3>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 0; white-space: pre-line;">${report.generalRecommendations}</p>
          </div>

          <div style="margin-top: 50px; text-align: right; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="font-size: 10px; color: #94a3b8; font-style: italic; margin: 0;">Généré par EduTrack Pro IA le ${new Date().toLocaleDateString('fr-BJ')}</p>
          </div>
        </div>
      `;

      document.body.appendChild(element);
      
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Analyse_IA_${student.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
      
      document.body.removeChild(element);
      toast({ title: "Téléchargement réussi", description: "Le rapport PDF a été enregistré." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erreur PDF", description: "Échec de la conversion du document." });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full px-2 md:px-0">
      {!report ? (
        <Card className="border-dashed border-2 bg-emerald-50/30 overflow-hidden shadow-none">
          <CardHeader className="text-center pb-2 px-4">
            <div className="mx-auto bg-emerald-deep/10 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4">
              <BrainCircuit className="w-7 h-7 md:w-8 md:h-8 text-emerald-deep" />
            </div>
            <CardTitle className="text-lg md:text-xl">Analyste IA EduTrack</CardTitle>
            <CardDescription className="text-xs md:text-sm">Analyse pédagogique basée sur les moyennes pondérées de {student.name}.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 px-4 pb-8">
            <div className="text-xs md:text-sm text-center max-w-md text-muted-foreground leading-relaxed">
              L'IA examine chaque moyenne par matière en tenant compte des coefficients réels pour proposer des conseils de remédiation personnalisés.
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="bg-emerald-deep hover:bg-emerald-deep/90 h-12 px-8 rounded-full font-bold shadow-lg gap-2 w-full md:w-auto mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? "Calcul en cours..." : "Générer l'Analyse"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl border-none overflow-hidden">
          <CardHeader className="bg-emerald-deep text-white px-4 py-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl md:text-2xl font-black">{report.title}</CardTitle>
                <CardDescription className="text-emerald-50/80 font-medium">Bilan pédagogique personnel</CardDescription>
              </div>
              <div className="bg-white/10 p-2 rounded-xl">
                <FileCheck className="w-6 h-6 md:w-8 md:h-8 text-emerald-100" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-8 space-y-6 md:space-y-8">
            <section className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100">
              <h4 className="text-sm font-black text-emerald-deep uppercase tracking-widest flex items-center gap-2 mb-3">
                <ArrowRight className="w-4 h-4" /> Évaluation Générale
              </h4>
              <p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium italic">
                {report.overallAssessment}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <section className="bg-emerald-50/50 p-4 md:p-6 rounded-2xl border border-emerald-100/50">
                <h4 className="font-black text-emerald-800 text-xs md:text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full" /> Points Forts
                </h4>
                <ul className="space-y-3">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-emerald-900">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="font-medium">{s}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-orange-50/50 p-4 md:p-6 rounded-2xl border border-orange-100/50">
                <h4 className="font-black text-orange-800 text-xs md:text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-orange-500 rounded-full" /> Axes d'Amélioration
                </h4>
                <div className="space-y-4">
                  {report.areasForImprovement.map((area, i) => (
                    <div key={i} className="space-y-1.5 group">
                      <p className="text-xs md:text-sm font-bold text-orange-900 group-hover:text-orange-700 transition-colors">{area.subject}</p>
                      <p className="text-[11px] md:text-xs text-orange-800/80 leading-relaxed">{area.details}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-dashed border-slate-300">
              <h4 className="font-black text-slate-900 text-xs md:text-sm uppercase tracking-widest mb-4">Recommandations pour la réussite</h4>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">{report.generalRecommendations}</p>
            </section>
          </CardContent>
          <CardFooter className="bg-slate-50/50 px-4 py-4 md:p-6 border-t flex flex-col md:flex-row gap-3 md:justify-between items-center">
            <Button variant="ghost" onClick={() => setReport(null)} className="text-xs font-bold text-slate-500 hover:text-emerald-deep w-full md:w-auto">
              Refaire l'analyse
            </Button>
            <Button 
              variant="default" 
              onClick={handleDownloadPdf} 
              disabled={isDownloading} 
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 font-bold shadow-md w-full md:w-auto gap-2"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isDownloading ? "Conversion..." : "Télécharger PDF"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
