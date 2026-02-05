import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, Scissors, AlertCircle, Trash2, Repeat, Hash, CalendarDays } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      {/* 
         Removed h-[90vh], relying on content but with a max-height to fit smaller screens.
         Using overflow-hidden on the main card to prevent body scroll.
      */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden max-h-[95vh]">
        
        {/* Header - Compact padding */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div>
             <h2 className="text-lg font-bold text-slate-900">
               {appointment ? "Randevu Düzenle" : "Yeni Randevu Oluştur"}
             </h2>
             <p className="text-xs text-slate-500">Gerekli bilgileri doldurarak randevuyu planlayın.</p>
          </div>
          <div className="flex items-center gap-2">
            {appointment && (
              <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Sil">
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Content - Flex layout to fill space without main scrollbar */}
        <form id="appointment-form" onSubmit={handleSubmit} className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* LEFT COLUMN: Who & What */}
            {/* Added flex flex-col and overflow-hidden to allow inner scrolling for services if needed */}
            <div className="w-full md:w-7/12 p-6 flex flex-col border-b md:border-b-0 md:border-r border-slate-100 overflow-hidden bg-white">
                
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs flex items-center gap-2 border border-red-100 mb-4 shrink-0">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 shrink-0">
                    {/* Müşteri Seçimi */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <User size={14} className="text-slate-500" /> Müşteri
                        </label>
                        <Select 
                        value={customerId} 
                        onChange={(e) => setCustomerId(Number(e.target.value))}
                        required
                        className="bg-slate-50 border-slate-200 focus:bg-white h-10 text-sm" // Compact height
                        >
                        <option value="">Müşteri Seçin...</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                        ))}
                        </Select>
                    </div>

                    {/* Personel Seçimi */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <User size={14} className="text-slate-500" /> Personel
                        </label>
                        <Select 
                        value={staffId} 
                        onChange={(e) => setStaffId(Number(e.target.value))}
                        required
                        className="bg-slate-50 border-slate-200 focus:bg-white h-10 text-sm" // Compact height
                        >
                        <option value="">Personel Seçin...</option>
                        {staff.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                        </Select>
                    </div>
                </div>

                {/* Hizmet Seçimi - Fills remaining space */}
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex justify-between items-end mb-2 shrink-0">
                        <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                            <Scissors size={14} className="text-slate-500" /> Hizmetler
                        </label>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {selectedServiceIds.length} seçildi
                        </span>
                    </div>
                    
                    {/* Grid wrapper with overflow-y-auto to scroll ONLY services if list is long */}
                    <div className="flex-1 overflow-y-auto pr-1">
                        <div className="grid grid-cols-2 gap-2 pb-2">
                            {services.map(s => {
                                const isSelected = selectedServiceIds.includes(s.id);
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => toggleService(s.id)}
                                        className={`relative flex items-center p-2.5 rounded-lg border transition-all text-left group ${
                                            isSelected
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`w-1.5 h-6 rounded-full mr-2.5 shrink-0 ${isSelected ? 'bg-white/30' : ''}`} style={{ backgroundColor: isSelected ? undefined : s.color }}></div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>{s.name}</div>
                                            <div className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{s.duration} dk</div>
                                        </div>
                                        <div className={`text-xs font-bold ml-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>{s.price}₺</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: When & Details */}
            <div className="w-full md:w-5/12 p-6 bg-slate-50/50 flex flex-col space-y-4">
                
                {/* Tarih ve Saat */}
                <div className="grid grid-cols-2 gap-3 shrink-0">
                    <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <CalendarIcon size={14} className="text-slate-500" /> Tarih
                    </label>
                    <div className="h-10"> {/* Fixed height wrapper for consistency */}
                        <DatePicker 
                            value={date}
                            onChange={setDate}
                        />
                    </div>
                    </div>
                    <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-500" /> Saat
                    </label>
                    <TimePicker 
                        value={startTime}
                        onChange={setStartTime}
                        className="h-10" // Pass class if supported or style wrapper
                    />
                    </div>
                </div>

                {/* Tekrarlayan Randevu Bölümü */}
                <div className={`border rounded-xl p-3 transition-all shrink-0 ${isRecurring ? 'bg-white border-slate-900 shadow-sm' : 'bg-transparent border-slate-200'}`}>
                    <div className="flex items-center gap-2.5 mb-2">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox"
                                id="recurring"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 transition-all checked:border-slate-900 checked:bg-slate-900 hover:border-slate-400"
                            />
                            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                <Repeat size={10} strokeWidth={3} />
                            </div>
                        </div>
                        <label htmlFor="recurring" className="text-xs font-bold text-slate-800 cursor-pointer select-none">
                            Tekrarlayan Randevu
                        </label>
                    </div>

                    {isRecurring && (
                        <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
                             <div className="space-y-0.5">
                                <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                                    <CalendarDays size={10} /> Sıklık
                                </label>
                                <Select 
                                    value={recurrenceFreq}
                                    onChange={(e) => setRecurrenceFreq(e.target.value)}
                                    className="h-8 text-xs py-0"
                                >
                                    <option value="daily">Her Gün</option>
                                    <option value="weekly">Her Hafta</option>
                                    <option value="monthly">Her Ay</option>
                                </Select>
                             </div>
                             <div className="space-y-0.5">
                                <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                                    <Hash size={10} /> Tekrar Sayısı
                                </label>
                                <Input 
                                    type="number"
                                    min="1"
                                    max="52"
                                    value={recurrenceCount}
                                    onChange={(e) => setRecurrenceCount(e.target.value)}
                                    className="h-8 text-xs py-0"
                                />
                             </div>
                        </div>
                    )}
                </div>

                {/* Notlar - Fills remaining vertical space */}
                <div className="space-y-1 flex-1 flex flex-col min-h-0">
                    <label className="text-xs font-semibold text-slate-900">Notlar</label>
                    <textarea
                    className="flex-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Müşteri talepleri veya özel notlar..."
                    />
                </div>
            </div>
        </form>

        {/* Footer / Summary - Compact */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-6">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Bitiş</p>
                    <p className="font-mono font-bold text-base text-slate-700">{endTime || "--:--"}</p>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Toplam</p>
                    <p className="font-bold text-xl text-slate-900">{totalPrice} ₺</p>
                </div>
            </div>

            <Button 
                onClick={handleSubmit}
                variant="black"
                className="w-full sm:w-auto px-6 h-10 text-sm shadow-lg shadow-slate-300"
            >
                {appointment ? "Kaydet" : "Randevuyu Kaydet"}
            </Button>
        </div>

      </div>
    </div>
  );
};