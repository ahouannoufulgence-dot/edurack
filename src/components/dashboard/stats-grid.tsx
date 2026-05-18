
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, Clock, TrendingUp, CreditCard } from "lucide-react";
import { getGlobalStats } from "@/lib/data-service";

export function StatsGrid() {
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    globalAverage: "0.00",
    totalRevenue: "0 FCFA",
    attendanceRate: "94%"
  });

  useEffect(() => {
    setStatsData(getGlobalStats());
  }, []);

  const stats = [
    { label: "Effectif Total", value: statsData.totalStudents.toString(), icon: Users, color: "bg-blue-500", trend: "+2.4%" },
    { label: "Moyenne Générale", value: statsData.globalAverage, icon: TrendingUp, color: "bg-emerald-deep", trend: "+0.8%" },
    { label: "Recettes (Ce mois)", value: statsData.totalRevenue, icon: CreditCard, color: "bg-orange-500", trend: "+12%" },
    { label: "Réussite (Prév.)", value: "88%", icon: GraduationCap, color: "bg-purple-500", trend: "+5.1%" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card key={i} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                <div className="flex items-center gap-1 mt-2">
                  <span className={stat.trend.startsWith('+') ? "text-emerald-600 text-[10px] font-black" : "text-red-500 text-[10px] font-black"}>
                    {stat.trend}
                  </span>
                  <span className="text-[10px] text-muted-foreground">ce mois</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-2xl shadow-lg ring-4 ring-white`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
