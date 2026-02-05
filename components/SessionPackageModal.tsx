import React, { useState } from 'react';
import { X, Layers, Calendar, CreditCard, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button, Input, DatePicker, CustomSelect } from './ui/LayoutComponents';

interface SessionPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionPackageModal: React.FC<SessionPackageModalProps> = ({ isOpen, onClose }) => {
  const { customers, addSessionPackage } = useStore();
  
  const [customerId, setCustomerId] = useState<number | "">("");
  const [packageName, setPackageName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalSessions, setTotalSessions] = useState("10");
  const [totalPrice, setTotalPrice] = useState("");
  const [paidAmount, setPaidAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId) return;

    addSessionPackage({
      customerId: Number(customerId),
      packageName,
      startDate,
      totalSessions: Number(totalSessions),
      completedSessions: 0,
      scheduledSessions: 0,
      cancelledSessions: 0,
      totalPrice: Number(totalPrice),
      paidAmount: Number(paidAmount) || 0
    });

    // Reset Form
    setCustomerId("");
    setPackageName("");
    setTotalSessions("10");
    setTotalPrice("");
    setPaidAmount("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-visible">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Yeni Paket Satışı</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Müşteri Seçimi */}
          <div className="space-y-1.5">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <User size={14} /> Müşteri
             </label>
             <CustomSelect 
                value={customerId}
                onChange={(val) => setCustomerId(Number(val))}
                options={customers.map(c => ({ value: c.id, label: c.name }))}
                placeholder="Müşteri Seçin"
                className="h-12"
             />
          </div>

          {/* Paket Adı */}
          <div className="space-y-1.5">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <Layers size={14} /> Paket Adı
             </label>
             <Input 
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="Örn: 10 Seans Lazer Epilasyon"
                required
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
              {/* Başlangıç Tarihi */}
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar size={14} /> Başlangıç
                 </label>
                 <div className="h-11">
                    <DatePicker value={startDate} onChange={setStartDate} />
                 </div>
              </div>

              {/* Seans Sayısı */}
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Layers size={14} /> Seans Sayısı
                 </label>
                 <Input 
                    type="number"
                    value={totalSessions}
                    onChange={(e) => setTotalSessions(e.target.value)}
                    required
                 />
              </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
              {/* Toplam Tutar */}
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <CreditCard size={14} /> Tutar (₺)
                 </label>
                 <Input 
                    type="number"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    placeholder="0"
                    required
                 />
              </div>

              {/* Alınan Ödeme */}
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <CreditCard size={14} /> Alınan (₺)
                 </label>
                 <Input 
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="0"
                 />
              </div>
          </div>

          <div className="pt-2 flex gap-3">
             <Button type="button" variant="outline" className="flex-1" onClick={onClose}>İptal</Button>
             <Button type="submit" variant="black" className="flex-1">Kaydet</Button>
          </div>

        </form>
      </div>
    </div>
  );
};