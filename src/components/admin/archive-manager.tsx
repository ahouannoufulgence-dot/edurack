
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  Archive, 
  RefreshCcw, 
  Download, 
  Search, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CalendarCheck
} from "lucide-react";
import { getFromStorage, getActiveYear, closeAcademicYear, setActiveYear } from "@/lib/data-service";
import { ArchiveData, User } from "@/lib/school-types";
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
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

export function ArchiveManager() {
  const [archives, setArchives] = useState<ArchiveData[]>([]);
  const [activeYear, setActiveYearState] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setArchives(getFromStorage<ArchiveData>('edutrack_archives'));
    setActiveYearState(getActiveYear());
  }, []);

  const handleCloseYear = () => {
    const years = activeYear.split('-');
    const nextYear = `${parseInt(years[0]) + 1}-${parseInt(years[1]) + 1}`;
    
    closeAcademicYear(activeYear, nextYear);
    
    // Refresh
    setArchives(getFromStorage<ArchiveData>('edutrack_archives'));
    setActiveYearState(nextYear);
    
    toast({
      title: "Année scolaire clôturée",
      description: `L'année ${activeYear} a été archivée. Nouvelle année : ${nextYear}.`
    });
  };

  const filteredArchives = archives.filter(a => a.year.includes(searchQuery));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <History className="w-8 h-8 text-emerald-deep" />
            Gestion des Années & Archives
          </h2>
          <p className="text-muted-foreground">Année en cours : <span className="font-black text-emerald-deep">{activeYear}</span></p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 gap-2 h-12 px-6 rounded-xl shadow-lg">
              <RefreshCcw className="w-4 h-4" /> Clôturer l'Année Scolaire
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black">Clôture Annuelle de l'Établissement</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4 pt-4">
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200 text-orange-800 text-sm">
                  <p className="font-bold flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" /> Action irréversible
                  </p>
                  Cette opération va archiver l'année <span className="font-black">{activeYear}</span> et effectuer les actions suivantes :
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Promotion automatique des élèves (6e vers 5e, etc.)</li>
                    <li>Réinitialisation des notes, absences et emplois du temps</li>
                    <li>Archive complète consultable à tout moment</li>
                  </ul>
                </div>
                <p className="text-slate-500 italic">Voulez-vous procéder à la rentrée scolaire suivante ?</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="rounded-xl h-12 border-slate-200">Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleCloseYear} className="rounded-xl h-12 bg-emerald-600">
                Confirmer la Clôture et Promouvoir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-1 border-none shadow-md h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-700">Filtres Archives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Année (ex: 2024)" 
                className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] text-emerald-700 font-bold uppercase mb-2">Rappel</p>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Les archives permettent de rééditer des bulletins d'anciens élèves ou de justifier des dossiers passés.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6 py-4">Année Scolaire</TableHead>
                  <TableHead>Effectif Archivé</TableHead>
                  <TableHead>Date d'Archivage</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArchives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                      <Archive className="w-12 h-12 mx-auto mb-4 opacity-10" />
                      Aucune archive disponible pour le moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArchives.map((arc) => (
                    <TableRow key={arc.year} className="hover:bg-slate-50/50 group">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-100 p-2 rounded-lg"><CalendarCheck className="w-5 h-5 text-slate-600" /></div>
                          <span className="font-black text-slate-800">{arc.year}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100">{arc.users.filter(u => u.role === 'Eleve').length} Élèves</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(arc.timestamp).toLocaleDateString('fr-BJ')}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-100 text-emerald-700 border-none gap-1">
                          <ShieldCheck className="w-3 h-3" /> Scellé
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="outline" size="sm" className="gap-2 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <Download className="w-4 h-4" /> Consulter
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
