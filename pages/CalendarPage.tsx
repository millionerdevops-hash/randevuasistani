import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Button, Select } from '../components/ui/LayoutComponents';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, Clock, Search, X, Plus } from 'lucide-react';
import { 
  format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, 
  isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, 
  subMonths, addMonths, subDays, isSameMonth, getDay, updateAppointment
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { AppointmentModal } from '../components/AppointmentModal';
import { Appointment } from '../types';

type ViewMode = 'day' | 'week' | 'month';

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [finderStaffId, setFinderStaffId] = useState<number | 'all'>('all');
  const [finderDuration, setFinderDuration] = useState('60');
  
  const [selectedDateForModal, setSelectedDateForModal] = useState<string | undefined>(undefined);
  const [selectedAppointmentForModal, setSelectedAppointmentForModal] = useState<Appointment | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<number | 'all'>('all');
  
  const [draggedAppointmentId, setDraggedAppointmentId] = useState<number | null>(null);
  
  const { appointments, customers, services, staff, updateAppointment } = useStore();

  const startHour = 7; 
  const endHour = 23; 
  const timeSlots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  
  const rowHeight = 60; 

  const daysToShow = useMemo(() => {
    if (view === 'day') {
      return [currentDate];
    }
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }
    if (view === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const start = startOfWeek(monthStart, { weekStartsOn: 1 });
      const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
    return [];
  }, [currentDate, view]);

  const headerTitle = useMemo(() => {
    if (view === 'day') return format(currentDate, 'd MMMM yyyy', { locale: tr });
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, 'd')} - ${format(end, 'd MMMM', { locale: tr })}`;
      }
      return `${format(start, 'd MMM', { locale: tr })} - ${format(end, 'd MMM', { locale: tr })}`;
    }
    if (view === 'month') return format(currentDate, 'MMMM yyyy', { locale: tr });
    return '';
  }, [currentDate, view]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (view === 'day') setCurrentDate(subDays(currentDate, 1));
      if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
      if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    } else {
      if (view === 'day') setCurrentDate(addDays(currentDate, 1));
      if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
      if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const getCustomerName = (id: number) => customers.find(c => c.id === id)?.name || 'Müşteri';
  const getServiceName = (ids: number[]) => {
     if(ids.length === 0) return '';
     const s = services.find(ser => ser.id === ids[0]);
     return s ? s.name : '';
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => selectedStaffId === 'all' || apt.staffId === selectedStaffId);
  }, [appointments, selectedStaffId]);

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredAppointments.filter(apt => apt.date === dateStr);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDateForModal(format(date, 'yyyy-MM-dd'));
    setSelectedAppointmentForModal(null);
    setIsModalOpen(true);
  };

  const handleAppointmentDoubleClick = (e: React.MouseEvent, apt: Appointment) => {
    e.stopPropagation();
    setSelectedDateForModal(undefined);
    setSelectedAppointmentForModal(apt);
    setIsModalOpen(true);
  };

  const findAvailableSlots = () => {
    const suggestions = [];
    const checkDays = [currentDate, addDays(currentDate, 1), addDays(currentDate, 2)];
    
    for (const day of checkDays) {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayName = format(day, 'EEEE', { locale: tr });
        
        suggestions.push({ date: dayStr, dayName, time: '09:00', staffId: finderStaffId === 'all' ? staff[0].id : finderStaffId });
        suggestions.push({ date: dayStr, dayName, time: '13:30', staffId: finderStaffId === 'all' ? staff[1]?.id || staff[0].id : finderStaffId });
        suggestions.push({ date: dayStr, dayName, time: '16:00', staffId: finderStaffId === 'all' ? staff[0].id : finderStaffId });
    }
    return suggestions.slice(0, 4);
  };

  const suggestedSlots = isFinderOpen ? findAvailableSlots() : [];

  const handleSlotSelect = (slot: any) => {
      setSelectedDateForModal(slot.date);
      setSelectedStaffId(slot.staffId);
      setIsFinderOpen(false);
      setIsModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, id: number, duration: number) => {
    setDraggedAppointmentId(id);
    const rect = e.currentTarget.getBoundingClientRect();
    const grabOffset = e.clientY - rect.top;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, duration, grabOffset }));
    
    setTimeout(() => {
        if(e.currentTarget) e.currentTarget.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedAppointmentId(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    setDraggedAppointmentId(null);

    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    const { id, duration, grabOffset } = JSON.parse(data);
    
    if (view === 'month') {
        const newDateStr = format(targetDate, 'yyyy-MM-dd');
        updateAppointment(id, { date: newDateStr });
        return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeMouseY = e.clientY - rect.top;
    const correctedY = relativeMouseY - (grabOffset || 0);
    const pixelsPerMinute = rowHeight / 30;
    
    let totalMinutesFromStart = (correctedY / pixelsPerMinute);
    totalMinutesFromStart = Math.round(totalMinutesFromStart / 15) * 15;

    if (totalMinutesFromStart < 0) totalMinutesFromStart = 0;

    const absoluteStartMinutes = (startHour * 60) + totalMinutesFromStart;
    const newStartHour = Math.floor(absoluteStartMinutes / 60);
    const newStartMinute = absoluteStartMinutes % 60;
    
    if (newStartHour < startHour || newStartHour >= endHour) return;

    const formattedStartTime = `${newStartHour.toString().padStart(2, '0')}:${newStartMinute.toString().padStart(2, '0')}`;
    const endTotalMinutes = absoluteStartMinutes + duration;
    const newEndHour = Math.floor(endTotalMinutes / 60);
    const newEndMinute = endTotalMinutes % 60;
    const formattedEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;
    const newDateStr = format(targetDate, 'yyyy-MM-dd');

    updateAppointment(id, {
        date: newDateStr,
        startTime: formattedStartTime,
        endTime: formattedEndTime
    });
  };

  const getEventStyle = (startTime: string, endTime: string, serviceIds: number[]) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const startMinutes = (startH - startHour) * 60 + startM;
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    
    const pixelsPerMinute = rowHeight / 30;
    const top = startMinutes * pixelsPerMinute; 
    const height = durationMinutes * pixelsPerMinute;

    const service = services.find(s => s.id === serviceIds[0]);
    let bgColor = service ? service.color + "40" : "#e0e7ff"; 
    let borderColor = service ? service.color : "#6366f1";

    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: bgColor,
      borderLeft: `4px solid ${borderColor}`,
      color: "#1e293b",
    };
  };

  const getEventDuration = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  const stripeStyle = {
    backgroundColor: '#f9fafb',
    backgroundImage: `repeating-linear-gradient(45deg, #e2e8f0 0, #e2e8f0 1px, transparent 0, transparent 10px)`
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in relative">
      
      {/* Page Header - Hidden on Mobile to save space */}
      <div className="hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Randevu Takvimi</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Takvim</span>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        {/* Availability Finder Overlay Modal */}
        {isFinderOpen && (
            <div className="absolute inset-x-0 top-0 z-[60] bg-white border-b border-slate-200 p-4 shadow-lg animate-in slide-in-from-top-10">
                <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                    <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">İşlem Süresi</label>
                            <Select value={finderDuration} onChange={(e) => setFinderDuration(e.target.value)} className="h-9 text-sm">
                                <option value="30">30 Dakika</option>
                                <option value="60">1 Saat</option>
                                <option value="90">1.5 Saat</option>
                                <option value="120">2 Saat</option>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Personel</label>
                            <Select value={finderStaffId} onChange={(e) => setFinderStaffId(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="h-9 text-sm">
                                <option value="all">Farketmez</option>
                                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </Select>
                        </div>
                    </div>
                    <button onClick={() => setIsFinderOpen(false)} className="absolute top-2 right-2 text-slate-400 hover:text-black">
                        <X size={18} />
                    </button>
                </div>
                <div className="mt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Önerilen Saatler (Örnek)</h4>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {suggestedSlots.map((slot, i) => {
                            const stf = staff.find(s => s.id === slot.staffId);
                            return (
                                <button 
                                    key={i} 
                                    onClick={() => handleSlotSelect(slot)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all bg-white min-w-[140px] group"
                                >
                                    <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-md">
                                        <Clock size={14} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-slate-800">{slot.time}</div>
                                        <div className="text-[10px] text-slate-500 group-hover:text-indigo-600">{slot.dayName}, {stf?.name.split(' ')[0]}</div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        )}

        {/* Header Toolbar - Optimized for Mobile */}
        <div className="flex flex-col lg:flex-row items-center justify-between p-3 md:p-4 border-b border-slate-200 gap-3 md:gap-4 shrink-0 z-30 bg-white sticky top-0">
            
            {/* Top Row on Mobile: Nav & View */}
            <div className="flex items-center justify-between w-full lg:w-auto gap-2">
                
                {/* Date Navigation */}
                <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200 shrink-0 flex-1 lg:flex-none justify-between lg:justify-start">
                    <button onClick={() => handleNavigate('prev')} className="p-1.5 hover:bg-white rounded-md transition-colors text-slate-600">
                        <ChevronLeft size={18} />
                    </button>
                    <div className="flex items-center justify-center px-2 md:px-4 font-medium text-sm text-slate-800 whitespace-nowrap capitalize truncate">
                        <CalendarIcon size={14} className="mr-2 text-slate-400 hidden sm:inline" />
                        {headerTitle}
                    </div>
                    <button onClick={() => handleNavigate('next')} className="p-1.5 hover:bg-white rounded-md transition-colors text-slate-600">
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Today Button - Icon on Mobile, Text on Desktop */}
                <button 
                    onClick={() => setCurrentDate(new Date())} 
                    className="text-sm font-medium text-slate-600 hover:text-black px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors shrink-0 border border-slate-200 lg:border-0"
                    title="Bugün"
                >
                    <span className="hidden md:inline">Bugün</span>
                    <span className="md:hidden">Bugün</span>
                </button>
            </div>

            {/* Bottom Row on Mobile: Staff, View & Actions */}
            <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto justify-between overflow-x-auto no-scrollbar">
                
                {/* Staff Selector */}
                <div className="relative group min-w-[140px] md:min-w-[200px] shrink-0">
                    <button className="flex items-center gap-2 md:gap-3 pl-1 md:pl-1 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 transition-colors bg-white w-full shadow-sm text-slate-700 h-10">
                         {/* Show avatar only on desktop or if it's 'all' */}
                        <div className="hidden md:block">
                            <img 
                                src={`https://i.pravatar.cc/100?img=${selectedStaffId === 'all' ? '68' : (Number(selectedStaffId) + 25)}`}
                                alt="Staff"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        </div>
                        <span className="text-xs md:text-sm font-medium truncate flex-1 text-left pl-2 md:pl-0">
                            {selectedStaffId === 'all' ? 'Tüm Çalışanlar' : staff.find(s => s.id === selectedStaffId)?.name}
                        </span>
                        <ChevronDown size={14} className="text-slate-400" />
                    </button>
                    <select 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        value={selectedStaffId}
                        onChange={(e) => setSelectedStaffId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    >
                        <option value="all">Tüm Çalışanlar</option>
                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                {/* View Selector */}
                <div className="relative min-w-[90px] md:min-w-[120px] shrink-0">
                    <div className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer h-10">
                        <span>
                            {view === 'day' ? 'Günlük' : view === 'week' ? 'Haftalık' : 'Aylık'}
                        </span>
                        <ChevronDown size={14} />
                    </div>
                    <select 
                        value={view}
                        onChange={(e) => setView(e.target.value as ViewMode)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                        <option value="day">Günlük</option>
                        <option value="week">Haftalık</option>
                        <option value="month">Aylık</option>
                    </select>
                </div>

                {/* Desktop: Availability Finder */}
                <Button 
                    variant="outline" 
                    onClick={() => setIsFinderOpen(!isFinderOpen)}
                    className={`hidden md:flex px-4 ${isFinderOpen ? 'bg-slate-100 border-slate-300' : ''}`}
                >
                    <Search size={16} className="mr-2" /> Müsaitlik Bul
                </Button>
                
                {/* New Appointment Button - Compact on Mobile */}
                <Button onClick={() => { setSelectedDateForModal(undefined); setSelectedAppointmentForModal(null); setIsModalOpen(true); }} variant="black" className="shadow-md shadow-slate-300/50 shrink-0 h-10 px-3 md:px-6">
                    <span className="hidden md:inline">Yeni Randevu</span>
                    <span className="md:hidden"><Plus size={20} /></span>
                </Button>
            </div>
        </div>

        {/* --- TIME GRID VIEW (Day & Week) --- */}
        {(view === 'week' || view === 'day') && (
            <div className="flex-1 overflow-auto bg-white relative select-none">
                <div 
                    className="grid min-w-[800px] h-full" 
                    style={{ 
                        gridTemplateColumns: `80px repeat(${daysToShow.length}, 1fr)`, 
                        gridTemplateRows: '56px 1fr' 
                    }}
                >
                    {/* Top-Left Corner */}
                    <div className="sticky top-0 left-0 z-20 bg-white border-b border-r border-slate-200"></div>
                    
                    {/* Day Headers */}
                    {daysToShow.map((day, i) => {
                        const isToday = isSameDay(day, new Date());
                        const isSunday = getDay(day) === 0;
                        return (
                            <div key={i} className={`sticky top-0 z-20 border-b border-r border-slate-200 flex items-center justify-center bg-white ${isToday ? 'bg-indigo-50/30' : ''} ${isSunday ? 'bg-slate-50' : ''}`}>
                                <div className="text-center py-2">
                                    <span className={`text-sm font-bold block ${isToday ? 'text-indigo-600' : 'text-slate-900'}`}>
                                        {format(day, 'd MMMM', { locale: tr })}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium capitalize">
                                        {format(day, 'EEEE', { locale: tr })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Time Column */}
                    <div className="relative border-r border-slate-200 bg-white sticky left-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]" style={{ height: timeSlots.length * rowHeight }}>
                        {timeSlots.map(time => {
                            const isHour = time.endsWith(':00');
                            return (
                                <div key={time} className={`absolute w-full flex items-start justify-end pr-3 pointer-events-none`} style={{ top: (timeSlots.indexOf(time)) * rowHeight, height: rowHeight }}>
                                    <span className={`absolute -top-3 right-3 px-1 bg-white font-medium ${isHour ? 'text-xs text-slate-900 font-bold' : 'text-[10px] text-slate-400'}`}>
                                        {time}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Day Columns */}
                    {daysToShow.map((day, i) => {
                        const dayAppts = getAppointmentsForDay(day);
                        const isToday = isSameDay(day, new Date());
                        const dayOfWeek = getDay(day);
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; 
                        
                        return (
                            <div 
                                key={i} 
                                className={`relative border-r border-slate-200 transition-colors ${isToday ? 'bg-indigo-50/5' : ''}`} 
                                style={{ height: timeSlots.length * rowHeight }}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, day)}
                            >
                                {timeSlots.map((time, idx) => {
                                    const isHour = time.endsWith(':00');
                                    return (
                                        <div 
                                            key={idx}
                                            className={`absolute w-full pointer-events-none ${isHour ? 'border-b border-dashed border-slate-200/50' : 'border-b border-slate-200'}`}
                                            style={{ 
                                                top: idx * rowHeight, 
                                                height: rowHeight,
                                                ...( isWeekend ? stripeStyle : {} )
                                            }}
                                        ></div>
                                    );
                                })}

                                <div className="absolute inset-0 z-0" onClick={() => handleDayClick(day)}></div>

                                {dayAppts.map(apt => {
                                    const style = getEventStyle(apt.startTime, apt.endTime, apt.serviceIds);
                                    const duration = getEventDuration(apt.startTime, apt.endTime);
                                    
                                    return (
                                        <div 
                                            key={apt.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, apt.id, duration)}
                                            onDragEnd={handleDragEnd}
                                            onDoubleClick={(e) => handleAppointmentDoubleClick(e, apt)}
                                            className="absolute left-1 right-1 rounded-md p-2 shadow-sm cursor-grab active:cursor-grabbing hover:brightness-95 transition-all z-10 overflow-hidden flex flex-col items-start group ring-1 ring-black/5 hover:shadow-md"
                                            style={{
                                                ...style,
                                                opacity: draggedAppointmentId === apt.id ? 0.5 : 1,
                                                zIndex: draggedAppointmentId === apt.id ? 50 : 10
                                            }}
                                        >
                                            <div className="text-[10px] font-semibold opacity-70 mb-0.5 flex items-center gap-1">
                                                <Clock size={10} /> {apt.startTime} - {apt.endTime}
                                            </div>
                                            <div className="font-bold text-xs leading-tight mb-0.5 pointer-events-none truncate w-full">{getCustomerName(apt.customerId)}</div>
                                            <div className="text-[10px] opacity-80 truncate w-full pointer-events-none">{getServiceName(apt.serviceIds)}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        )}

        {/* --- MONTH VIEW --- */}
        {view === 'month' && (
            <div className="flex-1 overflow-auto bg-white p-4">
                <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden min-w-[800px]">
                    {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map(day => (
                        <div key={day} className="bg-slate-50 p-2 text-center text-xs font-semibold text-slate-500 uppercase">
                            {day}
                        </div>
                    ))}

                    {daysToShow.map((day, i) => {
                        const isToday = isSameDay(day, new Date());
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const dayAppts = getAppointmentsForDay(day);
                        
                        return (
                            <div 
                                key={i} 
                                className={`bg-white min-h-[120px] p-2 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col gap-1 ${!isCurrentMonth ? 'bg-slate-50/50' : ''}`}
                                onClick={() => handleDayClick(day)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, day)}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayAppts.length > 0 && (
                                        <span className="text-[10px] font-medium text-slate-400">
                                            {dayAppts.length} randevu
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col gap-1 mt-1 overflow-y-auto max-h-[100px] no-scrollbar">
                                    {dayAppts.map(apt => {
                                        const service = services.find(s => s.id === apt.serviceIds[0]);
                                        return (
                                            <div 
                                                key={apt.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, apt.id, 0)}
                                                onDragEnd={handleDragEnd}
                                                onDoubleClick={(e) => handleAppointmentDoubleClick(e, apt)}
                                                className="text-[10px] px-1.5 py-1 rounded truncate border-l-4 cursor-grab hover:opacity-80 shadow-sm"
                                                style={{
                                                    backgroundColor: service ? service.color + '20' : '#f1f5f9',
                                                    borderLeftColor: service ? service.color : '#cbd5e1',
                                                    color: '#334155'
                                                }}
                                            >
                                                <span className="font-bold mr-1">{apt.startTime}</span>
                                                {getCustomerName(apt.customerId)}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}
      </div>

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedAppointmentForModal(null); }}
        initialDate={selectedDateForModal}
        appointment={selectedAppointmentForModal}
      />
    </div>
  );
};