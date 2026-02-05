import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
        {/* Navigation / Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-8 h-20 flex items-center justify-between">
                {/* Brand */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center font-bold text-white text-lg">r.</div>
                    <span className="font-bold text-xl tracking-tight text-black">randevumvar</span>
                </div>

                {/* Back Button */}
                <Link 
                    to="/login" 
                    className="group flex items-center text-sm font-semibold text-slate-500 hover:text-black transition-colors"
                >
                    <span className="mr-3 hidden sm:inline">Giriş Sayfasına Dön</span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors border border-slate-100">
                        <ArrowLeft size={16} />
                    </div>
                </Link>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Gizlilik Politikası</h1>
                <p className="text-slate-500 mb-8">Son güncelleme: 14 Aralık 2025</p>

                <div className="space-y-8 text-slate-700 leading-relaxed">
                    <p className="text-lg text-slate-600">
                        RandevumVar olarak gizliliğinize önem veriyoruz. Bu politika, kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">1. Toplanan Bilgiler</h2>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Hesap Bilgileri:</strong> Ad, soyad, e-posta adresi, telefon numarası ve işletme detayları.</li>
                            <li><strong>Müşteri Verileri:</strong> Sisteme kaydettiğiniz müşterilerinizin iletişim bilgileri ve randevu geçmişi.</li>
                            <li><strong>Kullanım Verileri:</strong> Cihaz bilgileri, IP adresi ve platform üzerindeki etkileşimleriniz.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">2. Verilerin Kullanımı</h2>
                        <p>Topladığımız bilgileri şu amaçlarla kullanırız:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Hizmetin sağlanması ve yönetilmesi.</li>
                            <li>Müşteri desteği sunmak.</li>
                            <li>Hizmet kalitesini artırmak ve analiz yapmak.</li>
                            <li>Yasal yükümlülükleri yerine getirmek.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">3. Veri Güvenliği</h2>
                        <p>
                            Verileriniz, endüstri standardı şifreleme yöntemleri (SSL/TLS) ile korunmaktadır. Sunucularımız güvenli veri merkezlerinde barındırılmakta ve düzenli olarak yedeklenmektedir. Ancak, internet üzerinden yapılan hiçbir iletimin %100 güvenli olmadığını unutmayınız.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">4. Üçüncü Taraflarla Paylaşım</h2>
                        <p>
                            Kişisel verilerinizi, yasal zorunluluklar dışında veya hizmeti sağlamak için gerekli olan iş ortaklarımız (örn. ödeme altyapısı sağlayıcıları) haricinde üçüncü taraflarla paylaşmayız, satmayız veya kiralamayız.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">5. Çerezler (Cookies)</h2>
                        <p>
                            Kullanıcı deneyimini geliştirmek için çerezler kullanıyoruz. Tarayıcı ayarlarınızdan çerezleri yönetebilir veya engelleyebilirsiniz, ancak bu durumda platformun bazı özellikleri düzgün çalışmayabilir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">6. Haklarınız</h2>
                        <p>
                            KVKK kapsamında verilerinize erişme, düzeltme veya silinmesini talep etme hakkına sahipsiniz. Bu haklarınızı kullanmak için bizimle iletişime geçebilirsiniz.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            Gizlilik politikamızla ilgili sorularınız için <a href="#" className="text-indigo-600 hover:underline">gizlilik@randevumvar.com</a> adresinden ulaşabilirsiniz.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};