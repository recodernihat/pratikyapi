"use client";

import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

interface Talep {
  id: string;
  ad: string;
  hizmet: string;
  tel: string;
}

interface Proje {
  id: string;
  baslik: string;
  kategori: string;
  gorsel?: string;
}

export default function AdminPage() {
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");

  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [projeler, setProjeler] = useState<Proje[]>([]);
  const [yeniProje, setYeniProje] = useState("");
  const [yeniKategori, setYeniKategori] = useState("Pergola");
  const [secilenDosya, setSecilenDosya] = useState<File | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  const verileriGetir = async () => {
    try {
      const pSnap = await getDocs(query(collection(db, "projeler"), orderBy("createdAt", "desc")));
      setProjeler(pSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Proje, "id">) })));

      const tSnap = await getDocs(query(collection(db, "talepler"), orderBy("createdAt", "desc")));
      setTalepler(tSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Talep, "id">) })));
    } catch (err) {
      console.error("Veri çekme hatası:", err);
    }
  };

  useEffect(() => {
    if (girisYapildi) verileriGetir();
  }, [girisYapildi]);

  const gorselSikistir = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxGenislik = 900;
          const oran = maxGenislik / img.width;
          canvas.width = img.width > maxGenislik ? maxGenislik : img.width;
          canvas.height = img.width > maxGenislik ? img.height * oran : img.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.75));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const girisKontrol = (e: React.FormEvent) => {
    e.preventDefault();
    if (sifre === "admin123") {
      setGirisYapildi(true);
      setHata("");
    } else {
      setHata("Hatalı şifre kanka, tekrar dene.");
    }
  };

  const projeEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniProje.trim()) return;
    setYukleniyor(true);
    try {
      let gorselData = "";
      if (secilenDosya) {
        gorselData = await gorselSikistir(secilenDosya);
      }
      await addDoc(collection(db, "projeler"), {
        baslik: yeniProje.trim(),
        kategori: yeniKategori,
        gorsel: gorselData,
        createdAt: Date.now(),
      });
      setYeniProje("");
      setSecilenDosya(null);
      const fileInput = document.getElementById("dosya-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      await verileriGetir();
    } catch (err) {
      alert("Yükleme sırasında hata oldu, Firestore test modunun açık olduğundan emin ol.");
      console.error(err);
    } finally {
      setYukleniyor(false);
    }
  };

  const projeSil = async (id: string) => {
    await deleteDoc(doc(db, "projeler", id));
    setProjeler(projeler.filter((p) => p.id !== id));
  };

  const talepSil = async (id: string) => {
    await deleteDoc(doc(db, "talepler", id));
    setTalepler(talepler.filter((t) => t.id !== id));
  };

  if (!girisYapildi) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
        <form onSubmit={girisKontrol} className="w-full max-w-sm bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 rounded-lg flex flex-col items-center justify-center leading-none font-bold text-[10px]">
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
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-white"
          />
          {hata && <p className="text-red-400 text-xs mb-3">{hata}</p>}
          <button
            type="submit"
            className="w-full bg-white text-black hover:bg-neutral-200 transition font-semibold py-2.5 rounded-lg text-sm cursor-pointer"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 bg-neutral-900/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-900 border border-neutral-700 rounded-lg flex flex-col items-center justify-center leading-tight">
            <span className="text-[9px] font-bold text-white uppercase">Pratik</span>
            <span className="text-[9px] font-bold text-neutral-400 uppercase">Yapı</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
            <p className="text-xs text-neutral-400">Gelen Teklif Talepleri</p>
            <p className="text-2xl font-bold mt-1">{talepler.length}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    onClick={() => talepSil(t.id)}
                    className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Sil
                  </button>
                </div>
              ))}
              {talepler.length === 0 && <p className="text-xs text-neutral-500">Henüz teklif talebi yok.</p>}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="font-bold text-base mb-4">Hızlı Proje Ekle / Yönet</h2>
            <form onSubmit={projeEkle} className="space-y-3 mb-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Proje adı yaz (Örn: Villa Kış Bahçesi)..."
                  value={yeniProje}
                  onChange={(e) => setYeniProje(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white"
                />
                <select
                  value={yeniKategori}
                  onChange={(e) => setYeniKategori(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-2 text-xs"
                >
                  <option value="Pergola">Pergola</option>
                  <option value="Kış Bahçesi">Kış Bahçesi</option>
                  <option value="Cam Cephe">Cam Cephe</option>
                  <option value="Çelik Yapı">Çelik Yapı</option>
                  <option value="Prefabrik">Prefabrik</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="dosya-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSecilenDosya(e.target.files?.[0] || null)}
                  className="flex-1 text-xs text-neutral-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer"
                />
                <button
                  type="submit"
                  disabled={yukleniyor}
                  className="bg-white text-black hover:bg-neutral-200 disabled:opacity-50 px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {yukleniyor ? "Yükleniyor..." : "Ekle"}
                </button>
              </div>
            </form>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {projeler.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-neutral-950 p-3 rounded-lg border border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    {p.gorsel && (
                      <img src={p.gorsel} alt={p.baslik} className="w-12 h-12 rounded object-cover border border-neutral-800" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{p.baslik}</p>
                      <span className="text-[11px] text-neutral-400">{p.kategori}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => projeSil(p.id)}
                    className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2.5 py-1 rounded cursor-pointer"
                  >
                    Kaldır
                  </button>
                </div>
              ))}
              {projeler.length === 0 && <p className="text-xs text-neutral-500">Henüz eklenmiş proje yok.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}