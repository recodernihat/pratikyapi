"use client";

import { useState } from "react";

export default function AdminPage() {
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");

  // Örnek Teklif Talepleri
  const [talepler, setTalepler] = useState([
    { id: 1, ad: "Ahmet Yılmaz", hizmet: "Çelik Konstrüksiyon", tel: "0532 000 00 01", durum: "Yeni" },
    { id: 2, ad: "Mehmet Demir", hizmet: "Prefabrik Ev", tel: "0533 000 00 02", durum: "Arandı" },
  ]);

  // Örnek Projeler
  const [projeler, setProjeler] = useState([
    { id: 1, baslik: "Şile Villa Pergola Uygulaması", kategori: "Pergola" },
    { id: 2, baslik: "Tuzla Depo Çelik Çatı", kategori: "Çelik Yapı" },
  ]);
  const [yeniProje, setYeniProje] = useState("");
  const [yeniKategori, setYeniKategori] = useState("Genel");

  const girisKontrol = (e: React.FormEvent) => {
    e.preventDefault();
    if (sifre === "pratikyapı123") {
      setGirisYapildi(true);
      setHata("");
    } else {
      setHata("Hatalı şifre kanka, tekrar dene.");
    }
  };

  const projeEkle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniProje.trim()) return;
    setProjeler([{ id: Date.now(), baslik: yeniProje, kategori: yeniKategori }, ...projeler]);
    setYeniProje("");
  };

  const projeSil = (id: number) => {
    setProjeler(projeler.filter((p) => p.id !== id));
  };

  // ŞİFRE EKRANI
  if (!girisYapildi) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
        <form onSubmit={girisKontrol} className="w-full max-w-sm bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex flex-col items-center justify-center leading-none font-bold text-[10px]">
              <span>PRATİK</span>
              <span>YAPI</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Yönetim Paneli</h1>
              <p className="text-xs text-neutral-400">Devam etmek için şifre girin</p>
            </div>
          </div>

          <input
            type="password"
            placeholder="Admin şifresi..."
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-orange-500"
          />
          {hata && <p className="text-red-400 text-xs mb-3">{hata}</p>}
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-500 transition font-semibold py-2.5 rounded-lg text-sm cursor-pointer"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    );
  }

  // ANA ADMIN PANELİ
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Üst Bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-900 border border-orange-500/50 rounded-lg flex flex-col items-center justify-center leading-tight">
            <span className="text-[9px] font-bold text-white uppercase">Pratik</span>
            <span className="text-[9px] font-bold text-orange-500 uppercase">Yapı</span>
          </div>
          <span className="font-bold text-lg">Admin Kontrol</span>
        </div>
        <button
          onClick={() => setGirisYapildi(false)}
          className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          Çıkış Yap
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
            <p className="text-xs text-neutral-400">Gelen Teklif Talepleri</p>
            <p className="text-2xl font-bold mt-1 text-orange-500">{talepler.length}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
            <p className="text-xs text-neutral-400">Yayındaki Projeler</p>
            <p className="text-2xl font-bold mt-1">{projeler.length}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
            <p className="text-xs text-neutral-400">Sistem & Alan Adı</p>
            <p className="text-sm font-semibold mt-2 text-emerald-400">● pratikyapı.com Aktif</p>
          </div>
        </div>

        {/* Alt Bölümler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gelen Talepler */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="font-bold text-base mb-4">Müşteri Teklif Talepleri</h2>
            <div className="space-y-3">
              {talepler.map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-neutral-950 p-3.5 rounded-lg border border-neutral-800/80">
                  <div>
                    <p className="font-semibold text-sm">{t.ad}</p>
                    <p className="text-xs text-neutral-400">{t.hizmet} • {t.tel}</p>
                  </div>
                  <button
                    onClick={() => setTalepler(talepler.filter((item) => item.id !== t.id))}
                    className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Sil
                  </button>
                </div>
              ))}
              {talepler.length === 0 && <p className="text-xs text-neutral-500">Bekleyen talep yok.</p>}
            </div>
          </div>

          {/* Proje Yönetimi */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="font-bold text-base mb-4">Hızlı Proje Ekle / Yönet</h2>
            <form onSubmit={projeEkle} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Proje adı yaz..."
                value={yeniProje}
                onChange={(e) => setYeniProje(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
              />
              <select
                value={yeniKategori}
                onChange={(e) => setYeniKategori(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-2 text-xs"
              >
                <option value="Pergola">Pergola</option>
                <option value="Çelik Yapı">Çelik Yapı</option>
                <option value="Prefabrik">Prefabrik</option>
              </select>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Ekle
              </button>
            </form>

            <div className="space-y-2.5">
              {projeler.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-neutral-950 p-3 rounded-lg border border-neutral-800/80">
                  <div>
                    <p className="text-sm font-medium">{p.baslik}</p>
                    <span className="text-[11px] text-orange-400">{p.kategori}</span>
                  </div>
                  <button
                    onClick={() => projeSil(p.id)}
                    className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2.5 py-1 rounded cursor-pointer"
                  >
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}