
"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { User, Student } from '@/lib/school-types';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { CoefficientConfig } from '@/components/grades/coefficient-config';
import { UserGuide } from '@/components/dashboard/user-guide';
import { StudentManager } from '@/components/students/student-manager';
import { GradeManager } from '@/components/grades/grade-manager';
import { DisciplineManager } from '@/components/discipline/discipline-manager';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RemediationReport } from '@/components/ai/remediation-report';
import { SecurityDashboard } from '@/components/security/security-dashboard';
import { TokenGenerator } from '@/components/admin/token-generator';
import { FileText, ChevronRight, Filter, Download, BrainCircuit, Lock, Unlock, QrCode, UserPlus, ShieldCheck } from 'lucide-react';
import { cn } from "@/lib/utils";
import { createAuditLog } from '@/lib/audit';
import { getCurrentUser } from '@/lib/auth-service';
import { getFromStorage, addPayment } from '@/lib/data-service';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function EduTrackApp() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  if (!user) return null;

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Bonjour, {user.name}</h1>
                <p className="text-muted-foreground mt-1">
                  Espace sécurisé - Rôle : <span className="font-bold text-emerald-deep">{user.role}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => setActiveModule('guide')}><ShieldCheck className="w-4 h-4" /> Comment ça marche ?</Button>
                {user.role === 'Directeur' && <Button className="bg-emerald-deep gap-2"><Filter className="w-4 h-4" /> Filtrer</Button>}
              </div>
            </div>
            
            <StatsGrid />

            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-white border-b py-4">
                  <CardTitle className="text-lg">Derniers Élèves Inscrits</CardTitle>
                  <Button variant="link" size="sm" onClick={() => setActiveModule('students')}>Voir tout</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-secondary/20">
                      <TableRow>
                        <TableHead className="pl-6">Identifiant / Nom</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead className="text-right pr-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFromStorage<User>('edutrack_users').filter(u => u.role === 'Eleve').slice(-5).map((student) => (
                        <TableRow 
                          key={student.id} 
                          className="group cursor-pointer hover:bg-emerald-50/50"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{student.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium group-hover:text-emerald-deep transition-colors leading-none">{student.name}</p>
                                <p className="text-[10px] text-muted-foreground mt-1 font-mono">{student.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="font-normal">{student.classLevel}</Badge></TableCell>
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
                    <CardTitle className="text-lg">Alertes Sécurité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {getFromStorage<any>('edutrack_audit_logs').filter(l => l.severity === 'high' || l.severity === 'critical').slice(0, 3).map((l: any, i: number) => (
                      <div key={i} className="flex gap-3 items-start border-b pb-3 last:border-0">
                         <div className="bg-red-100 p-2 rounded-lg"><Lock className="w-4 h-4 text-red-600" /></div>
                         <div>
                            <p className="text-xs font-bold text-red-900">{l.action}</p>
                            <p className="text-[10px] text-muted-foreground">{l.details}</p>
                         </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'security':
        return <SecurityDashboard />;
      
      case 'inscriptions':
        return <TokenGenerator />;

      case 'students':
        return <StudentManager />;

      case 'grades':
        return <GradeManager user={user} />;

      case 'absences':
        return <DisciplineManager />;

      case 'settings':
        return <CoefficientConfig />;

      case 'guide':
        return <UserGuide />;

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
            <h2 className="text-xl font-bold">Analyse Pédagogique IA</h2>
            <p className="text-muted-foreground">Sélectionnez un élève dans le tableau de bord ou la gestion des élèves pour lancer l'analyse.</p>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestion des Encaissements</h2>
                {user.role === 'Directeur' && (
                  <Button className="bg-emerald-deep" onClick={() => {
                    const student = prompt("ID de l'élève ?");
                    const amount = prompt("Montant (FCFA) ?");
                    if(student && amount) addPayment({ eleveId: student, montant: parseInt(amount), statut: 'payé' });
                    toast({title: "Paiement ajouté"});
                  }}>+ Nouveau Paiement</Button>
                )}
             </div>
             <Card>
               <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">N° Reçu</TableHead>
                        <TableHead>Élève ID</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right pr-6">QR Code</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFromStorage<any>('edutrack_payments').map((p: any) => (
                        <TableRow key={p.paiementId}>
                          <TableCell className="pl-6 font-bold">{p.paiementId}</TableCell>
                          <TableCell className="font-mono">{p.eleveId}</TableCell>
                          <TableCell>{p.montant.toLocaleString()} FCFA</TableCell>
                          <TableCell>{new Date(p.datePaiement).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right pr-6"><QrCode className="w-5 h-5 text-muted-foreground inline" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
               </CardContent>
             </Card>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="bg-secondary/50 p-6 rounded-full">
              <ShieldCheck className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Module en développement</h2>
            <p className="text-muted-foreground">Accès autorisé pour {user.role}. Contenu bientôt disponible.</p>
          </div>
        );
    }
  };

  return (
    <AppLayout 
      activeModule={activeModule} 
      setActiveModule={setActiveModule}
      user={user}
    >
      {renderModule()}
    </AppLayout>
  );
}
