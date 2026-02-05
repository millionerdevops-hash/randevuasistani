import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, Scissors, AlertCircle, Trash2, Repeat, Hash, CalendarDays, ChevronDown, Check, Plus } from 'lucide-react';
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

  // Service Dropdown State
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  // Recurring Fields
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFreq, setRecurrenceFreq] = useState("weekly"); // daily, weekly, monthly
  const [recurrenceCount, setRecurrenceCount] = useState("1");

  // Calculation State
  const [endTime, setEndTime] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setIsServiceDropdownOpen(false);
      }
    };
    if (isServiceDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isServiceDropdownOpen]);

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
      setIsServiceDropdownOpen(false);
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
    // Dropdown'ı kapatma, birden fazla seçim yapılabilir olsun
    // setIsServiceDropdownOpen(false); 
  };

  const removeService = (id: number) => {
    setSelectedServiceIds(prev => prev.filter(pid => pid !== id));
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
        <form id="appointment-form" onSubmit={handleSubmit} className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-white relative">
            
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

                {/* Hizmetler Dropdown & List */}
                <div className="space-y-2 flex-1 flex flex-col" ref={serviceDropdownRef}>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <Scissors size={14} className="text-slate-400" /> Hizmetler
                    </label>

                    {/* Selected Services List (Chips) */}
                    <div className="flex flex-wrap gap-2 mb-1">
                        {selectedServiceIds.map(id => {
                            const s = services.find(ser => ser.id === id);
                            if (!s) return null;
                            return (
                                <div key={id} className="flex items-center gap-2 bg-slate-900 text-white pl-3 pr-2 py-1.5 rounded-lg text-sm font-medium shadow-sm animate-in zoom-in duration-200">
                                    <span>{s.name}</span>
                                    <span className="opacity-60 text-xs">({s.duration}dk)</span>
                                    <button 
                                        type="button" 
                                        onClick={() => removeService(id)}
                                        className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Dropdown Trigger */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                            className={`w-full h-12 flex items-center justify-between px-3 border rounded-xl bg-white text-left transition-all ${isServiceDropdownOpen ? 'border-black ring-1 ring-black' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <span className="text-slate-500 text-sm font-medium">
                                {selectedServiceIds.length === 0 ? "Hizmet Ekle..." : "Başka hizmet ekle..."}
                            </span>
                            <ChevronDown size={18} className={`text-slate-400 transition-transform ${isServiceDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isServiceDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 origin-top">
                                {services.map(s => {
                                    const isSelected = selectedServiceIds.includes(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => toggleService(s.id)}
                                            className={`w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex items-center justify-between group ${isSelected ? 'bg-slate-50' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className={`w-1 h-8 rounded-full transition-colors ${isSelected ? 'bg-slate-300' : ''}`} 
                                                    style={{ backgroundColor: isSelected ? undefined : s.color }}
                                                ></div>
                                                <div>
                                                    <div className={`text-sm font-bold ${isSelected ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                        {s.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {s.duration} dk
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <span className={`font-bold text-sm ${isSelected ? 'text-slate-400 line-through' : 'text-indigo-600'}`}>
                                                    {s.price}₺
                                                </span>
                                                {isSelected ? (
                                                    <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                                                        <Check size={12} strokeWidth={3} />
                                                    </div>
                                                ) : (
                                                    <div className="w-5 h-5 border border-slate-300 rounded-full flex items-center justify-center text-transparent group-hover:border-slate-400">
                                                        <Plus size={12} className="text-slate-300" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: Time & Notes --- */}
            {/* Updated bg-slate-50 to bg-white for mobile to match top section */}
            <div className="w-full md:w-5/12 p-4 md:p-6 bg-white md:bg-slate-50 flex flex-col gap-5">
                
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