"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert, History, UserCheck, AlertTriangle, Fingerprint, Activity, RefreshCcw } from "lucide-react";
import { getAuditLogs } from "@/lib/audit";
import { AuditLog } from "@/lib/school-types";
import { initializeDemoUsers } from "@/lib/auth-service";
import { resetTokens } from "@/lib/activation";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function SecurityDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

  const handleFullReset = () => {
    if (confirm("Voulez-vous vraiment réinitialiser toutes les données du prototype ? (Comptes de démo, jetons, logs)")) {
      localStorage.clear();
      initializeDemoUsers(true);
      resetTokens();
      toast({ title: "Système réinitialisé", description: "Toutes les données sont revenues à leur état initial." });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const stats = [
    { label: "Alertes Critiques", value: logs.filter(l => l.severity === 'critical').length, icon: ShieldAlert, color: "text-red-600" },
    { label: "Tentatives suspectes", value: logs.filter(l => l.action === 'ACCESS_DENIED').length, icon: AlertTriangle, color: "text-orange-600" },
    { label: "Modifications Notes", value: logs.filter(l => l.action === 'GRADE_UPDATE').length, icon: History, color: "text-blue-600" },
    { label: "Utilisateurs Actifs", value: 4, icon: UserCheck, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Fingerprint className="w-8 h-8 text-emerald-deep" />
            Centre de Contrôle Anti-Fraude
          </h2>
          <p className="text-muted-foreground">Surveillance en temps réel des activités sensibles.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleFullReset} className="text-red-600 border-red-200 hover:bg-red-50 gap-2">
            <RefreshCcw className="w-4 h-4" /> Réinitialiser le prototype
          </Button>
          <Badge variant="outline" className="px-4 py-1 gap-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" /> Système Actif
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={cn("p-3 rounded-full bg-secondary/50", s.color)}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" /> Journal d'Audit Système
          </CardTitle>
          <CardDescription>Actions enregistrées sur la plateforme.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horodatage</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Détails</TableHead>
                <TableHead>Sévérité</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                    Aucun événement enregistré.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-secondary/20">
                    <TableCell className="font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString('fr-BJ')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold">{log.userName}</span>
                        <span className="text-[10px] text-muted-foreground">{log.userId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-bold">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm">
                      {log.details}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        log.severity === 'critical' ? 'bg-red-600' :
                        log.severity === 'high' ? 'bg-orange-500' :
                        log.severity === 'medium' ? 'bg-blue-500' : 'bg-emerald-500'
                      )}>
                        {log.severity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
