import React, { useState, useEffect } from 'react';
import { X, Calendar, Edit2, Save, Phone, Mail, User, Check } from 'lucide-react';
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
  const { appointments, updateCustomer, services, staff } = useStore();
  
  // Profile Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});

  // Notes State
  const [notes, setNotes] = useState("");
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  useEffect(() => {
    if (customer) {
      setNotes(customer.notes || "");
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

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
    
    // Show success message for 1 second then close
    setTimeout(() => {
      setIsNoteSaved(false);
      onClose();
    }, 1000);
  };

  const getServiceName = (ids: number[]) => ids.map(id => services.find(s => s.id === id)?.name).join(', ');
  const getStaffName = (id: number) => staff.find(s => s.id === id)?.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Sidebar: Profile Info */}
        <div className="md:w-1/3 bg-slate-50 p-8 border-r border-slate-100 flex flex-col items-center text-center">
          <img 
            src={`https://i.pravatar.cc/300?img=${customer.id}`} 
            alt={customer.name} 
            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm mb-4"
          />
          
          {isEditing ? (
            <div className="w-full space-y-3">
              <Input 
                value={editForm.name} 
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                placeholder="Ad Soyad"
              />
              <PhoneInput 
                value={editForm.phone || ''} 
                onChange={(val) => setEditForm({...editForm, phone: val})}
              />
              <Input 
                value={editForm.email} 
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                placeholder="Email"
              />
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900">{customer.name}</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-600 w-full">
                <div className="flex items-center justify-center gap-2">
                  <Phone size={14} /> {formatPhoneNumber(customer.phone)}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Mail size={14} /> {customer.email}
                </div>
              </div>
            </>
          )}

          <div className="mt-6 w-full pt-6 border-t border-slate-200">
            <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Toplam Harcama</div>
            <div className="text-2xl font-bold text-indigo-600">{customer.totalSpent} ₺</div>
          </div>
          
          <div className="mt-auto pt-6 w-full">
             <Button onClick={handleEditToggle} variant={isEditing ? 'primary' : 'outline'} className="w-full">
               {isEditing ? <><Save size={16} className="mr-2"/> Kaydet</> : <><Edit2 size={16} className="mr-2"/> Düzenle</>}
             </Button>
          </div>
        </div>

        {/* Right Content: History & Notes */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Randevu Geçmişi</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {customerHistory.length === 0 ? (
              <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                Henüz randevu geçmişi yok.
              </div>
            ) : (
              customerHistory.map(apt => (
                <div key={apt.id} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-slate-800">{getServiceName(apt.serviceIds)}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <Calendar size={14} /> 
                        {format(parseISO(apt.date), 'd MMMM yyyy', { locale: tr })} • {apt.startTime}
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                         apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                         apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                         apt.status === 'completed' ? 'bg-indigo-100 text-indigo-700' :
                         'bg-red-100 text-red-700'
                       }`}>
                         {apt.status === 'confirmed' ? 'Onaylı' : 
                          apt.status === 'pending' ? 'Bekliyor' :
                          apt.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                       </span>
                       <div className="mt-1 font-bold text-slate-900">{apt.totalPrice}₺</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 border-t border-slate-100 pt-2 mt-2 flex justify-between">
                     <span>Uzman: {getStaffName(apt.staffId)}</span>
                     {apt.notes && <span className="italic">"{apt.notes}"</span>}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Müşteri Notları</h3>
            <div className="relative">
              <textarea 
                className="w-full h-24 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Müşteri tercihleri, alerjiler veya özel notlar..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
            <div className="text-right mt-2">
              <Button 
                onClick={handleUpdateNote} 
                variant="black" 
                className={`px-4 py-1.5 text-xs transition-all ${isNoteSaved ? 'bg-green-600 border-green-600' : ''}`}
              >
                {isNoteSaved ? <><Check size={14} className="mr-1"/> Güncellendi</> : "Notu Güncelle"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};