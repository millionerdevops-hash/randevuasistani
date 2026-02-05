import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, Input, Select, DatePicker } from '../components/ui/LayoutComponents';
import { Search, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Wallet, Filter, X } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';

export const Dashboard = () => {
  const { appointments, customers, services, staff } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  
  // Date Filter State
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    end: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  });
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsDateFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCustomer = (id: number) => customers.find(c => c.id === id);
  const getStaff = (id: number) => staff.find(s => s.id === id);
  const getServices = (ids: number[]) => ids.map(id => services.find(s => s.id === id)?.name).join(', ');

  const filteredData = appointments.filter(apt => {
    const customer = getCustomer(apt.customerId);
    const staffMember = getStaff(apt.staffId);
    
    const matchesSearch = customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStaff = staffFilter === "all" || staffMember?.name === staffFilter;
    
    // Date Range Filter
    const matchesDate = (!dateRange.start || apt.date >= dateRange.start) && 
                        (!dateRange.end || apt.date <= dateRange.end);

    return matchesSearch && matchesStaff && matchesDate;
  }).sort((a, b) => b.id - a.id); // Newest first

  // Pagination Logic (Mock for now, but prepared)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const setPreset = (type: 'today' | 'week' | 'month') => {
    const today = new Date();
    let start, end;
    
    if (type === 'today') {
      start = end = today;
    } else if (type === 'week') {
      start = startOfWeek(today, { weekStartsOn: 1 });
      end = endOfWeek(today, { weekStartsOn: 1 });
    } else {
      start = startOfMonth(today);
      end = endOfMonth(today);
    }
    
    setDateRange({
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Standardized Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Adisyonlar</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Adisyonlar</span>
           </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4 relative">
          <Input 
             placeholder="Ara..." 
             className="pl-10 h-12 bg-white" 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
        </div>
        <div className="md:col-span-4">
          <Select 
            className="h-12 bg-white"
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
          >
             <option value="all">Tüm çalışanlar</option>
             {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </Select>
        </div>
        
        {/* Date Filter Dropdown */}
        <div className="md:col-span-4 relative" ref={filterRef}>
           <button 
             onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
             className={`w-full h-12 bg-white border rounded-xl px-4 text-left text-sm text-slate-600 flex items-center justify-between transition-all ${isDateFilterOpen ? 'border-black ring-1 ring-black' : 'border-slate-200 hover:border-slate-300'}`}
           >
             <span className="flex items-center gap-2 truncate">
               <CalendarIcon size={16} className="text-slate-400" />
               {dateRange.start ? format(parseISO(dateRange.start), 'd MMM yyyy', { locale: tr }) : 'Başlangıç'} 
               {' - '}
               {dateRange.end ? format(parseISO(dateRange.end), 'd MMM yyyy', { locale: tr }) : 'Bitiş'}
             </span>
             <ChevronRight size={16} className={`text-slate-400 transition-transform ${isDateFilterOpen ? 'rotate-90' : ''}`} />
           </button>

           {isDateFilterOpen && (
             <div className="absolute top-full right-0 left-0 z-40 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-4 animate-in fade-in zoom-in-95">
               <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                  <button onClick={() => setPreset('today')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 whitespace-nowrap transition-colors">Bugün</button>
                  <button onClick={() => setPreset('week')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 whitespace-nowrap transition-colors">Bu Hafta</button>
                  <button onClick={() => setPreset('month')} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 whitespace-nowrap transition-colors">Bu Ay</button>
               </div>
               
               <div className="grid grid-cols-2 gap-3 mb-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Başlangıç</label>
                   <DatePicker 
                     value={dateRange.start} 
                     onChange={(d) => setDateRange(prev => ({ ...prev, start: d }))} 
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bitiş</label>
                   <DatePicker 
                     value={dateRange.end} 
                     onChange={(d) => setDateRange(prev => ({ ...prev, end: d }))} 
                   />
                 </div>
               </div>
               
               <div className="flex gap-2 pt-2 border-t border-slate-50">
                  <Button variant="ghost" className="flex-1 h-9 text-xs text-slate-500" onClick={() => {
                    setDateRange({ start: '', end: '' });
                    setIsDateFilterOpen(false);
                  }}>
                    Temizle
                  </Button>
                  <Button variant="black" className="flex-1 h-9 text-xs" onClick={() => setIsDateFilterOpen(false)}>
                    Uygula
                  </Button>
               </div>
             </div>
           )}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-0 shadow-none bg-transparent">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500 font-medium">
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-left font-normal pl-6">Müşteri</th>
                <th className="px-6 py-4 text-left font-normal">Hizmetler</th>
                <th className="px-6 py-4 text-left font-normal">Tarih</th>
                <th className="px-6 py-4 text-left font-normal">Toplam</th>
                <th className="px-6 py-4 text-left font-normal">Ödenen</th>
                <th className="px-6 py-4 text-left font-normal">Kalan ödeme</th>
                <th className="px-6 py-4 text-left font-normal">Çalışan</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {displayedData.length > 0 ? (
                displayedData.map((apt) => {
                  const customer = getCustomer(apt.customerId);
                  const staffMember = getStaff(apt.staffId);

                  return (
                    <tr key={apt.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={`https://i.pravatar.cc/150?img=${customer?.id}`} 
                            alt={customer?.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0"
                          />
                          <span className="font-medium text-slate-900">{customer?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{getServices(apt.serviceIds)}</td>
                      <td className="px-6 py-4 text-slate-600">{format(parseISO(apt.date), 'd MMMM HH:mm', { locale: tr })}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">₺{apt.totalPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-600">₺{apt.totalPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-400">₺0,00</td>
                      <td className="px-6 py-4 text-slate-600">{staffMember?.name}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center">
                      <Filter size={32} className="mb-2 opacity-50" />
                      <p>Bu kriterlere uygun kayıt bulunamadı.</p>
                      <button onClick={() => {setDateRange({start: '', end: ''}); setSearchTerm(''); setStaffFilter('all');}} className="mt-2 text-indigo-600 hover:underline font-medium">Filtreleri Temizle</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex justify-end items-center p-4 gap-4 mt-2">
             <span className="text-sm text-slate-500">Sayfa {currentPage} / {totalPages}</span>
             <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16}/>
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16}/>
                </button>
             </div>
          </div>
        )}
      </Card>
    </div>
  );
};