
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_CLASSES, User } from "@/lib/school-types";
import { getFromStorage, addStudent, deleteStudent } from "@/lib/data-service";
import { GraduationCap, Trash2, UserPlus, Search, ShieldAlert, BadgeCheck } from "lucide-react";
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
  const { toast } = useToast();

  const [newStudent, setNewStudent] = useState({
    nom: "", prenom: "", classeId: "3e 1" as any, sexe: "M" as "M" | "F"
  });

  useEffect(() => {
    setStudents(getFromStorage<User>('edutrack_users').filter(u => u.role === 'Eleve'));
  }, []);

  const handleAdd = () => {
    if (!newStudent.nom || !newStudent.prenom) {
      toast({ variant: "destructive", title: "Champs manquants", description: "Veuillez remplir le nom et le prénom." });
      return;
    }
    addStudent({
      name: `${newStudent.prenom} ${newStudent.nom}`.toUpperCase(),
      nom: newStudent.nom,
      prenom: newStudent.prenom,
      classLevel: newStudent.classeId,
      sexe: newStudent.sexe
    });
    setStudents(getFromStorage<User>('edutrack_users').filter(u => u.role === 'Eleve'));
    setNewStudent({ nom: "", prenom: "", classeId: "3e 1" as any, sexe: "M" });
    toast({ title: "Inscription réussie", description: "L'élève a été ajouté à la base de données." });
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    setStudents(getFromStorage<User>('edutrack_users').filter(u => u.role === 'Eleve'));
    toast({ title: "Suppression effectuée", description: "Le dossier de l'élève a été effacé." });
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold flex items-center gap-3 text-emerald-900">
          <GraduationCap className="w-8 h-8" /> Dossiers Élèves
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher nom ou ID..." 
            className="pl-10 h-11 rounded-xl shadow-sm border-emerald-100"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 border-none shadow-md rounded-[2rem] bg-emerald-50/30">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase text-emerald-800 tracking-widest">Nouvelle Inscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Identité</label>
              <Input placeholder="NOM" value={newStudent.nom} onChange={e => setNewStudent({...newStudent, nom: e.target.value.toUpperCase()})} className="rounded-xl border-white bg-white/70" />
            </div>
            <Input placeholder="Prénom" value={newStudent.prenom} onChange={e => setNewStudent({...newStudent, prenom: e.target.value})} className="rounded-xl border-white bg-white/70" />
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Sexe</label>
                <Select value={newStudent.sexe} onValueChange={v => setNewStudent({...newStudent, sexe: v as any})}>
                  <SelectTrigger className="rounded-xl border-white bg-white/70"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Classe</label>
                <Select value={newStudent.classeId} onValueChange={v => setNewStudent({...newStudent, classeId: v as any})}>
                  <SelectTrigger className="rounded-xl border-white bg-white/70"><SelectValue /></SelectTrigger>
                  <SelectContent>{ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleAdd} className="w-full bg-emerald-800 hover:bg-emerald-900 h-12 rounded-xl font-bold gap-2 text-white shadow-lg mt-2">
              <UserPlus className="w-4 h-4" /> Inscrire l'élève
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-xl overflow-hidden rounded-[2.5rem] bg-white">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-8">ID Matricule</TableHead>
                <TableHead>Nom & Prénoms</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right pr-8">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">Aucun élève trouvé.</TableCell>
                </TableRow>
              ) : (
                filtered.map(student => (
                  <TableRow key={student.id} className="hover:bg-emerald-50/20 group">
                    <TableCell className="pl-8 font-mono font-bold text-emerald-700 text-xs">{student.id}</TableCell>
                    <TableCell className="font-bold text-slate-700">{student.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 px-3">{student.classLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <BadgeCheck className="w-4 h-4 text-emerald-500" /> Scolarisé
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-black text-slate-800">Effacer ce dossier ?</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-4 pt-2">
                              <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-3 text-red-800">
                                <ShieldAlert className="w-6 h-6 shrink-0" />
                                <div className="space-y-1">
                                  <p className="font-bold">Avertissement de Sécurité</p>
                                  <p className="text-sm">
                                    Vous allez supprimer définitivement <b>{student.name}</b> de la base de données. 
                                    Toutes ses notes et ses informations seront effacées sans possibilité de récupération.
                                  </p>
                                </div>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2 pt-4">
                            <AlertDialogCancel className="rounded-xl h-11 border-slate-200">Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(student.id)} className="bg-red-600 hover:bg-red-700 rounded-xl h-11 text-white shadow-lg">
                              Confirmer la suppression
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
