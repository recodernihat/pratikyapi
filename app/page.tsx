"use client";

import { useState } from 'react';

export default function Home() {
  
  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");
  const [hizmet, setHizmet] = useState("Pergola");
  const [randevuAlindi, setRandevuAlindi] = useState(false);
  const [hataMesaji, setHataMesaji] = useState("");

  const randevuGonder = () => {
    // BURASI YARIN FORMSPREE ILE GÜNCELLENECEK, ŞU AN SADECE GÖRSEL
    if (adSoyad.trim() === "" || telefon.trim() === "") {
      setHataMesaji("Lütfen adınızı ve telefon numaranızı girin.");
      return; 
    }
    if (telefon.length < 10) {
      setHataMesaji("Lütfen geçerli bir telefon numarası girin.");
      return;
    }
    setHataMesaji("");
    setRandevuAlindi(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans scroll-smooth">
      
      {/* 1. NAVBAR */}
      <nav className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="text-2xl font-black tracking-wider">PRATİK<span className="text-blue-500">YAPI</span></div>
        <div className="space-x-6 font-semibold hidden md:block">
          <a href="#hakkimizda" className="hover:text-blue-400 transition cursor-pointer">Kurumsal</a>
          <a href="#hizmetler" className="hover:text-blue-400 transition cursor-pointer">Hizmetlerimiz</a>
          <a href="#galeri" className="hover:text-blue-400 transition cursor-pointer">Tamamlanan Projeler</a>
          <a href="#iletisim" className="hover:text-blue-400 transition cursor-pointer">İletişim</a>
        </div>
      </nav>

      {/* 2. HERO */}
      <section className="bg-slate-800 text-white py-32 px-4 text-center border-b-[8px] border-blue-600">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Şıklığı ve Konforu Mekanınıza Taşıyoruz</h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Modern Pergola, Kış Bahçesi ve Cam Balkon Sistemleri ile dört mevsim yaşanabilir alanlar tasarlıyoruz.
        </p>
        <a href="#iletisim" className="inline-block bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-md font-bold text-lg transition shadow-lg shadow-blue-600/30">
          Hemen Keşif Randevusu Al
        </a>
      </section>

      {/* 3. KURUMSAL */}
      <section id="hakkimizda" className="py-20 px-8 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
        <div className="md:w-1/2 text-left">
          <div className="bg-blue-600 text-white inline-block px-5 py-2 rounded-md font-bold mb-6 shadow-md">
            20 Yıllık Sektör Tecrübesi
          </div>
          <h2 className="text-3xl font-bold mb-6 text-slate-900">Biz Kimiz?</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            20 yılın verdiği tecrübe ve usta işçiliğimizle, mekanlarınızı dört mevsim yaşanabilir alanlara dönüştürüyoruz. Pergola, cam balkon ve kış bahçesi sistemlerinde önceliğimiz daima kalite ve müşteri memnuniyetidir.
          </p>
          <p className="text-gray-600 leading-relaxed font-semibold">
            Garantili malzeme ve zamanında teslimat prensibiyle çalışıyoruz.
          </p>
        </div>
        <div className="md:w-1/2 bg-slate-200 aspect-video rounded-xl flex items-center justify-center border-2 border-dashed border-slate-400 shadow-sm">
           <span className="text-slate-500 font-bold">📸 Kurumsal Ekip/Atölye Fotoğrafı</span>
        </div>
      </section>

      {/* 4. HİZMETLER */}
      <section id="hizmetler" className="py-20 bg-white px-8 text-center border-y border-gray-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-slate-900">Neler Yapıyoruz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 hover:-translate-y-2 cursor-pointer">
              <h3 className="text-xl font-bold mb-3 text-slate-800">Pergola Sistemleri</h3>
              <p className="text-gray-600 text-sm">Işıklı, otomatik açılır kapanır modern tavan sistemleri.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 hover:-translate-y-2 cursor-pointer">
              <h3 className="text-xl font-bold mb-3 text-slate-800">Cam Balkon</h3>
              <p className="text-gray-600 text-sm">Isı yalıtımlı, katlanabilir ve sürgülü cam balkonlar.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 hover:-translate-y-2 cursor-pointer">
              <h3 className="text-xl font-bold mb-3 text-slate-800">Kış Bahçesi</h3>
              <p className="text-gray-600 text-sm">Mekanınızı genişleten, estetik ve yalıtımlı kış bahçeleri.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GALERİ */}
      <section id="galeri" className="py-20 px-8 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-slate-900">Örnek Uygulamalarımız</h2>
        <p className="text-gray-600 mb-12">Hayata geçirdiğimiz projelerden kareler ve uygulama videolarımız.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-slate-200 aspect-video rounded-xl flex items-center justify-center border-2 border-slate-300 shadow-sm hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <span className="text-slate-500 font-bold group-hover:text-blue-600">📸 Örnek Proje 1</span>
          </div>
          <div className="bg-slate-200 aspect-video rounded-xl flex items-center justify-center border-2 border-slate-300 shadow-sm hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <span className="text-slate-500 font-bold group-hover:text-blue-600">📸 Örnek Proje 2</span>
          </div>
          <div className="bg-slate-800 text-white aspect-video rounded-xl flex flex-col items-center justify-center shadow-lg hover:scale-105 hover:shadow-2xl hover:bg-slate-900 transition-all duration-300 cursor-pointer group relative overflow-hidden">
            <span className="text-5xl mb-2 group-hover:scale-110 transition-transform text-red-500">▶</span>
            <span className="font-bold tracking-wide">Uygulama Videosu</span>
          </div>
        </div>
      </section>

      {/* 6. İLETİŞİM & RANDEVU FORMU */}
      <section id="iletisim" className="py-20 bg-slate-200 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-slate-900">İletişim & Randevu</h2>
        <p className="mb-10 text-gray-600">Ücretsiz keşif, ölçü ve fiyat bilgisi için bize ulaşın.</p>
        
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          <div className="bg-slate-900 text-white p-10 md:w-1/2 flex flex-col justify-center text-left">
            <h3 className="text-2xl font-bold mb-6">Bize Ulaşın</h3>
            <div className="mb-6 space-y-2">
              <p className="text-lg flex items-center gap-3">📞 <span>+90 534 875 21 22</span></p>
              <p className="text-lg flex items-center gap-3">📞 <span>+90 533 087 40 97</span></p>
            </div>
            <p className="text-lg mb-6 flex items-center gap-3 text-blue-400">✉️ <span>pratikyapii@gmail.com</span></p>
            <div className="mt-2 mb-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Takip Edin</h4>
              <div className="flex gap-4">
                {/* INSTAGRAM LİNKİ EKLENDİ, FACEBOOK SİLİNDİ */}
                <a 
                  href="https://instagram.com/prtyapi" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-blue-600 p-2 px-4 rounded-md hover:bg-blue-500 transition text-sm font-bold shadow-md"
                >
                  Instagram'da Biz
                </a>
              </div>
            </div>
            <p className="text-md text-gray-400 border-t border-slate-700 pt-4 mt-2">
              📍 Avcılar, İstanbul
            </p>
          </div>

          <div className="p-10 md:w-1/2 flex flex-col justify-center">
            {randevuAlindi ? (
              <div className="text-center bg-green-50 p-8 rounded-xl border border-green-200">
                <div className="text-green-500 text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Talebiniz Alındı!</h3>
                <p className="text-green-700">Sayın <strong>{adSoyad}</strong>, randevu talebiniz bize ulaştı. En kısa sürede sizinle iletişime geçeceğiz.</p>
                <button 
                  onClick={() => {
                    setRandevuAlindi(false);
                    setAdSoyad("");
                    setTelefon("");
                  }} 
                  className="mt-6 text-sm text-green-600 underline hover:text-green-800"
                >
                  Yeni bir form gönder
                </button>
              </div>
            ) : (
              <form className="flex flex-col gap-4 text-left">
                {hataMesaji && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 text-sm font-semibold">
                    ⚠️ {hataMesaji}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ad Soyad</label>
                  <input 
                    type="text" 
                    value={adSoyad}
                    onChange={(e) => setAdSoyad(e.target.value)}
                    placeholder="Adınız Soyadınız" 
                    className="w-full p-3 border rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon</label>
                  <input 
                    type="tel" 
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                    placeholder="05XX XXX XX XX" 
                    className="w-full p-3 border rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Hangi hizmetle ilgileniyorsunuz?</label>
                  <select 
                    value={hizmet}
                    onChange={(e) => setHizmet(e.target.value)}
                    className="w-full p-3 border rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Pergola</option>
                    <option>Cam Balkon</option>
                    <option>Kış Bahçesi</option>
                  </select>
                </div>
                <button 
                  type="button" 
                  onClick={randevuGonder}
                  className="mt-4 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 font-bold transition shadow-md active:scale-95"
                >
                  Randevu Talebi Gönder
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 7. SABİT WHATSAPP BUTONU */}
      <a 
        href="https://wa.me/905348752122" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center"
        title="WhatsApp İletişim"
      >
        <span className="text-3xl">💬</span>
      </a>

    </div>
  );
}