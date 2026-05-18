
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Role } from "@/lib/school-types";
import { getFromStorage, sendMessage } from "@/lib/data-service";
import { MessageSquare, Send, Search, User as UserIcon } from "lucide-react";

export function MessagingCenter({ currentUser }: { currentUser: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const allUsers = getFromStorage<User>('edutrack_users');
    setUsers(allUsers.filter(u => u.id !== currentUser.id));
    setMessages(getFromStorage<any>('edutrack_messages'));
  }, [currentUser.id]);

  const handleSend = () => {
    if (!selectedUser || !newMessage.trim()) return;
    sendMessage({
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      content: newMessage
    });
    setNewMessage("");
    setMessages(getFromStorage<any>('edutrack_messages'));
  };

  const currentChat = messages
    .filter(m => 
      (m.senderId === currentUser.id && m.receiverId === selectedUser?.id) ||
      (m.senderId === selectedUser?.id && m.receiverId === currentUser.id)
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
      <Card className="md:col-span-1 border-none shadow-md overflow-hidden flex flex-col">
        <CardHeader className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher contact..." 
              className="pl-9 h-9 bg-slate-50 border-none rounded-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredUsers.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedUser?.id === u.id ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50'}`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback>{u.name[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left overflow-hidden">
                  <p className="font-bold text-sm truncate">{u.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{u.role}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="md:col-span-2 border-none shadow-md overflow-hidden flex flex-col bg-white">
        {selectedUser ? (
          <>
            <CardHeader className="p-4 border-b flex flex-row items-center gap-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm font-bold">{selectedUser.name}</CardTitle>
                <p className="text-[10px] text-emerald-600 font-bold uppercase">{selectedUser.role}</p>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-6 bg-slate-50/30">
              <div className="space-y-4">
                {currentChat.map((m, i) => (
                  <div key={i} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${m.senderId === currentUser.id ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
                      {m.content}
                      <p className={`text-[9px] mt-1 opacity-60 ${m.senderId === currentUser.id ? 'text-right' : 'text-left'}`}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-white flex gap-2">
              <Textarea 
                placeholder="Votre message..." 
                className="min-h-[40px] h-[40px] resize-none border-none bg-slate-50 focus-visible:ring-emerald-500"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              />
              <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700 h-10 w-10 shrink-0" onClick={handleSend}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-muted-foreground">
            <MessageSquare className="w-16 h-16 mb-4 opacity-10" />
            <p className="font-bold">Sélectionnez un contact</p>
            <p className="text-sm">Lancez une discussion sécurisée au sein de l'établissement.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
