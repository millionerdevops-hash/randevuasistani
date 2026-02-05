import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Bell, AlignLeft, Type, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button, Input, DatePicker, TimePicker, Select, CustomSelect } from './ui/LayoutComponents';
import { Note } from '../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note | null;
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, note }) => {
  const { addNote, updateNote, staff } = useStore();
  
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("09:00");
  const [hasReminder, setHasReminder] = useState(false);
  const [creator, setCreator] = useState(staff[0]?.name || "Personel");

  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTitle(note.title);
        setSubject(note.subject);
        setContent(note.content);
        setDate(note.date);
        setTime(note.time);
        setHasReminder(note.hasReminder);
        setCreator(note.creator);
      } else {
        setTitle("");
        setSubject("");
        setContent("");
        setDate(new Date().toISOString().split('T')[0]);
        setTime("09:00");
        setHasReminder(false);
        setCreator(staff[0]?.name || "Personel");
      }
    }
  }, [isOpen, note, staff]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const noteData = {
      title,
      subject,
      content,
      date,
      time,
      hasReminder,
      creator,
      status: note ? note.status : 'unread' as const
    };

    if (note) {
      updateNote(note.id, noteData);
    } else {
      addNote(noteData);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-visible">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white rounded-t-2xl">
          <div>
             <h2 className="text-lg font-bold text-slate-900">
               {note ? "Notu Düzenle" : "Yeni Not Ekle"}
             </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title & Subject */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <Type size={14} className="text-slate-500" /> Başlık
                    </label>
                    <Input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Örn: Muhasebe" 
                        required 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <AlignLeft size={14} className="text-slate-500" /> Konu
                    </label>
                    <Input 
                        value={subject} 
                        onChange={(e) => setSubject(e.target.value)} 
                        placeholder="Örn: Fatura Ödemesi" 
                        required 
                    />
                </div>
            </div>

            {/* Content */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <AlignLeft size={14} className="text-slate-500" /> İçerik
                </label>
                <textarea
                    className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[100px] resize-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Not detayları..."
                    required
                />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <CalendarIcon size={14} className="text-slate-500" /> Tarih
                    </label>
                    <div className="h-10">
                        <DatePicker value={date} onChange={setDate} />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-500" /> Saat
                    </label>
                    <TimePicker value={time} onChange={setTime} className="h-10" />
                </div>
            </div>

            {/* Creator & Reminder */}
            <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <User size={14} className="text-slate-500" /> Oluşturan
                    </label>
                    <CustomSelect 
                        value={creator} 
                        onChange={(val) => setCreator(val)} 
                        options={staff.map(s => ({ value: s.name, label: s.name }))}
                        className="h-10"
                    />
                </div>
                
                <div className="h-10 flex items-center">
                    <div 
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all w-full select-none ${hasReminder ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        onClick={() => setHasReminder(!hasReminder)}
                    >
                        <Bell size={16} className={hasReminder ? 'fill-white' : ''} />
                        <span className="text-sm font-medium">Hatırlatma</span>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 mt-4 pt-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>İptal</Button>
                <Button variant="black" className="flex-1" onClick={handleSubmit}>Kaydet</Button>
            </div>
        </form>
      </div>
    </div>
  );
};