
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getFromStorage, addPayment } from "@/lib/data-service";
import { PaymentRecord, User } from "@/lib/school-types";
import { CreditCard, Plus, QrCode, Search, TrendingUp, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function PaymentManager({ user }: { user: User }) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const [newPayment, setNewPayment] = useState({
    eleveId: "",
    montant: 0,
    typePaiement: "Scolarité"
  });

  useEffect(() => {
    setPayments(getFromStorage<PaymentRecord>('edutrack_payments'));
    setStudents(getFromStorage<User>('edutrack_users').filter(u => u.role === 'Eleve'));
  }, []);

  const handleAdd = () => {
    if (!newPayment.eleveId || newPayment.montant <= 0) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez remplir tous les champs correctement." });
      return;
    }
    addPayment(newPayment);
    setPayments(getFromStorage<PaymentRecord>('edutrack_payments'));
    setNewPayment({ eleveId: "", montant: 0, typePaiement: "Scolarité" });
    toast({ title: "Paiement enregistré", description: "Le reçu a été généré avec succès." });
  };

  const filtered = payments.filter(p => p.eleveId.toLowerCase().includes(search.toLowerCase()));
  const totalCollected = payments.reduce((acc, curr) => acc + curr.montant, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-600 text-white border-none shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase opacity-80">Recettes Totales</p>
              <h3 className="text-2xl font-black">{totalCollected.toLocaleString()} FCFA</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white border-none shadow-lg">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl"><Wallet className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase opacity-80">Transactions</p>
              <h3 className="text-2xl font-black">{payments.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {user.role === 'Directeur' && (
          <Card className="lg:col-span-1 border-none shadow-md h-fit">
            <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-700">Nouvel Encaissement</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold">Élève</label>
                <Select value={newPayment.eleveId} onValueChange={v => setNewPayment({...newPayment, eleveId: v})}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Type</label>
                <Select value={newPayment.typePaiement} onValueChange={v => setNewPayment({...newPayment, typePaiement: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scolarité">Scolarité</SelectItem>
                    <SelectItem value="Cantine">Cantine</SelectItem>
                    <SelectItem value="Examen">Frais d'Examen</SelectItem>
                    <SelectItem value="Uniforme">Uniforme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Montant (FCFA)</label>
                <Input type="number" value={newPayment.montant} onChange={e => setNewPayment({...newPayment, montant: parseInt(e.target.value)})} />
              </div>
              <Button onClick={handleAdd} className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 font-bold h-12 rounded-xl">
                <Plus className="w-4 h-4" /> Valider l'encaissement
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className={user.role === 'Directeur' ? "lg:col-span-3 border-none shadow-md" : "lg:col-span-4 border-none shadow-md"}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Historique des Transactions</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Chercher ID élève..." 
                className="pl-9 h-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6">Référence</TableHead>
                  <TableHead>Élève</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right pr-6">Preuve</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.paiementId}>
                    <TableCell className="pl-6 font-mono font-bold text-xs">{p.paiementId}</TableCell>
                    <TableCell className="font-bold">{students.find(s => s.id === p.eleveId)?.name || p.eleveId}</TableCell>
                    <TableCell><Badge variant="secondary">{p.typePaiement || 'Scolarité'}</Badge></TableCell>
                    <TableCell className="font-black text-emerald-700">{p.montant.toLocaleString()} FCFA</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(p.datePaiement).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right pr-6"><QrCode className="w-5 h-5 text-slate-400 inline cursor-pointer hover:text-emerald-600" /></TableCell>
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
