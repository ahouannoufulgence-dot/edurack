
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, FileCheck, BrainCircuit, ArrowRight } from "lucide-react";
import { generateRemediationReport, GenerateRemediationReportOutput } from "@/ai/flows/generate-remediation-report";
import { User, GradeRecord, SUBJECTS } from "@/lib/school-types";
import { getFromStorage, getCoefficient } from "@/lib/data-service";
import { useToast } from "@/hooks/use-toast";

interface AIReportProps {
  student: User;
}

export function RemediationReport({ student }: AIReportProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GenerateRemediationReportOutput | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const allGrades = getFromStorage<GradeRecord>('edutrack_grades');
      const studentGrades = allGrades.filter(g => g.eleveId === student.id);
      const classLevel = student.classLevel || 'N/A';

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
          rank: "Analyse des performances..."
        };
      }).filter(p => p.subjects.length > 0);

      if (academicPerformances.length === 0) {
        throw new Error("Aucune note trouvée pour cet élève.");
      }

      const result = await generateRemediationReport({
        studentName: student.name,
        className: classLevel,
        conductGrade: 'Bien',
        academicPerformances
      });
      setReport(result);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message || 'Impossible de générer le rapport.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!report ? (
        <Card className="border-dashed border-2 bg-emerald-deep/5 overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-emerald-deep/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <BrainCircuit className="w-8 h-8 text-emerald-deep" />
            </div>
            <CardTitle>Analyste Pédagogique IA</CardTitle>
            <CardDescription>Analyse réelle des moyennes pondérées de {student.name}.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="text-sm text-center max-w-md text-muted-foreground">
              Notre IA scanne les moyennes pondérées de chaque trimestre pour proposer des actions correctives basées sur les coefficients réels.
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="bg-emerald-deep hover:bg-emerald-deep/90 h-12 px-8 rounded-full font-bold shadow-lg gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? "Calcul pondéré et analyse..." : "Lancer l'analyse intelligente"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl border-none">
          <CardHeader className="bg-emerald-deep text-white rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{report.title}</CardTitle>
                <CardDescription className="text-emerald-50/80">Rapport de remédiation IA - {student.name}</CardDescription>
              </div>
              <FileCheck className="w-8 h-8 text-emerald-100" />
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <section>
              <h4 className="text-lg font-bold text-emerald-deep flex items-center gap-2 mb-3">
                <ArrowRight className="w-5 h-5" /> Évaluation Globale
              </h4>
              <p className="text-muted-foreground leading-relaxed italic">{report.overallAssessment}</p>
            </section>

            <div className="grid md:grid-cols-2 gap-8">
              <section className="bg-emerald-50/50 p-6 rounded-xl">
                <h4 className="font-bold text-emerald-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-emerald-500 rounded-full" /> Points Forts
                </h4>
                <ul className="space-y-3">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-orange-50/50 p-6 rounded-xl">
                <h4 className="font-bold text-orange-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-orange-500 rounded-full" /> Axes d'Amélioration
                </h4>
                <div className="space-y-4">
                  {report.areasForImprovement.map((area, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-sm font-bold text-orange-900">{area.subject}</p>
                      <p className="text-xs text-orange-800/80">{area.details}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4">Recommandations Générales</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{report.generalRecommendations}</p>
            </section>
          </CardContent>
          <CardFooter className="bg-gray-50 rounded-b-lg border-t flex justify-between">
            <Button variant="ghost" onClick={() => setReport(null)}>Nouvelle Analyse</Button>
            <Button variant="outline" className="gap-2">Exporter en PDF</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
