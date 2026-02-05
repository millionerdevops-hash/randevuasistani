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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Sidebar - Categories */}
        <Card className="p-4 lg:col-span-1">
          <h3 className="font-bold text-lg mb-4 px-2">Kategoriler</h3>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory("Tüm kategoriler")}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                selectedCategory === "Tüm kategoriler" 
                  ? 'bg-slate-100 text-black' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Tüm kategoriler</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedCategory === "Tüm kategoriler" ? 'bg-black text-white' : 'bg-slate-200 text-slate-600'}`}>
                {services.length}
              </span>
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-slate-100 text-black' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{cat} Hizmetleri</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedCategory === cat ? 'bg-black text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {categoryCounts[cat]}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Right Content - Service List */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="font-bold text-xl text-slate-800 mb-4">{selectedCategory}</h2>
          
          <div className="space-y-4">
            {filteredServices.length === 0 ? (
               <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-xl text-slate-400">
                 Bu kategoride hizmet bulunmuyor.
               </div>
            ) : (
              filteredServices.map(service => (
                <Card key={service.id} className="p-0 flex flex-col sm:flex-row items-center overflow-visible hover:shadow-md transition-shadow relative">
                  <div className="w-2 sm:h-full sm:w-2 h-2 self-stretch" style={{ backgroundColor: service.color }}></div>
                  <div className="flex-1 p-6 flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg">{service.name}</h3>
                      <div className="text-slate-500 text-sm mt-1">{service.duration} dk</div>
                    </div>
                    
                    <div className="flex items-center gap-8 relative">
                      <div className="font-bold text-slate-900 text-lg w-20 text-right">
                        {service.price}₺
                      </div>
                      
                      {/* Action Menu */}
                      <div className="relative">
                        <button 
                          onClick={(e) => toggleMenu(e, service.id)}
                          className={`p-2 rounded-lg transition-colors ${openMenuId === service.id ? 'bg-slate-100 text-black' : 'text-slate-400 hover:text-black hover:bg-slate-100'}`}
                        >
                           <MoreVertical size={20} />
                        </button>

                        {/* Dropdown Popover */}
                        {openMenuId === service.id && (
                          <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                </Card>
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