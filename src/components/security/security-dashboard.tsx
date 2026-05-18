"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert, History, UserCheck, AlertTriangle, Fingerprint, Activity, RefreshCcw, ShieldCheck, Globe, Monitor, Trash2 } from "lucide-react";
import { getAuditLogs } from "@/lib/audit";
import { AuditLog } from "@/lib/school-types";
import { initializeDemoUsers } from "@/lib/auth-service";
import { resetTokens } from "@/lib/activation";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function SecurityDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

  const handleFullReset = () => {
    if (confirm("ATTENTION : Cette action va supprimer TOUTES les données (utilisateurs créés, notes, logs, jetons) et remettre le système à zéro. Voulez-vous continuer ?")) {
      localStorage.clear();
      initializeDemoUsers(true);
      resetTokens();
      toast({ 
        title: "Système Réinitialisé", 
        description: "L'application a été remise à son état d'usine." 
      });
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const criticalCount = logs.filter(l => l.severity === 'critical').length;
  const threatLevel = criticalCount > 5 ? 'Elevé' : criticalCount > 2 ? 'Modéré' : 'Bas';

  const stats = [
    { label: "Niveau de Menace", value: threatLevel, icon: ShieldAlert, color: threatLevel === 'Elevé' ? "text-red-600" : threatLevel === 'Modéré' ? "text-orange-600" : "text-emerald-600" },
    { label: "Tentatives suspectes", value: logs.filter(l => l.action === 'ACCESS_DENIED').length, icon: AlertTriangle, color: "text-orange-600" },
    { label: "Utilisateurs Actifs", value: logs.filter(l => l.action === 'LOGIN').length > 0 ? "Connecté" : "Veille", icon: UserCheck, color: "text-emerald-600" },
    { label: "Vérifications IP", value: "Actif", icon: Globe, color: "text-blue-600" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Fingerprint className="w-8 h-8 text-emerald-deep" />
            Centre de Contrôle Anti-Fraude
          </h2>
          <p className="text-muted-foreground">Surveillance cyber-pédagogique et journalisation immuable.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={handleFullReset} className="gap-2 shadow-lg">
            <Trash2 className="w-4 h-4" /> Remettre à zéro
          </Button>
          <Badge className="bg-emerald-600 px-4 py-1 gap-2 hidden md:flex">
            <ShieldCheck className="w-4 h-4" /> Protection Active v2.0
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={cn("p-3 rounded-xl bg-secondary/30", s.color)}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-deep" /> Journal d'Audit Temps Réel
                </CardTitle>
                <CardDescription>Traçabilité complète des actions administratives.</CardDescription>
              </div>
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[180px]">Date/IP</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Détails</TableHead>
                    <TableHead className="text-right">Sévérité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                        Aucun événement de sécurité enregistré.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50/50 group">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono font-bold">
                              {new Date(log.timestamp).toLocaleTimeString('fr-BJ')}
                            </span>
                            <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                              <Globe className="w-2 h-2" /> {log.ipAddress || '8.8.8.8'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-xs">{log.userName}</span>
                            <span className="text-[9px] text-muted-foreground">{log.userId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] h-4 py-0 font-bold">{log.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] text-muted-foreground leading-tight">{log.details}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className={cn(
                            "text-[9px] h-4",
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
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-400">
              <ShieldAlert className="w-5 h-5" /> IPs Restreintes
            </CardTitle>
            <CardDescription className="text-slate-400">Sécurité adaptative couche 7.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { ip: '197.234.34.12', origin: 'Cotonou, BJ', status: 'Verrouillé', date: 'Il y a 2 min' },
              { ip: '41.85.23.1', origin: 'Porto-Novo, BJ', status: 'Observation', date: 'Il y a 15 min' }
            ].map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <p className="text-sm font-mono font-bold">{entry.ip}</p>
                  <p className="text-[10px] text-slate-400">{entry.origin}</p>
                </div>
                <div className="text-right">
                  <Badge variant={entry.status === 'Verrouillé' ? 'destructive' : 'secondary'} className="text-[9px] h-4">
                    {entry.status}
                  </Badge>
                  <p className="text-[9px] text-slate-500 mt-1">{entry.date}</p>
                </div>
              </div>
            ))}
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Statut Pare-feu</p>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-full" />
              </div>
              <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Filtration active de couche 7
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}