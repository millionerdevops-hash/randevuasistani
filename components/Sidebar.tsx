import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  LayoutDashboard, // Özet için
  ListOrdered, // Adisyonlar için
  CalendarDays, 
  Receipt, 
  Package, 
  Users, 
  BarChart2, 
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  CalendarCheck2,
  Layers, // Seans Takibi için
  NotebookPen // Ajanda için
} from 'lucide-react';
import { Button } from './ui/LayoutComponents';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { logout, isSidebarExpanded, toggleSidebar } = useStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Özet', path: '/' },
    { icon: CalendarDays, label: 'Randevu Takvimi', path: '/calendar' },
    { icon: CalendarCheck2, label: 'Randevular', path: '/appointments' },
    { icon: Layers, label: 'Seans Takibi', path: '/sessions' }, 
    { icon: NotebookPen, label: 'Ajanda', path: '/agenda' }, // Yeni Öğe
    { icon: ListOrdered, label: 'Adisyonlar', path: '/transactions' },
    { icon: Receipt, label: 'Müşteriler', path: '/customers' }, 
    { icon: Package, label: 'Hizmetler', path: '/services' },
    { icon: Users, label: 'Ekip', path: '/staff' },
    { icon: BarChart2, label: 'Raporlar', path: '/reports' },
  ];

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <aside 
        className={`fixed left-0 top-0 h-full bg-black text-slate-400 flex flex-col transition-all duration-300 ease-in-out z-50 hidden md:flex ${
          isSidebarExpanded ? 'w-64 px-4' : 'w-20 items-center'
        }`}
      >
        {/* Logo Area */}
        <div className={`mt-6 mb-10 flex items-center ${isSidebarExpanded ? 'justify-start px-2' : 'justify-center'}`}>
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-black font-extrabold text-xl shrink-0 transition-transform duration-300">
            r.
          </div>
          <span 
            className={`ml-3 font-bold text-white text-lg tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isSidebarExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'
            }`}
          >
            randevumvar
          </span>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 flex flex-col gap-4 w-full ${!isSidebarExpanded && 'px-4'}`}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 h-12 rounded-xl transition-all duration-200 group overflow-hidden ${
                  isSidebarExpanded ? 'px-3 w-full' : 'justify-center w-12'
                } ${
                  isActive 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-slate-500 hover:text-white hover:bg-white/10'
                }`
              }
              title={!isSidebarExpanded ? item.label : ''}
            >
              <item.icon size={22} strokeWidth={2} className="shrink-0" />
              <span 
                className={`font-medium whitespace-nowrap transition-all duration-300 ${
                  isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Settings / Footer */}
        <div className={`mt-auto mb-6 flex flex-col gap-2 w-full ${!isSidebarExpanded && 'px-4 items-center'}`}>
          
          <button 
            onClick={() => navigate('/settings')}
            className={`flex items-center gap-3 h-12 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-colors overflow-hidden ${
                isSidebarExpanded ? 'px-3 w-full' : 'justify-center w-12'
            }`}
            title="Ayarlar"
          >
            <Settings size={22} className="shrink-0" />
            <span 
                className={`font-medium whitespace-nowrap transition-all duration-300 ${
                  isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none'
                }`}
            >
                Ayarlar
            </span>
          </button>

          <button 
            onClick={handleLogoutClick}
            className={`flex items-center gap-3 h-12 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors overflow-hidden ${
                isSidebarExpanded ? 'px-3 w-full' : 'justify-center w-12'
            }`}
            title="Çıkış Yap"
          >
            <LogOut size={22} className="shrink-0" />
            <span 
                className={`font-medium whitespace-nowrap transition-all duration-300 ${
                  isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none'
                }`}
            >
                Çıkış Yap
            </span>
          </button>

          {/* Expand/Collapse Toggle */}
          <div className={`pt-4 mt-2 border-t border-white/10 w-full flex ${isSidebarExpanded ? 'justify-end' : 'justify-center'}`}>
            <button 
                onClick={toggleSidebar}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-white hover:bg-white/10 transition-all"
            >
                 {isSidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50">
                <LogOut size={28} strokeWidth={2.5} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">Çıkış Yapılıyor</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed px-4">
                Hesabınızdan çıkış yapmak üzeresiniz. Devam etmek istediğinize emin misiniz?
              </p>
              
              <div className="flex gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1 h-11 border-slate-200 hover:bg-slate-50 text-slate-700" 
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Vazgeç
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-1 h-11 bg-red-600 hover:bg-red-700 shadow-red-200 shadow-lg" 
                  onClick={confirmLogout}
                >
                  Çıkış Yap
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const MobileHeader = ({ title }: { title: string }) => {
  return (
    <div className="md:hidden bg-black text-white p-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center font-bold text-black">r.</div>
        <span className="font-bold text-lg">{title}</span>
      </div>
    </div>
  )
}
