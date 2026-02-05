import React, { useState } from 'react';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock network request
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden">
      {/* Left Side - Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-12 lg:p-0 relative animate-in fade-in slide-in-from-left-4 duration-500">
        
        {/* Navigation - Back Button */}
        {/* Mobile: In flow. Desktop: Absolute */}
        <div className="mb-8 lg:mb-0 lg:absolute lg:top-8 lg:left-12 z-20">
            <Link 
                to="/login" 
                className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-black transition-colors"
            >
                <ArrowLeft size={18} className="mr-2" />
                Giriş sayfasına dön
            </Link>
        </div>

        {/* Content Container - Centered */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto">
            
            {isSubmitted ? (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center animate-in zoom-in-95">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-green-900 mb-2">E-posta Gönderildi!</h2>
                    <p className="text-green-700 mb-6 text-sm leading-relaxed">
                        Şifre sıfırlama talimatlarını içeren bir e-postayı <strong>{email}</strong> adresine gönderdik.
                    </p>
                    <Link to="/login" className="block w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-sm">
                        Giriş Yap
                    </Link>
                </div>
            ) : (
                <>
                    {/* Title */}
                    <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                        Şifreni mi unuttun?
                    </h1>
                    <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
                        Endişelenme! E-posta adresini gir, sana şifreni sıfırlaman için bir bağlantı gönderelim.
                    </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">E-posta</label>
                        <div className="relative">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                            placeholder="isim@sirket.com"
                        />
                        <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all flex items-center justify-center shadow-lg hover:shadow-xl transform active:scale-[0.98]"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Sıfırlama Bağlantısı Gönder'}
                    </button>
                    </form>
                </>
            )}
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block w-1/2 relative bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-overlay"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1548&q=80")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-16 w-full text-white animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Güvenliğin bizim için önemli.
          </h2>
          <p className="text-lg text-gray-300 max-w-lg mb-8">
            Hesabınızı korumak için en son güvenlik standartlarını kullanıyoruz. Şifrenizi unuttuysanız saniyeler içinde sıfırlayabilirsiniz.
          </p>
          
          <div className="flex gap-2">
            <div className="w-12 h-1.5 bg-white rounded-full"></div>
            <div className="w-2 h-1.5 bg-white/30 rounded-full"></div>
            <div className="w-2 h-1.5 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};