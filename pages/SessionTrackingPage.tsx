import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, Input } from '../components/ui/LayoutComponents';
import { Search, ChevronRight, Layers, Calendar, Check, X, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export const SessionTrackingPage = () => {
  const { sessionPackages, customers, deleteSessionPackage } = useStore();
  const [searchTerm, setSearchTerm] = useState("");

  const getCustomer = (id: number) => customers.find(c => c.id === id);

  const filteredPackages = sessionPackages.filter(pkg => {
    const customer = getCustomer(pkg.customerId);
    const searchString = searchTerm.toLowerCase();
    
    return (
        customer?.name.toLowerCase().includes(searchString) || 
        pkg.packageName.toLowerCase().includes(searchString) ||
        customer?.phone.includes(searchString)
    );
  });

  const handleDelete = (id: number) => {
    if(window.confirm("Bu paket kaydını silmek istediğinize emin misiniz?")) {
        deleteSessionPackage(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Seans Takibi</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Seans Takibi</span>
           </div>
        </div>
        <Button variant="black">
           <Plus size={18} className="mr-2" /> Yeni Paket Satışı
        </Button>
      </div>

      {/* Filter / Search */}
      <Card className="p-4 bg-slate-50 border border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 hidden sm:flex">
                  <span>Sayfada</span>
                  <select className="border border-slate-200 rounded p-1 bg-white font-semibold focus:outline-none">
                      <option>10</option>
                      <option>20</option>
                  </select>
                  <span>kayıt göster</span>
              </div>

              <div className="relative w-full sm:w-64">
                <Input 
                    placeholder="Müşteri veya paket ara..." 
                    className="pl-10 bg-white border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
             </div>
          </div>
      </Card>

      {/* 1. Desktop Table */}
      <Card className="hidden md:block overflow-hidden border border-slate-200 shadow-sm p-0">
         <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                     <tr>
                         <th className="px-6 py-4">Müşteri</th>
                         <th className="px-6 py-4">Başlangıç</th>
                         <th className="px-6 py-4">Paket Adı</th>
                         <th className="px-6 py-4 text-center">Seans Detayı</th>
                         <th className="px-6 py-4 text-right">Toplam</th>
                         <th className="px-6 py-4 text-right">Ödenen</th>
                         <th className="px-6 py-4 text-right">Kalan</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 bg-white">
                     {filteredPackages.length > 0 ? (
                         filteredPackages.map((pkg) => {
                             const customer = getCustomer(pkg.customerId);
                             const remainingPayment = pkg.totalPrice - pkg.paidAmount;
                             
                             return (
                                 <tr key={pkg.id} className="hover:bg-slate-50 transition-colors group">
                                     <td className="px-6 py-4 font-medium text-slate-900">
                                         <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {customer?.name.charAt(0)}
                                            </div>
                                            {customer?.name}
                                         </div>
                                     </td>
                                     <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                         {format(parseISO(pkg.startDate), 'dd.MM.yyyy')}
                                     </td>
                                     <td className="px-6 py-4 text-slate-700 font-medium">
                                         {pkg.packageName}
                                     </td>
                                     <td className="px-6 py-4">
                                         <div className="flex items-center justify-center gap-2">
                                             <div className="flex items-center gap-1 bg-[#4f46e5] text-white px-2 py-1 rounded-md text-xs font-bold min-w-[45px] justify-center shadow-sm" title="Toplam Seans">
                                                 <span>{pkg.totalSessions}</span>
                                                 <Layers size={12} />
                                             </div>
                                             <div className="flex items-center gap-1 bg-[#fbbf24] text-white px-2 py-1 rounded-md text-xs font-bold min-w-[45px] justify-center shadow-sm" title="Planlanan">
                                                 <span>{pkg.scheduledSessions}</span>
                                                 <Calendar size={12} />
                                             </div>
                                             <div className="flex items-center gap-1 bg-[#10b981] text-white px-2 py-1 rounded-md text-xs font-bold min-w-[45px] justify-center shadow-sm" title="Tamamlanan">
                                                 <span>{pkg.completedSessions}</span>
                                                 <Check size={12} strokeWidth={3} />
                                             </div>
                                             <div className="flex items-center gap-1 bg-[#ef4444] text-white px-2 py-1 rounded-md text-xs font-bold min-w-[45px] justify-center shadow-sm" title="İptal / Gelmedi">
                                                 <span>{pkg.cancelledSessions}</span>
                                                 <X size={12} strokeWidth={3} />
                                             </div>
                                         </div>
                                     </td>
                                     <td className="px-6 py-4 text-right text-slate-900 font-bold">
                                         {pkg.totalPrice.toLocaleString()} ₺
                                     </td>
                                     <td className="px-6 py-4 text-right text-slate-600">
                                         {pkg.paidAmount.toLocaleString()} ₺
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                         <span className={`font-bold ${remainingPayment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {remainingPayment.toLocaleString()} ₺
                                         </span>
                                     </td>
                                 </tr>
                             );
                         })
                     ) : (
                         <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Kayıt bulunamadı.</td></tr>
                     )}
                 </tbody>
             </table>
         </div>
      </Card>

      {/* 2. Mobile Cards */}
      <div className="md:hidden space-y-4">
         {filteredPackages.length > 0 ? (
             filteredPackages.map(pkg => {
                 const customer = getCustomer(pkg.customerId);
                 const remainingPayment = pkg.totalPrice - pkg.paidAmount;
                 return (
                     <div key={pkg.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                         <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">{customer?.name.charAt(0)}</div>
                                 <div className="font-bold text-slate-900">{customer?.name}</div>
                             </div>
                             <div className="text-xs font-mono text-slate-500">{format(parseISO(pkg.startDate), 'dd.MM.yyyy')}</div>
                         </div>
                         
                         <div className="font-semibold text-slate-800">{pkg.packageName}</div>
                         
                         <div className="grid grid-cols-4 gap-2 text-center">
                             <div className="bg-indigo-50 rounded p-1 flex flex-col items-center">
                                 <span className="text-xs text-indigo-400 font-bold">TOP</span>
                                 <span className="font-bold text-indigo-700">{pkg.totalSessions}</span>
                             </div>
                             <div className="bg-yellow-50 rounded p-1 flex flex-col items-center">
                                 <span className="text-xs text-yellow-400 font-bold">PLAN</span>
                                 <span className="font-bold text-yellow-700">{pkg.scheduledSessions}</span>
                             </div>
                             <div className="bg-green-50 rounded p-1 flex flex-col items-center">
                                 <span className="text-xs text-green-400 font-bold">BİTEN</span>
                                 <span className="font-bold text-green-700">{pkg.completedSessions}</span>
                             </div>
                             <div className="bg-red-50 rounded p-1 flex flex-col items-center">
                                 <span className="text-xs text-red-400 font-bold">İPTAL</span>
                                 <span className="font-bold text-red-700">{pkg.cancelledSessions}</span>
                             </div>
                         </div>
                         
                         <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-1">
                             <div className="text-sm text-slate-500">Kalan Ödeme</div>
                             <div className={`font-bold ${remainingPayment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                 {remainingPayment.toLocaleString()} ₺
                             </div>
                         </div>
                     </div>
                 )
             })
         ) : (
             <div className="text-center py-10 text-slate-400">Kayıt bulunamadı.</div>
         )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-center gap-4">
         <Button variant="outline" className="h-8 px-3 text-xs" disabled>Önceki</Button>
         <span className="text-sm text-slate-600 flex items-center">1 / 1</span>
         <Button variant="outline" className="h-8 px-3 text-xs" disabled>Sonraki</Button>
      </div>
    </div>
  );
};