"use client";

import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

interface Proje {
  id: string;
  baslik: string;
  kategori: string;
  gorsel?: string;
}

export default function Home() {
  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");
  const [hizmet, setHizmet] = useState("Pergola");
  const [randevuAlindi, setRandevuAlindi] = useState(false);
  const [hataMesaji, setHataMesaji] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  const [projeler, setProjeler] = useState<Proje[]>([]);
  const [galeriYukleniyor, setGaleriYukleniyor] = useState(true);
  const [aktifKategori, setAktifKategori] = useState("Tümü");
  const [seciliProje, setSeciliProje] = useState<Proje | null>(null);

  useEffect(() => {
    const projeleriCek = async () => {
      try {
        const snap = await getDocs(query(collection(db, "projeler"), orderBy("createdAt", "desc")));
        setProjeler(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Proje, "id">) })));
      } catch (err) {
        console.error("Projeler yüklenemedi:", err);
      } finally {
        setGaleriYukleniyor(false);
      }
    };
    projeleriCek();
  }, []);

  const randevuGonder = async () => {
    if (adSoyad.trim() === "" || telefon.trim() === "") {
      setHataMesaji("Lütfen adınızı ve telefon numaranızı girin.");
      return;
    }
    if (telefon.replace(/\s/g, "").length < 10) {
      setHataMesaji("Lütfen geçerli bir telefon numarası girin.");
      return;
    }
    setHataMesaji("");
    setGonderiliyor(true);

    try {
      await addDoc(collection(db, "talepler"), {
        ad: adSoyad.trim(),
        tel: telefon.trim(),
        hizmet,
        createdAt: Date.now(),
      });
      setRandevuAlindi(true);
    } catch (err) {
      setHataMesaji("Talep gönderilirken bir sorun oluştu, lütfen WhatsApp'tan ulaşın.");
      console.error(err);
    } finally {
      setGonderiliyor(false);
    }
  };

  const hizmetSecVeGit = (secilenHizmet: string) => {
    setHizmet(secilenHizmet);
    const el = document.getElementById("iletisim");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const kategoriler = ["Tümü", "Pergola", "Kış Bahçesi", "Cam Balkon"];
  const filtreliProjeler =
    aktifKategori === "Tümü"
      ? projeler
      : projeler.filter((p) => p.kategori === aktifKategori);

  const heroArkaPlan = projeler.find((p) => p.gorsel)?.gorsel;
  const kurumsalGorsel = projeler.filter((p) => p.gorsel)[1]?.gorsel || heroArkaPlan;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans scroll-smooth selection:bg-amber-500 selection:text-black">
      
      {/* 1. ŞEFFAF CAM EFEKTLİ ÜST MENÜ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/10 px-6 md:px-12 py-4 flex justify-between items-center">
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-xs flex items-center justify-center tracking-tighter shadow-lg shadow-amber-500/20">
            PY
          </div>
          <div className="text-xl font-black tracking-widest uppercase">
            PRATİK<span className="text-amber-400">YAPI</span>
          </div>
        </a>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-300">
          <a href="#sistemler" className="hover:text-amber-400 transition">Sistemlerimiz</a>
          <a href="#galeri" className="hover:text-amber-400 transition">Projelerimiz</a>
          <a href="#kurumsal" className="hover:text-amber-400 transition">Kurumsal</a>
          <a href="#iletisim" className="hover:text-amber-400 transition">İletişim</a>
        </div>

        <a
          href="#iletisim"
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs md:text-sm px-5 py-2.5 rounded-full transition shadow-lg shadow-amber-500/20"
        >
          Ücretsiz Keşif
        </a>
      </nav>

      {/* 2. TAM EKRAN MİMARİ HERO VİTRİN */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-20 px-6 overflow-hidden">
        {heroArkaPlan && (
          <img
            src={heroArkaPlan}
            alt="Pratik Yapı Pergola Sistemleri"
            className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/85 via-neutral-950/65 to-neutral-950" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="inline-block border border-amber-400/40 bg-amber-500/10 text-amber-300 text-xs font-semibold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6">
            20 Yıllık Mimari & Mühendislik Tecrübesi
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white mb-6">
            Dört Mevsim Yaşayan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600">
              Modern Mekanlar
            </span>
          </h1>

          <p className="text-base sm:text-xl text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Bioklimatik Pergola, Kış Bahçesi ve Motorlu Giyotin Cam Balkon sistemleriyle
            teras, bahçe ve ticari alanlarınıza prestij katıyoruz.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#iletisim"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-xl text-base transition shadow-xl shadow-amber-500/25"
            >
              Hemen Keşif Randevusu Al
            </a>
            <a
              href="#galeri"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-white font-semibold px-8 py-4 rounded-xl text-base transition"
            >
              Tamamlanan Projeleri Gör
            </a>
          </div>
        </div>
      </section>

      {/* 3. MİMARİ GÜVEN & SAYAÇ BANDI */}
      <section className="border-y border-white/10 bg-neutral-900/50 py-10 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl md:text-4xl font-black text-amber-400">20+</p>
            <p className="text-xs md:text-sm text-neutral-400 mt-1 uppercase tracking-wider">Yıllık Tecrübe</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-black text-white">1.500+</p>
            <p className="text-xs md:text-sm text-neutral-400 mt-1 uppercase tracking-wider">Teslim Edilen Proje</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-black text-amber-400">%100</p>
            <p className="text-xs md:text-sm text-neutral-400 mt-1 uppercase tracking-wider">Garantili Malzeme</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-black text-white">4 Mevsim</p>
            <p className="text-xs md:text-sm text-neutral-400 mt-1 uppercase tracking-wider">Tam Isı & Su Yalıtımı</p>
          </div>
        </div>
      </section>

      {/* 4. SİSTEMLERİMİZ (ÜRÜN VİTRİNİ) */}
      <section id="sistemler" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase">Uzmanlık Alanlarımız</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 text-white">Mimari Gölgelendirme & Cam Sistemleri</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 hover:border-amber-500/50 transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-lg mb-6">
                01
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition">
                Bioklimatik & Raylı Pergola
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Uzaktan kumandalı açılır-kapanır alüminyum tavan, gizli LED aydınlatma ve su tahliye kanallarıyla her hava koşuluna tam uyum.
              </p>
            </div>
            <button
              onClick={() => hizmetSecVeGit("Pergola")}
              className="text-left text-sm font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              Bu Sistem İçin Teklif Al →
            </button>
          </div>

          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 hover:border-amber-500/50 transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-lg mb-6">
                02
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition">
                Kış Bahçesi Sistemleri
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Yüksek ısı yalıtımlı cam tavan ve sürme doğramalarla bahçenizi veya terasınızı evinizin en keyifli odasına dönüştürün.
              </p>
            </div>
            <button
              onClick={() => hizmetSecVeGit("Kış Bahçesi")}
              className="text-left text-sm font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              Bu Sistem İçin Teklif Al →
            </button>
          </div>

          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 hover:border-amber-500/50 transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-lg mb-6">
                03
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition">
                Giyotin & Sürme Cam Balkon
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Motorlu giyotin cam, ısıcamlı katlanır ve eşiksiz sürme sistemlerle manzaranızı kesmeden rüzgar ve sesi dışarıda bırakın.
              </p>
            </div>
            <button
              onClick={() => hizmetSecVeGit("Cam Balkon")}
              className="text-left text-sm font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              Bu Sistem İçin Teklif Al →
            </button>
          </div>
        </div>
      </section>

      {/* 5. TAMAMLANMIŞ PROJELER (CANLI GALERİ) */}
      <section id="galeri" className="py-24 px-6 bg-neutral-900/40 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase">Referanslarımız</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 text-white">Tamamlanmış Projeler</h2>
            <p className="text-neutral-400 mt-3 max-w-xl mx-auto text-sm md:text-base">
              Uygulamasını tamamladığımız gerçek projelerimizi inceleyebilir, fotoğraflara tıklayarak detayları büyütebilirsiniz.
            </p>
          </div>

          {projeler.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2.5 mb-12">
              {kategoriler.map((kat) => (
                <button
                  key={kat}
                  onClick={() => setAktifKategori(kat)}
                  className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition cursor-pointer ${
                    aktifKategori === kat
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                      : "bg-neutral-900 text-neutral-300 border border-white/10 hover:border-white/30"
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>
          )}

          {galeriYukleniyor ? (
            <p className="text-center text-neutral-400 text-sm">Projeler yükleniyor...</p>
          ) : filtreliProjeler.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtreliProjeler.map((proje) => (
                <div
                  key={proje.id}
                  onClick={() => setSeciliProje(proje)}
                  className="bg-neutral-900 rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-300 cursor-pointer group"
                >
                  <div className="aspect-[16/10] bg-neutral-800 overflow-hidden relative">
                    {proje.gorsel ? (
                      <img
                        src={proje.gorsel}
                        alt={proje.baslik}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
                        Görsel Yok
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-md border border-white/10 text-amber-400 text-[11px] font-bold px-3 py-1 rounded-full">
                      {proje.kategori}
                    </span>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition">
                      {proje.baslik}
                    </h3>
                    <span className="text-neutral-500 group-hover:text-amber-400 text-sm transition">↗</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-500 text-sm">Henüz proje eklenmedi.</p>
          )}
        </div>
      </section>

      {/* BÜYÜK GÖRSEL PENCERESİ (LIGHTBOX) */}
      {seciliProje && (
        <div
          onClick={() => setSeciliProje(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-900 border border-white/15 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl"
          >
            {seciliProje.gorsel && (
              <img
                src={seciliProje.gorsel}
                alt={seciliProje.baslik}
                className="w-full max-h-[75vh] object-contain bg-black"
              />
            )}
            <div className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {seciliProje.kategori}
                </span>
                <h3 className="font-bold text-lg text-white mt-0.5">{seciliProje.baslik}</h3>
              </div>
              <button
                onClick={() => setSeciliProje(null)}
                className="bg-white text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-neutral-200 cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. KURUMSAL */}
      <section id="kurumsal" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-neutral-900 shadow-2xl">
            {kurumsalGorsel ? (
              <img src={kurumsalGorsel} alt="Pratik Yapı Uygulama" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold">
                PRATİK YAPI MİMARİ
              </div>
            )}
          </div>

          <div>
            <span className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase">Hakkımızda</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6 text-white">
              20 Yıllık Tecrübe, Kusursuz İşçilik
            </h2>
            <p className="text-neutral-300 leading-relaxed mb-4">
              Pratik Yapı olarak, 20 yılı aşkın sektör deneyimimizle yaşam ve ticaret alanlarınıza değer katıyoruz.
              Pergola, kış bahçesi ve cam balkon sistemlerinde statik hesaplamadan montaja kadar her aşamayı kendi uzman ekibimizle yürütüyoruz.
            </p>
            <p className="text-neutral-400 leading-relaxed mb-6">
              Birinci sınıf alüminyum profiller, Avrupa standartlarında motor otomasyonu ve zamanında teslimat garantisiyle çalışıyoruz.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10 text-sm">
              <div className="text-neutral-200 font-semibold">✓ Ücretsiz Yerinde Keşif</div>
              <div className="text-neutral-200 font-semibold">✓ Özel Ölçü & Projelendirme</div>
              <div className="text-neutral-200 font-semibold">✓ Garantili Motor & Aksam</div>
              <div className="text-neutral-200 font-semibold">✓ Hızlı & Temiz Montaj</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. İLETİŞİM & ÜCRETSİZ KEŞİF FORMU */}
      <section id="iletisim" className="py-24 px-6 bg-neutral-900/60 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase">Bize Ulaşın</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 text-white">Ücretsiz Keşif & Fiyat Teklifi</h2>
          </div>

          <div className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 bg-gradient-to-br from-neutral-900 to-neutral-950 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Doğrudan İletişim</h3>
                <p className="text-neutral-400 text-sm mb-8">
                  Projeniz için ölçü ve fiyat bilgisi almak üzere bizi arayabilir veya WhatsApp üzerinden fotoğraf gönderebilirsiniz.
                </p>

                <div className="space-y-4">
                  <a href="tel:+905348752122" className="flex items-center gap-3 text-lg font-semibold text-white hover:text-amber-400 transition">
                    <span className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm">📞</span>
                    +90 534 875 21 22
                  </a>
                  <a href="tel:+905330874097" className="flex items-center gap-3 text-lg font-semibold text-white hover:text-amber-400 transition">
                    <span className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm">📞</span>
                    +90 533 087 40 97
                  </a>
                  <p className="flex items-center gap-3 text-sm text-neutral-300">
                    <span className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm">✉️</span>
                    pratikyapii@gmail.com
                  </p>
                  <p className="flex items-center gap-3 text-sm text-neutral-300">
                    <span className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm">📍</span>
                    Avcılar, İstanbul
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <a
                  href="https://instagram.com/prtyapi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-amber-500 hover:text-black text-white px-5 py-2.5 rounded-xl text-sm font-bold transition"
                >
                  Instagram’da Takip Et (@prtyapi)
                </a>
              </div>
            </div>

            <div className="p-8 md:p-12 flex flex-col justify-center">
              {randevuAlindi ? (
                <div className="text-center bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-2xl">
                  <div className="text-emerald-400 text-5xl mb-3">✓</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Talebiniz Alındı!</h3>
                  <p className="text-neutral-300 text-sm">
                    Sayın <strong>{adSoyad}</strong>, keşif talebiniz ekibimize ulaştı. En kısa sürede sizi arayacağız.
                  </p>
                  <button
                    onClick={() => {
                      setRandevuAlindi(false);
                      setAdSoyad("");
                      setTelefon("");
                    }}
                    className="mt-6 text-xs text-amber-400 underline hover:text-amber-300 cursor-pointer"
                  >
                    Yeni bir talep oluştur
                  </button>
                </div>
              ) : (
                <form className="flex flex-col gap-4">
                  {hataMesaji && (
                    <div className="bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/30 text-xs font-semibold">
                      {hataMesaji}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      value={adSoyad}
                      onChange={(e) => setAdSoyad(e.target.value)}
                      placeholder="Adınız Soyadınız"
                      className="w-full p-3.5 rounded-xl bg-neutral-950 border border-white/10 text-white text-sm focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Telefon Numaranız
                    </label>
                    <input
                      type="tel"
                      value={telefon}
                      onChange={(e) => setTelefon(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full p-3.5 rounded-xl bg-neutral-950 border border-white/10 text-white text-sm focus:border-amber-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                      İlgilendiğiniz Sistem
                    </label>
                    <select
                      value={hizmet}
                      onChange={(e) => setHizmet(e.target.value)}
                      className="w-full p-3.5 rounded-xl bg-neutral-950 border border-white/10 text-white text-sm focus:border-amber-400 outline-none"
                    >
                      <option value="Pergola">Bioklimatik / Raylı Pergola</option>
                      <option value="Kış Bahçesi">Kış Bahçesi Sistemleri</option>
                      <option value="Cam Balkon">Giyotin / Sürme Cam Balkon</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    disabled={gonderiliyor}
                    onClick={randevuGonder}
                    className="mt-3 bg-amber-500 hover:bg-amber-400 text-black p-4 rounded-xl font-bold text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {gonderiliyor ? "Gönderiliyor..." : "Ücretsiz Keşif Talebi Gönder"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 text-center text-xs text-neutral-500 border-t border-white/10">
        © {new Date().getFullYear()} Pratik Yapı — Pergola, Kış Bahçesi & Cam Balkon Sistemleri. Tüm hakları saklıdır.
      </footer>

      {/* 8. SABİT WHATSAPP BUTONU */}
      <a
        href="https://wa.me/905330874097"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 z-50 flex items-center gap-2 text-sm"
        title="WhatsApp İletişim"
      >
        <span className="text-xl">💬</span>
        <span>WhatsApp</span>
      </a>
    </div>
  );
}