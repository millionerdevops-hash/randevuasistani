import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, formatPhoneNumber } from '../components/ui/LayoutComponents';
import { Calendar, UserPlus, Tag, Gift, Search, MoreHorizontal, ChevronRight, Clock, User } from 'lucide-react';
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

  return (
    <div className="space-y-6 animate-in fade-in">
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

      {/* Top Colorful Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { title: 'Randevu', count: todayAppointments, icon: Calendar, color: 'bg-[#22d3ee]' },
            { title: 'Ön Görüşme', count: mockPreInterviews, icon: UserPlus, color: 'bg-[#9333ea]' },
            { title: 'Ürün Satışı', count: mockProductSales, icon: Tag, color: 'bg-[#0ea5e9]' },
            { title: 'Paket Satışı', count: mockPackageSales, icon: Gift, color: 'bg-[#e879f9]' }
        ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex h-24 relative group hover:shadow-md transition-shadow">
                <div className="flex-1 p-4 flex flex-col justify-center pl-6">
                    <div className="text-3xl font-extrabold text-slate-800">{item.count}</div>
                    <div className="text-sm font-medium text-slate-500 mt-1">{item.title}</div>
                </div>
                <div className={`w-24 ${item.color} flex items-center justify-center text-white`}>
                    <item.icon size={32} strokeWidth={2.5} />
                </div>
            </div>
        ))}
      </div>

      {/* Main Content Area */}
      <Card className="p-0 border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
         {/* Tabs */}
         <div className="p-4 border-b border-slate-200">
             <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                 {tabs.map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
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

         {/* Sub-Header: Filters & Search */}
         <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <div className="flex items-center gap-4 w-full sm:w-auto">
               <span className="text-sm font-medium text-slate-500 whitespace-nowrap hidden sm:inline">
                   Sayfada 
                   <select className="mx-2 p-1 rounded border border-slate-200 text-slate-700 text-xs font-bold focus:outline-none">
                       <option>5</option>
                       <option>10</option>
                   </select> 
                   kayıt göster
               </span>
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto">
               <div className="relative flex-1 sm:w-64">
                   <input 
                      type="text" 
                      placeholder="Ara" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-3 pr-10 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-900 transition-colors"
                   />
                   <Search size={16} className="absolute right-3 top-2.5 text-slate-400" />
               </div>
            </div>
         </div>

         {/* 1. Desktop Table */}
         <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-slate-900 font-bold border-b border-slate-100 bg-white">
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
                <tbody className="divide-y divide-slate-50 bg-white">
                    {filteredData.length > 0 ? (
                        filteredData.map((apt) => {
                            const customer = getCustomer(apt.customerId);
                            const staffMember = getStaff(apt.staffId);
                            return (
                                <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">{customer?.name}</td>
                                    <td className="px-6 py-4 text-slate-500 font-mono">{formatPhoneNumber(customer?.phone || "")}</td>
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

         {/* 2. Mobile Cards */}
         <div className="md:hidden">
             {filteredData.length > 0 ? (
                 <div className="divide-y divide-slate-100">
                    {filteredData.map(apt => {
                        const customer = getCustomer(apt.customerId);
                        const staffMember = getStaff(apt.staffId);
                        return (
                            <div key={apt.id} className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-slate-900">{customer?.name}</div>
                                        <div className="text-xs text-slate-500 font-mono">{formatPhoneNumber(customer?.phone || "")}</div>
                                    </div>
                                    {getStatusBadge(apt.status)}
                                </div>
                                
                                <div className="bg-slate-50 p-2 rounded text-sm text-slate-700">
                                    {getServices(apt.serviceIds)}
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex gap-3">
                                        <span className="flex items-center gap-1"><Calendar size={12}/> {format(parseISO(apt.date), 'dd.MM')}</span>
                                        <span className="flex items-center gap-1"><Clock size={12}/> {apt.startTime}</span>
                                    </div>
                                    <div className="flex items-center gap-1"><User size={12}/> {staffMember?.name}</div>
                                </div>
                            </div>
                        )
                    })}
                 </div>
             ) : (
                 <div className="p-8 text-center text-slate-400">Kayıt bulunamadı.</div>
             )}
         </div>

         {/* Footer */}
         <div className="bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-between">
             <div className="text-sm text-slate-500">Total {filteredData.length}</div>
             <div className="flex gap-1">
                 <button className="px-3 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 text-slate-600">Önceki</button>
                 <button className="px-3 py-1 text-xs bg-black text-white rounded font-medium">1</button>
                 <button className="px-3 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 text-slate-600">Sonraki</button>
             </div>
         </div>
      </Card>
    </div>
  );
};