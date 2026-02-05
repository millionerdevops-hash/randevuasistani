import React, { useState } from 'react';
import { X, Calendar, FileText, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button, Input, Select, DatePicker } from './ui/LayoutComponents';
import { StaffLeave } from '../types';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: number;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({ isOpen, onClose, staffId }) => {
  const { addLeave } = useStore();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<StaffLeave['type']>('Yıllık İzin');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError("Lütfen tarih aralığını seçin.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        setError("Bitiş tarihi başlangıç tarihinden önce olamaz.");
        return;
    }

    addLeave({
      staffId,
      startDate,
      endDate,
      type,
      description
    });

    // Reset form
    setStartDate('');
    setEndDate('');
    setDescription('');
    setType('Yıllık İzin');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-visible">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">Yeni İzin Ekle</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Tarih Aralığı */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Calendar size={16} /> Başlangıç
              </label>
              <DatePicker 
                value={startDate}
                onChange={setStartDate}
                placeholder="Seçiniz"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Calendar size={16} /> Bitiş
              </label>
              <DatePicker 
                value={endDate}
                onChange={setEndDate}
                placeholder="Seçiniz"
              />
            </div>
          </div>

          {/* İzin Türü */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <FileText size={16} /> İzin Türü
            </label>
            <Select 
              value={type} 
              onChange={(e) => setType(e.target.value as any)}
              required
            >
              <option value="Yıllık İzin">Yıllık İzin</option>
              <option value="Rapor">Rapor</option>
              <option value="Ücretsiz İzin">Ücretsiz İzin</option>
              <option value="Diğer">Diğer</option>
            </Select>
          </div>

          {/* Açıklama */}
          <div>
            <label className="text-sm font-medium text-slate-700">Açıklama (Opsiyonel)</label>
            <textarea
              className="mt-1 flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="İzin nedeni..."
            />
          </div>

          <div className="pt-2 flex gap-3">
             <Button variant="outline" className="flex-1" onClick={onClose}>İptal</Button>
             <Button type="submit" variant="primary" className="flex-1">Kaydet</Button>
          </div>

        </form>
      </div>
    </div>
  );
};