import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, Input, Select, DatePicker, formatPhoneNumber } from '../components/ui/LayoutComponents';
import { Search, ChevronRight, Filter, Plus, Edit2, Trash2, Clock, Calendar, User, Scissors } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { AppointmentModal } from '../components/AppointmentModal';
import { Appointment } from '../types';

export const AppointmentsPage = () => {
  const { appointments, customers, services, staff, deleteAppointment } = useStore();
  
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Helpers
  const getCustomer = (id: number) => customers.find(c => c.id === id);
  const getStaff = (id: number) => staff.find(s => s.id === id);
  const getServices = (ids: number[]) => ids.map(id => services.find(s => s.id === id)?.name).join(', ');

  // Filter Logic
  const filteredData = appointments.filter(apt => {
    const customer = getCustomer(apt.customerId);
    const staffMember = getStaff(apt.staffId);
    
    const matchesSearch = 
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        customer?.phone.includes(searchTerm) || false;
    
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesStaff = staffFilter === "all" || staffMember?.id.toString() === staffFilter;
    const matchesDate = !dateFilter || apt.date === dateFilter;

    return matchesSearch && matchesStatus && matchesStaff && matchesDate;
  }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (apt: Appointment) => {
      setSelectedAppointment(apt);
      setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
      if(window.confirm("Bu randevuyu silmek istediğinize emin misiniz?")) {
          deleteAppointment(id);
      }
  };

  const getStatusBadge = (status: string) => {
      const styles = {
          confirmed: "bg-black text-white",
          pending: "bg-orange-500 text-white",
          completed: "bg-green-600 text-white",
          cancelled: "bg-red-600 text-white",
      };
      
      const labels = {
          confirmed: "Onaylı",
          pending: "Bekliyor",
          completed: "Geldi", 
          cancelled: "İptal",
      };

      return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${styles[status as keyof typeof styles] || 'bg-slate-200'}`}>
              {labels[status as keyof typeof labels]}
          </span>
      );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Randevular</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Randevular</span>
           </div>
        </div>
        <Button variant="black" onClick={() => { setSelectedAppointment(null); setIsModalOpen(true); }} className="w-full sm:w-auto">
           <Plus size={18} className="mr-2" /> Yeni Randevu
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-slate-50 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <Select 
                 value={statusFilter} 
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="bg-white border-slate-200"
             >
                 <option value="all">Tüm Durumlar</option>
                 <option value="confirmed">Onaylı</option>
                 <option value="pending">Bekliyor</option>
                 <option value="completed">Tamamlandı</option>
                 <option value="cancelled">İptal</option>
             </Select>

             <Select
                 value={staffFilter}
                 onChange={(e) => setStaffFilter(e.target.value)}
                 className="bg-white border-slate-200"
             >
                 <option value="all">Tüm Personel</option>
                 {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </Select>

             <DatePicker 
                 value={dateFilter}
                 onChange={setDateFilter}
                 placeholder="Tüm Zamanlar"
             />

             <div className="relative">
                <Input 
                    placeholder="Ara..." 
                    className="pl-10 bg-white border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
             </div>
          </div>
          
          {(statusFilter !== "all" || staffFilter !== "all" || dateFilter || searchTerm) && (
              <div className="mt-3 flex justify-end">
                  <button 
                    onClick={() => { setStatusFilter("all"); setStaffFilter("all"); setDateFilter(""); setSearchTerm(""); }}
                    className="text-xs font-semibold text-red-500 hover:underline flex items-center gap-1"
                  >
                      <Trash2 size={12} /> Filtreleri Temizle
                  </button>
              </div>
          )}
      </Card>

      {/* --- CONTENT AREA --- */}
      
      {/* 1. Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                     <tr>
                         <th className="px-6 py-4">Müşteri</th>
                         <th className="px-6 py-4">Telefon</th>
                         <th className="px-6 py-4">Hizmetler</th>
                         <th className="px-6 py-4">Tarih</th>
                         <th className="px-6 py-4">Saat</th>
                         <th className="px-6 py-4">Durum</th>
                         <th className="px-6 py-4">Oluşturan</th>
                         <th className="px-6 py-4 text-right">İşlemler</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 bg-white">
                     {displayedData.length > 0 ? (
                         displayedData.map((apt) => {
                             const customer = getCustomer(apt.customerId);
                             const staffMember = getStaff(apt.staffId);
                             return (
                                 <tr key={apt.id} className="hover:bg-slate-50 transition-colors group">
                                     <td className="px-6 py-4 font-medium text-slate-900">{customer?.name}</td>
                                     <td className="px-6 py-4 text-slate-600 font-mono">{formatPhoneNumber(customer?.phone || "")}</td>
                                     <td className="px-6 py-4 text-slate-600">{getServices(apt.serviceIds)}</td>
                                     <td className="px-6 py-4 text-slate-600">{format(parseISO(apt.date), 'dd.MM.yyyy')}</td>
                                     <td className="px-6 py-4 text-slate-600 font-medium">{apt.startTime}</td>
                                     <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>
                                     <td className="px-6 py-4 text-slate-600">{staffMember?.name}</td>
                                     <td className="px-6 py-4 text-right">
                                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button onClick={() => handleEdit(apt)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"><Edit2 size={14} /></button>
                                             <button onClick={() => handleDelete(apt.id)} className="p-2 bg-red-50 hover:bg-red-100 rounded text-red-600"><Trash2 size={14} /></button>
                                         </div>
                                     </td>
                                 </tr>
                             );
                         })
                     ) : (
                         <tr>
                             <td colSpan={8} className="px-6 py-12 text-center text-slate-400">Kayıt bulunamadı.</td>
                         </tr>
                     )}
                 </tbody>
             </table>
         </div>
      </div>

      {/* 2. Mobile Card View (Hidden on Desktop) */}
      <div className="md:hidden space-y-4">
         {displayedData.length > 0 ? (
             displayedData.map((apt) => {
                const customer = getCustomer(apt.customerId);
                const staffMember = getStaff(apt.staffId);
                return (
                    <div key={apt.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
                        {/* Header: Customer & Status */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                    {customer?.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">{customer?.name}</div>
                                    <div className="text-xs text-slate-500 font-mono">{formatPhoneNumber(customer?.phone || "")}</div>
                                </div>
                            </div>
                            {getStatusBadge(apt.status)}
                        </div>

                        <hr className="border-slate-100" />

                        {/* Body: Details */}
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                             <div className="col-span-2 flex items-center gap-2 text-slate-700">
                                 <Scissors size={16} className="text-slate-400" />
                                 <span className="font-medium">{getServices(apt.serviceIds)}</span>
                             </div>
                             <div className="flex items-center gap-2 text-slate-600">
                                 <Calendar size={16} className="text-slate-400" />
                                 {format(parseISO(apt.date), 'd MMM', {locale: tr})}
                             </div>
                             <div className="flex items-center gap-2 text-slate-600">
                                 <Clock size={16} className="text-slate-400" />
                                 {apt.startTime}
                             </div>
                             <div className="col-span-2 flex items-center gap-2 text-slate-600">
                                 <User size={16} className="text-slate-400" />
                                 {staffMember?.name}
                             </div>
                        </div>

                        {/* Footer: Price & Actions */}
                        <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100">
                            <div className="font-bold text-lg text-slate-900">{apt.totalPrice} ₺</div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(apt)} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(apt.id)} className="p-2 bg-red-50 border border-red-100 rounded-lg text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )
             })
         ) : (
            <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                Kayıt bulunamadı.
            </div>
         )}
      </div>

      {/* Pagination (Common) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
                {filteredData.length} kayıttan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} arası
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
            
            <div className="hidden sm:flex gap-1">
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
            </div>

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

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment}
      />
    </div>
  );
};