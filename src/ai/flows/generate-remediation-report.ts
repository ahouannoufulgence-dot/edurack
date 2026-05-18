'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate a personalized remediation report for a student.
 *
 * - generateRemediationReport - A function that handles the generation of the remediation report.
 * - GenerateRemediationReportInput - The input type for the generateRemediationReport function.
 * - GenerateRemediationReportOutput - The return type for the generateRemediationReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SubjectSummarySchema = z.object({
  name: z.string().describe('Name of the subject.'),
  average: z.number().describe('Average grade for the subject.'),
});

const TrimesterSummarySchema = z.object({
  trimester: z.enum(['T1', 'T2', 'T3']).describe('The trimester.'),
  subjects: z
    .array(SubjectSummarySchema)
    .describe('Summary of performance in each subject for the trimester.'),
  overallAverage: z.number().describe('Overall average for the trimester.'),
  rank: z.string().describe("Student's rank for the trimester (e.g., '5ème sur 30')."),
});

const GenerateRemediationReportInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  className: z
    .string()
    .describe("The class of the student (e.g., '3e', '1ère C')."),
  academicPerformances: z
    .array(TrimesterSummarySchema)
    .describe('Academic performance summarized per trimester.'),
  conductGrade: z
    .enum(['Très bien', 'Bien', 'Assez bien', 'Passable', 'Insuffisant'])
    .describe(
      "Student's conduct grade based on the school's grading system (Très bien=20, Bien=16, Assez bien=12, Passable=10, Insuffisant=6)."
    ),
});
export type GenerateRemediationReportInput = z.infer<
  typeof GenerateRemediationReportInputSchema
>;

const GenerateRemediationReportOutputSchema = z.object({
  title: z.string().describe('A clear and concise title for the report.'),
  overallAssessment:
    z.string().describe("A general assessment of the student's current academic standing and conduct."),
  strengths: z
    .array(z.string())
    .describe('List of academic strengths of the student (2-3 key points).'),
  areasForImprovement: z
    .array(
      z.object({
        subject: z.string().describe('The name of the subject.'),
        details:
          z.string().describe('Detailed feedback and specific, actionable suggestions for improvement in this subject.'),
      })
    )
    .describe(
      "Specific areas where the student needs improvement (average below 12), with suggestions. Group subjects with similar challenges if applicable."
    ),
  conductFeedback: z
    .string()
    .describe('Constructive feedback regarding the student\'s conduct.'),
  generalRecommendations: z
    .string()
    .describe('Overall recommendations for the student and parents (2-3 points) to support their learning journey.'),
});
export type GenerateRemediationReportOutput = z.infer<
  typeof GenerateRemediationReportOutputSchema
>;

export async function generateRemediationReport(
  input: GenerateRemediationReportInput
): Promise<GenerateRemediationReportOutput> {
  return generateRemediationReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'remediationReportPrompt',
  input: {schema: GenerateRemediationReportInputSchema},
  output: {schema: GenerateRemediationReportOutputSchema},
  prompt: `You are an AI pedagogical analyst for EduTrack Pro, a school management application in Benin. Your task is to generate a personalized remediation report for a student based on their academic performance and conduct. The report should provide targeted feedback and actionable suggestions for improvement.

The student's details are as follows:
Student Name: {{{studentName}}}
Class: {{{className}}}
Conduct Grade: {{{conductGrade}}}

Here is a summary of the student's academic performance across trimesters:

{{#each academicPerformances}}
--- Trimester: {{trimester}} ---
Overall Average: {{overallAverage}}
Rank: {{rank}}
Subject Performances:
{{#each subjects}}
  - {{name}}: Average = {{average}}
{{/each}}
{{/each}}

Based on this information, please generate a comprehensive remediation report in French. The report should be structured as follows:
1.  **Title**: A clear and concise title for the report.
2.  **Overall Assessment**: A general statement about the student's current academic standing and conduct.
3.  **Strengths**: Identify 2-3 key academic strengths where the student excels.
4.  **Areas for Improvement**: For each subject where the student's average is below 12, identify it as an area for improvement. For each identified subject, provide specific, actionable feedback and 1-2 suggestions for how the student can improve. Group subjects with similar challenges if applicable.
5.  **Conduct Feedback**: Provide constructive feedback based on the 'conductGrade'.
6.  **General Recommendations**: Offer 2-3 overall recommendations for the student and parents to support their learning journey.

Remember to be encouraging and constructive. The report should be in French.`,
});

const generateRemediationReportFlow = ai.defineFlow(
  {
    name: 'generateRemediationReportFlow',
    inputSchema: GenerateRemediationReportInputSchema,
    outputSchema: GenerateRemediationReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
