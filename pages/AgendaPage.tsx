import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, Input } from '../components/ui/LayoutComponents';
import { Search, ChevronRight, Plus, Check, Edit2, Trash2, Bell, Clock, Calendar, ChevronLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { NoteModal } from '../components/NoteModal';
import { Note } from '../types';

export const AgendaPage = () => {
  const { notes, deleteNote, updateNote } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Pagination (Simple)
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
    if(window.confirm("Bu notu silmek istediğinize emin misiniz?")) {
        deleteNote(id);
    }
  };

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const toggleStatus = (note: Note) => {
    updateNote(note.id, { status: note.status === 'read' ? 'unread' : 'read' });
  };

  const openNewNoteModal = () => {
      setSelectedNote(null);
      setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Ajanda / Notlar</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Notlar</span>
           </div>
        </div>
        <Button variant="black" onClick={openNewNoteModal}>
           <Plus size={18} className="mr-2" /> Yeni Not Ekle
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4 bg-slate-50 border border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Filter Tabs */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 w-full md:w-auto">
                 <button 
                    onClick={() => setStatusFilter('all')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                 >
                    Tümü
                 </button>
                 <button 
                    onClick={() => setStatusFilter('read')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'read' ? 'bg-green-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                 >
                    Okundu
                 </button>
                 <button 
                    onClick={() => setStatusFilter('unread')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'unread' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                 >
                    Okunmadı
                 </button>
              </div>

              {/* Search & Page Count */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
                    <span>Sayfada</span>
                    <select className="border border-slate-200 rounded p-1 bg-white font-semibold focus:outline-none">
                        <option>10</option>
                        <option>20</option>
                    </select> 
                    <span>kayıt göster</span>
                 </div>

                 <div className="relative w-full md:w-64">
                    <Input 
                        placeholder="Ara..." 
                        className="pl-10 bg-white border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
                 </div>
              </div>
          </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden border border-slate-200 shadow-sm p-0">
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
                                 <td className="px-6 py-4 font-bold text-slate-900">
                                     {note.title}
                                 </td>
                                 <td className="px-6 py-4 text-slate-700 font-medium">
                                     {note.subject}
                                 </td>
                                 <td className="px-6 py-4 text-slate-600 truncate max-w-xs" title={note.content}>
                                     {note.content}
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                     {note.hasReminder && (
                                         <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
                                            <Check size={14} strokeWidth={3} />
                                         </div>
                                     )}
                                 </td>
                                 <td className="px-6 py-4 text-slate-600">
                                     {format(parseISO(note.date), 'dd.MM.yyyy')}
                                 </td>
                                 <td className="px-6 py-4 text-slate-600 font-mono">
                                     {note.time}
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                     <button 
                                        onClick={() => toggleStatus(note)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                            note.status === 'read' 
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                        }`}
                                     >
                                        {note.status === 'read' ? 'Okundu' : 'Okunmadı'}
                                     </button>
                                 </td>
                                 <td className="px-6 py-4 text-slate-600">
                                     {note.creator}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                     <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => handleEdit(note)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-600" title="Düzenle">
                                             <Edit2 size={14} />
                                         </button>
                                         <button onClick={() => handleDelete(note.id)} className="p-2 bg-red-50 hover:bg-red-100 rounded text-red-600" title="Sil">
                                             <Trash2 size={14} />
                                         </button>
                                     </div>
                                 </td>
                             </tr>
                         ))
                     ) : (
                         <tr>
                             <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                                 <div className="flex flex-col items-center">
                                     <Bell size={32} className="mb-2 opacity-50" />
                                     <p>Kayıtlı not bulunamadı.</p>
                                 </div>
                             </td>
                         </tr>
                     )}
                 </tbody>
             </table>
         </div>

         {/* Footer / Pagination */}
         <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="text-sm text-slate-500">
                 {filteredNotes.length} kayıttan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredNotes.length)} arası gösteriliyor
             </div>
             
             <div className="flex items-center gap-1">
                <Button 
                    variant="outline" 
                    className="h-8 px-3 text-xs" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                    Önceki
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                            currentPage === page 
                                ? 'bg-black text-white' 
                                : 'text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                <Button 
                    variant="outline" 
                    className="h-8 px-3 text-xs" 
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                    Sonraki
                </Button>
             </div>
         </div>
      </Card>

      <NoteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        note={selectedNote}
      />
    </div>
  );
};
