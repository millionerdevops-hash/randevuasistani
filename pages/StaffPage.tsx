import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, Input, TimePicker, PhoneInput, formatPhoneNumber, CustomSelect } from '../components/ui/LayoutComponents';
import { Phone, Mail, Calendar, Edit2, Clock, CheckCircle, Wallet, Award, Save, X, CalendarCheck, Trash2, ChevronRight, User } from 'lucide-react';
import { AppointmentModal } from '../components/AppointmentModal';
import { LeaveModal } from '../components/LeaveModal';
import { Staff, WorkingHour } from '../types';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export const StaffPage = () => {
  const { staff, appointments, services, customers, updateStaff, leaves, deleteLeave } = useStore();
  
  // Selection & Tabs
  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id || 1);
  const [activeTab, setActiveTab] = useState("Genel Bakış");
  
  // Modals & Editing
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Staff>>({});

  // Working Hours Editing State
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [editedHours, setEditedHours] = useState<WorkingHour[]>([]);

  const selectedStaff = staff.find(s => s.id === selectedStaffId) || staff[0];

  const tabs = ["Genel Bakış", "Randevular", "Çalışma Saatleri", "İzinler"];

  // Stats Logic
  const staffAppointments = appointments.filter(a => a.staffId === selectedStaffId);
  const totalRevenue = staffAppointments.reduce((sum, a) => sum + a.totalPrice, 0);
  const completedCount = staffAppointments.filter(a => a.status === 'completed').length;
  const upcomingCount = staffAppointments.filter(a => a.status === 'confirmed').length;

  // Filter Leaves for selected staff
  const staffLeaves = leaves.filter(l => l.staffId === selectedStaffId).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  // --- Profile Edit Logic ---
  const startEdit = () => {
    setEditForm(selectedStaff);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const saveEdit = () => {
    updateStaff(selectedStaff.id, editForm);
    setIsEditing(false);
  };

  // --- Working Hours Edit Logic ---
  const startEditHours = () => {
    const hoursToEdit = selectedStaff.workingHours || [];
    setEditedHours(JSON.parse(JSON.stringify(hoursToEdit)));
    setIsEditingHours(true);
  };

  const cancelEditHours = () => {
    setIsEditingHours(false);
    setEditedHours([]);
  };

  const saveEditHours = () => {
    updateStaff(selectedStaff.id, { workingHours: editedHours });
    setIsEditingHours(false);
  };

  const handleHourChange = (index: number, field: keyof WorkingHour, value: any) => {
    const newHours = [...editedHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setEditedHours(newHours);
  };

  const getCustomerName = (id: number) => customers.find(c => c.id === id)?.name || 'Müşteri';
  const getServiceName = (ids: number[]) => ids.map(id => services.find(s => s.id === id)?.name).join(', ');

  const getLeaveColor = (type: string) => {
      switch(type) {
          case 'Yıllık İzin': return 'bg-purple-100 text-purple-700';
          case 'Rapor': return 'bg-red-100 text-red-700';
          case 'Ücretsiz İzin': return 'bg-orange-100 text-orange-700';
          default: return 'bg-slate-100 text-slate-700';
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      {/* Standardized Header */}
      <div className="hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Personel Yönetimi</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Personel</span>
           </div>
        </div>
      </div>

      {/* Staff Selector - Mobile Optimized with CustomSelect */}
      <div className="md:hidden">
         <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Personel Seç</label>
         <CustomSelect
            value={selectedStaffId}
            onChange={(val) => { setSelectedStaffId(Number(val)); setIsEditing(false); setIsEditingHours(false); setActiveTab("Genel Bakış"); }}
            options={staff.map(s => ({ value: s.id, label: s.name }))}
            className="h-12"
            icon={User}
         />
      </div>

      {/* Staff Selector - Desktop */}
      <div className="hidden md:flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {staff.map(s => (
          <button
            key={s.id}
            onClick={() => { setSelectedStaffId(s.id); setIsEditing(false); setIsEditingHours(false); setActiveTab("Genel Bakış"); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-3 border ${
              selectedStaffId === s.id 
                ? 'bg-black text-white border-black shadow-md' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <img src={`https://i.pravatar.cc/50?img=${s.id + 25}`} alt="" className="w-8 h-8 rounded-full object-cover border border-white/20" />
            {s.name}
          </button>
        ))}
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-4 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

        {isEditing ? (
             <div className="space-y-4 max-w-lg animate-in fade-in relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg">Profili Düzenle</h2>
                    <button onClick={cancelEdit} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={18}/></button>
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Ad Soyad</label>
                    <Input value={editForm.name || ''} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Email</label>
                        <Input value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                        </div>
                        <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Telefon</label>
                        <PhoneInput value={editForm.phone || ''} onChange={(val) => setEditForm({...editForm, phone: val})} />
                        </div>
                </div>
                <div className="pt-2 flex gap-3">
                     <Button variant="black" onClick={saveEdit} className="flex-1">Kaydet</Button>
                </div>
            </div>
        ) : (
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 md:gap-6">
                    <img 
                        src={`https://i.pravatar.cc/300?img=${selectedStaff.id + 25}`} 
                        alt={selectedStaff.name} 
                        className="h-20 w-20 md:h-28 md:w-28 rounded-full object-cover border-4 border-slate-50 shadow-sm shrink-0"
                    />
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold text-slate-900 leading-tight">{selectedStaff.name}</h1>
                        <div className="flex flex-col gap-1 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {selectedStaff.email}</span>
                            <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {formatPhoneNumber(selectedStaff.phone)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto md:ml-auto mt-2 md:mt-0">
                    <Button variant="outline" onClick={startEdit} className="flex-1 md:flex-none h-10 px-4 text-xs">
                        <Edit2 size={14} className="mr-2"/> Düzenle
                    </Button>
                    <Button variant="black" onClick={() => setIsAppointmentModalOpen(true)} className="flex-1 md:flex-none h-10 px-4 text-xs shadow-lg shadow-slate-200">
                        <Calendar size={14} className="mr-2"/> Randevu
                    </Button>
                </div>
            </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-16 md:static z-20 -mx-4 px-4 md:mx-0 md:px-0 md:rounded-xl md:border md:shadow-sm">
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
             {tabs.map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`py-3 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                   activeTab === tab 
                     ? 'border-black text-black' 
                     : 'border-transparent text-slate-500 hover:text-slate-800'
                 }`}
               >
                 {tab}
               </button>
             ))}
           </div>
      </div>

      {/* Content Area */}
      <div>
           
           {/* GENEL BAKIŞ */}
           {activeTab === "Genel Bakış" && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    <Card className="p-4 flex flex-col justify-between h-28 border border-indigo-100 bg-indigo-50/30">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-2">
                            <Wallet size={18} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">{totalRevenue.toLocaleString()} ₺</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Toplam Kazanç</div>
                        </div>
                    </Card>
                    <Card className="p-4 flex flex-col justify-between h-28 border border-green-100 bg-green-50/30">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-2">
                            <CheckCircle size={18} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">{completedCount}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tamamlanan</div>
                        </div>
                    </Card>
                    <Card className="p-4 flex flex-col justify-between h-28 border border-amber-100 bg-amber-50/30 col-span-2 md:col-span-1">
                        <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-2">
                            <Award size={18} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900">4.9</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Puan</div>
                        </div>
                    </Card>
                </div>

                {/* Upcoming List */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 px-1">Yaklaşan Randevular</h3>
                    <div className="space-y-3">
                        {upcomingCount > 0 ? (
                            staffAppointments
                            .filter(a => a.status === 'confirmed')
                            .slice(0, 5)
                            .map(apt => (
                                <div key={apt.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex flex-col items-center justify-center text-[10px] font-bold leading-tight">
                                            <span className="text-sm">{format(parseISO(apt.date), 'dd')}</span>
                                            <span className="uppercase">{format(parseISO(apt.date), 'MMM', {locale: tr})}</span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">{getCustomerName(apt.customerId)}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-[150px]">{getServiceName(apt.serviceIds)}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-black text-white text-xs px-2 py-1 rounded font-bold">{apt.startTime}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl text-sm">
                                Yaklaşan randevu yok.
                            </div>
                        )}
                    </div>
                </div>
             </div>
           )}

           {/* RANDEVULAR */}
           {activeTab === "Randevular" && (
             <div className="space-y-3 animate-in fade-in">
                 {staffAppointments.length > 0 ? (
                     staffAppointments.sort((a,b) => b.id - a.id).map(apt => (
                         <div key={apt.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                             <div className="flex justify-between items-start">
                                 <div>
                                    <div className="font-bold text-slate-900">{getCustomerName(apt.customerId)}</div>
                                    <div className="text-xs text-slate-500">{getServiceName(apt.serviceIds)}</div>
                                 </div>
                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    apt.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                 }`}>
                                    {apt.status === 'confirmed' ? 'Onaylı' : apt.status === 'pending' ? 'Bekliyor' : apt.status === 'completed' ? 'Bitti' : 'İptal'}
                                 </span>
                             </div>
                             <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
                                 <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                     <Calendar size={12}/> {format(parseISO(apt.date), 'd MMM', {locale: tr})}
                                     <Clock size={12} className="ml-1"/> {apt.startTime}
                                 </div>
                                 <div className="font-bold text-slate-900 text-sm">{apt.totalPrice} ₺</div>
                             </div>
                         </div>
                     ))
                 ) : (
                    <div className="p-8 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl text-sm">
                        Kayıt yok.
                    </div>
                 )}
             </div>
           )}

           {/* ÇALIŞMA SAATLERİ */}
           {activeTab === "Çalışma Saatleri" && (
             <div className="space-y-4 animate-in fade-in">
                 {/* Toolbar */}
                 <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                     <h3 className="font-bold text-slate-900 text-sm">Haftalık Program</h3>
                     {isEditingHours ? (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={cancelEditHours} className="h-8 text-xs px-3">İptal</Button>
                            <Button variant="black" onClick={saveEditHours} className="h-8 text-xs px-3">Kaydet</Button>
                        </div>
                     ) : (
                        <Button variant="outline" onClick={startEditHours} className="h-8 text-xs px-3 bg-slate-50">Düzenle</Button>
                     )}
                 </div>

                 {/* Hours List */}
                 <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    {isEditingHours 
                        ? editedHours.map((row, i) => (
                            <div key={i} className="p-4 border-b border-slate-100 last:border-0 flex flex-col gap-3">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            checked={row.isOpen} 
                                            onChange={(e) => handleHourChange(i, 'isOpen', e.target.checked)}
                                            className="w-5 h-5 rounded border-slate-300 text-black focus:ring-black"
                                        />
                                        <span className={`font-bold ${row.isOpen ? 'text-slate-900' : 'text-slate-400'}`}>{row.day}</span>
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">{row.isOpen ? 'AÇIK' : 'KAPALI'}</span>
                                 </div>
                                 
                                 {row.isOpen && (
                                     <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                                        <TimePicker 
                                            value={row.startTime} 
                                            onChange={(val) => handleHourChange(i, 'startTime', val)}
                                            className="flex-1"
                                        />
                                        <span className="text-slate-400 text-xs font-bold">-</span>
                                        <TimePicker 
                                            value={row.endTime} 
                                            onChange={(val) => handleHourChange(i, 'endTime', val)}
                                            className="flex-1"
                                        />
                                     </div>
                                 )}
                            </div>
                        ))
                        : (selectedStaff.workingHours || []).map((row, i) => (
                           <div key={i} className="p-4 border-b border-slate-100 last:border-0 flex justify-between items-center hover:bg-slate-50/50">
                               <div className="flex items-center gap-3">
                                   <div className={`w-2 h-2 rounded-full shrink-0 ${row.isOpen ? 'bg-green-500' : 'bg-red-300'}`}></div>
                                   <span className="font-semibold text-slate-800 text-sm">{row.day}</span>
                               </div>
                               <div className={`text-sm font-medium ${row.isOpen ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                                   {row.isOpen ? `${row.startTime} - ${row.endTime}` : 'Tatil'}
                               </div>
                           </div>
                       ))
                    }
                 </div>
             </div>
           )}

           {/* İZİNLER */}
           {activeTab === "İzinler" && (
             <div className="space-y-4 animate-in fade-in">
                 <Button variant="black" onClick={() => setIsLeaveModalOpen(true)} className="w-full shadow-md">
                    <CalendarCheck size={16} className="mr-2" /> Yeni İzin Ekle
                 </Button>

                 <div className="space-y-3">
                    {staffLeaves.length > 0 ? (
                        staffLeaves.map(leave => (
                            <div key={leave.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getLeaveColor(leave.type)}`}>
                                        {leave.type}
                                    </span>
                                    <button 
                                        onClick={() => deleteLeave(leave.id)}
                                        className="text-slate-300 hover:text-red-500 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
                                    <Calendar size={16} className="text-slate-400" />
                                    {format(parseISO(leave.startDate), 'd MMM', {locale: tr})} - {format(parseISO(leave.endDate), 'd MMM yyyy', {locale: tr})}
                                </div>
                                {leave.description && <div className="text-sm text-slate-500 mt-1 border-t border-slate-50 pt-2">{leave.description}</div>}
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl text-sm flex flex-col items-center gap-2">
                            <CalendarCheck size={24} className="opacity-20"/>
                            <span>İzin kaydı bulunmuyor.</span>
                        </div>
                    )}
                 </div>
             </div>
           )}
      </div>

      <AppointmentModal 
        isOpen={isAppointmentModalOpen} 
        onClose={() => setIsAppointmentModalOpen(false)}
        initialStaffId={selectedStaffId}
      />

      <LeaveModal 
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        staffId={selectedStaffId}
      />
    </div>
  );
};