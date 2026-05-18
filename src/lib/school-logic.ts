
import { 
  GradeEntry, 
  CoefficientEntry, 
  SUBJECTS, 
  ConductGrade, 
  CONDUCT_VALUES 
} from './school-types';

export function getMention(average: number): string {
  if (average >= 16) return 'Très bien';
  if (average >= 14) return 'Bien';
  if (average >= 12) return 'Assez bien';
  if (average >= 10) return 'Passable';
  return 'Insuffisant';
}

export function calculateSubjectAverage(entry: GradeEntry): number {
  if (entry.subjectId === 'fr') {
    // Français: Communication x2, Lecture x1, Interrogations x3 (avg)
    const comm = entry.comm ?? 0;
    const lecture = entry.lecture ?? 0;
    const validInterros = entry.interros.filter((n) => n !== null) as number[];
    const avgInterros = validInterros.length > 0 ? validInterros.reduce((a, b) => a + b, 0) / validInterros.length : 0;
    return (2 * comm + 1 * lecture + 3 * avgInterros) / 6;
  } else {
    // Others: (Avg Interro + 3*Avg Devoirs) / 4
    const validInterros = entry.interros.filter((n) => n !== null) as number[];
    const validDevoirs = entry.devoirs.filter((n) => n !== null) as number[];
    
    const avgInterros = validInterros.length > 0 ? validInterros.reduce((a, b) => a + b, 0) / validInterros.length : 0;
    const avgDevoirs = validDevoirs.length > 0 ? validDevoirs.reduce((a, b) => a + b, 0) / validDevoirs.length : 0;
    
    return (avgInterros + 3 * avgDevoirs) / 4;
  }
}

export function calculateGeneralAverage(
  studentGrades: GradeEntry[], 
  trimester: 'T1' | 'T2' | 'T3',
  coefficients: CoefficientEntry[]
): number {
  let totalPoints = 0;
  let totalCoeffs = 0;

  studentGrades.filter(g => g.trimester === trimester).forEach(grade => {
    const coeff = coefficients.find(c => c.subjectId === grade.subjectId)?.value || 1;
    const avg = calculateSubjectAverage(grade);
    totalPoints += avg * coeff;
    totalCoeffs += coeff;
  });

  return totalCoeffs > 0 ? totalPoints / totalCoeffs : 0;
}
