
"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Role, Student, ClassLevel } from '@/lib/school-types';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { CoefficientConfig } from '@/components/grades/coefficient-config';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RemediationReport } from '@/components/ai/remediation-report';
import { FileText, ChevronRight, Filter, Download, Sparkles, BrainCircuit } from 'lucide-react';
import { cn } from "@/lib/utils";

const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Koffi ADEBAYO', classLevel: 'Terminale D', photoUrl: 'https://picsum.photos/seed/s1/100/100', conduct: 'Très bien', paymentStatus: 'A jour' },
  { id: '2', name: 'Sena HOUNKPONOU', classLevel: '3e', photoUrl: 'https://picsum.photos/seed/s2/100/100', conduct: 'Bien', paymentStatus: 'Partiel' },
  { id: '3', name: 'Bio AGOSSOU', classLevel: 'Terminale C', photoUrl: 'https://picsum.photos/seed/s3/100/100', conduct: 'Assez bien', paymentStatus: 'En retard' },
  { id: '4', name: 'Marie TOUDONOU', classLevel: '4e', photoUrl: 'https://picsum.photos/seed/s4/100/100', conduct: 'Très bien', paymentStatus: 'A jour' },
];

export default function EduTrackApp() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [userRole, setUserRole] = useState<Role>('Directeur');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Bonjour, M. le Directeur</h1>
                <p className="text-muted-foreground mt-1">Voici l'aperçu de votre établissement pour aujourd'hui.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> Rapport Global</Button>
                <Button className="bg-emerald-deep gap-2"><Filter className="w-4 h-4" /> Filtrer</Button>
              </div>
            </div>
            
            <StatsGrid />

            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-white border-b py-4">
                  <CardTitle className="text-lg">Élèves Récents</CardTitle>
                  <Button variant="link" size="sm" onClick={() => setActiveModule('students')}>Voir tout</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-secondary/20">
                      <TableRow>
                        <TableHead className="pl-6">Nom</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead>Conduite</TableHead>
                        <TableHead>Paiement</TableHead>
                        <TableHead className="text-right pr-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_STUDENTS.map((student) => (
                        <TableRow 
                          key={student.id} 
                          className="group cursor-pointer hover:bg-emerald-50/50"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={student.photoUrl} />
                                <AvatarFallback>{student.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium group-hover:text-emerald-deep transition-colors">{student.name}</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="font-normal">{student.classLevel}</Badge></TableCell>
                          <TableCell>
                            <Badge className={
                              student.conduct === 'Très bien' ? 'bg-emerald-deep' : 
                              student.conduct === 'Bien' ? 'bg-accent' : 
                              'bg-orange-500'
                            }>{student.conduct}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "text-xs font-bold",
                              student.paymentStatus === 'A jour' ? 'text-emerald-deep' : 
                              student.paymentStatus === 'Partiel' ? 'text-orange-500' : 'text-red-500'
                            )}>
                              {student.paymentStatus}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="space-y-8">
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Calendrier Scolaire</CardTitle>
                    <CardDescription>Événements à venir</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { date: '12 Mars', event: 'Devoir de Math (T2)', class: 'Terminale D' },
                      { date: '15 Mars', event: 'Conseil de Classe', class: 'Collège' },
                      { date: '20 Mars', event: 'Clôture T2', class: 'Tous' }
                    ].map((ev, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="bg-secondary/50 p-2 rounded-lg text-center min-w-[50px]">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">{ev.date.split(' ')[1]}</p>
                          <p className="text-lg font-bold leading-none">{ev.date.split(' ')[0]}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold">{ev.event}</p>
                          <p className="text-xs text-muted-foreground">{ev.class}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-emerald-deep text-white border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5" /> EduTrack AI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-emerald-50 mb-4 leading-relaxed">
                      L'IA a détecté une baisse de régime en Mathématiques chez 15% des élèves de 3ème.
                    </p>
                    <Button variant="secondary" size="sm" className="w-full font-bold">Voir l'Analyse</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return <CoefficientConfig />;

      case 'ai-analyst':
        return selectedStudent ? (
          <div className="space-y-6">
            <Button variant="ghost" className="gap-2" onClick={() => setSelectedStudent(null)}>
              <ChevronRight className="w-4 h-4 rotate-180" /> Retour à la liste
            </Button>
            <RemediationReport student={selectedStudent} />
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <BrainCircuit className="w-16 h-16 mx-auto text-muted-foreground/20" />
            <h2 className="text-xl font-bold">Sélectionnez un élève pour l'analyse</h2>
            <p className="text-muted-foreground">Utilisez la liste du tableau de bord ou la gestion des élèves.</p>
            <Button onClick={() => setActiveModule('dashboard')} className="bg-emerald-deep">Aller au Tableau de Bord</Button>
          </div>
        );

      case 'students':
        return (
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-white">
              <CardTitle>Liste des Élèves</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Exporter CSV</Button>
                <Button size="sm" className="bg-emerald-deep">+ Nouvel Élève</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Nom Complet</TableHead>
                    <TableHead>Série/Classe</TableHead>
                    <TableHead>Statut Frais</TableHead>
                    <TableHead>Assiduité</TableHead>
                    <TableHead className="text-right pr-6">Profil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_STUDENTS.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8"><AvatarImage src={s.photoUrl} /></Avatar>
                          <span className="font-semibold">{s.name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{s.classLevel}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", s.paymentStatus === 'A jour' ? 'bg-emerald-500' : 'bg-orange-500')} />
                          <span className="text-xs">{s.paymentStatus}</span>
                        </div>
                      </TableCell>
                      <TableCell>98%</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedStudent(s); setActiveModule('ai-analyst'); }}>Analyse IA</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
               </Table>
            </CardContent>
          </Card>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="bg-secondary/50 p-6 rounded-full">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Module en cours de développement</h2>
            <p className="text-muted-foreground max-w-sm">Le module "{activeModule}" sera disponible dans la prochaine mise à jour.</p>
            <Button onClick={() => setActiveModule('dashboard')} variant="outline">Retour au tableau de bord</Button>
          </div>
        );
    }
  };

  return (
    <AppLayout 
      activeModule={activeModule} 
      setActiveModule={setActiveModule}
      userRole={userRole}
      setUserRole={setUserRole}
    >
      {renderModule()}
    </AppLayout>
  );
}
