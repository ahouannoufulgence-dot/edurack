
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
const HOURS = Array.from({ length: 12 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

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
    matiereId: availableSubjects[0]?.id || "math",
    salle: "Salle 01"
  });

  useEffect(() => {
    const data = getFromStorage<EmploiDuTemps>('edutrack_schedule');
    setSchedules(data);
  }, []);

  const handleAddSlot = () => {
    if (!newSlot.matiereId || !newSlot.heureDebut || !newSlot.jour) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez remplir tous les champs." });
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
    toast({ title: "Cours ajouté", description: "L'emploi du temps a été mis à jour." });
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-700" /> Emploi du Temps
          </h2>
          <p className="text-sm text-muted-foreground">Classe : <span className="font-bold text-emerald-700">{selectedClass}</span></p>
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
              <Plus className="w-4 h-4" /> {isAdding ? "Fermer" : "Nouveau cours"}
            </Button>
          )}
        </div>
      </div>

      {isAdding && canEdit && (
        <Card className="border-emerald-200 bg-white shadow-xl animate-in slide-in-from-top duration-300 border-2">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500">Matière</label>
                <Select value={newSlot.matiereId} onValueChange={v => setNewSlot({...newSlot, matiereId: v})}>
                  <SelectTrigger className="bg-slate-50 border-none h-12 rounded-xl">
                    <SelectValue placeholder="Matière" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500">Jour</label>
                <Select value={newSlot.jour} onValueChange={v => setNewSlot({...newSlot, jour: v})}>
                  <SelectTrigger className="bg-slate-50 border-none h-12 rounded-xl">
                    <SelectValue placeholder="Jour" />
                  </SelectTrigger>
                  <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500">Heure du cours</label>
                <Select value={newSlot.heureDebut} onValueChange={v => setNewSlot({...newSlot, heureDebut: v})}>
                  <SelectTrigger className="bg-slate-50 border-none h-12 rounded-xl">
                    <SelectValue placeholder="Heure" />
                  </SelectTrigger>
                  <SelectContent>{HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500">Salle</label>
                <Input 
                  value={newSlot.salle} 
                  onChange={e => setNewSlot({...newSlot, salle: e.target.value})} 
                  className="bg-slate-50 border-none h-12 rounded-xl" 
                  placeholder="Ex: Salle 01" 
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleAddSlot} className="bg-emerald-700 h-12 px-10 font-bold rounded-xl shadow-lg">
                Enregistrer le cours
              </Button>
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
              <div key={hour} className="grid grid-cols-7 border-b group min-h-[95px]">
                <div className="p-4 border-r bg-slate-50/50 flex flex-col items-center justify-center">
                  <span className="text-xs font-mono font-black text-slate-600">{hour}</span>
                  <div className="h-4 w-[2px] bg-emerald-200 my-1" />
                  <span className="text-[10px] font-mono text-slate-400">{(parseInt(hour)+2).toString().padStart(2, '0')}:00</span>
                </div>
                {DAYS.map(day => {
                  const slot = getSlotAt(day, hour);
                  const subject = SUBJECTS.find(s => s.id === slot?.matiereId);
                  
                  return (
                    <div 
                      key={`${day}-${hour}`} 
                      className={cn(
                        "p-3 border-r relative group/slot transition-all flex flex-col items-center justify-center text-center",
                        slot ? "bg-emerald-50/80" : ""
                      )}
                    >
                      {slot ? (
                        <div className="w-full animate-in zoom-in duration-300">
                          <p className="text-[10px] font-black text-emerald-950 leading-tight uppercase mb-2">
                            {subject?.name}
                          </p>
                          <div className="flex items-center justify-center gap-1.5 text-[9px] text-emerald-700 font-bold bg-white/60 py-1 px-2 rounded-full inline-flex">
                            <MapPin className="w-2.5 h-2.5" /> {slot.salle}
                          </div>
                          {canEdit && (
                            <button 
                              onClick={() => removeSlot(slot.edtId)}
                              className="absolute top-1 right-1 opacity-0 group-hover/slot:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="opacity-0 group-hover/slot:opacity-50">
                           <Clock className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
        <AlertCircle className="w-4 h-4 text-emerald-600" />
        <span className="text-xs font-medium text-emerald-800 tracking-tight">
          Note : Les cours programmés sont enregistrés instantanément et visibles par tous les élèves de la classe sélectionnée.
        </span>
      </div>
    </div>
  );
}
