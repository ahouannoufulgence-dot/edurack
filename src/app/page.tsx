
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";

export default function ResetPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="max-w-md space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Trash2 className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Projet Supprimé</h1>
        <p className="text-slate-500 leading-relaxed">
          L'application a été entièrement effacée. Le système est maintenant vide et prêt pour une nouvelle configuration.
        </p>
        <div className="pt-6">
          <Button onClick={() => window.location.reload()} className="bg-slate-900 hover:bg-slate-800 h-12 px-8 rounded-xl font-bold gap-2">
            <PlusCircle className="w-5 h-5" /> Nouveau Projet
          </Button>
        </div>
      </div>
    </div>
  );
}
