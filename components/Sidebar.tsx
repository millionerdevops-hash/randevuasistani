import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  LayoutDashboard, 
  ListOrdered, 
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
  Layers, 
  NotebookPen, 
  Menu, 
  X 
} from 'lucide-react';
import { Button } from './ui/LayoutComponents';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { logout, isSidebarExpanded, toggleSidebar, isMobileMenuOpen, closeMobileMenu } = useStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Özet', path: '/' },
    { icon: CalendarDays, label: 'Randevu Takvimi', path: '/calendar' },
    { icon: CalendarCheck2, label: 'Randevular', path: '/appointments' },
    { icon: Layers, label: 'Seans Takibi', path: '/sessions' }, 
    { icon: NotebookPen, label: 'Ajanda', path: '/agenda' }, 
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

  const handleNavigation = (path: string) => {
    navigate(path);
    closeMobileMenu(); 
  };

  const isExpanded = isSidebarExpanded || isMobileMenuOpen;

  return (
    <>
      {/* Mobile Backdrop - Increased Z-Index */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] md:hidden animate-in fade-in"
            onClick={closeMobileMenu}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 bg-black text-slate-400 flex flex-col transition-all duration-300 ease-in-out z-[100]
          ${isSidebarExpanded ? 'w-64' : 'w-20'}
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'} 
        `}
      >
        {/* Logo Area */}
        <div className={`h-20 flex items-center shrink-0 transition-all duration-300 ${isExpanded ? 'px-6 justify-between' : 'justify-center'}`}>
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-black font-extrabold text-xl shrink-0">
                    r.
                </div>
                <span 
                    className={`font-bold text-white text-lg tracking-tight whitespace-nowrap transition-opacity duration-300 ${
                    isExpanded ? 'opacity-100' : 'opacity-0 hidden'
                    }`}
                >
                    randevumvar
                </span>
            </div>
            
            {/* Mobile Close Button */}
            <button onClick={closeMobileMenu} className="md:hidden text-slate-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 flex flex-col gap-2 w-full overflow-y-auto no-scrollbar ${!isExpanded ? 'px-2 items-center' : 'px-4'}`}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 h-11 rounded-xl transition-all duration-200 group overflow-hidden shrink-0 ${
                  isExpanded ? 'px-3 w-full' : 'justify-center w-11'
                } ${
                  isActive 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-slate-500 hover:text-white hover:bg-white/10'
                }`
              }
              title={!isExpanded ? item.label : ''}
            >
              <item.icon size={20} strokeWidth={2} className="shrink-0" />
              <span 
                className={`font-medium whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className={`mt-auto mb-6 flex flex-col gap-2 w-full ${!isExpanded ? 'items-center px-2' : 'px-4'}`}>
          
          <button 
            onClick={() => handleNavigation('/settings')}
            className={`flex items-center gap-3 h-11 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-colors overflow-hidden shrink-0 ${
                isExpanded ? 'px-3 w-full' : 'justify-center w-11'
            }`}
            title="Ayarlar"
          >
            <Settings size={20} className="shrink-0" />
            <span 
                className={`font-medium whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none'
                }`}
            >
                Ayarlar
            </span>
          </button>

          <button 
            onClick={handleLogoutClick}
            className={`flex items-center gap-3 h-11 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors overflow-hidden shrink-0 ${
                isExpanded ? 'px-3 w-full' : 'justify-center w-11'
            }`}
            title="Çıkış Yap"
          >
            <LogOut size={20} className="shrink-0" />
            <span 
                className={`font-medium whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute pointer-events-none'
                }`}
            >
                Çıkış Yap
            </span>
          </button>

          {/* Desktop Toggle */}
          <div className={`hidden md:flex pt-4 mt-2 border-t border-white/10 w-full ${isSidebarExpanded ? 'justify-end' : 'justify-center'}`}>
            <button 
                onClick={toggleSidebar}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-white hover:bg-white/10 transition-all"
            >
                 {isSidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Modal - Increased Z-Index */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-0">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowLogoutConfirm(false)}
          />
          
          {/* Modal Content */}
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[320px] sm:max-w-sm p-6 sm:p-8 animate-in zoom-in-95 duration-200 border border-slate-100 relative z-10 mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 ring-8 ring-red-50/50">
                <LogOut size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Çıkış Yapılıyor</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed px-2">
                Hesabınızdan çıkış yapmak üzeresiniz. Devam etmek istediğinize emin misiniz?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button 
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition-transform" 
                    onClick={() => setShowLogoutConfirm(false)}
                >
                    Vazgeç
                </Button>
                <Button 
                    variant="danger" 
                    className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 active:scale-95 transition-transform" 
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
  const { toggleMobileMenu } = useStore();
  
  return (
    <div className="md:hidden bg-black text-white px-4 h-16 flex items-center justify-between sticky top-0 z-40 shadow-md">
      <div className="flex items-center gap-3">
        <button 
            onClick={toggleMobileMenu}
            className="p-2 -ml-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
        >
            <Menu size={24} />
        </button>
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center font-bold text-black text-sm">r.</div>
            <span className="font-bold text-lg tracking-tight">{title}</span>
        </div>
      </div>
    </div>
  )
}