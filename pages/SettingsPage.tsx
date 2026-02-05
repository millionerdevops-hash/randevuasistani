import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/ui/LayoutComponents';
import { Link, Bell, Shield, Smartphone, Globe, Copy, Check, ChevronRight } from 'lucide-react';

export const SettingsPage = () => {
  const [copied, setCopied] = useState(false);
  const [onlineBookingEnabled, setOnlineBookingEnabled] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText("randevumvar.com/salon-guzellik");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      {/* Standardized Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Ayarlar</h1>
           <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span>Ana Sayfa</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium">Ayarlar</span>
           </div>
        </div>
      </div>

      {/* Online Booking Section */}
      <Card className="p-8">
         <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
               <Globe size={24} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-slate-900">Online Rezervasyon Linki</h2>
               <p className="text-slate-500">Müşterilerinizin Instagram veya Google üzerinden randevu almasını sağlayan link.</p>
            </div>
         </div>

         <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div className="flex-1 w-full">
               <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">İşletme Linkiniz</label>
               <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-mono text-sm">
                  <span className="text-slate-400">https://</span>
                  <span>randevumvar.com/salon-guzellik</span>
               </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <Button onClick={handleCopy} variant="outline" className="flex-1 md:flex-none">
                  {copied ? <Check size={16} className="mr-2 text-green-600"/> : <Copy size={16} className="mr-2"/>}
                  {copied ? "Kopyalandı" : "Kopyala"}
               </Button>
               <Button onClick={() => window.open('#', '_blank')} variant="black" className="flex-1 md:flex-none">
                  Sayfayı Gör
               </Button>
            </div>
         </div>

         <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
            <div>
               <div className="font-semibold text-slate-800">Online Randevu Alımı</div>
               <div className="text-sm text-slate-500">Aktif olduğunda link üzerinden randevu kabul edilir.</div>
            </div>
            <button 
               onClick={() => setOnlineBookingEnabled(!onlineBookingEnabled)}
               className={`w-12 h-6 rounded-full transition-colors relative ${onlineBookingEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
            >
               <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${onlineBookingEnabled ? 'left-7' : 'left-1'}`}></div>
            </button>
         </div>
      </Card>

      {/* Notifications Section */}
      <Card className="p-8">
         <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
               <Bell size={24} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-slate-900">Otomatik Hatırlatmalar</h2>
               <p className="text-slate-500">No-show oranını düşürmek için müşterilere otomatik mesajlar gönderin.</p>
            </div>
         </div>

         <div className="space-y-4">
            {[
               { title: "Randevu Onayı", desc: "Randevu oluşturulduğunda SMS gönder.", default: true },
               { title: "24 Saat Önce Hatırlatma", desc: "Randevudan 1 gün önce hatırlatma gönder.", default: true },
               { title: "2 Saat Önce Hatırlatma", desc: "Randevu saatine yakın son hatırlatma.", default: false },
               { title: "Teşekkür Mesajı", desc: "Randevu tamamlandıktan sonra anket gönder.", default: false }
            ].map((item, i) => (
               <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                        <Smartphone size={18} />
                     </div>
                     <div>
                        <div className="font-semibold text-slate-800">{item.title}</div>
                        <div className="text-xs text-slate-500">{item.desc}</div>
                     </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative cursor-pointer ${item.default ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                     <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${item.default ? 'left-5.5' : 'left-0.5'}`}></div>
                  </div>
               </div>
            ))}
         </div>
      </Card>

      {/* Security Mock */}
      <Card className="p-8">
         <div className="flex items-center gap-4 text-slate-400">
            <Shield size={20} />
            <span className="text-sm">Verileriniz 256-bit SSL sertifikası ile korunmaktadır ve günlük olarak yedeklenir.</span>
         </div>
      </Card>
    </div>
  );
};