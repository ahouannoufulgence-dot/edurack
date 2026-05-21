
"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { User } from '@/lib/school-types';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { CoefficientConfig } from '@/components/grades/coefficient-config';
import { UserGuide } from '@/components/dashboard/user-guide';
import { StudentManager } from '@/components/students/student-manager';
import { GradeManager } from '@/components/grades/grade-manager';
import { StudentGradeView } from '@/components/grades/student-grade-view';
import { DisciplineManager } from '@/components/discipline/discipline-manager';
import { ScheduleManager } from '@/components/schedule/schedule-manager';
import { PaymentManager } from '@/components/payments/payment-manager';
import { MessagingCenter } from '@/components/messaging/messaging-center';
import { ArchiveManager } from '@/components/admin/archive-manager';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RemediationReport } from '@/components/ai/remediation-report';
import { SecurityDashboard } from '@/components/security/security-dashboard';
import { TokenGenerator } from '@/components/admin/token-generator';
import { ChevronRight, Filter, BrainCircuit, ShieldCheck, Lock } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth-service';
import { getFromStorage } from '@/lib/data-service';
import { useRouter } from 'next/navigation';

export const maxDuration = 60; // Autorise 60 secondes pour les analyses IA

export default function EduTrackApp() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) router.push('/login');
    else setUser(currentUser);
  }, [router]);

  if (!user) return null;

  const handleSearchSelect = (student: User) => {
    setSelectedStudent(student);
    setActiveModule('ai-analyst');
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Bonjour, {user.name}</h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Espace sécurisé - Rôle : <span className="font-bold text-emerald-deep">{user.role}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2 rounded-xl h-10 md:h-11" onClick={() => setActiveModule('guide')}>
                  <ShieldCheck className="w-4 h-4" /> <span className="hidden sm:inline">Comment ça marche ?</span>
                </Button>
                {user.role === 'Directeur' && (
                  <Button size="sm" className="bg-emerald-deep gap-2 rounded-xl h-10 md:h-11">
                    <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filtrer</span>
                  </Button>
                )}
              </div>
            </div>
            
            <StatsGrid role={user.role} />

            {user.role !== 'Eleve' && (
              <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                <Card className="lg:col-span-2 border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                    <CardTitle className="text-base md:text-lg">Derniers Élèves Inscrits</CardTitle>
                    <Button variant="link" size="sm" onClick={() => setActiveModule('students')} className="text-xs md:text-sm">Voir tout</Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-secondary/20">
                        <TableRow>
                          <TableHead className="pl-4 md:pl-6 text-[10px] md:text-xs uppercase font-black">Élève</TableHead>
                          <TableHead className="text-[10px] md:text-xs uppercase font-black">Classe</TableHead>
                          <TableHead className="text-right pr-4 md:pr-6 text-[10px] md:text-xs uppercase font-black">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFromStorage<User>('edutrack_users').filter(u => u.role === 'Eleve').slice(-5).map((student) => (
                          <TableRow 
                            key={student.id} 
                            className="group cursor-pointer hover:bg-emerald-50/50"
                            onClick={() => {
                              setSelectedStudent(student);
                              setActiveModule('ai-analyst');
                            }}
                          >
                            <TableCell className="pl-4 md:pl-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8 md:w-9 md:h-9">
                                  <AvatarFallback className="text-[10px] md:text-xs">{student.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="max-w-[120px] md:max-w-none">
                                  <p className="font-bold text-xs md:text-sm group-hover:text-emerald-deep transition-colors leading-none truncate">{student.name}</p>
                                  <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1 font-mono uppercase">{student.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline" className="font-bold text-[9px] md:text-[10px] px-2 h-5 rounded-full">{student.classLevel}</Badge></TableCell>
                            <TableCell className="text-right pr-4 md:pr-6">
                              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground opacity-50 md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="space-y-6 md:space-y-8">
                  <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-base md:text-lg">Alertes Sécurité</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {getFromStorage<any>('edutrack_audit_logs').filter(l => l.severity === 'high' || l.severity === 'critical').slice(0, 3).map((l: any, i: number) => (
                        <div key={i} className="flex gap-3 items-start border-b pb-3 last:border-0">
                           <div className="bg-red-100 p-2 rounded-lg shrink-0"><Lock className="w-4 h-4 text-red-600" /></div>
                           <div className="min-w-0">
                              <p className="text-[10px] md:text-xs font-black text-red-900 leading-tight uppercase truncate">{l.action}</p>
                              <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1 leading-relaxed truncate">{l.details}</p>
                           </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {user.role === 'Eleve' && (
              <Card className="border-none shadow-md bg-emerald-deep text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Bienvenue sur ton espace EduTrack</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs md:text-sm opacity-90 leading-relaxed max-w-2xl">
                    Consulte tes notes, ton emploi du temps et tes absences en toute sécurité. 
                    Tous tes résultats sont validés par tes professeurs et certifiés par la direction.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'security': return <SecurityDashboard />;
      case 'inscriptions': return <TokenGenerator />;
      case 'archives': return <ArchiveManager />;
      case 'students': return <StudentManager />;
      case 'grades': 
        return user.role === 'Eleve' ? <StudentGradeView student={user} /> : <GradeManager user={user} />;
      case 'absences': return <DisciplineManager />;
      case 'schedule': return <ScheduleManager user={user} />;
      case 'settings': return <CoefficientConfig />;
      case 'guide': return <UserGuide />;
      case 'messaging': return <MessagingCenter currentUser={user} />;
      case 'payments': return <PaymentManager user={user} />;
      case 'ai-analyst':
        const studentToAnalyze = user.role === 'Eleve' ? user : selectedStudent;
        return studentToAnalyze ? (
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {user.role !== 'Eleve' && (
              <Button variant="ghost" size="sm" className="gap-2 font-bold text-slate-500 hover:text-emerald-deep" onClick={() => setSelectedStudent(null)}>
                <ChevronRight className="w-4 h-4 rotate-180" /> Retour au tableau de bord
              </Button>
            )}
            <RemediationReport student={studentToAnalyze} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 space-y-6 text-center animate-in zoom-in duration-500 px-6">
            <div className="bg-slate-100 p-8 rounded-full">
              <BrainCircuit className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground/30" />
            </div>
            <div className="max-w-md">
              <h2 className="text-xl md:text-2xl font-black text-slate-800">Analyse Pédagogique IA</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-3 leading-relaxed">
                Notre intelligence artificielle analyse les moyennes pondérées pour proposer des solutions concrètes de réussite.
              </p>
              <p className="text-xs md:text-sm font-bold text-emerald-deep mt-4 bg-emerald-50 py-2 px-4 rounded-full inline-block">
                Sélectionnez un élève pour commencer
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-in fade-in duration-500">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <ShieldCheck className="w-12 h-12 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold">Module en développement</h2>
            <p className="text-sm text-muted-foreground mt-1">Cet espace sera bientôt disponible pour votre profil {user.role}.</p>
          </div>
        );
    }
  };

  return (
    <AppLayout 
      activeModule={activeModule} 
      setActiveModule={setActiveModule} 
      user={user}
      onSearchSelect={handleSearchSelect}
    >
      {renderModule()}
    </AppLayout>
  );
}
