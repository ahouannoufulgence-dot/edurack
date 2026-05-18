
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_CLASSES, SUBJECTS, User, EmploiDuTemps } from "@/lib/school-types";
import { getFromStorage, saveToStorage } from "@/lib/data-service";
import { Calendar, Clock, Plus, Trash2, MapPin, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HOURS = Array.from({ length: 12 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

export function ScheduleManager({ user }: { user: User }) {
  const [selectedClass, setSelectedClass] = useState("3e 1");
  const [schedules, setSchedules] = useState<EmploiDuTemps[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const [newSlot, setNewSlot] = useState<Partial<EmploiDuTemps>>({
    jour: "Lundi",
    heureDebut: "07:00",
    heureFin: "09:00",
    matiereId: "math",
    salle: "Salle 01"
  });

  useEffect(() => {
    const data = getFromStorage<EmploiDuTemps>('edutrack_schedule');
    setSchedules(data);
  }, []);

  const handleAddSlot = () => {
    if (!newSlot.matiereId || !newSlot.heureDebut || !newSlot.heureFin) return;
    
    const slot: EmploiDuTemps = {
      edtId: `EDT-${Date.now()}`,
      classeId: selectedClass,
      jour: newSlot.jour!,
      heureDebut: newSlot.heureDebut!,
      heureFin: newSlot.heureFin!,
      matiereId: newSlot.matiereId!,
      enseignantId: SUBJECTS.find(s => s.id === newSlot.matiereId)?.enseignantId || "",
      salle: newSlot.salle || "N/A"
    };

    const updated = [...schedules, slot];
    setSchedules(updated);
    saveToStorage('edutrack_schedule', updated);
    setIsAdding(false);
    toast({ title: "Créneau ajouté", description: "L'emploi du temps a été mis à jour." });
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-700" /> Emploi du Temps
          </h2>
          <p className="text-sm text-muted-foreground">Organisation des cours par classe et série.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full md:w-48 bg-white h-11 rounded-xl">
              <SelectValue placeholder="Choisir une classe" />
            </SelectTrigger>
            <SelectContent>
              {ALL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {user.role === 'Directeur' && (
            <Button onClick={() => setIsAdding(true)} className="bg-emerald-700 hover:bg-emerald-800 gap-2 h-11 rounded-xl px-6">
              <Plus className="w-4 h-4" /> Programmer
            </Button>
          )}
        </div>
      </div>

      {isAdding && (
        <Card className="border-emerald-100 bg-emerald-50/30 animate-in slide-in-from-top duration-300">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Jour</label>
                <Select value={newSlot.jour} onValueChange={v => setNewSlot({...newSlot, jour: v})}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Début</label>
                <Select value={newSlot.heureDebut} onValueChange={v => setNewSlot({...newSlot, heureDebut: v})}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>{HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Matière</label>
                <Select value={newSlot.matiereId} onValueChange={v => setNewSlot({...newSlot, matiereId: v})}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>{SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Salle</label>
                <Input value={newSlot.salle} onChange={e => setNewSlot({...newSlot, salle: e.target.value})} className="bg-white" placeholder="ex: Salle 01" />
              </div>
              <div className="flex gap-2 md:col-span-2">
                <Button variant="outline" onClick={() => setIsAdding(false)} className="flex-1 h-10">Annuler</Button>
                <Button onClick={handleAddSlot} className="flex-1 bg-emerald-700 h-10">Confirmer</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-xl overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-7 bg-slate-50 border-b">
              <div className="p-4 border-r font-bold text-xs text-center text-muted-foreground uppercase">Heure</div>
              {DAYS.map(day => (
                <div key={day} className="p-4 border-r font-black text-xs text-center text-slate-700 uppercase">{day}</div>
              ))}
            </div>

            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-7 border-b group min-h-[80px]">
                <div className="p-4 border-r bg-slate-50/50 flex items-center justify-center">
                  <span className="text-xs font-mono font-bold text-slate-400">{hour}</span>
                </div>
                {DAYS.map(day => {
                  const slot = getSlotAt(day, hour);
                  const subject = SUBJECTS.find(s => s.id === slot?.matiereId);
                  
                  return (
                    <div key={`${day}-${hour}`} className={cn(
                      "p-2 border-r relative group/slot transition-all",
                      slot ? "bg-emerald-50/80" : "hover:bg-slate-50/50"
                    )}>
                      {slot ? (
                        <div className="h-full flex flex-col justify-center">
                          <p className="text-[10px] font-black text-emerald-800 leading-tight uppercase mb-1">
                            {subject?.name}
                          </p>
                          <div className="flex items-center gap-1 text-[8px] text-emerald-600 font-bold">
                            <MapPin className="w-2 h-2" /> {slot.salle}
                          </div>
                          {user.role === 'Directeur' && (
                            <button 
                              onClick={() => removeSlot(slot.edtId)}
                              className="absolute top-1 right-1 opacity-0 group-hover/slot:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        user.role === 'Directeur' && (
                          <div className="h-full flex items-center justify-center opacity-0 group-hover/slot:opacity-100">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => {
                              setNewSlot({...newSlot, jour: day, heureDebut: hour});
                              setIsAdding(true);
                            }}>
                              <Plus className="w-3 h-3 text-slate-300" />
                            </Button>
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

      <div className="flex gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded-sm" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cours programmés</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Zone GMT+1 (Bénin)</span>
        </div>
      </div>
    </div>
  );
}
