import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, formatPhoneNumber } from '../components/ui/LayoutComponents';
import { Calendar, UserPlus, Tag, Gift, Search, MoreHorizontal, ChevronRight, Clock, User, ChevronDown } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';

export const SummaryPage = () => {
  const { appointments, customers, services, staff } = useStore();
  const [activeTab, setActiveTab] = useState('Tüm Randevular');
  const [searchTerm, setSearchTerm] = useState("");

  const today = new Date();

  // --- Statistics Calculation ---
  const todayAppointments = appointments.filter(apt => 
    isSameDay(parseISO(apt.date), today)
  ).length;

  const mockPreInterviews = 14;
  const mockProductSales = 23;
  const mockPackageSales = 12;

  // --- Table Data Helpers ---
  const getCustomer = (id: number) => customers.find(c => c.id === id);
  const getStaff = (id: number) => staff.find(s => s.id === id);
  const getServices = (ids: number[]) => ids.map(id => services.find(s => s.id === id)?.name).join(', ');

  const filteredData = appointments.filter(apt => {
    const customer = getCustomer(apt.customerId);
    const searchMatch = 
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        customer?.phone.includes(searchTerm) || false;

    if (!searchMatch) return false;

    if (activeTab === 'Tüm Randevular') return true;
    if (activeTab === 'Randevular') return apt.status === 'confirmed';
    if (activeTab === 'Alacak Hatırlatmaları') return apt.status === 'pending';
    
    return false; 
  }).sort((a, b) => b.id - a.id).slice(0, 5);

  const getStatusBadge = (status: string) => {
    const styles = {
        confirmed: "bg-purple-600 text-white",
        pending: "bg-orange-500 text-white",
        completed: "bg-green-600 text-white",
        cancelled: "bg-red-600 text-white",
    };
    const labels = {
        confirmed: "Onaylı",
        pending: "Bekliyor",
        completed: "Geldi",
        cancelled: "Gelmedi",
    };
    return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold shadow-sm text-center inline-block ${styles[status as keyof typeof styles]}`}>
            {labels[status as keyof typeof labels]}
        </span>
    );
  };

  const tabs = [
    "Tüm Randevular", 
    "Randevular", 
    "Ön Görüşmeler", 
    "Ürün Satışları", 
    "Paket Satışları", 
    "Alacak Hatırlatmaları", 
    "Müşteri Yorumları"
  ];

  const stats = [
    { title: 'Randevu', count: todayAppointments, icon: Calendar, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { title: 'Ön Görüşme', count: mockPreInterviews, icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Ürün Satışı', count: mockProductSales, icon: Tag, color: 'text-sky-600', bg: 'bg-sky-50' },
    { title: 'Paket Satışı', count: mockPackageSales, icon: Gift, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' }
  ];

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Günlük Özet</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Özet</span>
           </div>
        </div>
      </div>

      {/* 1. Compact 2x2 Grid for Mobile, 4x1 for Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((item, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-5 flex flex-col justify-between h-full hover:border-indigo-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm font-semibold text-slate-500 truncate mr-2">{item.title}</span>
                    <div className={`p-1.5 md:p-2 rounded-lg ${item.bg} ${item.color} shrink-0`}>
                        <item.icon size={16} strokeWidth={2.5} className="md:w-5 md:h-5" />
                    </div>
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                    {item.count}
                </div>
            </div>
        ))}
      </div>

      {/* Main Content Area */}
      <Card className="p-0 border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
         
         {/* 2. Tabs / Filter Section */}
         <div className="border-b border-slate-200 bg-slate-50/50">
             
             {/* Mobile: Dropdown Selector */}
             <div className="md:hidden p-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Görünüm</label>
                <div className="relative">
                    <select 
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value)}
                        className="w-full h-11 appearance-none bg-white border border-slate-300 text-slate-900 text-sm rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-black font-medium shadow-sm"
                    >
                        {tabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" />
                </div>
             </div>

             {/* Desktop: Horizontal Tabs */}
             <div className="hidden md:flex items-center gap-2 overflow-x-auto p-4 no-scrollbar">
                 {tabs.map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                            activeTab === tab
                             ? 'bg-black text-white border-black shadow-sm' 
                             : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                     >
                         {tab}
                     </button>
                 ))}
             </div>
         </div>

         {/* Sub-Header: Search & Pagination Controls */}
         <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border-b border-slate-100">
            <div className="flex items-center gap-4 w-full sm:w-auto">
               <span className="text-sm font-medium text-slate-500 whitespace-nowrap hidden sm:inline">
                   Göster
                   <select className="mx-2 p-1 rounded border border-slate-200 text-slate-700 text-xs font-bold focus:outline-none bg-slate-50">
                       <option>5</option>
                       <option>10</option>
                   </select> 
               </span>
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto">
               <div className="relative flex-1 sm:w-64">
                   <input 
                      type="text" 
                      placeholder="Ara..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all bg-slate-50 focus:bg-white"
                   />
                   <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
               </div>
            </div>
         </div>

         {/* 3. Desktop Table */}
         <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-slate-500 font-medium border-b border-slate-100 bg-slate-50/50">
                    <tr>
                        <th className="px-6 py-4 whitespace-nowrap">Müşteri</th>
                        <th className="px-6 py-4 whitespace-nowrap">Telefon</th>
                        <th className="px-6 py-4 whitespace-nowrap">Hizmetler</th>
                        <th className="px-6 py-4 whitespace-nowrap">Tarih</th>
                        <th className="px-6 py-4 whitespace-nowrap">Saat</th>
                        <th className="px-6 py-4 whitespace-nowrap">Durum</th>
                        <th className="px-6 py-4 whitespace-nowrap">Oluşturan</th>
                        <th className="px-6 py-4 whitespace-nowrap"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredData.length > 0 ? (
                        filteredData.map((apt) => {
                            const customer = getCustomer(apt.customerId);
                            const staffMember = getStaff(apt.staffId);
                            return (
                                <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800">{customer?.name}</td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{formatPhoneNumber(customer?.phone || "")}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {getServices(apt.serviceIds)} <span className="text-slate-400 text-xs">({staffMember?.name.split(' ')[0]})</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{format(parseISO(apt.date), 'dd.MM.yyyy')}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{apt.startTime}</td>
                                    <td className="px-6 py-4">{getStatusBadge(apt.status)}</td>
                                    <td className="px-6 py-4 text-slate-600">{staffMember?.name}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-slate-600 p-1"><MoreHorizontal size={16} /></button>
                                    </td>
                                </tr>
                            )
                        })
                    ) : (
                        <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Kayıt bulunamadı.</td></tr>
                    )}
                </tbody>
            </table>
         </div>

         {/* 4. Mobile Cards */}
         <div className="md:hidden">
             {filteredData.length > 0 ? (
                 <div className="divide-y divide-slate-100">
                    {filteredData.map(apt => {
                        const customer = getCustomer(apt.customerId);
                        const staffMember = getStaff(apt.staffId);
                        return (
                            <div key={apt.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-slate-900 text-base">{customer?.name}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{formatPhoneNumber(customer?.phone || "")}</div>
                                    </div>
                                    {getStatusBadge(apt.status)}
                                </div>
                                
                                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-sm text-slate-700 font-medium">
                                    {getServices(apt.serviceIds)}
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                                    <div className="flex gap-3">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> {format(parseISO(apt.date), 'dd.MM')}</span>
                                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400"/> {apt.startTime}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5"><User size={14} className="text-slate-400"/> {staffMember?.name.split(' ')[0]}</div>
                                </div>
                            </div>
                        )
                    })}
                 </div>
             ) : (
                 <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                    <Search size={32} className="mb-2 opacity-20" />
                    <p>Kayıt bulunamadı.</p>
                 </div>
             )}
         </div>

         {/* Footer */}
         <div className="bg-white px-4 md:px-6 py-4 border-t border-slate-100 flex items-center justify-between sticky bottom-0">
             <div className="text-xs md:text-sm text-slate-500">Toplam {filteredData.length} kayıt</div>
             <div className="flex gap-1">
                 <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50 font-medium" disabled>Önceki</button>
                 <button className="px-3 py-1.5 text-xs bg-black text-white rounded-lg font-medium shadow-sm">1</button>
                 <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50 font-medium" disabled>Sonraki</button>
             </div>
         </div>
      </Card>
    </div>
  );
};