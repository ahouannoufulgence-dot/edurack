
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Activity,
  User as UserIcon,
  ChevronRight,
  History
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Role, User } from "@/lib/school-types";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth-service';
import { getUnreadMessageCount, getFromStorage, getActiveYear } from '@/lib/data-service';

interface AppLayoutProps {
  children: React.ReactNode;
  activeModule: string;
  setActiveModule: (m: string) => void;
  user?: User | null;
  onSearchSelect?: (student: User) => void;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Directeur', 'Enseignant', 'Parent', 'Eleve'] },
  { id: 'grades', label: 'Notes', icon: FileText, roles: ['Directeur', 'Enseignant', 'Parent', 'Eleve'] },
  { id: 'students', label: 'Élèves', icon: UserRound, roles: ['Directeur', 'Enseignant'] },
  { id: 'inscriptions', label: 'Inscriptions', icon: UserPlus, roles: ['Directeur'] },
  { id: 'absences', label: 'Vie Scolaire', icon: Clock, roles: ['Directeur', 'Enseignant', 'Parent', 'Eleve'] },
  { id: 'schedule', label: 'Horaires', icon: Calendar, roles: ['Directeur', 'Enseignant', 'Parent', 'Eleve'] },
  { id: 'payments', label: 'Paiements', icon: CreditCard, roles: ['Directeur', 'Parent', 'Eleve'] },
  { id: 'messaging', label: 'Messages', icon: MessageSquare, roles: ['Directeur', 'Enseignant', 'Parent', 'Eleve'] },
  { id: 'ai-analyst', label: 'IA Analyste', icon: Sparkles, roles: ['Directeur', 'Enseignant'] },
  { id: 'archives', label: 'Archives', icon: History, roles: ['Directeur'] },
  { id: 'security', label: 'Sécurité', icon: ShieldAlert, roles: ['Directeur'] },
  { id: 'settings', label: 'Paramètres', icon: Settings, roles: ['Directeur'] },
  { id: 'guide', label: 'Guide', icon: HelpCircle, roles: ['Directeur', 'Enseignant', 'Parent', 'Eleve'] },
];

export function AppLayout({ children, activeModule, setActiveModule, user, onSearchSelect }: AppLayoutProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeYear, setActiveYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const userRole = user?.role || 'Eleve';

  const handleLogout = useCallback(() => {
    logout();
    router.push('/login');
  }, [router]);

  const updateNotifications = useCallback(() => {
    if (user?.id) {
      setUnreadCount(getUnreadMessageCount(user.id));
      setActiveYear(getActiveYear());
    }
  }, [user?.id]);

  useEffect(() => {
    updateNotifications();
    const handleStorage = () => updateNotifications();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [updateNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      const allUsers = getFromStorage<User>('edutrack_users');
      const results = allUsers.filter(u => 
        u.name.toLowerCase().includes(query.toLowerCase()) || 
        u.id.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleResultClick = (result: User) => {
    setSearchQuery("");
    setShowResults(false);
    if (result.role === 'Eleve' && onSearchSelect) {
      onSearchSelect(result);
    } else {
      setActiveModule('students');
    }
  };

  const allowedMenuItems = MENU_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background font-body">
        <Sidebar className="border-r border-sidebar-border w-[220px] bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg shrink-0">
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-deep" />
              </div>
              <span className="font-bold text-base md:text-lg tracking-tight truncate">EduTrack <span className="text-accent">Pro</span></span>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3">
            <SidebarMenu className="gap-0.5">
              {allowedMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveModule(item.id)}
                    isActive={activeModule === item.id}
                    className={cn(
                      "flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200",
                      activeModule === item.id 
                        ? "bg-sidebar-accent text-white shadow-sm" 
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
                    )}
                  >
                    <div className="relative shrink-0">
                      <item.icon className="w-4 h-4" />
                      {item.id === 'messaging' && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full border-2 border-sidebar-background font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs md:text-sm font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-2 py-2.5 w-full text-left transition-colors hover:text-white group"
            >
              <LogOut className="w-4 h-4 text-sidebar-foreground/60 group-hover:text-white" />
              <span className="text-xs md:text-sm font-medium text-sidebar-foreground/60 group-hover:text-white">Déconnexion</span>
            </button>
          </div>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col bg-background overflow-hidden">
          <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 bg-white/80 backdrop-blur-md border-b">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="flex md:hidden" />
              <div className="relative max-w-sm hidden sm:block" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="bg-secondary/50 border-none rounded-full pl-10 pr-4 py-1.5 text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-48 md:w-64 transition-all"
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={() => searchQuery.length > 1 && setShowResults(true)}
                />
                
                {showResults && (
                  <div className="absolute top-full left-0 mt-2 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 space-y-1">
                      {searchResults.length > 0 ? (
                        searchResults.map(result => (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-[10px]">{result.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-sm font-bold truncate group-hover:text-emerald-700">{result.name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-muted-foreground">{result.id}</span>
                                <span className="text-[9px] font-bold text-emerald-600 uppercase">{result.classLevel || result.role}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-500" />
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          <p className="text-xs font-medium">Aucun résultat</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="hidden lg:flex items-center gap-2 mr-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-bold text-emerald-700 uppercase tracking-tighter">Année {activeYear}</span>
              </div>

              <div className="relative cursor-pointer" onClick={() => setActiveModule('messaging')}>
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] md:text-[10px] w-3.5 h-3.5 md:w-4 md:h-4 flex items-center justify-center rounded-full border-2 border-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 md:gap-3 pl-2 border-l">
                <div className="text-right hidden sm:block">
                  <p className="text-xs md:text-sm font-bold leading-none">{user?.name || 'Invité'}</p>
                  <p className="text-[9px] md:text-[10px] font-mono text-muted-foreground mt-0.5">{user?.id}</p>
                </div>
                <Avatar className="w-8 h-8 md:w-9 md:h-9 border-2 border-primary/20">
                  <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-8 flex-1 overflow-y-auto w-full">
            <div className="max-w-[1440px] mx-auto pb-10">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
