import React, { useState, useEffect } from 'react';
import { X, Calendar, Edit2, Save, Phone, Mail, User, Check, UserPlus, Clock, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button, Input, PhoneInput, formatPhoneNumber } from './ui/LayoutComponents';
import { Customer } from '../types';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface CustomerModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({ customer, isOpen, onClose }) => {
  const { appointments, updateCustomer, addCustomer, services, staff } = useStore();
  
  // Profile Editing State (For Existing Customer)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});

  // Creation State (For New Customer)
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Notes State
  const [notes, setNotes] = useState("");
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
        if (customer) {
            // View Mode Init
            setNotes(customer.notes || "");
            setIsEditing(false);
            setEditForm({});
        } else {
            // Create Mode Init
            setNewName("");
            setNewPhone("");
            setNewEmail("");
        }
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  // --- MODE 1: CREATE NEW CUSTOMER ---
  if (!customer) {
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        addCustomer({
            name: newName,
            phone: newPhone,
            email: newEmail
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <UserPlus size={20} className="text-slate-500" />
                        Yeni Müşteri
                    </h2>
                    <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleCreate} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ad Soyad</label>
                        <Input 
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Örn: Ayşe Yılmaz"
                            className="h-11"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Telefon</label>
                        <PhoneInput 
                            value={newPhone}
                            onChange={(val) => setNewPhone(val)}
                            className="h-11"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">E-posta</label>
                        <Input 
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="ornek@email.com"
                            className="h-11"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1 h-11" onClick={onClose}>İptal</Button>
                        <Button type="submit" variant="black" className="flex-1 h-11">Kaydet</Button>
                    </div>
                </form>
            </div>
        </div>
    );
  }

  // --- MODE 2: VIEW/EDIT EXISTING CUSTOMER ---

  const customerHistory = appointments
    .filter(a => a.customerId === customer.id)
    .sort((a, b) => b.id - a.id); // Newest first

  const handleEditToggle = () => {
    if (isEditing) {
      // Save Profile
      updateCustomer(customer.id, editForm);
      setIsEditing(false);
    } else {
      setEditForm(customer);
      setIsEditing(true);
    }
  };

  const handleUpdateNote = () => {
    updateCustomer(customer.id, { notes: notes });
    setIsNoteSaved(true);
    setTimeout(() => {
      setIsNoteSaved(false);
    }, 1000);
  };

  const getServiceName = (ids: number[]) => ids.map(id => services.find(s => s.id === id)?.name).join(', ');
  const getStaffName = (id: number) => staff.find(s => s.id === id)?.name;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Container: Bottom Sheet on Mobile, Modal on Desktop */}
      <div className="bg-white w-full h-[90dvh] md:h-auto md:max-h-[85vh] md:max-w-5xl rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300">
        
        {/* Mobile Header (Sticky) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-100 bg-white shrink-0 sticky top-0 z-20">
            <h2 className="font-bold text-lg text-slate-800">Müşteri Detayı</h2>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500">
                <X size={20} />
            </button>
        </div>

        {/* LEFT SIDE: Profile Info */}
        <div className="w-full md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
          
          <div className="p-6 md:p-8 flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-0">
              {/* Avatar */}
              <img 
                src={`https://i.pravatar.cc/300?img=${customer.id}`} 
                alt={customer.name} 
                className="h-16 w-16 md:h-28 md:w-28 rounded-full object-cover border-4 border-white shadow-sm md:mb-4 shrink-0"
              />
              
              <div className="flex-1 md:w-full min-w-0">
                  {isEditing ? (
                    <div className="space-y-3 w-full animate-in fade-in">
                      <Input 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        placeholder="Ad Soyad"
                        className="h-10 text-sm"
                      />
                      <PhoneInput 
                        value={editForm.phone || ''} 
                        onChange={(val) => setEditForm({...editForm, phone: val})}
                        className="h-10 text-sm"
                      />
                      <Input 
                        value={editForm.email} 
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        placeholder="Email"
                        className="h-10 text-sm"
                      />
                    </div>
                  ) : (
                    <div className="text-left md:text-center">
                      <h2 className="text-lg md:text-xl font-bold text-slate-900 truncate">{customer.name}</h2>
                      <div className="mt-1 md:mt-3 space-y-1 text-xs md:text-sm text-slate-500">
                        <div className="flex items-center md:justify-center gap-2">
                          <Phone size={14} className="shrink-0"/> {formatPhoneNumber(customer.phone)}
                        </div>
                        {customer.email && (
                            <div className="flex items-center md:justify-center gap-2 truncate">
                            <Mail size={14} className="shrink-0"/> <span className="truncate">{customer.email}</span>
                            </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
          </div>

          <div className="px-6 md:px-8 pb-6 md:pb-8 mt-auto w-full space-y-4">
             {/* Total Spent Box */}
             <div className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 text-center shadow-sm">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Toplam Harcama</div>
                <div className="text-xl md:text-2xl font-bold text-indigo-600">{customer.totalSpent} ₺</div>
             </div>

             {/* Edit Button */}
             <Button onClick={handleEditToggle} variant={isEditing ? 'primary' : 'outline'} className="w-full h-10 text-xs md:text-sm shadow-sm">
               {isEditing ? <><Save size={16} className="mr-2"/> Değişiklikleri Kaydet</> : <><Edit2 size={16} className="mr-2"/> Profili Düzenle</>}
             </Button>
          </div>
        </div>

        {/* RIGHT CONTENT: History & Notes */}
        <div className="flex-1 flex flex-col h-full min-h-0 bg-white">
          
          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
            <h3 className="text-lg font-bold text-slate-800">Müşteri Detayları</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
             
             {/* Appointment History */}
             <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-slate-500" /> Randevu Geçmişi
                </h4>
                
                <div className="space-y-3">
                    {customerHistory.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-sm">
                        Henüz randevu geçmişi yok.
                    </div>
                    ) : (
                    customerHistory.map(apt => (
                        <div key={apt.id} className="border border-slate-100 rounded-xl p-3 md:p-4 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="font-bold text-slate-800 text-sm truncate">{getServiceName(apt.serviceIds)}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                                        <Calendar size={12} /> 
                                        {format(parseISO(apt.date), 'd MMM yyyy', { locale: tr })} • {apt.startTime}
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        apt.status === 'completed' ? 'bg-indigo-100 text-indigo-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {apt.status === 'confirmed' ? 'Onaylı' : 
                                        apt.status === 'pending' ? 'Bekliyor' :
                                        apt.status === 'completed' ? 'Bitti' : 'İptal'}
                                    </span>
                                    <div className="mt-1 font-bold text-slate-900 text-sm">{apt.totalPrice}₺</div>
                                </div>
                            </div>
                            {(apt.notes || getStaffName(apt.staffId)) && (
                                <div className="text-xs text-slate-500 border-t border-slate-50 pt-2 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                    {getStaffName(apt.staffId) && <span className="flex items-center gap-1"><User size={12}/> {getStaffName(apt.staffId)}</span>}
                                    {apt.notes && <span className="italic text-slate-400">"{apt.notes}"</span>}
                                </div>
                            )}
                        </div>
                    ))
                    )}
                </div>
             </div>

             {/* Notes Section */}
             <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Edit2 size={16} className="text-slate-500" /> Müşteri Notları
                </h4>
                <div className="bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <textarea 
                        className="w-full h-24 bg-transparent border-0 p-3 text-sm focus:ring-0 resize-none placeholder:text-slate-400 text-slate-700"
                        placeholder="Müşteri tercihleri, alerjiler veya özel notlar..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end px-2 pb-2">
                        <Button 
                            onClick={handleUpdateNote} 
                            variant="black" 
                            className={`h-8 px-3 text-xs transition-all ${isNoteSaved ? 'bg-green-600 border-green-600 hover:bg-green-700' : ''}`}
                        >
                            {isNoteSaved ? <><Check size={14} className="mr-1"/> Kaydedildi</> : "Notu Kaydet"}
                        </Button>
                    </div>
                </div>
             </div>
             
             {/* Bottom Spacer for mobile scroll */}
             <div className="h-6 md:hidden"></div>

          </div>
        </div>
      </div>
    </div>
  );
};