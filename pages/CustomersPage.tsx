import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, Input, PhoneInput, formatPhoneNumber } from '../components/ui/LayoutComponents';
import { Search, UserPlus, Phone, Mail, Trash2, ChevronRight, Plus } from 'lucide-react';
import { CustomerModal } from '../components/CustomerModal';
import { Customer } from '../types';

export const CustomersPage = () => {
  const { customers, deleteCustomer } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State: We use the same modal for Adding (null) and Viewing (object)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleOpenAddModal = () => {
    setSelectedCustomer(null); // Null means "Create Mode"
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (customer: Customer) => {
    setSelectedCustomer(customer); // Object means "View/Edit Mode"
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in pb-20 md:pb-0">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white md:bg-transparent p-4 md:p-0 -mx-4 md:mx-0 border-b md:border-0 border-slate-100 sticky top-0 md:static z-20">
        <div className="hidden md:block">
           <h1 className="text-2xl font-bold text-slate-900">Müşteriler</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Müşteriler</span>
           </div>
        </div>
        
        {/* Mobile & Desktop Actions */}
        <div className="flex gap-2 w-full sm:w-auto items-center">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <Input 
              placeholder="İsim veya telefon ara..." 
              className="pl-10 bg-white h-11" // Sabit yükseklik
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenAddModal} className="h-11 px-5 flex items-center shrink-0">
            <UserPlus size={18} className="mr-2" /> Yeni
          </Button>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-4 md:px-0">
        {filteredCustomers.map(customer => (
          <Card 
            key={customer.id} 
            className="p-4 md:p-6 hover:shadow-md transition-all group relative cursor-pointer hover:border-indigo-200"
            onClick={() => handleOpenViewModal(customer)}
          >
            {/* Header: Avatar, Name, ID, Delete */}
            <div className="flex items-start gap-3 md:gap-4">
               <img 
                   src={`https://i.pravatar.cc/150?img=${customer.id}`} 
                   alt={customer.name}
                   className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border border-slate-100 shrink-0"
               />
               <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm md:text-base truncate pr-2">{customer.name}</h3>
                        <p className="text-[10px] text-slate-400 font-mono">ID: #{customer.id}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteCustomer(customer.id); }}
                        className="text-slate-300 hover:text-red-500 p-1 -mt-1 -mr-1"
                      >
                        <Trash2 size={16} />
                      </button>
                  </div>

                  {/* Contact Info - Compact List */}
                  <div className="mt-1.5 space-y-1">
                      <div className="flex items-center text-xs text-slate-600">
                        <Phone size={12} className="mr-2 text-slate-400 shrink-0" />
                        {formatPhoneNumber(customer.phone)}
                      </div>
                      {customer.email && (
                        <div className="flex items-center text-xs text-slate-600 truncate">
                          <Mail size={12} className="mr-2 text-slate-400 shrink-0" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      )}
                  </div>
               </div>
            </div>

            {/* Footer: Total Spent */}
            <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Toplam Harcama</div>
              <div className="font-bold text-sm text-indigo-600">{customer.totalSpent} ₺</div>
            </div>
          </Card>
        ))}
      </div>

      <CustomerModal 
        isOpen={isModalOpen}
        customer={selectedCustomer}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};