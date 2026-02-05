import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, CustomSelect } from '../components/ui/LayoutComponents';
import { Plus, MoreVertical, Pencil, Trash2, ChevronRight, Tag, MoreHorizontal } from 'lucide-react';
import { ServiceModal } from '../components/ServiceModal';
import { Service } from '../types';

export const ServicesPage = () => {
  const { services, deleteService } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("Tüm kategoriler");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Dropdown Menu State
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Get categories and counts
  const categories = Array.from(new Set(services.map((s) => s.category))) as string[];
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = services.filter(s => s.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const filteredServices = selectedCategory === "Tüm kategoriler" 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  const handleAdd = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, service: Service) => {
    e.stopPropagation();
    setEditingService(service);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Event'in yukarı bubbling yapmasını engelle
    if (window.confirm("Bu hizmeti silmek istediğinize emin misiniz?")) {
      deleteService(id);
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Prepare options for Mobile Dropdown
  const categoryOptions = [
    { value: "Tüm kategoriler", label: `Tüm kategoriler (${services.length})` },
    ...categories.map(cat => ({ value: cat, label: `${cat} (${categoryCounts[cat]})` }))
  ];

  return (
    <div 
      className="flex flex-col relative space-y-6 animate-in fade-in pb-20" 
      onClick={() => setOpenMenuId(null)} // Sayfada herhangi bir yere tıklayınca menüyü kapat
    >
      {/* Standardized Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="hidden md:block">
           <h1 className="text-2xl font-bold text-slate-900">Hizmetler</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Hizmetler</span>
           </div>
        </div>
        {/* Desktop Button */}
        <Button variant="black" onClick={handleAdd} className="hidden md:flex">
          Ekle <Plus size={16} className="ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
        
        {/* Mobile Dropdown Category Selector */}
        <div className="lg:hidden mb-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Kategori Filtrele</label>
            <CustomSelect 
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
                options={categoryOptions}
                icon={Tag}
                className="w-full"
            />
        </div>

        {/* Left Sidebar - Categories (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-1 lg:bg-white lg:border lg:border-slate-100 lg:shadow-sm lg:rounded-2xl lg:p-4 sticky top-0 z-10">
          <h3 className="font-bold text-lg mb-4 px-2 text-slate-900">Kategoriler</h3>
          
          <div className="flex flex-col gap-2">
            {/* Tüm Kategoriler Butonu */}
            <button
              onClick={() => setSelectedCategory("Tüm kategoriler")}
              className={`
                shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${selectedCategory === "Tüm kategoriler" 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'bg-white text-slate-600 hover:bg-slate-50'
                }
              `}
            >
              <span>Tüm kategoriler</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                selectedCategory === "Tüm kategoriler" 
                  ? 'bg-black text-white' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {services.length}
              </span>
            </button>

            {/* Kategori Listesi */}
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                   shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                   ${selectedCategory === cat 
                     ? 'bg-slate-100 text-slate-900' 
                     : 'bg-white text-slate-600 hover:bg-slate-50'
                   }
                `}
              >
                <span>{cat}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                   selectedCategory === cat 
                     ? 'bg-black text-white' 
                     : 'bg-slate-100 text-slate-500'
                }`}>
                  {categoryCounts[cat]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - Service List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="font-bold text-xl text-slate-800">{selectedCategory}</h2>
             <span className="text-sm text-slate-500 hidden sm:block">{filteredServices.length} hizmet listeleniyor</span>
          </div>
          
          <div className="space-y-3">
            {filteredServices.length === 0 ? (
               <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-xl text-slate-400">
                 Bu kategoride hizmet bulunmuyor.
               </div>
            ) : (
              filteredServices.map(service => (
                <div 
                    key={service.id} 
                    className={`bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md relative group flex min-h-[72px] ${openMenuId === service.id ? 'z-20' : ''}`}
                >
                    {/* Color Strip - Now a direct child, ensuring fixed width */}
                    <div className="w-1.5 shrink-0 rounded-l-xl" style={{ backgroundColor: service.color }}></div>
                    
                    {/* Content - Removed nested flexible wrappers that caused height issues */}
                    <div className="flex-1 p-3 flex items-center gap-3 min-w-0">
                        
                        {/* Info Section */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-900 text-sm truncate">{service.name}</h3>
                                {/* Category Badge */}
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100">
                                    {service.category}
                                </span>
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                                {service.duration} dk
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="font-bold text-slate-900 text-sm whitespace-nowrap">
                            {service.price}₺
                        </div>

                        {/* Menu Section */}
                        <div className="relative shrink-0">
                            <button 
                                onClick={(e) => toggleMenu(e, service.id)}
                                className={`p-1.5 rounded-lg transition-colors ${openMenuId === service.id ? 'bg-slate-100 text-black' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'}`}
                            >
                                <MoreVertical size={18} />
                            </button>

                            {/* Dropdown Popover */}
                            {openMenuId === service.id && (
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <button 
                                        onClick={(e) => handleEdit(e, service)}
                                        className="w-full flex items-center px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 text-left transition-colors"
                                    >
                                        <Pencil size={14} className="mr-2" /> Düzenle
                                    </button>
                                    <div className="h-[1px] bg-slate-50 w-full"></div>
                                    <button 
                                        onClick={(e) => handleDelete(e, service.id)}
                                        className="w-full flex items-center px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 text-left transition-colors"
                                    >
                                        <Trash2 size={14} className="mr-2" /> Sil
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <button 
        onClick={handleAdd}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-105 active:scale-95 transition-all"
        aria-label="Yeni Hizmet Ekle"
      >
        <Plus size={28} />
      </button>

      <ServiceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingService={editingService}
      />
    </div>
  );
};