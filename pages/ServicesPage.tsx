import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button } from '../components/ui/LayoutComponents';
import { Plus, MoreVertical, Pencil, Trash2, ChevronRight } from 'lucide-react';
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

  return (
    <div 
      className="flex flex-col h-full relative space-y-6 animate-in fade-in" 
      onClick={() => setOpenMenuId(null)} // Sayfada herhangi bir yere tıklayınca menüyü kapat
    >
      {/* Standardized Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Hizmetler</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Hizmetler</span>
           </div>
        </div>
        <Button variant="black" onClick={handleAdd}>
          Ekle <Plus size={16} className="ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
        
        {/* Left Sidebar - Categories */}
        {/* Mobile: Horizontal Scroll List / Desktop: Vertical Card List */}
        <div className="lg:col-span-1 lg:bg-white lg:border lg:border-slate-100 lg:shadow-sm lg:rounded-2xl lg:p-4 sticky top-0 z-10 lg:static -mx-4 px-4 lg:mx-0 lg:px-0 bg-slate-50/95 backdrop-blur-sm lg:bg-transparent py-2 lg:py-0">
          <h3 className="font-bold text-lg mb-4 px-2 hidden lg:block text-slate-900">Kategoriler</h3>
          
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
            {/* Tüm Kategoriler Butonu */}
            <button
              onClick={() => setSelectedCategory("Tüm kategoriler")}
              className={`
                shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 rounded-full lg:rounded-xl text-sm font-medium transition-all border lg:border-0
                ${selectedCategory === "Tüm kategoriler" 
                  ? 'bg-black text-white border-black lg:bg-slate-100 lg:text-slate-900 shadow-md lg:shadow-none' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 lg:hover:bg-slate-50'
                }
              `}
            >
              <span>Tüm kategoriler</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                selectedCategory === "Tüm kategoriler" 
                  ? 'bg-white text-black lg:bg-black lg:text-white' 
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
                   shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 rounded-full lg:rounded-xl text-sm font-medium transition-all border lg:border-0
                   ${selectedCategory === cat 
                     ? 'bg-black text-white border-black lg:bg-slate-100 lg:text-slate-900 shadow-md lg:shadow-none' 
                     : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 lg:hover:bg-slate-50'
                   }
                `}
              >
                <span>{cat}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                   selectedCategory === cat 
                     ? 'bg-white text-black lg:bg-black lg:text-white' 
                     : 'bg-slate-100 text-slate-500'
                }`}>
                  {categoryCounts[cat]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - Service List */}
        <div className="lg:col-span-3 space-y-6">
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
                <div key={service.id} className="bg-white rounded-xl border border-slate-200 p-0 flex flex-col sm:flex-row items-center overflow-hidden hover:shadow-md transition-shadow relative group">
                  {/* Color Strip */}
                  <div className="w-full sm:w-1.5 h-1.5 sm:h-auto shrink-0" style={{ backgroundColor: service.color }}></div>
                  
                  <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-900 text-base sm:text-lg">{service.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{service.category}</span>
                                <span className="text-slate-400 text-xs">•</span>
                                <span className="text-slate-500 text-sm">{service.duration} dk</span>
                            </div>
                          </div>
                          {/* Mobile Price (Shown at top right on mobile) */}
                          <div className="sm:hidden font-bold text-slate-900 text-lg">
                            {service.price}₺
                          </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:relative pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-50 mt-2 sm:mt-0">
                      {/* Desktop Price */}
                      <div className="hidden sm:block font-bold text-slate-900 text-lg w-20 text-right">
                        {service.price}₺
                      </div>
                      
                      {/* Action Menu - Mobile Friendly Position */}
                      <div className="relative ml-auto sm:ml-0">
                        <button 
                          onClick={(e) => toggleMenu(e, service.id)}
                          className={`p-2 rounded-lg transition-colors ${openMenuId === service.id ? 'bg-slate-100 text-black' : 'text-slate-400 hover:text-black hover:bg-slate-100'}`}
                        >
                           <MoreVertical size={20} />
                        </button>

                        {/* Dropdown Popover */}
                        {openMenuId === service.id && (
                          <div className="absolute right-0 bottom-full sm:bottom-auto sm:top-full mb-2 sm:mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <button 
                              onClick={(e) => handleEdit(e, service)}
                              className="w-full flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 text-left transition-colors"
                            >
                              <Pencil size={16} className="mr-2" /> Düzenle
                            </button>
                            <div className="h-[1px] bg-slate-100 w-full"></div>
                            <button 
                              onClick={(e) => handleDelete(e, service.id)}
                              className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
                            >
                              <Trash2 size={16} className="mr-2" /> Sil
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ServiceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingService={editingService}
      />
    </div>
  );
};