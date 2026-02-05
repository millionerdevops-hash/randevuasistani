import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, formatPhoneNumber } from '../components/ui/LayoutComponents';
import { Calendar, UserPlus, Tag, Gift, Search, MoreHorizontal, ChevronRight } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';

export const SummaryPage = () => {
  const { appointments, customers, services, staff } = useStore();
  const [activeTab, setActiveTab] = useState('Tüm Randevular');
  const [searchTerm, setSearchTerm] = useState("");

  const today = new Date();

  // --- Statistics Calculation ---
  // Count appointments for today
  const todayAppointments = appointments.filter(apt => 
    isSameDay(parseISO(apt.date), today)
  ).length;

  // Mock data for features not yet in types (Ön Görüşme, Ürün, Paket)
  const mockPreInterviews = 14;
  const mockProductSales = 23;
  const mockPackageSales = 12;

  // --- Table Data Helpers ---
  const getCustomer = (id: number) => customers.find(c => c.id === id);
  const getStaff = (id: number) => staff.find(s => s.id === id);
  const getServices = (ids: number[]) => ids.map(id => services.find(s => s.id === id)?.name).join(', ');

  // Filter Logic for the Table
  const filteredData = appointments.filter(apt => {
    // Basic search filtering
    const customer = getCustomer(apt.customerId);
    const searchMatch = 
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        customer?.phone.includes(searchTerm) || false;

    if (!searchMatch) return false;

    // Tab Filtering
    if (activeTab === 'Tüm Randevular') return true;
    if (activeTab === 'Randevular') return apt.status === 'confirmed'; // Example logic
    if (activeTab === 'Alacak Hatırlatmaları') return apt.status === 'pending'; // Example logic
    
    // For other tabs (Sales, Pre-interviews) we don't have real data yet, so return false (empty table)
    return false; 
  }).sort((a, b) => b.id - a.id).slice(0, 5); // Show only recent 5 for summary view

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
        <span className={`px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm min-w-[80px] text-center inline-block ${styles[status as keyof typeof styles]}`}>
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
      {/* Standardized Header */}
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
        {/* Card 1: Randevu (Cyan) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex h-24 relative group hover:shadow-md transition-shadow">
           <div className="flex-1 p-4 flex flex-col justify-center pl-6">
              <div className="text-3xl font-extrabold text-slate-800">{todayAppointments}</div>
              <div className="text-sm font-medium text-slate-500 mt-1">Randevu</div>
           </div>
           <div className="w-24 bg-[#22d3ee] flex items-center justify-center text-white">
              <Calendar size={32} strokeWidth={2.5} />
           </div>
        </div>

        {/* Card 2: Ön Görüşme (Purple) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex h-24 relative group hover:shadow-md transition-shadow">
           <div className="flex-1 p-4 flex flex-col justify-center pl-6">
              <div className="text-3xl font-extrabold text-slate-800">{mockPreInterviews}</div>
              <div className="text-sm font-medium text-slate-500 mt-1">Ön Görüşme</div>
           </div>
           <div className="w-24 bg-[#9333ea] flex items-center justify-center text-white">
              <UserPlus size={32} strokeWidth={2.5} />
           </div>
        </div>

        {/* Card 3: Ürün Satışı (Blue) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex h-24 relative group hover:shadow-md transition-shadow">
           <div className="flex-1 p-4 flex flex-col justify-center pl-6">
              <div className="text-3xl font-extrabold text-slate-800">{mockProductSales}</div>
              <div className="text-sm font-medium text-slate-500 mt-1">Ürün Satışı</div>
           </div>
           <div className="w-24 bg-[#0ea5e9] flex items-center justify-center text-white">
              <Tag size={32} strokeWidth={2.5} />
           </div>
        </div>

        {/* Card 4: Paket Satışı (Pink) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex h-24 relative group hover:shadow-md transition-shadow">
           <div className="flex-1 p-4 flex flex-col justify-center pl-6">
              <div className="text-3xl font-extrabold text-slate-800">{mockPackageSales}</div>
              <div className="text-sm font-medium text-slate-500 mt-1">Paket Satışı</div>
           </div>
           <div className="w-24 bg-[#e879f9] flex items-center justify-center text-white">
              <Gift size={32} strokeWidth={2.5} />
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="p-0 border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
         {/* Tabs Scroll Area */}
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
               <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
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

         {/* Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-slate-900 font-bold border-b border-slate-100 bg-white">
                    <tr>
                        <th className="px-6 py-4 whitespace-nowrap">Müşteri</th>
                        <th className="px-6 py-4 whitespace-nowrap">Telefon Numarası</th>
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
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {customer?.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-mono">
                                        {formatPhoneNumber(customer?.phone || "")}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {getServices(apt.serviceIds)} <span className="text-slate-400 text-xs">({staffMember?.name.split(' ')[0]})</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {format(parseISO(apt.date), 'dd.MM.yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {apt.startTime}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(apt.status)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {staffMember?.name}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-slate-600 p-1">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })
                    ) : (
                        <tr>
                            <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                <div className="flex flex-col items-center">
                                    <p>Bu kategoride kayıt bulunamadı.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
         </div>

         {/* Pagination Footer (Static for Visual) */}
         <div className="bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-between">
             <div className="text-sm text-slate-500">
                {filteredData.length} kayıttan 1 - {filteredData.length} arasındaki kayıtlar gösteriliyor
             </div>
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