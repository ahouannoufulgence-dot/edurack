
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_CLASSES, SUBJECTS, User, EmploiDuTemps } from "@/lib/school-types";
import { getFromStorage, saveToStorage } from "@/lib/data-service";
import { Calendar, Clock, Plus, Trash2, MapPin, User as UserIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HOURS = Array.from({ length: 12 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

export function ScheduleManager({ user }: { user: User }) {
  const [selectedClass, setSelectedClass] = useState("3e 1");
  const [schedules, setSchedules] = useState<EmploiDuTemps[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  // Filtrer les matières disponibles si c'est un enseignant
  const availableSubjects = user.role === 'Enseignant' 
    ? SUBJECTS.filter(s => user.matieresAttribuees?.includes(s.id))
    : SUBJECTS;

  const [newSlot, setNewSlot] = useState<Partial<EmploiDuTemps>>({
    jour: "Lundi",
    heureDebut: "07:00",
    heureFin: "09:00",
    matiereId: availableSubjects[0]?.id || "math",
    salle: "Salle 01"
  });

  useEffect(() => {
    const data = getFromStorage<EmploiDuTemps>('edutrack_schedule');
    setSchedules(data);
  }, []);

  const handleAddSlot = () => {
    if (!newSlot.matiereId || !newSlot.heureDebut) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez remplir les informations du cours." });
      return;
    }
    
    const hourNum = parseInt(newSlot.heureDebut.split(':')[0]);
    const endHour = `${(hourNum + 2).toString().padStart(2, '0')}:00`;

    const slot: EmploiDuTemps = {
      edtId: `EDT-${Date.now()}`,
      classeId: selectedClass,
      jour: newSlot.jour!,
      heureDebut: newSlot.heureDebut!,
      heureFin: endHour,
      matiereId: newSlot.matiereId!,
      enseignantId: user.role === 'Enseignant' ? user.id : (SUBJECTS.find(s => s.id === newSlot.matiereId)?.enseignantId || ""),
      salle: newSlot.salle || "N/A"
    };

    const updated = [...schedules, slot];
    setSchedules(updated);
    saveToStorage('edutrack_schedule', updated);
    setIsAdding(false);
    toast({ title: "Cours programmé", description: `Le cours de ${SUBJECTS.find(s => s.id === slot.matiereId)?.name} a été ajouté.` });
  };

  const removeSlot = (id: string) => {
    const updated = schedules.filter(s => s.edtId !== id);
    setSchedules(updated);
    saveToStorage('edutrack_schedule', updated);
    toast({ title: "Créneau supprimé" });
  };

  const classSchedules = schedules.filter(s => s.classeId === selectedClass);

  const getSlotAt = (day: string, hour: string) => {
    return classSchedules.find(s => s.jour === day && s.heureDebut === hour);
  };

  const canEdit = user.role === 'Directeur' || user.role === 'Enseignant';

  const openFormForCell = (day: string, hour: string) => {
    if (!canEdit) return;
    setNewSlot({
      ...newSlot,
      jour: day,
      heureDebut: hour,
      matiereId: availableSubjects[0]?.id || "math",
      salle: "Salle 01"
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-700" /> Gestion du Temps Scolaire
          </h2>
          <p className="text-sm text-muted-foreground">
            {canEdit ? "Cliquez sur une case pour programmer un cours." : "Consultez l'organisation des cours."} ({selectedClass})
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full md:w-48 bg-white h-11 rounded-xl shadow-sm">
              <SelectValue placeholder="Choisir une classe" />
            </SelectTrigger>
            <SelectContent>
              {ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {canEdit && (
            <Button onClick={() => setIsAdding(!isAdding)} className="bg-emerald-700 hover:bg-emerald-800 gap-2 h-11 rounded-xl px-6 shadow-md transition-all active:scale-95">
              <Plus className="w-4 h-4" /> {isAdding ? "Fermer" : "Programmer"}
            </Button>
          )}
        </div>
      </div>

      {isAdding && canEdit && (
        <Card className="border-emerald-200 bg-emerald-50/50 animate-in slide-in-from-top duration-300 border-2">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-emerald-800">Matière</label>
                <Select value={newSlot.matiereId} onValueChange={v => setNewSlot({...newSlot, matiereId: v})}>
                  <SelectTrigger className="bg-white border-emerald-100"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    {availableSubjects.length === 0 && <SelectItem value="none" disabled>Aucune matière attribuée</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-emerald-800">Jour</label>
                <Select value={newSlot.jour} onValueChange={v => setNewSlot({...newSlot, jour: v})}>
                  <SelectTrigger className="bg-white border-emerald-100"><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-emerald-800">Heure de début</label>
                <Select value={newSlot.heureDebut} onValueChange={v => setNewSlot({...newSlot, heureDebut: v})}>
                  <SelectTrigger className="bg-white border-emerald-100"><SelectValue /></SelectTrigger>
                  <SelectContent>{HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-emerald-800">Salle</label>
                <Input value={newSlot.salle} onChange={e => setNewSlot({...newSlot, salle: e.target.value})} className="bg-white border-emerald-100" placeholder="ex: Salle 01" />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddSlot} 
                  className="flex-1 bg-emerald-700 h-10 font-bold shadow-sm"
                  disabled={user.role === 'Enseignant' && availableSubjects.length === 0}
                >
                  Valider le créneau
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-xl overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-7 bg-slate-100/80 border-b">
              <div className="p-4 border-r font-black text-[10px] text-center text-slate-500 uppercase tracking-widest">Horaire</div>
              {DAYS.map(day => (
                <div key={day} className="p-4 border-r font-black text-xs text-center text-emerald-900 uppercase tracking-wider">{day}</div>
              ))}
            </div>

            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-7 border-b group min-h-[90px]">
                <div className="p-4 border-r bg-slate-50/50 flex flex-col items-center justify-center">
                  <span className="text-xs font-mono font-black text-slate-500">{hour}</span>
                  <div className="h-4 w-[2px] bg-slate-200 my-1" />
                  <span className="text-[10px] font-mono text-slate-400">{(parseInt(hour)+2).toString().padStart(2, '0')}:00</span>
                </div>
                {DAYS.map(day => {
                  const slot = getSlotAt(day, hour);
                  const subject = SUBJECTS.find(s => s.id === slot?.matiereId);
                  
                  return (
                    <div 
                      key={`${day}-${hour}`} 
                      onClick={() => !slot && openFormForCell(day, hour)}
                      className={cn(
                        "p-2 border-r relative group/slot transition-all flex flex-col items-center justify-center text-center",
                        slot ? "bg-emerald-50/60 shadow-inner" : (canEdit ? "hover:bg-emerald-50/30 cursor-pointer" : "")
                      )}
                    >
                      {slot ? (
                        <div className="w-full animate-in zoom-in duration-300">
                          <p className="text-[10px] font-black text-emerald-900 leading-tight uppercase mb-1 px-1">
                            {subject?.name}
                          </p>
                          <div className="flex items-center justify-center gap-1 text-[9px] text-emerald-600 font-bold">
                            <MapPin className="w-2.5 h-2.5" /> {slot.salle}
                          </div>
                          {canEdit && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSlot(slot.edtId);
                              }}
                              className="absolute top-1 right-1 opacity-0 group-hover/slot:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        canEdit && (
                          <div className="opacity-0 group-hover/slot:opacity-100 flex flex-col items-center gap-1">
                            <Plus className="w-4 h-4 text-emerald-300" />
                            <span className="text-[8px] font-black text-emerald-400 uppercase">Ajouter</span>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-6 mt-4 p-4 bg-white/50 rounded-2xl border border-dashed border-emerald-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded-sm" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Créneaux de 2h standards</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-700">
          <AlertCircle className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {canEdit ? "Astuce : Cliquez sur une case vide pour remplir plus vite" : "L'emploi du temps est géré par l'administration et les professeurs"}
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fuseau : Porto-Novo (GMT+1)</span>
        </div>
      </div>
    </div>
  );
}
