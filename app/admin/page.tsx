"use client";

import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, orderBy } from "firebase/firestore";

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

const KATEGORILER = ["Pergola", "Kış Bahçesi", "Cam Balkon"] as const;

const BASLIK_HAVUZU: Record<string, string[]> = {
  "Pergola": [
    "Bioklimatik Pergola Uygulaması",
    "LED Işıklı Açılır Tavan Pergola",
    "Motorlu Raylı Pergola Sistemi",
    "Teras & Bahçe Pergola Projesi",
    "Ticari Mekan Pergola Tavan Sistemi",
    "Antrasit Alüminyum Pergola Uygulaması",
  ],
  "Kış Bahçesi": [
    "Modern Villa Kış Bahçesi",
    "Sürme Camlı Kış Bahçesi Uygulaması",
    "Isı Yalıtımlı Kış Bahçesi Projesi",
    "Bahçe Katı Cam Kış Bahçesi",
    "Dört Mevsim Cam Tavan Kış Bahçesi",
    "Müstakil Bahçe Kış Bahçesi Sistemi",
  ],
  "Cam Balkon": [
    "Isıcamlı Katlanır Cam Balkon Uygulaması",
    "Motorlu Giyotin Cam Balkon Sistemi",
    "Panoramik Sürme Cam Balkon Projesi",
    "Eşiksiz Sürgülü Teras Cam Kapama",
    "Temperli Füme Cam Balkon Uygulaması",
    "Alüminyum Profilli Balkon Camlama",
    "Dört Mevsim Yalıtımlı Cam Balkon",
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
  const [topluIslemYapiliyor, setTopluIslemYapiliyor] = useState(false);

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

  const gorselVerisiAnalizEt = (dataUrl: string, dosyaAdi = ""): Promise<string> => {
    return new Promise((resolve) => {
      const ad = dosyaAdi.toLowerCase();
      if (ad.includes("pergola")) return resolve("Pergola");
      if (ad.includes("kis") || ad.includes("kış") || ad.includes("bahce")) return resolve("Kış Bahçesi");
      if (ad.includes("balkon") || ad.includes("giyotin") || ad.includes("surme") || ad.includes("cam")) {
        return resolve("Cam Balkon");
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const w = 160;
        const h = 160;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve("Pergola");

        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;

        const gri = new Float32Array(w * h);
        for (let i = 0; i < w * h; i++) {
          const idx = i * 4;
          gri[i] = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        }

        let ustYatayLamel = 0;
        let ustKoyuKiris = 0;
        let ustSicakLed = 0;
        let ortaDikeyProfil = 0;
        let ortaParlakDisari = 0;
        let altKorkulukBant = 0;
        let altTamBoyCam = 0;
        let altBahceYesil = 0;

        const ustPikselSayisi = w * Math.floor(h * 0.42);
        const ortaPikselSayisi = w * Math.floor(h * 0.5);
        const altPikselSayisi = w * Math.floor(h * 0.35);

        for (let y = 1; y < h - 1; y++) {
          let satirYatayKenar = 0;
          for (let x = 1; x < w - 1; x++) {
            const p = y * w + x;
            const idx = p * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const parlaklik = gri[p];

            const gx =
              -gri[(y - 1) * w + (x - 1)] +
              gri[(y - 1) * w + (x + 1)] -
              2 * gri[y * w + (x - 1)] +
              2 * gri[y * w + (x + 1)] -
              gri[(y + 1) * w + (x - 1)] +
              gri[(y + 1) * w + (x + 1)];

            const gy =
              -gri[(y - 1) * w + (x - 1)] -
              2 * gri[(y - 1) * w + x] -
              gri[(y - 1) * w + (x + 1)] +
              gri[(y + 1) * w + (x - 1)] +
              2 * gri[(y + 1) * w + x] +
              gri[(y + 1) * w + (x + 1)];

            const absGx = Math.abs(gx);
            const absGy = Math.abs(gy);

            if (y < h * 0.42) {
              if (absGy > 110 && absGy > absGx * 1.25) ustYatayLamel++;
              if (parlaklik < 65 && Math.max(r, g, b) - Math.min(r, g, b) < 22) ustKoyuKiris++;
              if (r > 195 && g > 145 && b < 115) ustSicakLed++;
            }

            if (y >= h * 0.25 && y <= h * 0.75) {
              if (absGx > 115 && absGx > absGy * 1.35) ortaDikeyProfil++;
              if (parlaklik > 170) ortaParlakDisari++;
            }

            if (y >= h * 0.52 && y <= h * 0.82) {
              if (absGy > 130 && absGy > absGx * 1.4) satirYatayKenar++;
            }

            if (y > h * 0.65) {
              if (g > r + 12 && g > b + 12 && g > 50) altBahceYesil++;
              if (y > h * 0.78 && absGx > 115 && absGx > absGy * 1.4) altTamBoyCam++;
            }
          }
          if (satirYatayKenar > w * 0.35) altKorkulukBant++;
        }

        const rLamel = (ustYatayLamel / ustPikselSayisi) * 100;
        const rKoyuTavan = (ustKoyuKiris / ustPikselSayisi) * 100;
        const rLed = (ustSicakLed / ustPikselSayisi) * 100;
        const rDikeyCam = (ortaDikeyProfil / ortaPikselSayisi) * 100;
        const rParlakDis = (ortaParlakDisari / ortaPikselSayisi) * 100;
        const rBahce = (altBahceYesil / altPikselSayisi) * 100;
        const rTamBoyCam = (altTamBoyCam / (altPikselSayisi * 0.6)) * 100;

        const pergolaSkor =
          rLamel * 2.4 +
          rKoyuTavan * 0.9 +
          rLed * 4.5 -
          altKorkulukBant * 1.2;

        const camBalkonSkor =
          rDikeyCam * 2.6 +
          altKorkulukBant * 2.2 +
          rParlakDis * 0.45 -
          rBahce * 1.1 -
          rLed * 2.0;

        const kisBahcesiSkor =
          rBahce * 1.9 +
          rTamBoyCam * 2.2 +
          rDikeyCam * 1.4 +
          rLamel * 0.6 -
          altKorkulukBant * 1.5;

        const adaylar = [
          { kategori: "Pergola", skor: pergolaSkor },
          { kategori: "Cam Balkon", skor: camBalkonSkor },
          { kategori: "Kış Bahçesi", skor: kisBahcesiSkor },
        ];

        adaylar.sort((a, b) => b.skor - a.skor);
        resolve(adaylar[0].kategori);
      };
      img.onerror = () => resolve("Pergola");
      img.src = dataUrl;
    });
  };

  const tekDosyaAnalizEt = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const res = e.target?.result as string;
        if (!res) return resolve("Pergola");
        resolve(await gorselVerisiAnalizEt(res, file.name));
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
      const kategori = await tekDosyaAnalizEt(file);
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
      prev.map((item, idx) => {
        if (item.id !== id) return item;
        if (alan === "kategori") {
          const havuz = BASLIK_HAVUZU[deger] || ["Özel Yapı Uygulaması"];
          return { ...item, kategori: deger, baslik: havuz[idx % havuz.length] };
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

  // Yayındaki mevcut bir projenin kategorisini tek tıkla değiştir
  const yayindakiKategoriDegistir = async (id: string, yeniKategori: string) => {
    const sayac = projeler.filter((p) => p.kategori === yeniKategori).length;
    const havuz = BASLIK_HAVUZU[yeniKategori] || ["Özel Yapı Uygulaması"];
    const yeniBaslik = havuz[sayac % havuz.length];

    setProjeler((prev) =>
      prev.map((p) => (p.id === id ? { ...p, kategori: yeniKategori, baslik: yeniBaslik } : p))
    );
    await updateDoc(doc(db, "projeler", id), {
      kategori: yeniKategori,
      baslik: yeniBaslik,
    });
  };

  // Yayındaki mevcut bir projenin başlığını kaydet
  const yayindakiBaslikKaydet = async (id: string, yeniBaslik: string) => {
    if (!yeniBaslik.trim()) return;
    await updateDoc(doc(db, "projeler", id), { baslik: yeniBaslik.trim() });
  };

  // Yayındaki tüm karışık projeleri yeni algoritmayla baştan ayır ve isimlendir
  const yayindakileriYenidenAyir = async () => {
    if (projeler.length === 0) return;
    setTopluIslemYapiliyor(true);
    try {
      const sayac: Record<string, number> = {};
      const guncelListe: Proje[] = [];

      for (const p of projeler) {
        const kategori = p.gorsel ? await gorselVerisiAnalizEt(p.gorsel, "") : "Pergola";
        const idx = sayac[kategori] || 0;
        sayac[kategori] = idx + 1;
        const havuz = BASLIK_HAVUZU[kategori] || ["Özel Yapı Uygulaması"];
        const baslik = havuz[idx % havuz.length];

        await updateDoc(doc(db, "projeler", p.id), { kategori, baslik });
        guncelListe.push({ ...p, kategori, baslik });
      }
      setProjeler(guncelListe);
    } finally {
      setTopluIslemYapiliyor(false);
    }
  };

  // Yayındaki tüm projeleri temizle
  const tumProjeleriSil = async () => {
    if (projeler.length === 0) return;
    if (!confirm(`Yayındaki ${projeler.length} fotoğrafın tamamı silinsin mi?`)) return;
    setTopluIslemYapiliyor(true);
    try {
      for (const p of projeler) {
        await deleteDoc(doc(db, "projeler", p.id));
      }
      setProjeler([]);
    } finally {
      setTopluIslemYapiliyor(false);
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
              <p className="text-xs text-neutral-400">Fotoğrafları toplu seç, kategorileri tek tıkla kontrol et ve yayınla.</p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                {bekleyenler.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800"
                  >
                    <img
                      src={item.onizleme}
                      alt={item.baslik}
                      className="w-20 h-20 rounded-lg object-cover border border-neutral-800 shrink-0"
                    />
                    <div className="flex-1 space-y-2 min-w-0">
                      <input
                        type="text"
                        value={item.baslik}
                        onChange={(e) => bekleyenGuncelle(item.id, "baslik", e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-white"
                      />
                      <div className="flex gap-1.5">
                        {KATEGORILER.map((kat) => (
                          <button
                            key={kat}
                            type="button"
                            onClick={() => bekleyenGuncelle(item.id, "kategori", kat)}
                            className={`flex-1 py-1 px-1.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                              item.kategori === kat
                                ? "bg-emerald-500 text-black"
                                : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                            }`}
                          >
                            {kat}
                          </button>
                        ))}
                      </div>
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
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="font-bold text-base">Yayındaki Projeler ({projeler.length})</h2>
              {projeler.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={yayindakileriYenidenAyir}
                    disabled={topluIslemYapiliyor}
                    className="text-[11px] bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 px-2.5 py-1 rounded font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {topluIslemYapiliyor ? "Düzenleniyor..." : "Hepsini Yeniden Ayır"}
                  </button>
                  <button
                    onClick={tumProjeleriSil}
                    disabled={topluIslemYapiliyor}
                    className="text-[11px] bg-red-500/15 text-red-400 hover:bg-red-500/25 px-2.5 py-1 rounded font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Tümünü Sil
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {projeler.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800/80">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {p.gorsel && (
                      <img src={p.gorsel} alt={p.baslik} className="w-16 h-16 rounded-lg object-cover border border-neutral-800 shrink-0" />
                    )}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <input
                        type="text"
                        value={p.baslik}
                        onChange={(e) =>
                          setProjeler((prev) =>
                            prev.map((item) => (item.id === p.id ? { ...item, baslik: e.target.value } : item))
                          )
                        }
                        onBlur={(e) => yayindakiBaslikKaydet(p.id, e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs focus:outline-none focus:border-white"
                      />
                      <div className="flex gap-1">
                        {KATEGORILER.map((kat) => (
                          <button
                            key={kat}
                            type="button"
                            onClick={() => yayindakiKategoriDegistir(p.id, kat)}
                            className={`flex-1 py-1 px-1.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                              p.kategori === kat
                                ? "bg-emerald-500 text-black"
                                : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                            }`}
                          >
                            {kat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => projeSil(p.id)}
                    className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2.5 py-1.5 rounded cursor-pointer shrink-0"
                  >
                    Sil
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