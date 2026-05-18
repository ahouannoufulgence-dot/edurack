
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, FileCheck, BrainCircuit, ArrowRight } from "lucide-react";
import { generateRemediationReport, GenerateRemediationReportOutput } from "@/ai/flows/generate-remediation-report";
import { Student, ConductGrade } from "@/lib/school-types";
import { useToast } from "@/hooks/use-toast";

interface AIReportProps {
  student: Student;
}

export function RemediationReport({ student }: AIReportProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GenerateRemediationReportOutput | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Dummy academic data for flow - in real app, fetch from state
      const academicPerformances = [
        {
          trimester: 'T1' as const,
          subjects: [
            { name: 'Mathématiques', average: 14.5 },
            { name: 'Français', average: 11.2 },
            { name: 'SVT', average: 9.5 }
          ],
          overallAverage: 11.7,
          rank: '12ème sur 30'
        }
      ];

      const result = await generateRemediationReport({
        studentName: student.name,
        className: student.classLevel,
        conductGrade: student.conduct,
        academicPerformances
      });
      setReport(result);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de générer le rapport.' });
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
            <CardDescription>Générez un plan de remédiation personnalisé basé sur les résultats de {student.name}.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="text-sm text-center max-w-md text-muted-foreground">
              Notre IA analyse les moyennes, les rangs et la conduite pour proposer des actions concrètes d'amélioration adaptées au système béninois.
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="bg-emerald-deep hover:bg-emerald-deep/90 h-12 px-8 rounded-full font-bold shadow-lg gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {loading ? "Analyse en cours..." : "Lancer l'analyse intelligente"}
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

            <section className="border-l-4 border-emerald-deep pl-6 py-2">
              <h4 className="font-bold text-gray-900 mb-2">Conduite & Discipline</h4>
              <p className="text-sm text-muted-foreground">{report.conductFeedback}</p>
            </section>

            <section className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4">Recommandations Générales</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{report.generalRecommendations}</p>
            </section>
          </CardContent>
          <CardFooter className="bg-gray-50 rounded-b-lg border-t flex justify-between">
            <Button variant="ghost" onClick={() => setReport(null)}>Nouvelle Analyse</Button>
            <Button variant="outline" className="gap-2">Imprimer le rapport</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
