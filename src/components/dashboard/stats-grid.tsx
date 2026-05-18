
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, Clock, TrendingUp } from "lucide-react";

export function StatsGrid() {
  const stats = [
    { label: "Total Élèves", value: "482", icon: Users, color: "bg-blue-500", trend: "+2.4%" },
    { label: "Moyenne Générale", value: "12.45", icon: TrendingUp, color: "bg-emerald-deep", trend: "+0.8%" },
    { label: "Taux Présence", value: "94%", icon: Clock, color: "bg-orange-500", trend: "-1.2%" },
    { label: "Réussite Prévisionnelle", value: "88%", icon: GraduationCap, color: "bg-purple-500", trend: "+5.1%" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card key={i} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <div className="flex items-center gap-1 mt-2">
                  <span className={stat.trend.startsWith('+') ? "text-emerald-deep text-xs font-bold" : "text-red-500 text-xs font-bold"}>
                    {stat.trend}
                  </span>
                  <span className="text-[10px] text-muted-foreground">ce mois</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-xl shadow-inner`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
