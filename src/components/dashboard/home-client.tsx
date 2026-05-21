
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
import { TokenGenerator } from '@/components/admin/token-generator';
import { DisciplineManager } from '@/components/discipline/discipline-manager';
import { CoefficientConfig } from '@/components/grades/coefficient-config';
import { SecurityDashboard } from '@/components/security/security-dashboard';
import { ArchiveManager } from '@/components/admin/archive-manager';
import { UserGuide } from '@/components/dashboard/user-guide';
import { User } from '@/lib/school-types';

export default function HomeClient() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
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

  if (!isMounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-emerald-200 rounded-2xl" />
          <p className="text-emerald-800 font-bold text-xs uppercase tracking-widest">Initialisation sécurisée...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-emerald-900 p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Bienvenue, {user.nom} 👋</h1>
                  <p className="text-emerald-50/80 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                    Portail EduTrack Pro. Gestion scolaire intelligente et "Zéro Fraude".
                  </p>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
            </div>
            <StatsGrid role={user.role} />
          </div>
        );
      case 'grades': return <GradeManager user={user} />;
      case 'students': return <StudentManager />;
      case 'inscriptions': return <TokenGenerator />;
      case 'absences': return <DisciplineManager />;
      case 'payments': return <PaymentManager user={user} />;
      case 'messaging': return <MessagingCenter currentUser={user} />;
      case 'settings': return <CoefficientConfig />;
      case 'security': return <SecurityDashboard />;
      case 'archives': return <ArchiveManager />;
      case 'guide': return <UserGuide />;
      default: return <div className="p-12 text-center text-muted-foreground">Module en cours de finalisation.</div>;
    }
  };

  return (
    <AppLayout 
      activeModule={activeModule} 
      setActiveModule={setActiveModule} 
      user={user}
    >
      {renderContent()}
    </AppLayout>
  );
}
