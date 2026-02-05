import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, Input, PhoneInput, formatPhoneNumber } from '../components/ui/LayoutComponents';
import { Search, UserPlus, Phone, Mail, Trash2, ChevronRight } from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in">
      {/* Standardized Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Müşteriler</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Müşteriler</span>
           </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <Input 
              placeholder="İsim veya telefon ara..." 
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenAddModal}>
            <UserPlus size={18} className="mr-2" /> Yeni
          </Button>
        </div>
      </div>

      {/* Grid updated to 4 columns on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCustomers.map(customer => (
          <Card 
            key={customer.id} 
            className="p-6 hover:shadow-md transition-all group relative cursor-pointer hover:border-indigo-200"
            onClick={() => handleOpenViewModal(customer)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img 
                   src={`https://i.pravatar.cc/150?img=${customer.id}`} 
                   alt={customer.name}
                   className="h-12 w-12 rounded-full object-cover border border-slate-100"
                />
                <div>
                  <h3 className="font-bold text-slate-800">{customer.name}</h3>
                  <p className="text-xs text-slate-500">ID: #{customer.id}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteCustomer(customer.id); }}
                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center text-sm text-slate-600">
                <Phone size={16} className="mr-3 text-slate-400" />
                {formatPhoneNumber(customer.phone)}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Mail size={16} className="mr-3 text-slate-400" />
                {customer.email}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
              <div className="text-xs font-semibold text-slate-500 uppercase">Toplam Harcama</div>
              <div className="font-bold text-indigo-600">{customer.totalSpent} ₺</div>
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