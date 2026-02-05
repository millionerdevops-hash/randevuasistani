import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, Input } from '../components/ui/LayoutComponents';
import { Search, ChevronRight, Plus, Check, Edit2, Trash2, Bell, Clock, Calendar, ChevronLeft, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { NoteModal } from '../components/NoteModal';
import { Note } from '../types';

export const AgendaPage = () => {
  const { notes, deleteNote, updateNote } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || note.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());

  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
  const displayedNotes = filteredNotes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id: number) => {
    if(window.confirm("Bu notu silmek istediğinize emin misiniz?")) deleteNote(id);
  };

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const toggleStatus = (note: Note) => {
    updateNote(note.id, { status: note.status === 'read' ? 'unread' : 'read' });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Ajanda / Notlar</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Notlar</span>
           </div>
        </div>
        <Button variant="black" onClick={() => { setSelectedNote(null); setIsModalOpen(true); }} className="w-full sm:w-auto">
           <Plus size={18} className="mr-2" /> Yeni Not Ekle
        </Button>
      </div>

      <Card className="p-4 bg-slate-50 border border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 w-full md:w-auto">
                 <button onClick={() => setStatusFilter('all')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>Tümü</button>
                 <button onClick={() => setStatusFilter('read')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'read' ? 'bg-green-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>Okundu</button>
                 <button onClick={() => setStatusFilter('unread')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'unread' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>Okunmadı</button>
              </div>
              <div className="relative w-full md:w-64">
                <Input placeholder="Ara..." className="pl-10 bg-white border-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
             </div>
          </div>
      </Card>

      {/* Desktop Table */}
      <Card className="hidden md:block overflow-hidden border border-slate-200 shadow-sm p-0">
         <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                     <tr>
                         <th className="px-6 py-4">Başlık</th>
                         <th className="px-6 py-4">Konu</th>
                         <th className="px-6 py-4 w-1/4">İçerik</th>
                         <th className="px-6 py-4 text-center">Hatırlatma</th>
                         <th className="px-6 py-4">Tarih</th>
                         <th className="px-6 py-4">Saat</th>
                         <th className="px-6 py-4 text-center">Durum</th>
                         <th className="px-6 py-4">Oluşturan</th>
                         <th className="px-6 py-4 text-right">İşlemler</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 bg-white">
                     {displayedNotes.length > 0 ? (
                         displayedNotes.map((note) => (
                             <tr key={note.id} className="hover:bg-slate-50 transition-colors group">
                                 <td className="px-6 py-4 font-bold text-slate-900">{note.title}</td>
                                 <td className="px-6 py-4 text-slate-700 font-medium">{note.subject}</td>
                                 <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{note.content}</td>
                                 <td className="px-6 py-4 text-center">{note.hasReminder && <Check size={16} className="text-green-600 mx-auto"/>}</td>
                                 <td className="px-6 py-4 text-slate-600">{format(parseISO(note.date), 'dd.MM.yyyy')}</td>
                                 <td className="px-6 py-4 text-slate-600 font-mono">{note.time}</td>
                                 <td className="px-6 py-4 text-center">
                                     <button onClick={() => toggleStatus(note)} className={`px-3 py-1 rounded-full text-xs font-bold ${note.status === 'read' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{note.status === 'read' ? 'Okundu' : 'Okunmadı'}</button>
                                 </td>
                                 <td className="px-6 py-4 text-slate-600">{note.creator}</td>
                                 <td className="px-6 py-4 text-right">
                                     <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => handleEdit(note)} className="p-2 bg-slate-100 rounded text-slate-600"><Edit2 size={14} /></button>
                                         <button onClick={() => handleDelete(note.id)} className="p-2 bg-red-50 rounded text-red-600"><Trash2 size={14} /></button>
                                     </div>
                                 </td>
                             </tr>
                         ))
                     ) : (
                         <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">Not bulunamadı.</td></tr>
                     )}
                 </tbody>
             </table>
         </div>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
          {displayedNotes.map(note => (
              <div key={note.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 relative">
                  <div className="flex justify-between items-start">
                      <div>
                          <h3 className="font-bold text-slate-900">{note.title}</h3>
                          <p className="text-xs text-slate-500 font-medium">{note.subject}</p>
                      </div>
                      <button onClick={() => toggleStatus(note)} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${note.status === 'read' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                          {note.status === 'read' ? 'Okundu' : 'Okunmadı'}
                      </button>
                  </div>
                  
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{note.content}</p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Calendar size={12}/> {format(parseISO(note.date), 'dd.MM')}</span>
                          <span className="flex items-center gap-1"><Clock size={12}/> {note.time}</span>
                          <span className="flex items-center gap-1"><User size={12}/> {note.creator}</span>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => handleEdit(note)} className="p-1.5 bg-slate-100 rounded text-slate-600"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(note.id)} className="p-1.5 bg-red-50 rounded text-red-600"><Trash2 size={14} /></button>
                      </div>
                  </div>
              </div>
          ))}
          {displayedNotes.length === 0 && <div className="text-center py-10 text-slate-400">Not bulunamadı.</div>}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-center gap-4">
            <Button variant="outline" className="h-8 px-3 text-xs" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Önceki</Button>
            <span className="text-sm text-slate-600 flex items-center">{currentPage} / {totalPages || 1}</span>
            <Button variant="outline" className="h-8 px-3 text-xs" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Sonraki</Button>
      </div>

      <NoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} note={selectedNote} />
    </div>
  );
};