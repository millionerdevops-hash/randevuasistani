import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
        {/* Navigation / Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-8 h-20 flex items-center justify-between">
                {/* Brand - Matched to Login Page Position */}
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
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Kullanım Koşulları</h1>
                <p className="text-slate-500 mb-8">Son güncelleme: 14 Aralık 2025</p>

                <div className="space-y-8 text-slate-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">1. Hizmetin Tanımı</h2>
                        <p>
                            RandevumVar ("Hizmet"), güzellik salonları, kuaförler ve benzeri işletmeler için randevu yönetimi, müşteri takibi ve raporlama araçları sunan bir yazılım platformudur. Bu hizmeti kullanarak, aşağıda belirtilen şartları kabul etmiş olursunuz.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">2. Hesap Oluşturma ve Güvenlik</h2>
                        <p>
                            Hizmeti kullanmak için doğru ve güncel bilgilerle bir hesap oluşturmanız gerekmektedir. Hesap güvenliğinizden (şifre koruması vb.) tamamen siz sorumlusunuz. Yetkisiz kullanım şüphesi durumunda derhal bize bildirmelisiniz.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">3. Kullanım Kuralları</h2>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Hizmeti yasa dışı amaçlarla kullanamazsınız.</li>
                            <li>Sistemin güvenliğini veya işleyişini bozacak girişimlerde bulunamazsınız.</li>
                            <li>Başkalarının verilerine izinsiz erişim sağlayamazsınız.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">4. Ödeme ve Abonelik</h2>
                        <p>
                            RandevumVar, ücretli bir abonelik modeline sahiptir. Ödemeler, seçilen plan dahilinde aylık veya yıllık olarak tahsil edilir. İptal talepleri, bir sonraki fatura dönemi için geçerli olacaktır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">5. Sorumluluk Reddi</h2>
                        <p>
                            Hizmet "olduğu gibi" sunulmaktadır. Yazılımın kesintisiz veya hatasız çalışacağını garanti etmiyoruz. Veri kaybı veya ticari zararlardan dolayı sorumluluk kabul edilmez, ancak veri güvenliği için endüstri standartlarında önlemler alınmaktadır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">6. Değişiklikler</h2>
                        <p>
                            Bu koşulları zaman zaman güncelleyebiliriz. Önemli değişiklikler olması durumunda e-posta yoluyla veya platform üzerinden bildirim yapılacaktır.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            Sorularınız için <a href="#" className="text-indigo-600 hover:underline">destek@randevumvar.com</a> adresinden bizimle iletişime geçebilirsiniz.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};