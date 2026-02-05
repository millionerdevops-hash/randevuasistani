import React, { useState, useEffect } from 'react';
import { X, Tag, Clock, Banknote, Palette } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button, Input, Select } from './ui/LayoutComponents';
import { Service } from '../types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingService?: Service | null;
}

const COLORS = [
  "#FF7676", // Red
  "#FFD966", // Yellow
  "#6B9B37", // Green
  "#5B9BD5", // Blue
  "#A67BC6", // Purple
  "#FF9F40", // Orange
  "#F472B6", // Pink
  "#94A3B8", // Slate
];

const PREDEFINED_CATEGORIES = [
  "Saç",
  "Makyaj",
  "Tırnak",
  "Cilt",
  "Masaj",
  "Epilasyon",
  "Diğer"
];

export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, editingService }) => {
  const { addService, updateService } = useStore();
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Saç");
  const [duration, setDuration] = useState("60");
  const [price, setPrice] = useState("0");
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (editingService) {
      setName(editingService.name);
      setCategory(editingService.category);
      setDuration(editingService.duration.toString());
      setPrice(editingService.price.toString());
      setColor(editingService.color);
    } else {
      // Reset defaults for new service
      setName("");
      setCategory("Saç");
      setDuration("60");
      setPrice("0");
      setColor(COLORS[0]);
    }
  }, [editingService, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData = {
      name,
      category,
      duration: parseInt(duration) || 0,
      price: parseInt(price) || 0,
      color,
    };

    if (editingService) {
      updateService(editingService.id, serviceData);
    } else {
      addService(serviceData);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-visible">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">
            {editingService ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Hizmet Adı */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Tag size={16} /> Hizmet Adı
            </label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Saç Kesimi"
              required
            />
          </div>

          {/* Kategori */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Tag size={16} /> Kategori
            </label>
            <Select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              {PREDEFINED_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Süre */}
             <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Clock size={16} /> Süre (dk)
                </label>
                <Input 
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="5"
                  step="5"
                  required
                />
             </div>

             {/* Fiyat */}
             <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Banknote size={16} /> Fiyat (₺)
                </label>
                <Input 
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  required
                />
             </div>
          </div>

          {/* Renk Seçimi */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Palette size={16} /> Renk Etiketi
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? 'border-black scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <Button variant="outline" className="flex-1" onClick={onClose}>İptal</Button>
             <Button type="submit" variant="primary" className="flex-1">Kaydet</Button>
          </div>

        </form>
      </div>
    </div>
  );
};