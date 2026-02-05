import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Eye, EyeOff, Lock, Mail, Loader2, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const slides = [
  {
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1674&q=80",
    title: "Randevularını kolayca yönet, işini bir adım öne taşı.",
    desc: "Modern araçlarla işletmeni dijitalleştirin ve müşterilerinize kusursuz bir deneyim sunun."
  },
  {
    image: "https://images.unsplash.com/photo-1503951914875-befbb6470521?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    title: "Zamanını verimli kullan, gelirini artır.",
    desc: "Otomatik hatırlatmalar sayesinde randevu kaçırmaları azaltın, akıllı takvim ile boşlukları doldurun."
  },
  {
    image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1548&q=80",
    title: "Müşterilerin 7/24 randevu alabilsin.",
    desc: "Online rezervasyon sistemi ile siz uyurken bile işletmeniz randevu kabul etmeye devam etsin."
  }
];

export const LoginPage = () => {
  const { login, isAuthenticated } = useStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Auto-advance slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock network request
    setTimeout(() => {
      login();
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden">
      {/* Left Side - Form Area */}
      <div className="w-full lg:w-1/2 relative flex flex-col justify-center animate-in fade-in slide-in-from-left-4 duration-500">
        
        {/* Header/Logo - Absolute Positioned Top Left */}
        <div className="absolute top-8 left-8 sm:left-12 flex items-center gap-3 z-20">
          <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center font-bold text-white text-lg">
            r.
          </div>
          <span className="font-bold text-xl tracking-tight text-black">randevumvar</span>
          <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
          <span className="text-slate-500 font-medium text-sm">Partner</span>
        </div>

        {/* Form Container - Centered */}
        <div className="w-full max-w-md mx-auto px-8 sm:px-0">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              {isRegister ? 'Hesap Oluştur' : 'Tekrar hoş geldin!'}
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed">
              {isRegister 
                ? 'İşletmeni büyütmek için hemen aramıza katıl.' 
                : 'İşletmeni yönetmek için hesabına giriş yap.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {isRegister && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-4">
                <label className="text-sm font-semibold text-gray-700">İşletme Adı / Ad Soyad</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Güzellik Salonu"
                  />
                  <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">E-posta <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="isim@sirket.com"
                />
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">Şifre</label>
                {!isRegister && (
                  <Link to="/forgot-password" className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    Şifremi unuttum
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-10 pr-10 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-all flex items-center justify-center shadow-lg hover:shadow-xl transform active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (isRegister ? 'Kayıt Ol' : 'Giriş Yap')}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium">
              {isRegister ? 'Zaten hesabın var mı?' : 'Hesabın yok mu?'}
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="ml-1 text-black font-bold hover:underline focus:outline-none"
              >
                {isRegister ? 'Giriş yap' : 'Kayıt ol'}
              </button>
            </p>

            <p className="mt-12 text-xs text-gray-400 leading-relaxed px-4 sm:px-8">
              Giriş yaparak <Link to="/terms" className="underline hover:text-gray-600">Kullanım Koşulları</Link> ve <Link to="/privacy" className="underline hover:text-gray-600">Gizlilik Politikası</Link>'nı kabul etmiş olursunuz.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Slider */}
      <div className="hidden lg:block w-1/2 relative bg-gray-900 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-overlay transition-transform duration-[10000ms] ease-linear transform scale-105"
              style={{ backgroundImage: `url("${slide.image}")` }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          </div>
        ))}
        
        {/* Content Area */}
        <div className="absolute bottom-0 left-0 p-16 w-full text-white z-20">
           {slides.map((slide, index) => (
             index === currentSlide && (
               <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <h2 className="text-4xl font-bold mb-4 leading-tight">
                    {slide.title.split('\n').map((line, i) => (
                      <span key={i} className="block">{line}</span>
                    ))}
                  </h2>
                  <p className="text-lg text-gray-300 max-w-lg mb-8">
                    {slide.desc}
                  </p>
               </div>
             )
           ))}
          
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === currentSlide ? 'w-12 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};