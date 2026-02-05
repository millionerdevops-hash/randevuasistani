import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, Scissors, AlertCircle, Trash2, Repeat, Hash, CalendarDays, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button, Input, Select, DatePicker, TimePicker } from './ui/LayoutComponents';
import { Appointment } from '../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialStaffId?: number;
  appointment?: Appointment | null; // For editing mode
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ 
  isOpen, 
  onClose, 
  initialDate, 
  initialStaffId, 
  appointment 
}) => {
  const { customers, staff, services, addAppointment, updateAppointment, deleteAppointment, checkAvailability } = useStore();
  
  // Basic Fields
  const [customerId, setCustomerId] = useState<number | "">("");
  const [staffId, setStaffId] = useState<number | "">("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Recurring Fields
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFreq, setRecurrenceFreq] = useState("weekly"); // daily, weekly, monthly
  const [recurrenceCount, setRecurrenceCount] = useState("1");

  // Calculation State
  const [endTime, setEndTime] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  // Effect to populate form when editing
  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        setCustomerId(appointment.customerId);
        setStaffId(appointment.staffId);
        setSelectedServiceIds(appointment.serviceIds);
        setDate(appointment.date);
        setStartTime(appointment.startTime);
        setNotes(appointment.notes || "");
        setIsRecurring(false);
      } else {
        setCustomerId("");
        setSelectedServiceIds([]);
        setNotes("");
        setStartTime("10:00");
        setIsRecurring(false);
        setRecurrenceFreq("weekly");
        setRecurrenceCount("1");
        if (initialDate) setDate(initialDate);
        if (initialStaffId) setStaffId(initialStaffId);
      }
      setError(null);
    }
  }, [isOpen, appointment, initialDate, initialStaffId]);

  // Price and End Time Calculation
  useEffect(() => {
    let duration = 0;
    let price = 0;

    selectedServiceIds.forEach(id => {
      const s = services.find(serv => serv.id === id);
      if (s) {
        duration += s.duration;
        price += s.price;
      }
    });

    setTotalPrice(price);

    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const dateObj = new Date();
      dateObj.setHours(hours, minutes + duration);
      const endHours = dateObj.getHours().toString().padStart(2, '0');
      const endMinutes = dateObj.getMinutes().toString().padStart(2, '0');
      setEndTime(`${endHours}:${endMinutes}`);
    }
  }, [selectedServiceIds, startTime, services]);

  const toggleService = (id: number) => {
    setSelectedServiceIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    if (appointment && window.confirm("Bu randevuyu silmek istediğinize emin misiniz?")) {
      deleteAppointment(appointment.id);
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId || !staffId || selectedServiceIds.length === 0) {
      setError("Lütfen Müşteri, Personel ve en az bir Hizmet seçiniz.");
      return;
    }

    const appointmentData = {
      customerId: Number(customerId),
      staffId: Number(staffId),
      serviceIds: selectedServiceIds,
      date,
      startTime,
      endTime,
      totalPrice,
      status: appointment ? appointment.status : 'confirmed' as const,
      notes: isRecurring 
        ? `${notes} (Tekrar: ${recurrenceCount}x ${recurrenceFreq === 'daily' ? 'Günlük' : recurrenceFreq === 'weekly' ? 'Haftalık' : 'Aylık'})` 
        : notes
    };

    const isAvailable = checkAvailability(
      Number(staffId), 
      date, 
      startTime, 
      endTime, 
      appointment?.id
    );

    if (!isAvailable) {
      setError("Seçilen saatte personel müsait değil.");
      return;
    }

    if (appointment) {
      updateAppointment(appointment.id, appointmentData);
    } else {
      addAppointment(appointmentData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    // Mobile: Full screen, justify-end (bottom sheet feel) or justify-center (modal)
    // Desktop: Centered modal
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Container */}
      <div className="bg-white w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:max-w-5xl flex flex-col md:rounded-3xl shadow-2xl overflow-hidden transition-all animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 md:px-6 py-4 border-b border-slate-100 bg-white shrink-0 relative z-10">
          <div>
             <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
               {appointment ? "Randevu Düzenle" : "Yeni Randevu"}
             </h2>
             <p className="text-xs text-slate-500 hidden md:block">Gerekli bilgileri doldurarak randevuyu planlayın.</p>
          </div>
          <div className="flex items-center gap-2">
            {appointment && (
              <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Sil">
                <Trash2 size={20} />
              </button>
            )}
            <button 
                onClick={onClose} 
                className="p-2 bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Form */}
        {/* Mobile: Single scrollable column. Desktop: Flex row with separate scrolling if needed or just fit content. */}
        <form id="appointment-form" onSubmit={handleSubmit} className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-slate-50 md:bg-white relative">
            
            {/* --- LEFT SIDE: Selection (Customer, Staff, Services) --- */}
            <div className="w-full md:w-7/12 p-4 md:p-6 flex flex-col gap-5 border-b md:border-b-0 md:border-r border-slate-200 bg-white">
                
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-start gap-2 border border-red-100 animate-in slide-in-from-top-2">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Müşteri */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                            <User size={14} className="text-slate-400" /> Müşteri
                        </label>
                        <Select 
                            value={customerId} 
                            onChange={(e) => setCustomerId(Number(e.target.value))}
                            required
                            className="bg-slate-50 border-slate-200 h-12 text-base font-medium focus:ring-black"
                        >
                            <option value="">Müşteri Seçin...</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </Select>
                    </div>

                    {/* Personel */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                            <User size={14} className="text-slate-400" /> Personel
                        </label>
                        <Select 
                            value={staffId} 
                            onChange={(e) => setStaffId(Number(e.target.value))}
                            required
                            className="bg-slate-50 border-slate-200 h-12 text-base font-medium focus:ring-black"
                        >
                            <option value="">Personel Seçin...</option>
                            {staff.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </Select>
                    </div>
                </div>

                {/* Hizmetler */}
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex justify-between items-end mb-3 sticky top-0 bg-white z-10 py-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                            <Scissors size={14} className="text-slate-400" /> Hizmetler
                        </label>
                        {selectedServiceIds.length > 0 && (
                            <span className="text-[10px] font-bold text-white bg-black px-2 py-1 rounded-full animate-in zoom-in">
                                {selectedServiceIds.length} Seçildi
                            </span>
                        )}
                    </div>
                    
                    {/* Services List - Mobile: List View (grid-cols-1), Desktop: Grid (grid-cols-2) */}
                    {/* Fixed: Use overflow-visible on mobile so page scrolls, internal scroll on desktop */}
                    <div className="md:flex-1 md:overflow-y-auto md:pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                            {services.map(s => {
                                const isSelected = selectedServiceIds.includes(s.id);
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => toggleService(s.id)}
                                        className={`relative flex items-center p-3 rounded-xl border transition-all text-left group w-full ${
                                            isSelected
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200 transform scale-[1.01]'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        {/* Color Indicator */}
                                        <div 
                                            className={`w-1.5 h-8 rounded-full mr-3 shrink-0 transition-colors ${isSelected ? 'bg-white/40' : ''}`} 
                                            style={{ backgroundColor: isSelected ? undefined : s.color }}
                                        ></div>
                                        
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <div className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>{s.name}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-[10px] font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{s.duration} dk</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{s.category}</span>
                                            </div>
                                        </div>
                                        
                                        <div className={`text-sm font-bold ml-2 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                            {s.price}₺
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: Time & Notes --- */}
            <div className="w-full md:w-5/12 p-4 md:p-6 bg-slate-50 flex flex-col gap-5">
                
                {/* Tarih ve Saat */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Zamanlama</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Tarih</label>
                            <div className="h-11">
                                <DatePicker value={date} onChange={setDate} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700">Saat</label>
                            <TimePicker value={startTime} onChange={setStartTime} className="h-11" />
                        </div>
                    </div>
                </div>

                {/* Tekrarlayan & Notlar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detaylar</h3>
                    
                    {/* Recurring Toggle */}
                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="relative flex items-center">
                                <input 
                                    type="checkbox"
                                    id="recurring"
                                    checked={isRecurring}
                                    onChange={(e) => setIsRecurring(e.target.checked)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-black checked:bg-black hover:border-slate-400"
                                />
                                <Repeat size={12} strokeWidth={3} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                            </div>
                            <label htmlFor="recurring" className="text-sm font-semibold text-slate-800 cursor-pointer select-none">
                                Tekrarlayan Randevu
                            </label>
                        </div>

                        {isRecurring && (
                            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl animate-in fade-in slide-in-from-top-1 border border-slate-100">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Sıklık</label>
                                    <Select 
                                        value={recurrenceFreq}
                                        onChange={(e) => setRecurrenceFreq(e.target.value)}
                                        className="h-9 text-xs"
                                    >
                                        <option value="daily">Her Gün</option>
                                        <option value="weekly">Her Hafta</option>
                                        <option value="monthly">Her Ay</option>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Tekrar</label>
                                    <Input 
                                        type="number"
                                        min="1"
                                        max="52"
                                        value={recurrenceCount}
                                        onChange={(e) => setRecurrenceCount(e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1 flex-1 flex flex-col min-h-[100px]">
                        <label className="text-xs font-semibold text-slate-700">Müşteri Notu</label>
                        <textarea
                            className="flex-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none leading-relaxed"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Müşteri talepleri, özel istekler..."
                        />
                    </div>
                </div>
                
                {/* Spacer for bottom safe area on mobile scroll */}
                <div className="h-20 md:hidden"></div>
            </div>
        </form>

        {/* Footer / Summary - Sticky Bottom */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between gap-4 z-20 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] pb-safe">
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toplam Tutar</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{totalPrice} ₺</span>
                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                        {endTime ? `Bitiş: ${endTime}` : '--:--'}
                    </span>
                </div>
            </div>

            <Button 
                onClick={handleSubmit}
                variant="black"
                className="px-8 h-12 text-sm font-semibold rounded-full shadow-lg shadow-slate-300 active:scale-95 transition-transform"
            >
                {appointment ? "Güncelle" : "Kaydet"}
            </Button>
        </div>

      </div>
    </div>
  );
};