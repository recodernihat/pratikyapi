"use client";

import React, { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

interface Proje {
  id: string;
  baslik: string;
  kategori: string;
  gorsel?: string;
}

interface SistemBilgi {
  id: string;
  kod: string;
  kategoriAdi: string;
  baslik: string;
  altBaslik: string;
  aciklama: string;
  ozellikler: string[];
  teknikDetaylar: { etiket: string; deger: string }[];
  renkSecenekleri: { ad: string; hex: string }[];
}

const SISTEMLER: SistemBilgi[] = [
  {
    id: "pergola",
    kod: "01",
    kategoriAdi: "Pergola",
    baslik: "Bioklimatik & Raylı Pergola",
    altBaslik: "Akıllı Tavan Teknolojisi",
    aciklama:
      "Kendi ekseni etrafında dönen veya geriye toplanabilen alüminyum panellerle güneş ışığını ve havalandırmayı tek tuşla kontrol edin. Gizli yağmur deresi ve entegre LED aydınlatma ile dört mevsim kesintisiz konfor sağlar.",
    ozellikler: [
      "Somfy / Becker Uzaktan Kumandalı Motor",
      "Dimmerli Gizli Günışığı & Beyaz LED",
      "Gizli Su Tahliye & Yağmur Yalıtımı",
      "120 km/s Rüzgar ve Yüksek Kar Yükü Dayanımı",
    ],
    teknikDetaylar: [
      { etiket: "Profil Malzemesi", deger: "6063-T6 Ekstrüzyon Alüminyum" },
      { etiket: "Boya Standardı", deger: "Qualicoat Elektrostatik Toz Boya" },
      { etiket: "Otomasyon", deger: "Uzaktan Kumanda + Akıllı Telefon Kontrolü" },
      { etiket: "Garanti Süresi", deger: "5 Yıl Motor & Mekanik Sistem Garantisi" },
    ],
    renkSecenekleri: [
      { ad: "Antrasit Gri (RAL 7016)", hex: "#2f353b" },
      { ad: "Mat Siyah (RAL 9005)", hex: "#141414" },
      { ad: "Altın Meşe Ahşap", hex: "#8b5a2b" },
      { ad: "Krem Beyaz (RAL 9016)", hex: "#e5e5e0" },
    ],
  },
  {
    id: "kis-bahcesi",
    kod: "02",
    kategoriAdi: "Kış Bahçesi",
    baslik: "Isı Yalıtımlı Kış Bahçesi",
    altBaslik: "Dört Mevsim Yaşam Alanı",
    aciklama:
      "Evinizin bahçesini, terasını veya işletmenizin açık alanını yüksek ısı ve ses yalıtımlı cam tavan ve sürme sistemlerle kapatarak 365 gün keyifle kullanabileceğiniz ferah bir odaya dönüştürün.",
    ozellikler: [
      "Isıcam Konfor & Güneş Kontrollü Cam Tavan",
      "Isı Bariyerli Alüminyum Taşıyıcı Sistem",
      "Sürme, Katlanır veya Giyotin Cam Entegrasyonu",
      "Yoğuşma Önleyici Özel Fitil ve Tahliye Kanalları",
    ],
    teknikDetaylar: [
      { etiket: "Cam Kombinasyonu", deger: "4+16+4 mm Temperli Isıcam Sinerji" },
      { etiket: "Isı Yalıtımı", deger: "EPDM Çift Contalı Tam Sızdırmazlık" },
      { etiket: "Taşıyıcı Statik", deger: "Gizli Çelik Takviyeli Alüminyum Konstrüksiyon" },
      { etiket: "Teslimat", deger: "Özel Ölçü Projelendirme & Hızlı Montaj" },
    ],
    renkSecenekleri: [
      { ad: "Antrasit Gri (RAL 7016)", hex: "#2f353b" },
      { ad: "Bronz Eloksal", hex: "#4a3c31" },
      { ad: "Mat Siyah (RAL 9005)", hex: "#141414" },
      { ad: "Ceviz Ahşap Kaplama", hex: "#5c3a21" },
    ],
  },
  {
    id: "cam-balkon",
    kod: "03",
    kategoriAdi: "Cam Balkon",
    baslik: "Motorlu Giyotin & Sürme Cam",
    altBaslik: "Panoramik Kesintisiz Manzara",
    aciklama:
      "Dikey hareketli motorlu giyotin cam sistemleri, eşiksiz sürme ve katlanır cam balkon çözümleriyle manzaranızı bölmeden rüzgar, yağmur ve dış ortam gürültüsünü tamamen dışarıda bırakın.",
    ozellikler: [
      "Zincirli & Sessiz Motorlu Giyotin Sistem",
      "Küpeşte Görevini Gören Sabit Alt Panel",
      "Eşiksiz Geçiş Sağlayan Paslanmaz Rulmanlı Sürme",
      "Çocuk Emniyet Kilidi ve Darbe Dayanımlı Temperli Cam",
    ],
    teknikDetaylar: [
      { etiket: "Cam Kalınlığı", deger: "8 mm / 10 mm Temperli veya Isıcamlı" },
      { etiket: "Cam Renkleri", deger: "Şeffaf, Füme, Bronz ve Reflekte Cam" },
      { etiket: "Hareket Mekanizması", deger: "Çelik Zincir & Sessiz Rulmanı Taşıyıcı" },
      { etiket: "Kullanım Alanı", deger: "Balkon, Teras, Kafe & Restoran Cepheleri" },
    ],
    renkSecenekleri: [
      { ad: "Antrasit Profil + Füme Cam", hex: "#2f353b" },
      { ad: "Siyah Profil + Şeffaf Cam", hex: "#18181b" },
      { ad: "Eloksal Gri + Bronz Cam", hex: "#71717a" },
      { ad: "Ahşap Desen + Sinerji Cam", hex: "#784b2a" },
    ],
  },
];

const SSS_LISTESI = [
  {
    soru: "Pergola ve kış bahçesi sistemleri için belediye ruhsatı gerekir mi?",
    cevap:
      "Açılır-kapanır hareketli tente, bioklimatik pergola ve katlanır/sürme cam balkon sistemleri sabit betonarme yapı sınıfına girmediği için çoğu projede ruhsat gerektirmez. Keşif ekibimiz mekanınıza özel en uygun çözümü yerinde planlar.",
  },
  {
    soru: "Kış aylarında yoğun yağmur, rüzgar ve kar yüküne dayanıklı mı?",
    cevap:
      "Evet. Kullanılan 6063-T6 kalın etli alüminyum profiller, paslanmaz çelik bağlantı elemanları ve gizli su tahliye kanalları sayesinde şiddetli yağış, fırtına ve kar yüküne karşı tam dayanım sağlar.",
  },
  {
    soru: "Keşif ve ölçülendirme hizmeti ücretli mi?",
    cevap:
      "İstanbul genelinde yerinde keşif, lazer ölçülendirme ve teknik projelendirme hizmetimiz tamamen ücretsizdir. Ekibimiz adresinize gelerek alanınıza en uygun modeli ve net fiyat teklifini sunar.",
  },
  {
    soru: "Siparişten sonra üretim ve montaj ne kadar sürer?",
    cevap:
      "Ölçü alımının ardından projenin metrekaresine ve seçilen boya/cam özelliklerine bağlı olarak ortalama 7 ila 14 iş günü içerisinde üretim tamamlanır ve uzman ekibimizce 1-2 gün içinde montajı yapılır.",
  },
  {
    soru: "Motor ve aydınlatma sistemlerinin garantisi var mı?",
    cevap:
      "Tüm projelerimizde Avrupa standartlarında sertifikalı motor ve LED otomasyon sistemleri kullanıyoruz. Tüm mekanik aksam, motor ve su sızdırmazlık uygulamalarımız Pratik Yapı garantisi altındadır.",
  },
];

const MUSTERI_YORUMLARI = [
  {
    ad: "Murat K.",
    konum: "Beylikdüzü / Villa Teras",
    sistem: "Bioklimatik Pergola",
    yorum:
      "Terasımız yazın sıcaktan, kışın yağmurdan hiç kullanılmıyordu. Pratik Yapı ekibi tam söz verdikleri günde gelip tertemiz montaj yaptı. Akşam LED ışıklarıyla evin en sevdiğimiz yeri oldu.",
  },
  {
    ad: "Selin & Emre T.",
    konum: "Bahçeşehir / Müstakil Ev",
    sistem: "Isı Yalıtımlı Kış Bahçesi",
    yorum:
      "Kışın ortasında bile içerisi sıcacık, en ufak bir su alma veya rüzgar sesi yok. İşçilik kalitesi ve malzeme kalınlığı piyasada baktığımız diğer firmalardan çok farklı.",
  },
  {
    ad: "Hakan D.",
    konum: "Avcılar / Kafe İşletmesi",
    sistem: "Motorlu Giyotin Cam & Pergola",
    yorum:
      "Mekanımızın ön cephesini komple giyotin cam ve ışıklı pergola yaptırdık. Tek kumandayla açıp kapatıyoruz, müşteri kapasitemiz kış aylarında bile hiç düşmedi.",
  },
];

// Yumuşak Scroll Reveal Bileşeni
function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [gorundu, setGorundu] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGorundu(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const baslangicSinifi =
    direction === "left"
      ? "opacity-0 -translate-x-10"
      : direction === "right"
      ? "opacity-0 translate-x-10"
      : direction === "scale"
      ? "opacity-0 scale-95"
      : "opacity-0 translate-y-10";

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`transition-all duration-1000 ${
        gorundu ? "opacity-100 translate-x-0 translate-y-0 scale-100" : baslangicSinifi
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Animasyonlu Sayaç Bileşeni
function AnimatedCounter({
  hedef,
  sonEk = "",
  onEk = "",
}: {
  hedef: number;
  sonEk?: string;
  onEk?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [deger, setDeger] = useState(0);
  const [basladi, setBasladi] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !basladi) {
          setBasladi(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [basladi]);

  useEffect(() => {
    if (!basladi) return;
    const sure = 1600;
    const baslangic = performance.now();

    const adim = (simdi: number) => {
      const gecen = simdi - baslangic;
      const oran = Math.min(gecen / sure, 1);
      const yumusak = 1 - Math.pow(1 - oran, 3);
      setDeger(Math.floor(yumusak * hedef));
      if (oran < 1) requestAnimationFrame(adim);
    };
    requestAnimationFrame(adim);
  }, [basladi, hedef]);

  return (
    <span ref={ref}>
      {onEk}
      {deger.toLocaleString("tr-TR")}
      {sonEk}
    </span>
  );
}

// 3D Tilt & Spotlight Kart Bileşeni
function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [stil, setStil] = useState<React.CSSProperties>({});

  const fareHareket = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    setStil({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
      backgroundImage: `radial-gradient(circle at ${x}px ${y}px, rgba(245, 158, 11, 0.08), transparent 60%)`,
    });
  };

  const fareCikis = () => {
    setStil({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={fareHareket}
      onMouseLeave={fareCikis}
      style={stil}
      className={`transition-transform duration-300 ease-out ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  // Açılış Perdesi
  const [perdeAcildi, setPerdeAcildi] = useState(false);

  // Scroll & Progress State
  const [kaydirildi, setKaydirildi] = useState(false);
  const [scrollYuzde, setScrollYuzde] = useState(0);
  const [mobilMenuAcik, setMobilMenuAcik] = useState(false);

  // Hero Slider State
  const [heroIndex, setHeroIndex] = useState(0);

  // Canlı İnteraktif Sistem Simülatörü State
  const [simLamelAciklik, setSimLamelAciklik] = useState(35); // 0 - 100
  const [simLedAcik, setSimLedAcik] = useState(true);
  const [simGiyotinKapali, setSimGiyotinKapali] = useState(70); // 0 - 100
  const [simKasaRengi, setSimKasaRengi] = useState<"antrasit" | "siyah" | "ahsap">("antrasit");

  // Firestore Galeri State
  const [projeler, setProjeler] = useState<Proje[]>([]);
  const [galeriYukleniyor, setGaleriYukleniyor] = useState(true);
  const [aktifKategori, setAktifKategori] = useState("Tümü");
  const [galeriGecis, setGaleriGecis] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Teknik Detay Modal State
  const [seciliSistemModal, setSeciliSistemModal] = useState<SistemBilgi | null>(null);

  // Keşif Sihirbazı State
  const [sihirbazSistem, setSihirbazSistem] = useState("Pergola");
  const [sihirbazMetrekare, setSihirbazMetrekare] = useState(28);
  const [sihirbazEkstralar, setSihirbazEkstralar] = useState<string[]>([
    "Gizli Günışığı LED",
    "Uzaktan Kumanda",
  ]);

  // SSS Accordion State
  const [acikSssIndex, setAcikSssIndex] = useState<number | null>(0);

  // Randevu Form State
  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");
  const [hizmet, setHizmet] = useState("Pergola");
  const [randevuAlindi, setRandevuAlindi] = useState(false);
  const [hataMesaji, setHataMesaji] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  // Açılış perdesi zamanlayıcısı
  useEffect(() => {
    const t = setTimeout(() => setPerdeAcildi(true), 650);
    return () => clearTimeout(t);
  }, []);

  // Firestore'dan projeleri çek
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

  // Scroll & İlerleme Çubuğu Dinleyicisi
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setKaydirildi(y > 40);
      const toplamYukseklik =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (toplamYukseklik > 0) {
        setScrollYuzde(Math.min(100, Math.round((y / toplamYukseklik) * 100)));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hero görselleri otomatik geçiş
  const gorselliProjeler = projeler.filter((p) => p.gorsel);
  useEffect(() => {
    if (gorselliProjeler.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(gorselliProjeler.length, 6));
    }, 5000);
    return () => clearInterval(timer);
  }, [gorselliProjeler.length]);

  const kategoriler = ["Tümü", "Pergola", "Kış Bahçesi", "Cam Balkon"];
  const filtreliProjeler =
    aktifKategori === "Tümü"
      ? projeler
      : projeler.filter((p) => p.kategori === aktifKategori);

  const kategoriDegistir = (kat: string) => {
    if (kat === aktifKategori) return;
    setGaleriGecis(true);
    setTimeout(() => {
      setAktifKategori(kat);
      setGaleriGecis(false);
    }, 180);
  };

  // Lightbox klavye kontrolü
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % filtreliProjeler.length : null
        );
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null
            ? (prev - 1 + filtreliProjeler.length) % filtreliProjeler.length
            : null
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, filtreliProjeler.length]);

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

  const formaGit = (secilenHizmet: string) => {
    setHizmet(secilenHizmet);
    setSeciliSistemModal(null);
    setLightboxIndex(null);
    setMobilMenuAcik(false);
    document.getElementById("iletisim")?.scrollIntoView({ behavior: "smooth" });
  };

  const ekstraSecToggle = (ekstra: string) => {
    setSihirbazEkstralar((prev) =>
      prev.includes(ekstra) ? prev.filter((item) => item !== ekstra) : [...prev, ekstra]
    );
  };

  const sihirbaziFormaAktar = () => {
    const ozet =
      sihirbazEkstralar.length > 0
        ? `${sihirbazSistem} (${sihirbazMetrekare} m² • ${sihirbazEkstralar.join(", ")})`
        : `${sihirbazSistem} (${sihirbazMetrekare} m²)`;
    formaGit(ozet);
  };

  const vitrinGorselleri = gorselliProjeler.slice(0, 6);
  const kurumsalGorsel = gorselliProjeler[1]?.gorsel || gorselliProjeler[0]?.gorsel;
  const aktifLightboxProje =
    lightboxIndex !== null ? filtreliProjeler[lightboxIndex] : null;

  const kasaRenkKodu =
    simKasaRengi === "antrasit"
      ? "#2d3339"
      : simKasaRengi === "siyah"
      ? "#141416"
      : "#7c4d2b";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans scroll-smooth selection:bg-amber-500 selection:text-black overflow-x-hidden">
      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.09) translate(-1.2%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        .animate-kenburns {
          animation: kenburns 20s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 5s linear infinite;
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: floatY 3.5s ease-in-out infinite;
        }
      `}</style>

      {/* AÇILIŞ MİMARİ PERDE ANİMASYONU */}
      <div
        className={`fixed inset-0 z-[100] bg-neutral-950 flex flex-col items-center justify-center pointer-events-none transition-all duration-1000 ease-in-out ${
          perdeAcildi ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-base flex flex-col items-center justify-center leading-none shadow-2xl shadow-amber-500/30 mb-4">
          <span>PRATİK</span>
          <span className="text-[10px] tracking-widest mt-1">YAPI</span>
        </div>
        <div className="text-xl font-black tracking-[0.35em] text-white uppercase">
          PRATİK<span className="text-amber-400">YAPI</span>
        </div>
        <div className="w-40 h-0.5 bg-neutral-800 mt-4 overflow-hidden rounded-full">
          <div className="h-full bg-amber-400 w-full transition-transform duration-700 origin-left" />
        </div>
      </div>

      {/* ÜST ALTIN SCROLL İLERLEME ÇİZGİSİ */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 transition-all duration-150"
          style={{ width: `${scrollYuzde}%` }}
        />
      </div>

      {/* 1. ÜST MİKRO BİLGİ ŞERİDİ */}
      <div className="bg-neutral-900 border-b border-white/10 text-[11px] text-neutral-400 py-2 px-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span>📍 Avcılar, İstanbul — Tüm İstanbul’a Ücretsiz Yerinde Keşif</span>
            <span>🛡️ 20 Yıllık Sektör Tecrübesi & 5 Yıl Sistem Garantisi</span>
          </div>
          <div className="flex items-center gap-5 font-medium">
            <a href="tel:+905348752122" className="hover:text-amber-400 transition">
              📞 +90 534 875 21 22
            </a>
            <a href="tel:+905330874097" className="hover:text-amber-400 transition">
              📞 +90 533 087 40 97
            </a>
          </div>
        </div>
      </div>

      {/* 2. DİNAMİK CAM EFEKTLİ NAVBAR */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 px-6 md:px-12 ${
          kaydirildi
            ? "bg-neutral-950/90 backdrop-blur-xl border-b border-white/10 py-3.5 shadow-2xl shadow-black/70"
            : "bg-neutral-950/60 backdrop-blur-md border-b border-white/5 py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-black font-black text-xs flex flex-col items-center justify-center leading-none shadow-lg shadow-amber-500/20 group-hover:rotate-3 group-hover:scale-105 transition-all duration-300">
              <span>PRATİK</span>
              <span className="text-[8px] tracking-widest mt-0.5">YAPI</span>
            </div>
            <div>
              <div className="text-xl font-black tracking-widest uppercase leading-none">
                PRATİK<span className="text-amber-400">YAPI</span>
              </div>
              <p className="text-[10px] text-neutral-400 tracking-[0.22em] uppercase mt-1">
                Pergola & Cam Sistemleri
              </p>
            </div>
          </a>

          <div className="hidden lg:flex items-center space-x-7 text-sm font-medium text-neutral-300">
            <a href="#sistemler" className="hover:text-amber-400 transition-colors relative py-1 group">
              Sistemlerimiz
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#simulator" className="hover:text-amber-400 transition-colors relative py-1 group">
              Canlı Simülatör
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#galeri" className="hover:text-amber-400 transition-colors relative py-1 group">
              Projelerimiz
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#sihirbaz" className="hover:text-amber-400 transition-colors relative py-1 group">
              Keşif Planlayıcı
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#kurumsal" className="hover:text-amber-400 transition-colors relative py-1 group">
              Kurumsal
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#sss" className="hover:text-amber-400 transition-colors relative py-1 group">
              S.S.S
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#iletisim"
              className="hidden sm:inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs md:text-sm px-5 py-2.5 rounded-full transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-95"
            >
              <span>Ücretsiz Keşif Al</span>
              <span>→</span>
            </a>

            <button
              onClick={() => setMobilMenuAcik(!mobilMenuAcik)}
              className="lg:hidden bg-white/10 hover:bg-white/15 border border-white/10 p-2.5 rounded-xl text-white cursor-pointer"
              aria-label="Menü"
            >
              {mobilMenuAcik ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobil Açılır Menü */}
        {mobilMenuAcik && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-3 text-sm font-semibold text-neutral-200 pb-2">
            <a href="#sistemler" onClick={() => setMobilMenuAcik(false)} className="py-1.5 hover:text-amber-400">
              Sistemlerimiz
            </a>
            <a href="#simulator" onClick={() => setMobilMenuAcik(false)} className="py-1.5 hover:text-amber-400">
              Canlı Pergola & Cam Simülatörü
            </a>
            <a href="#galeri" onClick={() => setMobilMenuAcik(false)} className="py-1.5 hover:text-amber-400">
              Tamamlanmış Projeler
            </a>
            <a href="#sihirbaz" onClick={() => setMobilMenuAcik(false)} className="py-1.5 hover:text-amber-400">
              Keşif & Fiyat Planlayıcı
            </a>
            <a href="#kurumsal" onClick={() => setMobilMenuAcik(false)} className="py-1.5 hover:text-amber-400">
              Kurumsal
            </a>
            <a href="#sss" onClick={() => setMobilMenuAcik(false)} className="py-1.5 hover:text-amber-400">
              Sıkça Sorulan Sorular
            </a>
            <a
              href="#iletisim"
              onClick={() => setMobilMenuAcik(false)}
              className="bg-amber-500 text-black text-center py-3 rounded-xl font-bold mt-1"
            >
              Hemen Randevu Al
            </a>
          </div>
        )}
      </nav>

      {/* 3. SİNEMATİK KEN BURNS HERO VİTRİN */}
      <section className="relative min-h-[93vh] flex items-center justify-center px-6 py-24 overflow-hidden">
        {vitrinGorselleri.length > 0 ? (
          vitrinGorselleri.map((item, idx) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === heroIndex ? "opacity-45" : "opacity-0"
              }`}
            >
              <img
                src={item.gorsel}
                alt={item.baslik}
                className="w-full h-full object-cover animate-kenburns"
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-neutral-950 to-neutral-950" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-neutral-950/55 to-neutral-950" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 delay-200 ${
              perdeAcildi ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="inline-flex items-center gap-2.5 border border-amber-400/35 bg-amber-500/10 backdrop-blur-md text-amber-300 text-xs font-bold tracking-[0.22em] uppercase px-5 py-2 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>20 Yıllık Mimari Uygulama & Mühendislik</span>
            </div>
          </div>

          <h1
            className={`text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.07] text-white mb-6 transition-all duration-1000 delay-300 ${
              perdeAcildi ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Mekanlarınıza Değer Katan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 animate-shimmer">
              Bioklimatik & Cam Sistemleri
            </span>
          </h1>

          <p
            className={`text-base sm:text-xl text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-1000 delay-500 ${
              perdeAcildi ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Işıklı otomatik pergola, dört mevsim ısı yalıtımlı kış bahçesi ve motorlu giyotin cam balkon çözümleriyle teras ve bahçelerinizi yeniden tasarlıyoruz.
          </p>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-700 ${
              perdeAcildi ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <a
              href="#iletisim"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-xl text-base transition-all duration-300 shadow-2xl shadow-amber-500/30 hover:-translate-y-1"
            >
              Ücretsiz Keşif Randevusu Al
            </a>
            <a
              href="#simulator"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-300 hover:-translate-y-1"
            >
              Canlı Sistemi Test Et ✦
            </a>
          </div>

          {/* Vitrin Slayt Kontrolleri */}
          {vitrinGorselleri.length > 1 && (
            <div className="mt-14 flex flex-col items-center gap-2.5">
              <div className="flex items-center gap-2">
                {vitrinGorselleri.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      idx === heroIndex
                        ? "w-12 bg-amber-400"
                        : "w-3 bg-white/25 hover:bg-white/50"
                    }`}
                    aria-label={item.baslik}
                  />
                ))}
              </div>
              <span className="text-[11px] text-neutral-400 tracking-wider">
                {vitrinGorselleri[heroIndex]?.kategori} • {vitrinGorselleri[heroIndex]?.baslik}
              </span>
            </div>
          )}

          {/* Aşağı Kaydır İndikatörü */}
          <div className="mt-10 hidden sm:flex justify-center">
            <a
              href="#sistemler"
              className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-1.5 text-amber-400 animate-float"
              aria-label="Aşağı Kaydır"
            >
              <span className="w-1 h-2 bg-amber-400 rounded-full" />
            </a>
          </div>
        </div>
      </section>

      {/* 4. ANİMASYONLU GÜVEN & SAYAÇ ŞERİDİ */}
      <section className="border-y border-white/10 bg-neutral-900/50 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Reveal delay={0}>
            <p className="text-3xl md:text-5xl font-black text-amber-400">
              <AnimatedCounter hedef={20} sonEk="+" />
            </p>
            <p className="text-xs text-neutral-400 mt-2 uppercase tracking-widest">Yıllık Tecrübe</p>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-3xl md:text-5xl font-black text-white">
              <AnimatedCounter hedef={1500} sonEk="+" />
            </p>
            <p className="text-xs text-neutral-400 mt-2 uppercase tracking-widest">Teslim Edilen Proje</p>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-3xl md:text-5xl font-black text-amber-400">
              <AnimatedCounter hedef={5} sonEk=" Yıl" />
            </p>
            <p className="text-xs text-neutral-400 mt-2 uppercase tracking-widest">Motor & Sistem Garantisi</p>
          </Reveal>
          <Reveal delay={300}>
            <p className="text-3xl md:text-5xl font-black text-white">
              <AnimatedCounter hedef={100} onEk="%" />
            </p>
            <p className="text-xs text-neutral-400 mt-2 uppercase tracking-widest">Su & Isı Yalıtımı</p>
          </Reveal>
        </div>
      </section>

      {/* 5. 3D EĞİMLİ SİSTEM KARTLARI */}
      <section id="sistemler" className="py-24 px-6 max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
            Mimari Çözümlerimiz
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-white">
            Üst Segment Gölgelendirme & Cam Sistemleri
          </h2>
          <p className="text-neutral-400 mt-4 max-w-2xl mx-auto text-sm md:text-base">
            Her mekanın mimari yapısına özel statik projelendirme, birinci sınıf alüminyum profiller ve sessiz otomasyon teknolojisi.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {SISTEMLER.map((sistem, idx) => {
            const kategoriGorseli = projeler.find(
              (p) => p.kategori === sistem.kategoriAdi && p.gorsel
            )?.gorsel;

            return (
              <Reveal key={sistem.id} delay={idx * 140}>
                <TiltCard className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden hover:border-amber-500/50 flex flex-col h-full group shadow-2xl">
                  <div className="relative h-56 bg-neutral-800 overflow-hidden">
                    {kategoriGorseli ? (
                      <img
                        src={kategoriGorseli}
                        alt={sistem.baslik}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-neutral-600 font-black text-4xl">
                        {sistem.kod}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/25 to-transparent" />
                    <span className="absolute top-4 left-4 bg-black/75 backdrop-blur-md border border-white/15 text-amber-400 font-black text-xs px-3.5 py-1.5 rounded-full">
                      {sistem.kod} • {sistem.altBaslik}
                    </span>
                  </div>

                  <div className="p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                        {sistem.baslik}
                      </h3>
                      <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                        {sistem.aciklama}
                      </p>

                      <ul className="space-y-2.5 mb-8 border-t border-white/10 pt-5">
                        {sistem.ozellikler.map((oz) => (
                          <li key={oz} className="flex items-start gap-2.5 text-xs text-neutral-300">
                            <span className="text-amber-400 font-bold mt-0.5">✓</span>
                            <span>{oz}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => setSeciliSistemModal(sistem)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 px-3 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Teknik & Renkler
                      </button>
                      <button
                        onClick={() => formaGit(sistem.kategoriAdi)}
                        className="bg-amber-500 hover:bg-amber-400 text-black py-3 px-3 rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-amber-500/15"
                      >
                        Teklif Al →
                      </button>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 6. CANLI İNTERAKTİF BİOKLİMATİK PERGOLA & GİYOTİN CAM SİMÜLATÖRÜ */}
      <section id="simulator" className="py-24 px-6 bg-neutral-900/50 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
              İnteraktif Deneyim
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-white">
              Canlı Pergola & Giyotin Cam Kontrolü
            </h2>
            <p className="text-neutral-400 mt-3 max-w-2xl mx-auto text-sm md:text-base">
              Sistemlerimizin çalışma mantığını canlı test edin: Tavan lamellerini döndürün, LED aydınlatmayı açın ve giyotin camı hareket ettirin.
            </p>
          </Reveal>

          <Reveal>
            <div className="bg-neutral-950 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Sol: Canlı Mimari Sahne */}
              <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-white/10 h-[340px] sm:h-[400px] bg-gradient-to-b from-slate-900 via-slate-800 to-neutral-900 flex flex-col justify-between p-6 select-none">
                {/* Gökyüzü / Güneş Işığı Efekti */}
                <div
                  className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
                  style={{
                    opacity: simLamelAciklik / 100,
                    background:
                      "radial-gradient(circle at 50% 0%, rgba(253, 224, 71, 0.35), transparent 70%)",
                  }}
                />

                {/* LED Aydınlatma Ortam Parlaması */}
                <div
                  className="absolute inset-x-10 top-14 h-44 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none"
                  style={{
                    opacity: simLedAcik ? 0.55 : 0,
                    background: "rgba(251, 191, 36, 0.55)",
                  }}
                />

                {/* Üst Bilgi Rozetleri */}
                <div className="relative z-20 flex items-center justify-between text-[11px] font-bold">
                  <span className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-neutral-300">
                    Tavan Açıklığı: %{simLamelAciklik}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full border transition ${
                      simLedAcik
                        ? "bg-amber-500/20 border-amber-400 text-amber-300"
                        : "bg-black/60 border-white/10 text-neutral-500"
                    }`}
                  >
                    LED: {simLedAcik ? "AÇIK" : "KAPALI"}
                  </span>
                </div>

                {/* Mimari Pergola + Giyotin Cam Konstrüksiyon Çizimi */}
                <div className="relative z-10 my-auto mx-auto w-full max-w-lg">
                  {/* Üst Ana Taşıyıcı Kiriş & Dönen Lameller */}
                  <div
                    className="h-7 rounded-t-lg border-b border-white/15 flex items-center justify-around px-3 shadow-xl transition-colors duration-500 relative"
                    style={{ backgroundColor: kasaRenkKodu }}
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          transform: `rotate(${simLamelAciklik * 0.75}deg)`,
                          backgroundColor: kasaRenkKodu,
                        }}
                        className="w-5 h-2.5 border border-white/25 rounded-xs transition-transform duration-300 shadow"
                      />
                    ))}

                    {/* Entegre LED Şerit Işığı */}
                    <div
                      className={`absolute -bottom-1 left-3 right-3 h-1 rounded-full transition-all duration-500 ${
                        simLedAcik
                          ? "bg-amber-300 shadow-[0_4px_20px_rgba(251,191,36,0.95)] opacity-100"
                          : "bg-neutral-700 opacity-30"
                      }`}
                    />
                  </div>

                  {/* Orta Alan: Kolonlar & Hareketli Giyotin Cam */}
                  <div className="relative h-44 flex justify-between px-2">
                    {/* Sol Alüminyum Kolon */}
                    <div
                      className="w-4 h-full transition-colors duration-500 shadow-lg"
                      style={{ backgroundColor: kasaRenkKodu }}
                    />

                    {/* Ortadaki Cam Alanı */}
                    <div className="flex-1 relative overflow-hidden border-x border-white/10 bg-white/[0.02]">
                      {/* Hareketli Üst Giyotin Cam Kanadı */}
                      <div
                        style={{
                          transform: `translateY(${(simGiyotinKapali - 100) * 0.65}%)`,
                        }}
                        className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-sky-200/20 to-sky-100/10 border-b-2 border-white/40 backdrop-blur-[1px] transition-transform duration-500 flex items-end justify-center pb-1"
                      >
                        <span className="text-[9px] text-white/50 tracking-widest uppercase">
                          Motorlu Giyotin Cam
                        </span>
                      </div>

                      {/* Sabit Alt Küpeşte Camı */}
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-sky-200/15 border-t-2 border-white/30 flex items-center justify-center">
                        <span className="text-[9px] text-white/40 tracking-widest uppercase">
                          Sabit Alt Cam Küpeşte
                        </span>
                      </div>
                    </div>

                    {/* Sağ Alüminyum Kolon */}
                    <div
                      className="w-4 h-full transition-colors duration-500 shadow-lg"
                      style={{ backgroundColor: kasaRenkKodu }}
                    />
                  </div>

                  {/* Teras Zemini */}
                  <div className="h-4 rounded-b-lg bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 border-t border-white/15 shadow-2xl" />
                </div>

                <p className="relative z-20 text-center text-[11px] text-neutral-400">
                  * Sağdaki kumanda panelinden sistem hareketlerini canlı kontrol edebilirsiniz.
                </p>
              </div>

              {/* Sağ: Uzaktan Kumanda Kontrol Paneli */}
              <div className="lg:col-span-5 space-y-6 bg-neutral-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                      Akıllı Kumanda Paneli
                    </span>
                    <h3 className="text-lg font-bold text-white">Sistem Kontrolleri</h3>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {/* Tavan Lamel Kontrolü */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-neutral-300">Tavan Lamel Açısı</span>
                    <span className="text-amber-400">%{simLamelAciklik}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={simLamelAciklik}
                    onChange={(e) => setSimLamelAciklik(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                    <span>Tam Kapalı (Yağmur Modu)</span>
                    <span>Tam Açık (Güneş Modu)</span>
                  </div>
                </div>

                {/* Giyotin Cam Kontrolü */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-neutral-300">Giyotin Cam Kapanma</span>
                    <span className="text-amber-400">%{simGiyotinKapali}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={simGiyotinKapali}
                    onChange={(e) => setSimGiyotinKapali(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                    <span>Açık Havalandırma</span>
                    <span>Tam Kapalı Yalıtım</span>
                  </div>
                </div>

                {/* LED Aydınlatma & Kasa Rengi */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setSimLedAcik(!simLedAcik)}
                    className={`py-3 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      simLedAcik
                        ? "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20"
                        : "bg-neutral-950 text-neutral-300 border-white/10"
                    }`}
                  >
                    💡 LED Işık: {simLedAcik ? "Açık" : "Kapalı"}
                  </button>

                  <div className="bg-neutral-950 border border-white/10 rounded-xl p-2 flex items-center justify-around">
                    {[
                      { id: "antrasit", color: "#2d3339", title: "Antrasit" },
                      { id: "siyah", color: "#141416", title: "Siyah" },
                      { id: "ahsap", color: "#7c4d2b", title: "Ahşap" },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSimKasaRengi(r.id as "antrasit" | "siyah" | "ahsap")}
                        title={r.title}
                        style={{ backgroundColor: r.color }}
                        className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${
                          simKasaRengi === r.id ? "border-amber-400 scale-110" : "border-white/25"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => formaGit("Bioklimatik Pergola & Giyotin Cam")}
                  className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-3.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Bu Kombinasyon İçin Keşif İste →
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7. TAMAMLANMIŞ PROJELER (ANİMASYONLU FİLTRELİ CANLI GALERİ) */}
      <section id="galeri" className="py-24 px-6 max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          <span className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
            Referans Galerimiz
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-white">
            Tamamlanmış Projeler
          </h2>
          <p className="text-neutral-400 mt-3 max-w-xl mx-auto text-sm md:text-base">
            Teslim ettiğimiz gerçek uygulamalarımızdan kareler. Detaylı incelemek için fotoğraflara tıklayın.
          </p>
        </Reveal>

        {projeler.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2.5 mb-12">
            {kategoriler.map((kat) => {
              const adet =
                kat === "Tümü"
                  ? projeler.length
                  : projeler.filter((p) => p.kategori === kat).length;
              return (
                <button
                  key={kat}
                  onClick={() => kategoriDegistir(kat)}
                  className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 cursor-pointer ${
                    aktifKategori === kat
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25 scale-105"
                      : "bg-neutral-900 text-neutral-300 border border-white/10 hover:border-white/30"
                  }`}
                >
                  {kat} ({adet})
                </button>
              );
            })}
          </div>
        )}

        {galeriYukleniyor ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-neutral-900 rounded-2xl h-72 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filtreliProjeler.length > 0 ? (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 ${
              galeriGecis ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"
            }`}
          >
            {filtreliProjeler.map((proje, idx) => (
              <div
                key={proje.id}
                onClick={() => setLightboxIndex(idx)}
                className="bg-neutral-900 rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-500 cursor-pointer group shadow-lg hover:-translate-y-2"
              >
                <div className="aspect-[16/10] bg-neutral-800 overflow-hidden relative">
                  {proje.gorsel ? (
                    <img
                      src={proje.gorsel}
                      alt={proje.baslik}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
                      Görsel Yok
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                  <span className="absolute top-3.5 left-3.5 bg-neutral-950/85 backdrop-blur-md border border-white/15 text-amber-400 text-[11px] font-bold px-3.5 py-1 rounded-full">
                    {proje.kategori}
                  </span>
                  <span className="absolute bottom-3.5 right-3.5 w-9 h-9 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    ⤢
                  </span>
                </div>
                <div className="p-5 flex items-center justify-between gap-2">
                  <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors truncate">
                    {proje.baslik}
                  </h3>
                  <span className="text-neutral-500 group-hover:text-amber-400 text-sm transition shrink-0">
                    İncele →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-neutral-500 text-sm py-10">
            Bu kategoride henüz proje bulunmuyor.
          </p>
        )}
      </section>

      {/* 8. İNTERAKTİF PROJE KEŞİF SİHİRBAZI */}
      <section id="sihirbaz" className="py-24 px-6 bg-neutral-900/60 border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
              Akıllı Planlayıcı
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-white">
              Projenizi 30 Saniyede Tasarlayın
            </h2>
            <p className="text-neutral-400 mt-3 text-sm md:text-base">
              İhtiyacınız olan sistemi ve yaklaşık alanı seçin, size özel teknik keşif paketini tek tıkla oluşturalım.
            </p>
          </Reveal>

          <Reveal>
            <div className="bg-neutral-950 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-7">
                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                    1. Uygulama Yapılacak Sistem
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {["Pergola", "Kış Bahçesi", "Cam Balkon"].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSihirbazSistem(sec)}
                        className={`py-3.5 px-3 rounded-xl text-xs md:text-sm font-bold border transition-all cursor-pointer ${
                          sihirbazSistem === sec
                            ? "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20"
                            : "bg-neutral-900 text-neutral-300 border-white/10 hover:border-white/25"
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      2. Tahmini Alan Genişliği
                    </label>
                    <span className="text-lg font-black text-white bg-neutral-900 border border-white/10 px-3.5 py-1 rounded-lg">
                      {sihirbazMetrekare} m²
                    </span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={120}
                    step={2}
                    value={sihirbazMetrekare}
                    onChange={(e) => setSihirbazMetrekare(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
                    <span>8 m² (Balkon)</span>
                    <span>45 m² (Teras / Bahçe)</span>
                    <span>120 m² (Ticari Mekan)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                    3. Tercih Edilen Donanımlar
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Gizli Günışığı LED",
                      "Uzaktan Kumanda",
                      "Isıcam Konfor",
                      "Rüzgar & Yağmur Sensörü",
                      "Giyotin Yan Kapama",
                    ].map((ek) => {
                      const secili = sihirbazEkstralar.includes(ek);
                      return (
                        <button
                          key={ek}
                          type="button"
                          onClick={() => ekstraSecToggle(ek)}
                          className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
                            secili
                              ? "bg-amber-500/20 border-amber-400 text-amber-300"
                              : "bg-neutral-900 border-white/10 text-neutral-400 hover:text-white"
                          }`}
                        >
                          {secili ? "✓ " : "+ "}
                          {ek}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-amber-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                    Seçilen Proje Özeti
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">{sihirbazSistem}</h3>

                  <div className="mt-5 space-y-3 text-xs border-t border-white/10 pt-4">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Uygulama Alanı:</span>
                      <span className="font-bold text-white">Yaklaşık {sihirbazMetrekare} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Tahmini Teslimat:</span>
                      <span className="font-bold text-emerald-400">
                        {sihirbazMetrekare > 50 ? "10 - 15 İş Günü" : "7 - 10 İş Günü"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Yerinde Keşif & Ölçü:</span>
                      <span className="font-bold text-amber-400">Ücretsiz</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-neutral-400 block mb-1.5">Seçili Donanımlar:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {sihirbazEkstralar.length > 0 ? (
                          sihirbazEkstralar.map((e) => (
                            <span
                              key={e}
                              className="bg-white/5 border border-white/10 px-2.5 py-1 rounded text-[11px] text-neutral-200"
                            >
                              {e}
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-500">Standart Paket</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={sihirbaziFormaAktar}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-xl text-sm transition shadow-xl shadow-amber-500/20 cursor-pointer"
                >
                  Bu Özelliklerle Net Fiyat Al →
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 9. KURUMSAL & MÜŞTERİ DENEYİMLERİ */}
      <section id="kurumsal" className="py-24 px-6 max-w-7xl mx-auto space-y-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Reveal direction="left">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-video bg-neutral-900 shadow-2xl">
              {kurumsalGorsel ? (
                <img
                  src={kurumsalGorsel}
                  alt="Pratik Yapı Uygulama"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold">
                  PRATİK YAPI MİMARİ
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-neutral-950/90 backdrop-blur-md border border-amber-500/30 px-4 py-2.5 rounded-xl">
                <p className="text-xs font-black text-amber-400">20 YILLIK USTALIK</p>
                <p className="text-[11px] text-neutral-300">Avcılar / İstanbul Merkez Atölye</p>
              </div>
            </div>
          </Reveal>

          <Reveal direction="right" delay={150}>
            <span className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
              Kurumsal
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-6 text-white">
              Kalite Tesadüf Değil, 20 Yıllık Tecrübenin Sonucudur
            </h2>
            <p className="text-neutral-300 leading-relaxed mb-4 text-sm md:text-base">
              Pratik Yapı olarak, 20 yılı aşkın süredir İstanbul başta olmak üzere konut, villa, kafe ve restoran projelerine modern pergola, kış bahçesi ve cam balkon sistemleri üretiyoruz.
            </p>
            <p className="text-neutral-400 leading-relaxed mb-8 text-sm md:text-base">
              Amacımız sadece bir alan kapatmak değil; yapınızın mimarisine değer katan, uzun yıllar sorunsuz çalışan estetik yaşam alanları oluşturmaktır.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs md:text-sm">
              <div className="flex items-center gap-2 text-neutral-200 font-semibold">
                <span className="text-amber-400">✓</span> Kendi Atölyemizde Üretim
              </div>
              <div className="flex items-center gap-2 text-neutral-200 font-semibold">
                <span className="text-amber-400">✓</span> Zamanında Teslimat Sözü
              </div>
              <div className="flex items-center gap-2 text-neutral-200 font-semibold">
                <span className="text-amber-400">✓</span> Sertifikalı Motor & Aksam
              </div>
              <div className="flex items-center gap-2 text-neutral-200 font-semibold">
                <span className="text-amber-400">✓</span> Satış Sonrası Teknik Servis
              </div>
            </div>
          </Reveal>
        </div>

        {/* Müşteri Yorumları */}
        <div>
          <Reveal className="text-center mb-12">
            <span className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
              Müşteri Deneyimleri
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold mt-2 text-white">
              Bizi Tercih Edenler Ne Diyor?
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MUSTERI_YORUMLARI.map((yorum, idx) => (
              <Reveal key={yorum.ad} delay={idx * 110}>
                <div className="bg-neutral-900 border border-white/10 hover:border-amber-500/30 transition rounded-2xl p-7 h-full flex flex-col justify-between">
                  <div>
                    <div className="text-amber-400 text-sm mb-3">★★★★★</div>
                    <p className="text-neutral-300 text-sm leading-relaxed italic">
                      “{yorum.yorum}”
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="font-bold text-white text-sm">{yorum.ad}</p>
                    <p className="text-xs text-neutral-400">
                      {yorum.konum} • <span className="text-amber-400">{yorum.sistem}</span>
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 10. SIKÇA SORULAN SORULAR (AKORDEON) */}
      <section id="sss" className="py-24 px-6 bg-neutral-900/40 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
              Merak Edilenler
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 text-white">
              Sıkça Sorulan Sorular
            </h2>
          </Reveal>

          <div className="space-y-3">
            {SSS_LISTESI.map((item, idx) => {
              const acik = acikSssIndex === idx;
              return (
                <div
                  key={item.soru}
                  className="bg-neutral-950 border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-white/25"
                >
                  <button
                    type="button"
                    onClick={() => setAcikSssIndex(acik ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-sm md:text-base text-white">
                      {item.soru}
                    </span>
                    <span
                      className={`text-amber-400 font-bold text-lg transition-transform duration-300 ${
                        acik ? "rotate-45" : "rotate-0"
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      acik ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-xs md:text-sm text-neutral-400 leading-relaxed border-t border-white/5 pt-3">
                        {item.cevap}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. İLETİŞİM & RANDEVU FORMU */}
      <section id="iletisim" className="py-24 px-6 bg-neutral-950 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">
              Bize Ulaşın
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-white">
              Ücretsiz Keşif & Fiyat Teklifi
            </h2>
          </Reveal>

          <Reveal>
            <div className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Doğrudan İletişim</h3>
                  <p className="text-neutral-400 text-sm mb-8">
                    Projeniz için ölçü ve net fiyat bilgisi almak üzere bizi arayabilir veya WhatsApp üzerinden alanınızın fotoğrafını gönderebilirsiniz.
                  </p>

                  <div className="space-y-4">
                    <a
                      href="tel:+905348752122"
                      className="flex items-center gap-3.5 text-base md:text-lg font-bold text-white hover:text-amber-400 transition"
                    >
                      <span className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm">
                        📞
                      </span>
                      +90 534 875 21 22
                    </a>
                    <a
                      href="tel:+905330874097"
                      className="flex items-center gap-3.5 text-base md:text-lg font-bold text-white hover:text-amber-400 transition"
                    >
                      <span className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm">
                        📞
                      </span>
                      +90 533 087 40 97
                    </a>
                    <p className="flex items-center gap-3.5 text-sm text-neutral-300">
                      <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm">
                        ✉️
                      </span>
                      pratikyapii@gmail.com
                    </p>
                    <p className="flex items-center gap-3.5 text-sm text-neutral-300">
                      <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm">
                        📍
                      </span>
                      Avcılar, İstanbul
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-3">
                  <a
                    href="https://instagram.com/prtyapi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-amber-500 hover:text-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition"
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
                        className="w-full p-3.5 rounded-xl bg-neutral-950 border border-white/10 text-white text-sm focus:border-amber-400 outline-none transition"
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
                        className="w-full p-3.5 rounded-xl bg-neutral-950 border border-white/10 text-white text-sm focus:border-amber-400 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                        İlgilendiğiniz Sistem / Detay
                      </label>
                      <input
                        type="text"
                        value={hizmet}
                        onChange={(e) => setHizmet(e.target.value)}
                        placeholder="Örn: Pergola, Kış Bahçesi veya Cam Balkon"
                        className="w-full p-3.5 rounded-xl bg-neutral-950 border border-white/10 text-white text-sm focus:border-amber-400 outline-none transition"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {["Pergola", "Kış Bahçesi", "Cam Balkon"].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setHizmet(h)}
                            className="text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg text-neutral-300 cursor-pointer"
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={gonderiliyor}
                      onClick={randevuGonder}
                      className="mt-3 bg-amber-500 hover:bg-amber-400 text-black p-4 rounded-xl font-bold text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer active:scale-95"
                    >
                      {gonderiliyor ? "Gönderiliyor..." : "Ücretsiz Keşif Talebi Gönder"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TEKNİK DETAY & RENK KARTELASI PENCERESİ (MODAL) */}
      {seciliSistemModal && (
        <div
          onClick={() => setSeciliSistemModal(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-900 border border-white/15 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  {seciliSistemModal.altBaslik}
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {seciliSistemModal.baslik}
                </h3>
              </div>
              <button
                onClick={() => setSeciliSistemModal(null)}
                className="bg-white/10 hover:bg-white/20 text-white w-9 h-9 rounded-full flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed">
              {seciliSistemModal.aciklama}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {seciliSistemModal.teknikDetaylar.map((td) => (
                <div
                  key={td.etiket}
                  className="bg-neutral-950 border border-white/10 rounded-xl p-3.5"
                >
                  <p className="text-[11px] text-neutral-400">{td.etiket}</p>
                  <p className="text-xs font-bold text-white mt-1">{td.deger}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5">
                Profil & Cam Renk Kartelası
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {seciliSistemModal.renkSecenekleri.map((renk) => (
                  <div
                    key={renk.ad}
                    className="flex items-center gap-2.5 bg-neutral-950 border border-white/10 rounded-xl p-2.5"
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-white/25 shrink-0"
                      style={{ backgroundColor: renk.hex }}
                    />
                    <span className="text-xs text-neutral-200 font-medium">{renk.ad}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => formaGit(seciliSistemModal.kategoriAdi)}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3.5 rounded-xl text-sm transition cursor-pointer"
              >
                Bu Sistem İçin Ücretsiz Keşif Al
              </button>
              <button
                onClick={() => setSeciliSistemModal(null)}
                className="bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BÜYÜK GALERİ PENCERESİ (İLERİ/GERİ LIGHTBOX) */}
      {aktifLightboxProje && lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-900 border border-white/15 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative"
          >
            <div className="relative bg-black flex items-center justify-center">
              {aktifLightboxProje.gorsel && (
                <img
                  src={aktifLightboxProje.gorsel}
                  alt={aktifLightboxProje.baslik}
                  className="w-full max-h-[72vh] object-contain"
                />
              )}

              {filtreliProjeler.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + filtreliProjeler.length) % filtreliProjeler.length
                      )
                    }
                    className="absolute left-3 bg-black/70 hover:bg-amber-500 hover:text-black text-white w-11 h-11 rounded-full flex items-center justify-center font-bold transition cursor-pointer"
                    aria-label="Önceki"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % filtreliProjeler.length)
                    }
                    className="absolute right-3 bg-black/70 hover:bg-amber-500 hover:text-black text-white w-11 h-11 rounded-full flex items-center justify-center font-bold transition cursor-pointer"
                    aria-label="Sonraki"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {aktifLightboxProje.kategori}
                  </span>
                  <span className="text-xs text-neutral-500">
                    ({lightboxIndex + 1} / {filtreliProjeler.length})
                  </span>
                </div>
                <h3 className="font-bold text-lg text-white mt-0.5">
                  {aktifLightboxProje.baslik}
                </h3>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => formaGit(aktifLightboxProje.kategori)}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Benzer Proje İçin Teklif Al
                </button>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-10 px-6 text-center text-xs text-neutral-500 border-t border-white/10 bg-neutral-950">
        © {new Date().getFullYear()} Pratik Yapı — Pergola, Kış Bahçesi & Cam Balkon Sistemleri. Tüm hakları saklıdır.
      </footer>

      {/* SABİT WHATSAPP BUTONU */}
      <a
        href="https://wa.me/905330874097"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 z-40 flex items-center gap-2 text-sm"
        title="WhatsApp İletişim"
      >
        <span className="text-xl">💬</span>
        <span>WhatsApp</span>
      </a>
    </div>
  );
}