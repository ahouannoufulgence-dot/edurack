
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_CLASSES, Student, User } from "@/lib/school-types";
import { getFromStorage, addStudent } from "@/lib/data-service";
import { UserPlus, Search, Filter, MoreVertical, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function StudentManager() {
  const [students, setStudents] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const { toast } = useToast();

  const [newStudent, setNewStudent] = useState({
    nom: "",
    prenom: "",
    classeId: "3e 1",
    sexe: "M" as "M" | "F"
  });

  useEffect(() => {
    const data = getFromStorage<User>('edutrack_users').filter(u => u.role === 'Eleve');
    setStudents(data);
  }, []);

  const handleAdd = () => {
    if (!newStudent.nom || !newStudent.prenom) {
      toast({ variant: "destructive", title: "Erreur", description: "Nom et Prénom requis." });
      return;
    }
    addStudent({
      name: `${newStudent.prenom} ${newStudent.nom}`.toUpperCase(),
      nom: newStudent.nom.toUpperCase(),
      prenom: newStudent.prenom,
      classLevel: newStudent.classeId,
      sexe: newStudent.sexe,
      paymentStatus: 'A jour'
    });
    
    // Refresh
    setStudents(getFromStorage<User>('edutrack_users').filter(u => u.role === 'Eleve'));
    setNewStudent({ nom: "", prenom: "", classeId: "3e 1", sexe: "M" });
    toast({ title: "Élève ajouté", description: "L'identifiant a été généré selon l'ordre alphabétique." });
  };

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === "all" || s.classLevel === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6" /> Effectif Scolaire
        </h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher élève..." 
              className="pl-10 w-64 h-10 rounded-xl"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue placeholder="Toutes les classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes classes</SelectItem>
              {ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 border-none shadow-md h-fit">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Inscription Rapide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold">Nom</label>
              <Input value={newStudent.nom} onChange={e => setNewStudent({...newStudent, nom: e.target.value})} placeholder="ex: ADEBAYO" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">Prénom</label>
              <Input value={newStudent.prenom} onChange={e => setNewStudent({...newStudent, prenom: e.target.value})} placeholder="ex: Koffi" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">Classe</label>
              <Select value={newStudent.classeId} onValueChange={v => setNewStudent({...newStudent, classeId: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} className="w-full bg-emerald-deep gap-2">
              <UserPlus className="w-4 h-4" /> Enregistrer
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Identifiant</TableHead>
                  <TableHead>Nom & Prénom</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="pl-6 font-mono font-bold text-emerald-700">{student.id}</TableCell>
                    <TableCell className="font-bold">{student.name}</TableCell>
                    <TableCell><Badge variant="outline">{student.classLevel}</Badge></TableCell>
                    <TableCell>{student.sexe}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
