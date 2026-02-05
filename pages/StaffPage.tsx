import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, Input, TimePicker, PhoneInput, formatPhoneNumber } from '../components/ui/LayoutComponents';
import { Phone, Mail, Calendar, Edit2, Clock, CheckCircle, Wallet, Award, Save, X, CalendarCheck, Trash2, ChevronRight } from 'lucide-react';
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

  // Helper to calculate duration for display
  const calculateDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const diff = (endH * 60 + endM) - (startH * 60 + startM);
    return Math.floor(diff / 60) + " sa";
  };

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
    // Clone existing hours or use defaults if missing (fallback)
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
    <div className="space-y-8 animate-in fade-in">
      {/* Standardized Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Personel Yönetimi</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Personel</span>
           </div>
        </div>
      </div>

      {/* Staff Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {staff.map(s => (
          <button
            key={s.id}
            onClick={() => { setSelectedStaffId(s.id); setIsEditing(false); setIsEditingHours(false); setActiveTab("Genel Bakış"); }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
              selectedStaffId === s.id 
                ? 'bg-black text-white border-black shadow-md transform scale-105' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <img src={`https://i.pravatar.cc/50?img=${s.id + 25}`} alt="" className="w-6 h-6 rounded-full object-cover" />
            {s.name}
          </button>
        ))}
      </div>

      {/* Profile Header (Redesigned) */}
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 transition-all">
        <div className="relative group shrink-0">
            <img 
                src={`https://i.pravatar.cc/300?img=${selectedStaff.id + 25}`} 
                alt={selectedStaff.name} 
                className="h-32 w-32 rounded-full object-cover border-4 border-slate-50 shadow-sm"
            />
        </div>
        
        <div className="flex-1 text-center md:text-left w-full">
            {isEditing ? (
                <div className="space-y-4 max-w-md animate-in fade-in">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase">Ad Soyad</label>
                        <Input value={editForm.name || ''} onChange={(e) => setEditForm({...editForm, name: e.target.value})} placeholder="Ad Soyad" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                            <Input value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                         </div>
                         <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Telefon</label>
                            <PhoneInput value={editForm.phone || ''} onChange={(val) => setEditForm({...editForm, phone: val})} />
                         </div>
                    </div>
                </div>
            ) : (
                <>
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">{selectedStaff.name}</h1>
                    <div className="flex flex-col sm:flex-row gap-3 text-slate-500 justify-center md:justify-start items-center flex-wrap">
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-sm hover:bg-slate-100 transition-colors">
                            <Mail size={14}/> {selectedStaff.email}
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-sm hover:bg-slate-100 transition-colors">
                            <Phone size={14}/> {formatPhoneNumber(selectedStaff.phone)}
                        </span>
                    </div>
                </>
            )}
        </div>

        <div className="flex gap-3 self-center md:self-start mt-4 md:mt-2 shrink-0">
             {isEditing ? (
                 <>
                    <Button variant="outline" onClick={cancelEdit} className="h-10 px-5">
                         <X size={16} className="mr-2"/> İptal
                    </Button>
                    <Button variant="black" onClick={saveEdit} className="h-10 px-5">
                         <Save size={16} className="mr-2"/> Kaydet
                    </Button>
                 </>
             ) : (
                 <>
                    <Button variant="black" onClick={() => setIsAppointmentModalOpen(true)} className="h-10 shadow-lg shadow-indigo-100">
                        Yeni Randevu <Calendar size={16} className="ml-2"/>
                    </Button>
                    <Button variant="outline" onClick={startEdit} className="h-10">
                        Düzenle <Edit2 size={16} className="ml-2"/>
                    </Button>
                 </>
             )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Tabs */}
        <Card className="p-4 h-fit lg:col-span-1 border-0 shadow-none bg-transparent lg:bg-white lg:border lg:border-slate-100 lg:shadow-sm">
           <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
             {tabs.map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                   activeTab === tab 
                     ? 'bg-slate-900 text-white shadow-md' 
                     : 'bg-white lg:bg-transparent text-slate-600 hover:bg-slate-100 border border-slate-200 lg:border-0'
                 }`}
               >
                 {tab}
               </button>
             ))}
           </div>
        </Card>

        {/* Right Content */}
        <div className="lg:col-span-3">
           
           {/* GENEL BAKIŞ TAB */}
           {activeTab === "Genel Bakış" && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="p-6 flex flex-col items-center text-center hover:border-indigo-200 transition-colors">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                            <Wallet size={24} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{totalRevenue.toLocaleString()} ₺</div>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Toplam Kazanç</div>
                    </Card>
                    <Card className="p-6 flex flex-col items-center text-center hover:border-indigo-200 transition-colors">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
                            <CheckCircle size={24} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{completedCount}</div>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tamamlanan</div>
                    </Card>
                    <Card className="p-6 flex flex-col items-center text-center hover:border-indigo-200 transition-colors">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3">
                            <Award size={24} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">4.9</div>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Puan</div>
                    </Card>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4">Yaklaşan Randevular ({upcomingCount})</h3>
                <Card className="overflow-hidden p-0">
                    {upcomingCount > 0 ? (
                        <div className="divide-y divide-slate-100">
                             {staffAppointments
                                .filter(a => a.status === 'confirmed')
                                .slice(0, 5)
                                .map(apt => (
                                    <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center text-xs font-bold border border-indigo-100">
                                                <span>{format(parseISO(apt.date), 'dd')}</span>
                                                <span className="uppercase">{format(parseISO(apt.date), 'MMM', {locale: tr})}</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{getCustomerName(apt.customerId)}</div>
                                                <div className="text-sm text-slate-500">{getServiceName(apt.serviceIds)}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono font-bold text-slate-900">{apt.startTime}</div>
                                            <div className="text-xs text-slate-400">{apt.totalPrice} ₺</div>
                                        </div>
                                    </div>
                                ))
                             }
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            Yaklaşan randevu bulunmuyor.
                        </div>
                    )}
                </Card>
             </div>
           )}

           {/* RANDEVULAR TAB */}
           {activeTab === "Randevular" && (
             <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 text-left">Tarih</th>
                                <th className="px-6 py-4 text-left">Müşteri</th>
                                <th className="px-6 py-4 text-left">Hizmet</th>
                                <th className="px-6 py-4 text-left">Durum</th>
                                <th className="px-6 py-4 text-right">Tutar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {staffAppointments.length > 0 ? (
                                staffAppointments.sort((a,b) => b.id - a.id).map(apt => (
                                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-600">
                                            {format(parseISO(apt.date), 'd MMM yyyy', {locale: tr})} <br/>
                                            <span className="text-xs text-slate-400">{apt.startTime}</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{getCustomerName(apt.customerId)}</td>
                                        <td className="px-6 py-4 text-slate-600">{getServiceName(apt.serviceIds)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                apt.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {apt.status === 'confirmed' ? 'Onaylı' : 
                                                 apt.status === 'pending' ? 'Bekliyor' :
                                                 apt.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-900">{apt.totalPrice} ₺</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        Kayıtlı randevu bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
             </Card>
           )}

           {/* ÇALIŞMA SAATLERİ TAB */}
           {activeTab === "Çalışma Saatleri" && (
             <Card className="p-8 animate-in fade-in slide-in-from-bottom-2">
               <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-xl font-bold text-slate-900">Haftalık Program</h2>
                    <p className="text-slate-500 text-sm">Standart çalışma saatlerini düzenleyin.</p>
                 </div>
                 {isEditingHours ? (
                     <div className="flex gap-2">
                        <Button variant="outline" onClick={cancelEditHours} className="h-9 text-xs">İptal</Button>
                        <Button variant="black" onClick={saveEditHours} className="h-9 text-xs">Kaydet</Button>
                     </div>
                 ) : (
                     <Button variant="outline" onClick={startEditHours} className="h-9 text-xs">Düzenle</Button>
                 )}
               </div>
               
               <div className="space-y-1">
                 {isEditingHours 
                    ? editedHours.map((row, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 gap-4">
                             <div className="flex items-center gap-3 w-32 shrink-0">
                                <input 
                                    type="checkbox" 
                                    checked={row.isOpen} 
                                    onChange={(e) => handleHourChange(i, 'isOpen', e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className={`font-semibold ${row.isOpen ? 'text-slate-800' : 'text-slate-400'}`}>{row.day}</span>
                             </div>
                             
                             <div className="flex items-center gap-2 flex-1 justify-center">
                                 {row.isOpen ? (
                                     <>
                                        <TimePicker 
                                            value={row.startTime} 
                                            onChange={(val) => handleHourChange(i, 'startTime', val)}
                                            className="w-28"
                                        />
                                        <span className="text-slate-400">-</span>
                                        <TimePicker 
                                            value={row.endTime} 
                                            onChange={(val) => handleHourChange(i, 'endTime', val)}
                                            className="w-28"
                                        />
                                     </>
                                 ) : (
                                     <span className="text-slate-400 italic text-sm py-2">Çalışma Yok</span>
                                 )}
                             </div>
                        </div>
                    ))
                    : (selectedStaff.workingHours || []).map((row, i) => (
                       <div key={i} className="flex justify-between items-center p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                         <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${!row.isOpen ? 'bg-red-300' : 'bg-green-400'}`}></div>
                            <span className="font-semibold text-slate-800 w-24">{row.day}</span>
                         </div>
                         <span className={`flex-1 text-center font-mono ${!row.isOpen ? 'text-slate-400' : 'text-slate-700'}`}>
                             {row.isOpen ? `${row.startTime} - ${row.endTime}` : 'Çalışmıyor'}
                         </span>
                         <span className="text-slate-400 text-sm w-12 text-right">
                             {row.isOpen ? calculateDuration(row.startTime, row.endTime) : ''}
                         </span>
                       </div>
                   ))
                 }
               </div>
             </Card>
           )}

           {/* İZİNLER TAB */}
           {activeTab === "İzinler" && (
               <Card className="p-8 animate-in fade-in slide-in-from-bottom-2 text-center">
                   <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                       <CalendarCheck size={32} />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mb-2">İzin Kayıtları</h3>
                   <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                       Personelin yıllık izin, rapor ve diğer izin durumlarını buradan yönetebilirsiniz.
                   </p>
                   
                   {staffLeaves.length > 0 ? (
                       <div className="border border-slate-100 rounded-xl overflow-hidden mb-6 text-left">
                           <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase flex justify-between">
                               <span>Tarih Aralığı</span>
                               <span>Tür / İşlem</span>
                           </div>
                           {staffLeaves.map(leave => (
                               <div key={leave.id} className="p-4 flex justify-between items-center hover:bg-slate-50 border-b border-slate-50 last:border-0 group">
                                   <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                       <div className="flex items-center gap-2 text-slate-700 font-medium">
                                            <Calendar size={16} className="text-slate-400"/>
                                            {format(parseISO(leave.startDate), 'd MMM yyyy', {locale: tr})} 
                                            <span className="text-slate-400 text-sm mx-1">-</span> 
                                            {format(parseISO(leave.endDate), 'd MMM yyyy', {locale: tr})}
                                       </div>
                                       {leave.description && <span className="text-xs text-slate-400 italic hidden sm:inline">({leave.description})</span>}
                                   </div>
                                   <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getLeaveColor(leave.type)}`}>
                                            {leave.type}
                                        </span>
                                        <button 
                                            onClick={() => deleteLeave(leave.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                            title="İzni Sil"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                   </div>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="p-4 text-slate-400 text-sm mb-6 bg-slate-50 rounded-xl">
                           Kayıtlı izin bulunmuyor.
                       </div>
                   )}

                   <Button variant="black" onClick={() => setIsLeaveModalOpen(true)}>Yeni İzin Ekle</Button>
               </Card>
           )}
        </div>
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