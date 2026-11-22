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

interface BekleyenProje {
  id: string;
  file: File;
  onizleme: string;
  baslik: string;
  kategori: string;
}

const BASLIK_HAVUZU: Record<string, string[]> = {
  "Pergola": [
    "Bioklimatik Pergola Uygulaması",
    "LED Işıklı Açılır Tavan Pergola",
    "Motorlu Raylı Pergola Sistemi",
    "Giyotin Camlı Pergola Projesi",
    "Teras & Bahçe Pergola Uygulaması",
    "Ticari Mekan Pergola Tavan Sistemi",
  ],
  "Kış Bahçesi": [
    "Modern Villa Kış Bahçesi",
    "Sürme Camlı Kış Bahçesi Uygulaması",
    "Isı Yalıtımlı Kış Bahçesi Projesi",
    "Bahçe Katı Cam Kış Bahçesi",
    "Dört Mevsim Cam Tavan Kış Bahçesi",
  ],
  "Cam Cephe": [
    "Sistem Cam Cephe Uygulaması",
    "Ticari Showroom Cam Cephe",
    "Giyotin & Sürme Cam Sistemi",
    "Alüminyum Doğrama Cam Cephe",
    "Panoramik Cam Korkuluk & Cephe",
  ],
};

export default function AdminPage() {
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");

  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [projeler, setProjeler] = useState<Proje[]>([]);
  const [bekleyenler, setBekleyenler] = useState<BekleyenProje[]>([]);
  const [analizEdiliyor, setAnalizEdiliyor] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [yuklemeDurumu, setYuklemeDurumu] = useState("");

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

  const tekGorselAnalizEt = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const ad = file.name.toLowerCase();
      if (ad.includes("pergola")) return resolve("Pergola");
      if (ad.includes("kis") || ad.includes("kış") || ad.includes("bahce")) return resolve("Kış Bahçesi");
      if (ad.includes("cam") || ad.includes("cephe") || ad.includes("giyotin")) return resolve("Cam Cephe");

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const w = 120;
          const h = 120;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve("Pergola");

          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h).data;

          let tavanRitim = 0;
          let koyuTavan = 0;
          let yesilBahce = 0;
          let camYansima = 0;
          let dikeyProfil = 0;

          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const i = (y * w + x) * 4;
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const parlaklik = (r + g + b) / 3;

              const ustI = ((y - 1) * w + x) * 4;
              const ustParlaklik = (data[ustI] + data[ustI + 1] + data[ustI + 2]) / 3;

              const solI = (y * w + (x - 1)) * 4;
              const solParlaklik = (data[solI] + data[solI + 1] + data[solI + 2]) / 3;

              if (y < h * 0.5) {
                if (Math.abs(parlaklik - ustParlaklik) > 38) tavanRitim++;
                if (parlaklik < 65) koyuTavan++;
              }

              if (y > h * 0.65 && g > r + 14 && g > b + 14 && g > 55) {
                yesilBahce++;
              }

              if (y >= h * 0.2 && y <= h * 0.8) {
                if (b > r + 12 && b > 85) camYansima++;
                if (Math.abs(parlaklik - solParlaklik) > 45 && parlaklik < 95) dikeyProfil++;
              }
            }
          }

          const pergolaSkor = (tavanRitim / 18) + (koyuTavan / 45);
          const kisBahcesiSkor = (yesilBahce / 14) + (dikeyProfil / 28) - (tavanRitim > 650 ? 25 : 0);
          const camCepheSkor = (camYansima / 22) + (dikeyProfil / 22) - (yesilBahce / 25);

          const adaylar = [
            { kategori: "Pergola", skor: pergolaSkor },
            { kategori: "Kış Bahçesi", skor: kisBahcesiSkor },
            { kategori: "Cam Cephe", skor: camCepheSkor },
          ];

          adaylar.sort((a, b) => b.skor - a.skor);
          resolve(adaylar[0].kategori);
        };
        img.onerror = () => resolve("Pergola");
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("Pergola");
      reader.readAsDataURL(file);
    });
  };

  const topluDosyaSecildi = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const dosyalar = Array.from(e.target.files || []);
    if (dosyalar.length === 0) return;

    setAnalizEdiliyor(true);
    const sayac: Record<string, number> = {};
    projeler.forEach((p) => {
      sayac[p.kategori] = (sayac[p.kategori] || 0) + 1;
    });
    bekleyenler.forEach((b) => {
      sayac[b.kategori] = (sayac[b.kategori] || 0) + 1;
    });

    const yeniListe: BekleyenProje[] = [];
    for (let i = 0; i < dosyalar.length; i++) {
      const file = dosyalar[i];
      const kategori = await tekGorselAnalizEt(file);
      const index = sayac[kategori] || 0;
      sayac[kategori] = index + 1;

      const havuz = BASLIK_HAVUZU[kategori] || ["Özel Yapı Uygulaması"];
      const baslik = havuz[index % havuz.length];

      yeniListe.push({
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        onizleme: URL.createObjectURL(file),
        baslik,
        kategori,
      });
    }

    setBekleyenler((prev) => [...prev, ...yeniListe]);
    setAnalizEdiliyor(false);
    e.target.value = "";
  };

  const bekleyenGuncelle = (id: string, alan: "baslik" | "kategori", deger: string) => {
    setBekleyenler((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (alan === "kategori") {
          const havuz = BASLIK_HAVUZU[deger] || ["Özel Yapı Uygulaması"];
          return { ...item, kategori: deger, baslik: havuz[0] };
        }
        return { ...item, baslik: deger };
      })
    );
  };

  const bekleyenSil = (id: string) => {
    setBekleyenler((prev) => prev.filter((item) => item.id !== id));
  };

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

  const topluYayinla = async () => {
    if (bekleyenler.length === 0) return;
    setYukleniyor(true);
    try {
      for (let i = 0; i < bekleyenler.length; i++) {
        const item = bekleyenler[i];
        setYuklemeDurumu(`Yükleniyor: ${i + 1} / ${bekleyenler.length}`);
        const gorselData = await gorselSikistir(item.file);
        await addDoc(collection(db, "projeler"), {
          baslik: item.baslik.trim() || "Özel Yapı Uygulaması",
          kategori: item.kategori,
          gorsel: gorselData,
          createdAt: Date.now() + i,
        });
      }
      setBekleyenler([]);
      setYuklemeDurumu("");
      await verileriGetir();
    } catch (err) {
      alert("Yükleme sırasında hata oldu, Firestore test modunun açık olduğundan emin ol.");
      console.error(err);
    } finally {
      setYukleniyor(false);
      setYuklemeDurumu("");
    }
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

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-bold text-base">Toplu Proje Ekle & Kontrol Et</h2>
              <p className="text-xs text-neutral-400">Fotoğrafları toplu seç, otomatik kategorileri kontrol et ve tek tıkla yayınla.</p>
            </div>
            <label className="bg-white text-black hover:bg-neutral-200 px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer text-center transition">
              {analizEdiliyor ? "Fotoğraflar Ayrıştırılıyor..." : "+ Toplu Fotoğraf Seç"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={topluDosyaSecildi}
                disabled={analizEdiliyor || yukleniyor}
                className="hidden"
              />
            </label>
          </div>

          {bekleyenler.length > 0 && (
            <div className="space-y-3 mt-4 border-t border-neutral-800 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400">
                  {bekleyenler.length} fotoğraf hazır — kontrol edip onaylayabilirsin:
                </span>
                <button
                  onClick={() => setBekleyenler([])}
                  disabled={yukleniyor}
                  className="text-xs text-neutral-400 hover:text-red-400 cursor-pointer"
                >
                  Listeyi Temizle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {bekleyenler.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800"
                  >
                    <img
                      src={item.onizleme}
                      alt={item.baslik}
                      className="w-16 h-16 rounded-lg object-cover border border-neutral-800 shrink-0"
                    />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <input
                        type="text"
                        value={item.baslik}
                        onChange={(e) => bekleyenGuncelle(item.id, "baslik", e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-white"
                      />
                      <select
                        value={item.kategori}
                        onChange={(e) => bekleyenGuncelle(item.id, "kategori", e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-emerald-400 font-semibold"
                      >
                        <option value="Pergola">Pergola</option>
                        <option value="Kış Bahçesi">Kış Bahçesi</option>
                        <option value="Cam Cephe">Cam Cephe</option>
                      </select>
                    </div>
                    <button
                      onClick={() => bekleyenSil(item.id)}
                      disabled={yukleniyor}
                      className="text-xs text-neutral-500 hover:text-red-400 px-2 py-1 cursor-pointer"
                      title="Listeden çıkar"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={topluYayinla}
                disabled={yukleniyor}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg text-sm transition cursor-pointer disabled:opacity-50"
              >
                {yukleniyor ? yuklemeDurumu : `Hepsini Siteye Yayınla (${bekleyenler.length} Fotoğraf)`}
              </button>
            </div>
          )}
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
            <h2 className="font-bold text-base mb-4">Yayındaki Projeler ({projeler.length})</h2>
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