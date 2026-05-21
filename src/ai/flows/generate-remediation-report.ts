
'use server';
/**
 * @fileOverview Analyste Pédagogique IA - Génère des rapports de remédiation.
 * 
 * - generateRemediationReport - Génère un rapport pédagogique basé sur les notes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRemediationReportInputSchema = z.object({
  studentName: z.string().describe('Nom de l\'élève'),
  className: z.string().describe('Classe de l\'élève'),
  conductGrade: z.string().describe('Appréciation de conduite'),
  academicPerformances: z.array(z.object({
    trimester: z.string(),
    subjects: z.array(z.object({
      name: z.string(),
      average: z.number()
    })),
    overallAverage: z.number(),
    rank: z.string().optional()
  })).describe('Performances académiques par trimestre')
});

const GenerateRemediationReportOutputSchema = z.object({
  title: z.string().describe('Titre du rapport'),
  overallAssessment: z.string().describe('Appréciation globale du profil'),
  strengths: z.array(z.string()).describe('Liste des points forts identifiés'),
  areasForImprovement: z.array(z.object({
    subject: z.string(),
    details: z.string()
  })).describe('Axes d\'amélioration spécifiques par matière'),
  generalRecommendations: z.string().describe('Conseils de remédiation concrets et méthodologiques')
});

export type GenerateRemediationReportInput = z.infer<typeof GenerateRemediationReportInputSchema>;
export type GenerateRemediationReportOutput = z.infer<typeof GenerateRemediationReportOutputSchema>;

export async function generateRemediationReport(input: GenerateRemediationReportInput): Promise<GenerateRemediationReportOutput> {
  return generateRemediationReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRemediationReportPrompt',
  input: { schema: GenerateRemediationReportInputSchema },
  output: { schema: GenerateRemediationReportOutputSchema },
  prompt: `Tu es un expert en pédagogie scolaire, spécialisé dans le système éducatif béninois. 
Analyse les résultats réels de l'élève {{{studentName}}} (Classe: {{{className}}}).

Données de l'élève :
- Conduite : {{{conductGrade}}}
- Résultats Académiques :
{{#each academicPerformances}}
Trimestre {{{trimester}}} : Moyenne Générale {{{overallAverage}}} / 20
Détail par matière :
{{#each subjects}}
- {{{name}}} : {{{average}}} / 20
{{/each}}
{{/each}}

Ta mission est de produire un rapport de remédiation constructif et motivant.
1. Analyse les écarts entre les matières scientifiques et littéraires.
2. Identifie les points forts à encourager.
3. Propose des solutions concrètes pour les matières où la moyenne est faible.
4. Donne des conseils de méthodologie de travail spécifiques (ex: fiches de lecture, exercices de répétition).

Le ton doit être professionnel, encourageant et adapté à un contexte scolaire d'excellence.`,
});

const generateRemediationReportFlow = ai.defineFlow(
  {
    name: 'generateRemediationReportFlow',
    inputSchema: GenerateRemediationReportInputSchema,
    outputSchema: GenerateRemediationReportOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
