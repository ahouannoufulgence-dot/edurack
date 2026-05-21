
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, initializeDemoUsers } from '@/lib/auth-service';
import { AppLayout } from '@/components/layout/app-layout';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { GradeManager } from '@/components/grades/grade-manager';
import { StudentManager } from '@/components/students/student-manager';
import { MessagingCenter } from '@/components/messaging/messaging-center';
import { PaymentManager } from '@/components/payments/payment-manager';
import { ScheduleManager } from '@/components/schedule/schedule-manager';
import { DisciplineManager } from '@/components/discipline/discipline-manager';
import { TokenGenerator } from '@/components/admin/token-generator';
import { CoefficientConfig } from '@/components/grades/coefficient-config';
import { RemediationReport } from '@/components/ai/remediation-report';
import { SecurityDashboard } from '@/components/security/security-dashboard';
import { ArchiveManager } from '@/components/admin/archive-manager';
import { UserGuide } from '@/components/dashboard/user-guide';
import { User } from '@/lib/school-types';
import { StudentGradeView } from '@/components/grades/student-grade-view';

export default function HomeClient() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [selectedStudentForAI, setSelectedStudentForAI] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    initializeDemoUsers();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-emerald-200 rounded-2xl" />
          <p className="text-emerald-800 font-bold text-xs uppercase tracking-widest">Initialisation sécurisée...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleSearchSelect = (student: User) => {
    setSelectedStudentForAI(student);
    setActiveModule('ai-analyst');
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-emerald-900 p-6 md:p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2">Bienvenue, {user.nom} 👋</h1>
                  <p className="text-emerald-50/80 text-sm md:text-lg font-medium max-w-xl leading-relaxed">
                    Portail EduTrack Pro. Votre espace de gestion scolaire sécurisé.
                  </p>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
            </div>
            <StatsGrid role={user.role} />
            <div className="grid lg:grid-cols-2 gap-8">
               <UserGuide />
               <div className="bg-white p-6 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl shadow-sm flex items-center justify-center text-3xl">📚</div>
                  <h3 className="text-xl font-black text-slate-800">Système Zéro Composition</h3>
                  <p className="text-slate-500 text-sm max-w-xs">Moyennes calculées sur les interrogations (40%) et devoirs (60%).</p>
               </div>
            </div>
          </div>
        );
      case 'grades':
        return user.role === 'Eleve' ? <StudentGradeView student={user} /> : <GradeManager user={user} />;
      case 'students':
        return <StudentManager />;
      case 'inscriptions':
        return <TokenGenerator />;
      case 'absences':
        return <DisciplineManager />;
      case 'schedule':
        return <ScheduleManager user={user} />;
      case 'payments':
        return <PaymentManager user={user} />;
      case 'messaging':
        return <MessagingCenter currentUser={user} />;
      case 'ai-analyst':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <span className="bg-emerald-900 text-white p-2 rounded-xl text-xs">AI</span>
              Analyse de Remédiation
            </h2>
            {selectedStudentForAI ? (
              <RemediationReport student={selectedStudentForAI} />
            ) : (
              <div className="bg-white p-12 rounded-[2.5rem] shadow-xl text-center flex flex-col items-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl">🤖</div>
                <div className="max-w-md">
                  <h3 className="text-xl font-bold text-slate-800">Sélectionnez un élève</h3>
                  <p className="text-slate-500 mt-2">Recherchez un élève pour générer un bilan intelligent.</p>
                </div>
                <button onClick={() => setActiveModule('students')} className="bg-emerald-900 text-white px-8 py-3 rounded-xl font-bold">Liste des élèves</button>
              </div>
            )}
          </div>
        );
      case 'archives':
        return <ArchiveManager />;
      case 'security':
        return <SecurityDashboard />;
      case 'settings':
        return <CoefficientConfig />;
      case 'guide':
        return <UserGuide />;
      default:
        return <div className="p-12 text-center text-muted-foreground">Module non trouvé.</div>;
    }
  };

  return (
    <AppLayout 
      activeModule={activeModule} 
      setActiveModule={setActiveModule} 
      user={user}
      onSearchSelect={handleSearchSelect}
    >
      {renderContent()}
    </AppLayout>
  );
}
