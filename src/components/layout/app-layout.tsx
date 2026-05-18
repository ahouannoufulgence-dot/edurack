"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Calendar, 
  MessageSquare, 
  CreditCard, 
  UserRound, 
  Settings, 
  Clock, 
  FileText,
  Bell,
  Search,
  LogOut,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  HelpCircle,
  Activity
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Role, User } from "@/lib/school-types";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { createAuditLog } from '@/lib/audit';
import { getCurrentUser, logout } from '@/lib/auth-service';

interface AppLayoutProps {
  children: React.ReactNode;
  activeModule: string;
  setActiveModule: (m: string) => void;
  user?: User | null;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['Directeur', 'Enseignant', 'Parent', 'Eleve'] },
  { id: 'grades', label: 'Notes & Résultats', icon: FileText, roles: ['Directeur', 'Enseignant', 'Parent', 'Eleve'] },
  { id: 'students', label: 'Gestion Elèves', icon: UserRound, roles: ['Directeur', 'Enseignant'] },
  { id: 'inscriptions', label: 'Inscriptions', icon: UserPlus, roles: ['Directeur'] },
  { id: 'absences', label: 'Absences & Discipline', icon: Clock, roles: ['Directeur', 'Enseignant', 'Parent', 'Eleve'] },
  { id: 'schedule', label: 'Emploi du temps', icon: Calendar, roles: ['Directeur', 'Enseignant', 'Parent', 'Eleve'] },
  { id: 'payments', label: 'Paiements', icon: CreditCard, roles: ['Directeur', 'Parent', 'Eleve'] },
  { id: 'messaging', label: 'Messagerie', icon: MessageSquare, roles: ['Directeur', 'Enseignant', 'Parent', 'Eleve'] },
  { id: 'ai-analyst', label: 'Analyste IA', icon: Sparkles, roles: ['Directeur', 'Enseignant'] },
  { id: 'security', label: 'Sécurité Anti-Fraude', icon: ShieldAlert, roles: ['Directeur'] },
  { id: 'settings', label: 'Paramètres', icon: Settings, roles: ['Directeur'] },
  { id: 'guide', label: 'Guide Utilisation', icon: HelpCircle, roles: ['Directeur', 'Enseignant', 'Parent', 'Eleve'] },
];

export function AppLayout({ children, activeModule, setActiveModule, user }: AppLayoutProps) {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const userRole = user?.role || 'Eleve';

  const handleLogout = useCallback(() => {
    logout();
    router.push('/login');
  }, [router]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleLogout, 15 * 60 * 1000); // 15 minutes d'inactivité
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(timeout);
    };
  }, [handleLogout]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const allowedMenuItems = MENU_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background font-body">
        <Sidebar className="border-r border-sidebar-border w-[210px] bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-emerald-deep" />
              </div>
              <span className="font-bold text-lg tracking-tight">EduTrack <span className="text-accent">Pro</span></span>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3">
            <SidebarMenu className="gap-1">
              {allowedMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveModule(item.id)}
                    isActive={activeModule === item.id}
                    className={cn(
                      "flex items-center gap-3 py-2.5 px-3 rounded-md transition-all duration-200",
                      activeModule === item.id 
                        ? "bg-sidebar-accent text-white shadow-sm" 
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-2 py-3 w-full text-left transition-colors hover:text-white group"
            >
              <LogOut className="w-4 h-4 text-sidebar-foreground/60 group-hover:text-white" />
              <span className="text-sm font-medium text-sidebar-foreground/60 group-hover:text-white">Déconnexion</span>
            </button>
          </div>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col bg-background overflow-hidden">
          <header className={cn(
            "sticky top-0 z-30 flex items-center justify-between px-6 py-3 transition-all duration-200 border-b",
            scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-border" : "bg-transparent border-transparent"
          )}>
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="relative max-w-sm hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Recherche sécurisée..." 
                  className="bg-secondary/50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none w-64 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 mr-4 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tighter">Connexion Protégée</span>
              </div>

              <div className="relative">
                <Bell className="w-5 h-5 text-muted-foreground cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white font-bold">3</span>
              </div>

              <div className="flex items-center gap-3 pl-2 border-l">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none">{user?.name || 'Invité'}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{user?.id}</p>
                </div>
                <Avatar className="w-9 h-9 border-2 border-primary/20">
                  <AvatarImage src={user?.photoUrl || "https://picsum.photos/seed/admin/100/100"} />
                  <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="p-6 md:p-8 flex-1 overflow-y-auto w-full">
            <div className="max-w-[1440px] mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
