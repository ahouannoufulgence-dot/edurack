
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, AbsenceRecord, DisciplineRecord, ALL_CLASSES } from "@/lib/school-types";
import { getFromStorage, addAbsence, addIncident } from "@/lib/data-service";
import { getCurrentUser } from "@/lib/auth-service";
import { Clock, ShieldAlert, UserPlus, CheckCircle, AlertTriangle, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DisciplineManager() {
  const [absences, setAbsences] = useState<AbsenceRecord[]>([]);
  const [incidents, setIncidents] = useState<DisciplineRecord[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("3e 1");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  const [newAbsence, setNewAbsence] = useState({
    eleveId: "",
    motif: "Non justifié",
    date: new Date().toISOString().split('T')[0]
  });

  const [newIncident, setNewIncident] = useState({
    eleveId: "",
    type: "Bavardage",
    sanction: "Avertissement verbal",
    description: ""
  });

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    setAbsences(getFromStorage<AbsenceRecord>('edutrack_absences'));
    setIncidents(getFromStorage<DisciplineRecord>('edutrack_discipline'));
    setStudents(getFromStorage<User>('edutrack_users').filter(u => u.role === 'Eleve'));
    
    if (user?.role === 'Eleve') {
      setSelectedClass(user.classLevel || "3e 1");
    }
  }, []);

  const handleAddAbsence = () => {
    if (!newAbsence.eleveId) return toast({ variant: "destructive", title: "Erreur", description: "Veuillez sélectionner un élève." });
    addAbsence(newAbsence);
    setAbsences(getFromStorage<AbsenceRecord>('edutrack_absences'));
    toast({ title: "Absence enregistrée" });
  };

  const handleAddIncident = () => {
    if (!newIncident.eleveId) return toast({ variant: "destructive", title: "Erreur", description: "Veuillez sélectionner un élève." });
    addIncident(newIncident);
    setIncidents(getFromStorage<DisciplineRecord>('edutrack_discipline'));
    toast({ title: "Incident enregistré", description: "Le dossier disciplinaire a été mis à jour." });
    setNewIncident({ eleveId: "", type: "Bavardage", sanction: "Avertissement verbal", description: "" });
  };

  const isEleve = currentUser?.role === 'Eleve';
  
  // Filtrage intelligent pour les élèves
  const filteredAbsences = isEleve 
    ? absences.filter(a => a.eleveId === currentUser?.id)
    : absences.filter(a => students.find(s => s.id === a.eleveId)?.classLevel === selectedClass);

  const filteredIncidents = isEleve
    ? incidents.filter(i => i.eleveId === currentUser?.id)
    : incidents.filter(i => students.find(s => s.id === i.eleveId)?.classLevel === selectedClass);

  const classStudents = students.filter(s => s.classLevel === selectedClass);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vie Scolaire</h2>
          <p className="text-muted-foreground">{isEleve ? "Mon suivi de présence et de conduite." : "Suivi des présences et de la discipline de l'établissement."}</p>
        </div>
        {!isEleve && (
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48 bg-white rounded-xl h-12 shadow-sm">
              <CalendarDays className="w-4 h-4 mr-2 text-emerald-600" />
              <SelectValue placeholder="Choisir une classe" />
            </SelectTrigger>
            <SelectContent>
              {ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      <Tabs defaultValue="absences" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1 rounded-2xl h-14">
          <TabsTrigger value="absences" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <Clock className="w-4 h-4" /> Registre des Absences
          </TabsTrigger>
          <TabsTrigger value="discipline" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <ShieldAlert className="w-4 h-4" /> Dossier Disciplinaire
          </TabsTrigger>
        </TabsList>

        <TabsContent value="absences" className="space-y-6">
          <div className={isEleve ? "w-full" : "grid lg:grid-cols-3 gap-6"}>
            {!isEleve && (
              <Card className="lg:col-span-1 border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-700">Signaler une Absence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Élève ({selectedClass})</label>
                    <Select value={newAbsence.eleveId} onValueChange={v => setNewAbsence({...newAbsence, eleveId: v})}>
                      <SelectTrigger className="bg-slate-50 border-none rounded-xl">
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {classStudents.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Motif</label>
                    <Select value={newAbsence.motif} onValueChange={v => setNewAbsence({...newAbsence, motif: v})}>
                      <SelectTrigger className="bg-slate-50 border-none rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maladie">Maladie</SelectItem>
                        <SelectItem value="Voyage">Voyage</SelectItem>
                        <SelectItem value="Problème familial">Problème familial</SelectItem>
                        <SelectItem value="Retard important">Retard important</SelectItem>
                        <SelectItem value="Non justifié">Non justifié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                    <Input 
                      type="date" 
                      value={newAbsence.date} 
                      onChange={e => setNewAbsence({...newAbsence, date: e.target.value})}
                      className="bg-slate-50 border-none rounded-xl"
                    />
                  </div>
                  <Button onClick={handleAddAbsence} className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 rounded-xl gap-2 font-bold shadow-lg">
                    <UserPlus className="w-4 h-4" /> Enregistrer l'absence
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className={isEleve ? "w-full border-none shadow-md overflow-hidden" : "lg:col-span-2 border-none shadow-md overflow-hidden"}>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="pl-6">Élève</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Motif</TableHead>
                      <TableHead className="text-right pr-6">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAbsences.map((a) => (
                      <TableRow key={a.absenceId}>
                        <TableCell className="pl-6 font-bold">
                          {isEleve ? currentUser?.name : (students.find(s => s.id === a.eleveId)?.name || a.eleveId)}
                        </TableCell>
                        <TableCell className="text-xs">{new Date(a.date).toLocaleDateString('fr-BJ')}</TableCell>
                        <TableCell><Badge variant="outline" className="font-normal">{a.motif}</Badge></TableCell>
                        <TableCell className="text-right pr-6">
                          <Badge className="bg-orange-100 text-orange-700 border-none">En attente justification</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredAbsences.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">Aucune absence enregistrée.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="discipline" className="space-y-6">
          <div className={isEleve ? "w-full" : "grid lg:grid-cols-3 gap-6"}>
            {!isEleve && (
              <Card className="lg:col-span-1 border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-red-700">Nouveau Manquement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Élève</label>
                    <Select value={newIncident.eleveId} onValueChange={v => setNewIncident({...newIncident, eleveId: v})}>
                      <SelectTrigger className="bg-slate-50 border-none rounded-xl">
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {classStudents.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Type d'incident</label>
                    <Select value={newIncident.type} onValueChange={v => setNewIncident({...newIncident, type: v})}>
                      <SelectTrigger className="bg-slate-50 border-none rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bavardage">Bavardage</SelectItem>
                        <SelectItem value="Insolence">Insolence</SelectItem>
                        <SelectItem value="Fraude">Fraude</SelectItem>
                        <SelectItem value="Bagarre">Bagarre</SelectItem>
                        <SelectItem value="Retard répété">Retard répété</SelectItem>
                        <SelectItem value="Uniforme non conforme">Uniforme non conforme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Sanction</label>
                    <Select value={newIncident.sanction} onValueChange={v => setNewIncident({...newIncident, sanction: v})}>
                      <SelectTrigger className="bg-slate-50 border-none rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Avertissement verbal">Avertissement verbal</SelectItem>
                        <SelectItem value="Blâme écrit">Blâme écrit</SelectItem>
                        <SelectItem value="Heures de colle">Heures de colle</SelectItem>
                        <SelectItem value="Exclusion 3 jours">Exclusion 3 jours</SelectItem>
                        <SelectItem value="Exclusion 1 semaine">Exclusion 1 semaine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddIncident} className="w-full bg-red-600 hover:bg-red-700 h-12 rounded-xl gap-2 font-bold shadow-lg">
                    <ShieldAlert className="w-4 h-4" /> Rapporter au CPE
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className={isEleve ? "w-full border-none shadow-md overflow-hidden" : "lg:col-span-2 border-none shadow-md overflow-hidden"}>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="pl-6">Élève / Incident</TableHead>
                      <TableHead>Sanction</TableHead>
                      <TableHead className="text-right pr-6">Gravité</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidents.map((i) => (
                      <TableRow key={i.incidentId}>
                        <TableCell className="pl-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-red-100 p-2 rounded-lg"><AlertTriangle className="w-4 h-4 text-red-600" /></div>
                            <div>
                              <p className="font-bold text-slate-800">{isEleve ? currentUser?.name : (students.find(s => s.id === i.eleveId)?.name || i.eleveId)}</p>
                              <p className="text-[10px] text-red-600 font-black uppercase tracking-tighter">{i.type}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="secondary" className="bg-slate-100 text-slate-700">{i.sanction}</Badge></TableCell>
                        <TableCell className="text-right pr-6">
                          <Badge className={i.type === 'Fraude' || i.type === 'Bagarre' ? "bg-red-600" : "bg-orange-500"}>
                            {i.type === 'Fraude' || i.type === 'Bagarre' ? 'Élevée' : 'Moyenne'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredIncidents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic">Aucun incident enregistré.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
