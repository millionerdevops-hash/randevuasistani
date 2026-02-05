import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/ui/LayoutComponents';
import { Link, Bell, Shield, Smartphone, Globe, Copy, Check, ChevronRight, MessageSquare } from 'lucide-react';

export const SettingsPage = () => {
  const [copied, setCopied] = useState(false);
  const [onlineBookingEnabled, setOnlineBookingEnabled] = useState(true);

  // State for toggles (mocking data persistence for now)
  const [notifications, setNotifications] = useState([
     { id: 1, title: "Randevu Onayı", desc: "Randevu oluşturulduğunda SMS gönder.", enabled: true },
     { id: 2, title: "24 Saat Önce Hatırlatma", desc: "Randevudan 1 gün önce hatırlatma gönder.", enabled: true },
     { id: 3, title: "2 Saat Önce Hatırlatma", desc: "Randevu saatine yakın son hatırlatma.", enabled: false },
     { id: 4, title: "Teşekkür Mesajı", desc: "Randevu tamamlandıktan sonra anket gönder.", enabled: false }
  ]);

  const toggleNotification = (id: number) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("https://randevumvar.com/salon-guzellik");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in pb-20">
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
      <Card className="overflow-hidden p-0">
         <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Globe size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Online Rezervasyon</h2>
                    <p className="text-sm text-slate-500">Müşterilerin web üzerinden randevu almasını sağla.</p>
                </div>
            </div>
         </div>
         
         <div className="p-6 md:p-8 space-y-6">
            {/* Link Input Area */}
            <div className="space-y-3">
               <label className="text-sm font-semibold text-slate-700">İşletme Linkiniz</label>
               <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-mono text-sm flex items-center truncate">
                      <span className="text-slate-400 select-none mr-1">https://</span>
                      <span className="truncate">randevumvar.com/salon-guzellik</span>
                  </div>
                  <Button onClick={handleCopy} variant="outline" className="shrink-0 active:scale-95 transition-transform">
                      {copied ? <Check size={16} className="mr-2 text-green-600"/> : <Copy size={16} className="mr-2"/>}
                      {copied ? "Kopyalandı" : "Kopyala"}
                  </Button>
               </div>
               <p className="text-xs text-slate-400">Bu linki Instagram biyografinize ekleyebilirsiniz.</p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="pr-4">
                    <div className="font-semibold text-slate-800 text-sm">Randevu Alımını Kapat/Aç</div>
                    <div className="text-xs text-slate-500 mt-0.5">Pasif yapıldığında link üzerinden yeni randevu alınamaz.</div>
                </div>
                <button 
                onClick={() => setOnlineBookingEnabled(!onlineBookingEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${onlineBookingEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${onlineBookingEnabled ? 'left-6' : 'left-1'}`}></div>
                </button>
            </div>
         </div>
      </Card>

      {/* Notifications Section */}
      <Card className="overflow-hidden p-0">
         <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <MessageSquare size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Otomatik Mesajlar</h2>
                    <p className="text-sm text-slate-500">Müşterilere giden SMS ve bildirim ayarları.</p>
                </div>
            </div>
         </div>

         <div className="divide-y divide-slate-50">
            {notifications.map((item) => (
               <div key={item.id} className="flex items-center justify-between p-4 md:px-8 md:py-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3 md:gap-4 pr-4">
                     <div className="mt-1 text-slate-400 hidden sm:block">
                        <Smartphone size={18} />
                     </div>
                     <div>
                        <div className="font-semibold text-slate-800 text-sm md:text-base">{item.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                     </div>
                  </div>
                  <button 
                     onClick={() => toggleNotification(item.id)}
                     className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${item.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                     <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${item.enabled ? 'left-6' : 'left-1'}`}></div>
                  </button>
               </div>
            ))}
         </div>
      </Card>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-2 text-slate-400 text-xs py-4">
          <Shield size={12} />
          <span>Verileriniz 256-bit SSL ile korunmaktadır.</span>
      </div>
    </div>
  );
};