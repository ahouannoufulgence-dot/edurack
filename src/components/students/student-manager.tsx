
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_CLASSES, User } from "@/lib/school-types";
import { getFromStorage, addStudent, deleteStudent } from "@/lib/data-service";
import { UserPlus, Search, GraduationCap, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
      sexe: newStudent.sexe
    });
    
    setStudents(getFromStorage<User>('edutrack_users').filter(u => u.role === 'Eleve'));
    setNewStudent({ nom: "", prenom: "", classeId: "3e 1", sexe: "M" });
    toast({ title: "Élève ajouté", description: "L'identifiant a été généré." });
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    setStudents(getFromStorage<User>('edutrack_users').filter(u => u.role === 'Eleve'));
    toast({ title: "Élève supprimé", description: "Le compte a été effacé." });
  };

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass === "all" || s.classLevel === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-emerald-800" /> Gestion des Élèves
        </h2>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-10 w-full md:w-64 h-10 rounded-xl"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-full md:w-40 rounded-xl h-10">
              <SelectValue placeholder="Classe" />
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
            <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-700">Inscription Rapide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500">Nom</label>
              <Input value={newStudent.nom} onChange={e => setNewStudent({...newStudent, nom: e.target.value.toUpperCase()})} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500">Prénom</label>
              <Input value={newStudent.prenom} onChange={e => setNewStudent({...newStudent, prenom: e.target.value})} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500">Classe</label>
              <Select value={newStudent.classeId} onValueChange={v => setNewStudent({...newStudent, classeId: v})}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} className="w-full bg-emerald-800 hover:bg-emerald-900 h-11 rounded-xl gap-2 font-bold shadow-md text-white">
              <UserPlus className="w-4 h-4" /> Enregistrer l'élève
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="pl-6 py-4">ID / Identifiant</TableHead>
                    <TableHead>Nom & Prénom</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((student) => (
                    <TableRow key={student.id} className="hover:bg-emerald-50/20 transition-colors">
                      <TableCell className="pl-6 font-mono font-bold text-emerald-700 text-xs">{student.id}</TableCell>
                      <TableCell className="font-bold text-sm">{student.name}</TableCell>
                      <TableCell><Badge variant="outline" className="rounded-full px-3">{student.classLevel}</Badge></TableCell>
                      <TableCell className="text-right pr-6">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-black text-slate-800">Supprimer le compte élève ?</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-500 py-2">
                                Êtes-vous sûr de vouloir supprimer définitivement l'élève <b>{student.name}</b> ({student.id}) ? 
                                <br/><br/>
                                <span className="text-red-600 font-bold bg-red-50 p-2 rounded-lg block text-xs">
                                  Attention : Cette action effacera également toutes ses notes, ses paiements et son historique.
                                </span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                              <AlertDialogCancel className="rounded-xl h-11 border-slate-200">Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(student.id)} className="bg-red-600 hover:bg-red-700 rounded-xl h-11 font-bold text-white">
                                Confirmer la suppression
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic text-xs">
                        Aucun élève trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
