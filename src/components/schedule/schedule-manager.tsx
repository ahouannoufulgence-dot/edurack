
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_CLASSES, SUBJECTS, User, EmploiDuTemps } from "@/lib/school-types";
import { getFromStorage, saveToStorage } from "@/lib/data-service";
import { Calendar, Clock, Plus, Trash2, MapPin, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const START_HOURS = Array.from({ length: 12 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);
const END_HOURS = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

export function ScheduleManager({ user }: { user: User }) {
  const [selectedClass, setSelectedClass] = useState("3e 1");
  const [schedules, setSchedules] = useState<EmploiDuTemps[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

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
    if (!newSlot.matiereId || !newSlot.heureDebut || !newSlot.heureFin || !newSlot.jour) {
      toast({ variant: "destructive", title: "Erreur", description: "Champs manquants." });
      return;
    }
    
    const startHour = parseInt(newSlot.heureDebut.split(':')[0]);
    const endHour = parseInt(newSlot.heureFin.split(':')[0]);

    if (endHour <= startHour) {
      toast({ variant: "destructive", title: "Erreur", description: "Heure de fin invalide." });
      return;
    }

    const slot: EmploiDuTemps = {
      edtId: `EDT-${Date.now()}`,
      classeId: selectedClass,
      jour: newSlot.jour!,
      heureDebut: newSlot.heureDebut!,
      heureFin: newSlot.heureFin!,
      matiereId: newSlot.matiereId!,
      enseignantId: user.role === 'Enseignant' ? user.id : "",
      salle: newSlot.salle || "N/A"
    };

    const updated = [...schedules, slot];
    setSchedules(updated);
    saveToStorage('edutrack_schedule', updated);
    setIsAdding(false);
    toast({ title: "Cours ajouté" });
  };

  const removeSlot = (id: string) => {
    const updated = schedules.filter(s => s.edtId !== id);
    setSchedules(updated);
    saveToStorage('edutrack_schedule', updated);
    toast({ title: "Créneau supprimé" });
  };

  const classSchedules = schedules.filter(s => s.classeId === selectedClass);
  const getSlotAt = (day: string, hour: string) => classSchedules.find(s => s.jour === day && s.heureDebut === hour);
  const canEdit = user.role === 'Directeur' || user.role === 'Enseignant';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-emerald-700" /> Emploi du Temps
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Classe : <span className="text-emerald-700 font-bold">{selectedClass}</span></p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full md:w-44 bg-white h-10 rounded-xl shadow-sm text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {canEdit && (
            <Button onClick={() => setIsAdding(!isAdding)} className="bg-emerald-700 hover:bg-emerald-800 gap-2 h-10 rounded-xl px-4 text-xs shadow-md">
              <Plus className="w-4 h-4" /> {isAdding ? "Fermer" : "Ajouter"}
            </Button>
          )}
        </div>
      </div>

      {isAdding && canEdit && (
        <Card className="border-emerald-200 bg-white shadow-lg animate-in slide-in-from-top duration-300">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500">Matière</label>
                <Select value={newSlot.matiereId} onValueChange={v => setNewSlot({...newSlot, matiereId: v})}>
                  <SelectTrigger className="bg-slate-50 h-10 rounded-xl text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500">Jour</label>
                <Select value={newSlot.jour} onValueChange={v => setNewSlot({...newSlot, jour: v})}>
                  <SelectTrigger className="bg-slate-50 h-10 rounded-xl text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500">Début</label>
                <Select value={newSlot.heureDebut} onValueChange={v => setNewSlot({...newSlot, heureDebut: v})}>
                  <SelectTrigger className="bg-slate-50 h-10 rounded-xl text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{START_HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500">Fin</label>
                <Select value={newSlot.heureFin} onValueChange={v => setNewSlot({...newSlot, heureFin: v})}>
                  <SelectTrigger className="bg-slate-50 h-10 rounded-xl text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{END_HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500">Salle</label>
                <Input value={newSlot.salle} onChange={e => setNewSlot({...newSlot, salle: e.target.value})} className="bg-slate-50 h-10 rounded-xl text-xs" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleAddSlot} className="w-full sm:w-auto bg-emerald-700 h-10 px-8 text-xs font-bold rounded-xl shadow-lg">Enregistrer</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-xl overflow-hidden bg-white/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[700px] md:min-w-[900px]">
              <div className="grid grid-cols-7 bg-slate-100/80 border-b">
                <div className="p-3 border-r font-black text-[9px] text-center text-slate-500 uppercase tracking-widest">Heure</div>
                {DAYS.map(day => (
                  <div key={day} className="p-3 border-r font-black text-[10px] text-center text-emerald-900 uppercase tracking-wider">{day}</div>
                ))}
              </div>

              {START_HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-7 border-b min-h-[80px] md:min-h-[100px]">
                  <div className="p-2 border-r bg-slate-50/50 flex items-center justify-center">
                    <span className="text-[9px] font-mono font-black text-slate-500">{hour}</span>
                  </div>
                  {DAYS.map(day => {
                    const slot = getSlotAt(day, hour);
                    const subject = SUBJECTS.find(s => s.id === slot?.matiereId);
                    
                    return (
                      <div key={`${day}-${hour}`} className={cn("p-2 border-r relative transition-all flex flex-col items-center justify-center text-center", slot ? "bg-emerald-50/60" : "hover:bg-slate-50/30")}>
                        {slot ? (
                          <div className="w-full animate-in zoom-in duration-300">
                            <p className="text-[9px] font-black text-emerald-950 uppercase leading-tight mb-1">{subject?.name}</p>
                            <p className="text-[8px] font-mono text-emerald-600 mb-1">{slot.heureDebut}-{slot.heureFin}</p>
                            <div className="flex items-center justify-center gap-1 text-[8px] text-emerald-700 font-bold bg-white/50 py-0.5 px-1.5 rounded-full">
                              <MapPin className="w-2 h-2" /> {slot.salle}
                            </div>
                            {canEdit && (
                              <button onClick={() => removeSlot(slot.edtId)} className="absolute top-1 right-1 p-1 text-red-500/50 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="opacity-0 group-hover:opacity-100"><Clock className="w-3 h-3 text-slate-200" /></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
