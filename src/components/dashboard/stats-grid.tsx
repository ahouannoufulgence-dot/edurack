
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, TrendingUp, CreditCard } from "lucide-react";
import { getGlobalStats } from "@/lib/data-service";

interface StatsGridProps {
  role?: string;
}

export function StatsGrid({ role }: StatsGridProps) {
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    globalAverage: "0.00",
    totalRevenue: "0 FCFA",
    attendanceRate: "94%"
  });

  const refreshStats = () => {
    setStatsData(getGlobalStats());
  };

  useEffect(() => {
    refreshStats();
    window.addEventListener('storage', refreshStats);
    return () => window.removeEventListener('storage', refreshStats);
  }, []);

  const allStats = [
    { label: "Effectif Total", value: statsData.totalStudents.toString(), icon: Users, color: "bg-blue-500", trend: "+2.4%" },
    { label: "Moyenne Générale", value: statsData.globalAverage, icon: TrendingUp, color: "bg-emerald-700", trend: "+0.8%" },
    { label: "Recettes Totales", value: statsData.totalRevenue, icon: CreditCard, color: "bg-orange-500", trend: "+12%", private: true },
    { label: "Taux de Présence", value: statsData.attendanceRate, icon: Clock, color: "bg-purple-500", trend: "Stable" },
  ];

  // Filtrer les statistiques selon le rôle
  const visibleStats = allStats.filter(stat => !stat.private || role === 'Directeur');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {visibleStats.map((stat, i) => (
        <Card key={i} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all bg-white/50 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] md:text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-xl md:text-2xl font-black text-slate-800">{stat.value}</h3>
                <div className="flex items-center gap-1 mt-2">
                  <span className={stat.trend.startsWith('+') ? "text-emerald-600 text-[9px] md:text-[10px] font-black" : "text-slate-400 text-[9px] md:text-[10px] font-black"}>
                    {stat.trend}
                  </span>
                  <span className="text-[9px] md:text-[10px] text-muted-foreground ml-1">temps réel</span>
                </div>
              </div>
              <div className={`${stat.color} p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-lg ring-4 ring-white`}>
                <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
