
"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { User, Student } from '@/lib/school-types';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { CoefficientConfig } from '@/components/grades/coefficient-config';
import { UserGuide } from '@/components/dashboard/user-guide';
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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const MOCK_STUDENTS: Student[] = [
  { id: 'ELV-TLED-001', name: 'Koffi ADEBAYO', classLevel: 'Tle D', photoUrl: 'https://picsum.photos/seed/s1/100/100', conduct: 'Très bien', paymentStatus: 'A jour' },
  { id: 'ELV-3E1-012', name: 'Sena HOUNKPONOU', classLevel: '3e 1', photoUrl: 'https://picsum.photos/seed/s2/100/100', conduct: 'Bien', paymentStatus: 'Partiel' },
  { id: 'ELV-TLEC-005', name: 'Bio AGOSSOU', classLevel: 'Tle C', photoUrl: 'https://picsum.photos/seed/s3/100/100', conduct: 'Assez bien', paymentStatus: 'En retard' },
  { id: 'ELV-4E2-024', name: 'Marie TOUDONOU', classLevel: '4e 2', photoUrl: 'https://picsum.photos/seed/s4/100/100', conduct: 'Très bien', paymentStatus: 'A jour' },
];

export default function EduTrackApp() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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

  useEffect(() => {
    if (user && activeModule === 'security' && user.role !== 'Directeur') {
      createAuditLog(user.id, user.name, 'ACCESS_DENIED', `Accès refusé au module Sécurité`, null, null, 'high');
      setActiveModule('dashboard');
      toast({
        variant: 'destructive',
        title: 'Accès Refusé',
        description: 'Seul le Directeur peut accéder à ce module.'
      });
    }
  }, [activeModule, user, toast]);

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
                  <CardTitle className="text-lg">Élèves Récents</CardTitle>
                  <Button variant="link" size="sm" onClick={() => setActiveModule('students')}>Voir tout</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-secondary/20">
                      <TableRow>
                        <TableHead className="pl-6">Identifiant / Nom</TableHead>
                        <TableHead>Classe</TableHead>
                        {user.role === 'Directeur' && <TableHead>Paiement</TableHead>}
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
                              <div>
                                <p className="font-medium group-hover:text-emerald-deep transition-colors leading-none">{student.name}</p>
                                <p className="text-[10px] text-muted-foreground mt-1 font-mono">{student.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="font-normal">{student.classLevel}</Badge></TableCell>
                          {user.role === 'Directeur' && (
                            <TableCell>
                              <span className={cn(
                                "text-xs font-bold",
                                student.paymentStatus === 'A jour' ? 'text-emerald-deep' : 
                                student.paymentStatus === 'Partiel' ? 'text-orange-500' : 'text-red-500'
                              )}>
                                {student.paymentStatus}
                              </span>
                            </TableCell>
                          )}
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
                      { date: '12 Mars', event: 'Devoir de Math (T2)', class: 'Tle D' },
                      { date: '15 Mars', event: 'Conseil de Classe', class: 'Collège' }
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

                {user.role === 'Directeur' && (
                  <Card className="bg-emerald-600 text-white border-none shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Centre d'Accès</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-emerald-50 mb-4 leading-relaxed">
                        Gérez les identifiants DIR/ENS/ELV/PAR et surveillez les connexions.
                      </p>
                      <Button variant="secondary" size="sm" className="w-full font-bold" onClick={() => setActiveModule('security')}>
                        Voir le Dashboard Sécurité
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        );

      case 'security':
        return <SecurityDashboard />;
      
      case 'inscriptions':
        return <TokenGenerator />;

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
            <p className="text-muted-foreground">Sélectionnez un élève pour lancer l'analyse.</p>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestion des Encaissements</h2>
                {user.role === 'Directeur' && <Button className="bg-emerald-deep">+ Nouveau Paiement</Button>}
             </div>
             <Card>
               <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Reçu</TableHead>
                        <TableHead>Élève</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>QR Code</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { id: '1', num: 'REC-2024-001', student: 'Koffi ADEBAYO', amount: '150 000 FCFA', date: '01/03/2024' },
                        { id: '2', num: 'REC-2024-002', student: 'Sena HOUNKPONOU', amount: '75 000 FCFA', date: '03/03/2024' },
                      ].map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-bold">{p.num}</TableCell>
                          <TableCell>{p.student}</TableCell>
                          <TableCell>{p.amount}</TableCell>
                          <TableCell>{p.date}</TableCell>
                          <TableCell><QrCode className="w-6 h-6 text-muted-foreground" /></TableCell>
                          <TableCell className="text-right">
                             <Button variant="outline" size="sm">Imprimer Reçu</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
               </CardContent>
             </Card>
          </div>
        );

      case 'grades':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Notes et Résultats</h2>
              {user.role === 'Enseignant' && <Button className="bg-emerald-deep">Saisir des notes</Button>}
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Élève</TableHead>
                      <TableHead>Matière</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Auteur</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: '1', name: 'Koffi ADEBAYO', sub: 'Mathématiques', val: 14.5, locked: true, author: 'M. Saliou' },
                      { id: '2', name: 'Koffi ADEBAYO', sub: 'Français', val: 12.0, locked: false, author: 'Mme Gnonlonfin' },
                    ].map((n) => (
                      <TableRow key={n.id}>
                        <TableCell className="font-medium">{n.name}</TableCell>
                        <TableCell>{n.sub}</TableCell>
                        <TableCell className="font-bold">{n.val}/20</TableCell>
                        <TableCell>
                          {n.locked ? (
                            <Badge className="bg-emerald-600 gap-1"><Lock className="w-3 h-3" /> Verrouillée</Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-orange-600 border-orange-600"><Unlock className="w-3 h-3" /> Brouillon</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{n.author}</TableCell>
                        <TableCell className="text-right">
                          {n.locked ? (
                             user.role === 'Directeur' ? <Button variant="ghost" size="sm">Déverrouiller</Button> : <span className="text-xs text-muted-foreground">Protégé</span>
                          ) : (
                            <Button variant="ghost" size="sm">Modifier</Button>
                          )}
                        </TableCell>
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
