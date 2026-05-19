
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@/lib/school-types";
import { getFromStorage, sendMessage, markConversationAsRead } from "@/lib/data-service";
import { MessageSquare, Send, Search, ChevronLeft } from "lucide-react";

export function MessagingCenter({ currentUser }: { currentUser: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

  const refreshMessages = useCallback(() => {
    setMessages(getFromStorage<any>('edutrack_messages'));
  }, []);

  useEffect(() => {
    const allUsers = getFromStorage<User>('edutrack_users');
    setUsers(allUsers.filter(u => u.id !== currentUser.id));
    refreshMessages();
    window.addEventListener('storage', refreshMessages);
    return () => window.removeEventListener('storage', refreshMessages);
  }, [currentUser.id, refreshMessages]);

  useEffect(() => {
    if (selectedUser) {
      markConversationAsRead(currentUser.id, selectedUser.id);
    }
  }, [selectedUser, currentUser.id, messages]);

  const handleSend = () => {
    if (!selectedUser || !newMessage.trim()) return;
    sendMessage({
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      content: newMessage
    });
    setNewMessage("");
    refreshMessages();
  };

  const currentChat = messages
    .filter(m => 
      (m.senderId === currentUser.id && m.receiverId === selectedUser?.id) ||
      (m.senderId === selectedUser?.id && m.receiverId === currentUser.id)
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[75vh] md:h-[70vh]">
      {/* Liste des contacts - Cachée sur mobile si un utilisateur est sélectionné */}
      <Card className={cn(
        "md:col-span-1 border-none shadow-md overflow-hidden flex flex-col h-full",
        selectedUser ? "hidden md:flex" : "flex"
      )}>
        <CardHeader className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-9 h-10 bg-slate-50 border-none rounded-xl text-xs"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredUsers.map(u => {
              const unreadCount = messages.filter(m => m.receiverId === currentUser.id && m.senderId === u.id && !m.read).length;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                    selectedUser?.id === u.id ? 'bg-emerald-50 text-emerald-900 shadow-sm' : 'hover:bg-slate-50'
                  )}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-xs">{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-xs truncate">{u.name}</p>
                      {unreadCount > 0 && (
                        <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">{u.role}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      {/* Zone de discussion */}
      <Card className={cn(
        "md:col-span-2 border-none shadow-md overflow-hidden flex flex-col bg-white h-full",
        !selectedUser ? "hidden md:flex" : "flex"
      )}>
        {selectedUser ? (
          <>
            <CardHeader className="p-3 md:p-4 border-b flex flex-row items-center gap-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedUser(null)}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Avatar className="w-9 h-9 md:w-10 md:h-10">
                <AvatarFallback className="text-xs">{selectedUser.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xs md:text-sm font-bold">{selectedUser.name}</CardTitle>
                <p className="text-[9px] md:text-[10px] text-emerald-600 font-bold uppercase">{selectedUser.role}</p>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-4 md:p-6 bg-slate-50/30">
              <div className="space-y-4">
                {currentChat.map((m, i) => (
                  <div key={i} className={cn("flex", m.senderId === currentUser.id ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      "max-w-[85%] p-3 rounded-2xl text-xs md:text-sm shadow-sm",
                      m.senderId === currentUser.id 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                    )}>
                      {m.content}
                      <p className={cn("text-[8px] md:text-[9px] mt-1 opacity-60", m.senderId === currentUser.id ? 'text-right' : 'text-left')}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 md:p-4 border-t bg-white flex gap-2">
              <Textarea 
                placeholder="Message..." 
                className="min-h-[44px] h-[44px] resize-none border-none bg-slate-50 focus-visible:ring-emerald-500 text-xs md:text-sm rounded-xl"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              />
              <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700 h-11 w-11 shrink-0 rounded-xl" onClick={handleSend}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-10" />
            <p className="font-bold text-sm">Messagerie Sécurisée</p>
            <p className="text-xs max-w-xs mt-2">Sélectionnez un contact pour démarrer une conversation cryptée au sein de l'école.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

import { cn } from '@/lib/utils';
