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
      { ad: "Titanyum Metalik", hex: "#525866" },
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
      { ad: "Ahşap Desen + Sinerji Cam", hex: "#6b4423" },
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
      ? "opacity-0 -translate-x-12"
      : direction === "right"
      ? "opacity-0 translate-x-12"
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
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`,
      backgroundImage: `radial-gradient(circle at ${x}px ${y}px, rgba(56, 189, 248, 0.12), transparent 60%)`,
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
  const [perdeAcildi, setPerdeAcildi] = useState(false);
  const [kaydirildi, setKaydirildi] = useState(false);
  const [scrollYuzde, setScrollYuzde] = useState(0);
  const [drawerAcik, setDrawerAcik] = useState(false);

  const [heroIndex, setHeroIndex] = useState(0);

  const [karsilastirmaOran, setKarsilastirmaOran] = useState(52);
  const karsilastirmaRef = useRef<HTMLDivElement | null>(null);

  const [simLamelAciklik, setSimLamelAciklik] = useState(25);
  const [simLedAcik, setSimLedAcik] = useState(true);
  const [simGiyotinKapali, setSimGiyotinKapali] = useState(75);
  const [simGeceModu, setSimGeceModu] = useState(true);
  const [simYagmurModu, setSimYagmurModu] = useState(false);
  const [simKasaRengi, setSimKasaRengi] = useState<"antrasit" | "siyah" | "titanyum" | "ahsap">("antrasit");

  const [projeler, setProjeler] = useState<Proje[]>([]);
  const [galeriYukleniyor, setGaleriYukleniyor] = useState(true);
  const [aktifKategori, setAktifKategori] = useState("Tümü");
  const [galeriGecis, setGaleriGecis] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [seciliSistemModal, setSeciliSistemModal] = useState<SistemBilgi | null>(null);

  const [sihirbazSistem, setSihirbazSistem] = useState("Pergola");
  const [sihirbazMetrekare, setSihirbazMetrekare] = useState(28);
  const [sihirbazEkstralar, setSihirbazEkstralar] = useState<string[]>([
    "Gizli LED Aydınlatma",
    "Uzaktan Kumanda",
  ]);

  const [acikSssIndex, setAcikSssIndex] = useState<number | null>(0);

  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");
  const [hizmet, setHizmet] = useState("Pergola");
  const [randevuAlindi, setRandevuAlindi] = useState(false);
  const [hataMesaji, setHataMesaji] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPerdeAcildi(true), 600);
    return () => clearTimeout(t);
  }, []);

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
        setSeciliSistemModal(null);
        setDrawerAcik(false);
      }
      if (lightboxIndex !== null && filtreliProjeler.length > 0) {
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
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, filtreliProjeler.length]);

  const karsilastirmaKonumGuncelle = (clientX: number) => {
    const el = karsilastirmaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(5, Math.min(clientX - rect.left, rect.width - 5));
    setKarsilastirmaOran(Math.round((x / rect.width) * 100));
  };

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
    setDrawerAcik(false);
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
  const karsilastirmaGorsel = gorselliProjeler[0]?.gorsel;
  const aktifLightboxProje =
    lightboxIndex !== null ? filtreliProjeler[lightboxIndex] : null;

  const kasaRenkKodu =
    simKasaRengi === "antrasit"
      ? "#2d3339"
      : simKasaRengi === "siyah"
      ? "#121316"
      : simKasaRengi === "titanyum"
      ? "#525a66"
      : "#78492a";

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans scroll-smooth selection:bg-sky-500 selection:text-black overflow-x-hidden">
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
        @keyframes rainFall {
          0% { transform: translateY(-20px) translateX(0); opacity: 0; }
          20% { opacity: 0.75; }
          100% { transform: translateY(240px) translateX(-18px); opacity: 0; }
        }
        .animate-rain {
          animation: rainFall 0.85s linear infinite;
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
        className={`fixed inset-0 z-[100] bg-[#07090E] flex flex-col items-center justify-center pointer-events-none transition-all duration-1000 ease-in-out ${
          perdeAcildi ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white font-black text-base flex flex-col items-center justify-center leading-none shadow-2xl shadow-sky-500/30 mb-4">
          <span>PRATİK</span>
          <span className="text-[10px] tracking-widest mt-1 text-sky-100">YAPI</span>
        </div>
        <div className="text-xl font-black tracking-[0.35em] text-white uppercase">
          PRATİK<span className="text-sky-400">YAPI</span>
        </div>
        <div className="w-44 h-0.5 bg-slate-800 mt-4 overflow-hidden rounded-full">
          <div className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 w-full transition-transform duration-700 origin-left" />
        </div>
      </div>

      {/* ÜST SAFİR-ZÜMRÜT SCROLL İLERLEME ÇİZGİSİ */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 transition-all duration-150"
          style={{ width: `${scrollYuzde}%` }}
        />
      </div>

      {/* 1. ÜST MİKRO BİLGİ ŞERİDİ */}
      <div className="bg-slate-950/90 border-b border-white/10 text-[11px] text-slate-400 py-2 px-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span>📍 Avcılar, İstanbul — Tüm İstanbul’a Ücretsiz Yerinde Keşif</span>
            <span>🛡️ 20 Yıllık Sektör Tecrübesi & 5 Yıl Sistem Garantisi</span>
          </div>
          <div className="flex items-center gap-5 font-medium">
            <a href="tel:+905348752122" className="hover:text-sky-400 transition">
              📞 +90 534 875 21 22
            </a>
            <a href="tel:+905330874097" className="hover:text-sky-400 transition">
              📞 +90 533 087 40 97
            </a>
          </div>
        </div>
      </div>

      {/* 2. DİNAMİK NAVBAR + SAĞ ÜST KÖŞEDE 3 ÇİZGİ MENÜ BUTONU */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 px-5 md:px-10 ${
          kaydirildi
            ? "bg-[#07090E]/90 backdrop-blur-xl border-b border-white/10 py-3.5 shadow-2xl shadow-black/80"
            : "bg-[#07090E]/65 backdrop-blur-md border-b border-white/5 py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white font-black text-xs flex flex-col items-center justify-center leading-none shadow-lg shadow-sky-500/25 group-hover:rotate-3 group-hover:scale-105 transition-all duration-300">
              <span>PRATİK</span>
              <span className="text-[8px] tracking-widest mt-0.5 text-sky-100">YAPI</span>
            </div>
            <div>
              <div className="text-xl font-black tracking-widest uppercase leading-none">
                PRATİK<span className="text-sky-400">YAPI</span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-[0.22em] uppercase mt-1">
                Pergola & Cam Sistemleri
              </p>
            </div>
          </a>

          <div className="hidden xl:flex items-center space-x-7 text-sm font-medium text-slate-300">
            <a href="#sistemler" className="hover:text-sky-400 transition-colors relative py-1 group">
              Sistemlerimiz
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#simulator" className="hover:text-sky-400 transition-colors relative py-1 group">
              Canlı Simülatör
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#oncesi-sonrasi" className="hover:text-sky-400 transition-colors relative py-1 group">
              Öncesi / Sonrası
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#galeri" className="hover:text-sky-400 transition-colors relative py-1 group">
              Projelerimiz
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#sihirbaz" className="hover:text-sky-400 transition-colors relative py-1 group">
              Keşif Planlayıcı
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <a href="#kurumsal" className="hover:text-sky-400 transition-colors relative py-1 group">
              Kurumsal
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-400 transition-all duration-300 group-hover:w-full" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#iletisim"
              className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs md:text-sm px-5 py-2.5 rounded-full transition-all duration-300 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 active:scale-95"
            >
              <span>Ücretsiz Keşif</span>
              <span>→</span>
            </a>

            <button
              onClick={() => setDrawerAcik(!drawerAcik)}
              className="group relative w-11 h-11 rounded-xl bg-white/5 hover:bg-sky-500/15 border border-white/15 hover:border-sky-400/50 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer"
              aria-label="Menüyü Aç"
              title="Hızlı Menü"
            >
              <span
                className={`w-5 h-0.5 bg-white group-hover:bg-sky-400 rounded-full transition-all duration-300 ${
                  drawerAcik ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`w-5 h-0.5 bg-white group-hover:bg-sky-400 rounded-full transition-all duration-300 ${
                  drawerAcik ? "opacity-0" : ""
                }`}
              />
              <span
                className={`w-5 h-0.5 bg-white group-hover:bg-sky-400 rounded-full transition-all duration-300 ${
                  drawerAcik ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* SAĞ KÖŞE 3 ÇİZGİDEN AÇILAN YAN MENÜ */}
      <div
        className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
          drawerAcik ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          onClick={() => setDrawerAcik(false)}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />
        <aside
          className={`absolute top-0 right-0 h-full w-80 sm:w-96 bg-[#0B0F19] border-l border-white/10 p-7 flex flex-col justify-between shadow-2xl transition-transform duration-500 ease-out ${
            drawerAcik ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white font-black text-[10px] flex items-center justify-center">
                  PY
                </div>
                <span className="font-black tracking-widest text-sm uppercase">
                  PRATİK<span className="text-sky-400">YAPI</span>
                </span>
              </div>
              <button
                onClick={() => setDrawerAcik(false)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ücretsiz Keşif Hattı Aktif</span>
            </div>

            <div className="mt-6 flex flex-col gap-1.5">
              {[
                { etiket: "Sistemlerimiz & Modeller", href: "#sistemler" },
                { etiket: "Canlı Pergola & Cam Simülatörü", href: "#simulator" },
                { etiket: "Öncesi / Sonrası Dönüşüm", href: "#oncesi-sonrasi" },
                { etiket: `Tamamlanmış Projeler (${projeler.length})`, href: "#galeri" },
                { etiket: "30 Saniyede Keşif Planlayıcı", href: "#sihirbaz" },
                { etiket: "Kurumsal & Referans Yorumları", href: "#kurumsal" },
                { etiket: "Sıkça Sorulan Sorular", href: "#sss" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setDrawerAcik(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-sky-500/10 hover:text-sky-400 transition"
                >
                  <span>{link.etiket}</span>
                  <span className="text-slate-500 text-xs">→</span>
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-5 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Hızlı İletişim Hatları
            </p>
            <a
              href="tel:+905348752122"
              className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition"
            >
              📞 +90 534 875 21 22
            </a>
            <a
              href="tel:+905330874097"
              className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition"
            >
              📞 +90 533 087 40 97
            </a>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="https://wa.me/905330874097"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 rounded-xl text-xs text-center transition"
              >
                💬 WhatsApp
              </a>
              <button
                onClick={() => formaGit("Pergola")}
                className="bg-sky-500 hover:bg-sky-400 text-black font-bold py-2.5 rounded-xl text-xs text-center transition cursor-pointer"
              >
                Teklif Al
              </button>
            </div>
          </div>
        </aside>
      </div>

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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-500/15 via-[#07090E] to-[#07090E]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/90 via-[#07090E]/55 to-[#07090E]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 delay-200 ${
              perdeAcildi ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="inline-flex items-center gap-2.5 border border-sky-400/35 bg-sky-500/10 backdrop-blur-md text-sky-300 text-xs font-bold tracking-[0.22em] uppercase px-5 py-2 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>20 Yıllık Mimari Uygulama & Mühendislik</span>
            </div>
          </div>

          <h1
            className={`text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.07] text-white mb-6 transition-all duration-1000 delay-300 ${
              perdeAcildi ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Mekanlarınıza Değer Katan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-400 to-emerald-300 animate-shimmer">
              Bioklimatik & Cam Sistemleri
            </span>
          </h1>

          <p
            className={`text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-1000 delay-500 ${
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
              className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all duration-300 shadow-2xl shadow-sky-500/30 hover:-translate-y-1"
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

          {vitrinGorselleri.length > 1 && (
            <div className="mt-14 flex flex-col items-center gap-2.5">
              <div className="flex items-center gap-2">
                {vitrinGorselleri.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      idx === heroIndex
                        ? "w-12 bg-sky-400"
                        : "w-3 bg-white/25 hover:bg-white/50"
                    }`}
                    aria-label={item.baslik}
                  />
                ))}
              </div>
              <span className="text-[11px] text-slate-400 tracking-wider">
                {vitrinGorselleri[heroIndex]?.kategori} • {vitrinGorselleri[heroIndex]?.baslik}
              </span>
            </div>
          )}

          <div className="mt-10 hidden sm:flex justify-center">
            <a
              href="#sistemler"
              className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-1.5 text-sky-400 animate-float"
              aria-label="Aşağı Kaydır"
            >
              <span className="w-1 h-2 bg-sky-400 rounded-full" />
            </a>
          </div>
        </div>
      </section>

      {/* 4. ANİMASYONLU GÜVEN & SAYAÇ ŞERİDİ */}
      <section className="border-y border-white/10 bg-slate-900/40 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Reveal delay={0}>
            <p className="text-3xl md:text-5xl font-black text-sky-400">
              <AnimatedCounter hedef={20} sonEk="+" />
            </p>
            <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest">Yıllık Tecrübe</p>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-3xl md:text-5xl font-black text-white">
              <AnimatedCounter hedef={1500} sonEk="+" />
            </p>
            <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest">Teslim Edilen Proje</p>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-3xl md:text-5xl font-black text-emerald-400">
              <AnimatedCounter hedef={5} sonEk=" Yıl" />
            </p>
            <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest">Motor & Sistem Garantisi</p>
          </Reveal>
          <Reveal delay={300}>
            <p className="text-3xl md:text-5xl font-black text-white">
              <AnimatedCounter hedef={100} onEk="%" />
            </p>
            <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest">Su & Isı Yalıtımı</p>
          </Reveal>
        </div>
      </section>

      {/* 5. 3D EĞİMLİ SİSTEM KARTLARI */}
      <section id="sistemler" className="py-24 px-6 max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="text-sky-400 text-xs font-bold tracking-[0.25em] uppercase">
            Mimari Çözümlerimiz
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-white">
            Üst Segment Gölgelendirme & Cam Sistemleri
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-sm md:text-base">
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
                <TiltCard className="bg-slate-900/70 border border-white/10 rounded-3xl overflow-hidden hover:border-sky-500/50 flex flex-col h-full group shadow-2xl">
                  <div className="relative h-56 bg-slate-800 overflow-hidden">
                    {kategoriGorseli ? (
                      <img
                        src={kategoriGorseli}
                        alt={sistem.baslik}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-600 font-black text-4xl">
                        {sistem.kod}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
                    <span className="absolute top-4 left-4 bg-black/75 backdrop-blur-md border border-white/15 text-sky-400 font-black text-xs px-3.5 py-1.5 rounded-full">
                      {sistem.kod} • {sistem.altBaslik}
                    </span>
                  </div>

                  <div className="p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-sky-400 transition-colors">
                        {sistem.baslik}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        {sistem.aciklama}
                      </p>

                      <ul className="space-y-2.5 mb-8 border-t border-white/10 pt-5">
                        {sistem.ozellikler.map((oz) => (
                          <li key={oz} className="flex items-start gap-2.5 text-xs text-slate-300">
                            <span className="text-emerald-400 font-bold mt-0.5">✓</span>
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
                        className="bg-sky-500 hover:bg-sky-400 text-black py-3 px-3 rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-sky-500/20"
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

      {/* 6. CANLI İNTERAKTİF BİOKLİMATİK PERGOLA & GİYOTİN CAM SİMÜLATÖRÜ 2.0 */}
      <section id="simulator" className="py-24 px-6 bg-slate-900/40 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-sky-400 text-xs font-bold tracking-[0.25em] uppercase">
              İnteraktif Teknoloji
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-white">
              Canlı Pergola & Giyotin Cam Simülatörü
            </h2>
            <p className="text-slate-400 mt-3 max-w-2xl mx-auto text-sm md:text-base">
              Gece/Gündüz modunu değiştirin, yağmur testi başlatın, tavan lamellerini ve motorlu giyotin camı canlı kontrol edin.
            </p>
          </Reveal>

          <Reveal>
            <div className="bg-[#0B0F19] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div
                className={`lg:col-span-7 relative rounded-2xl overflow-hidden border border-white/10 h-[360px] sm:h-[420px] flex flex-col justify-between p-6 select-none transition-colors duration-700 ${
                  simGeceModu
                    ? "bg-gradient-to-b from-[#060B19] via-[#0F172A] to-slate-900"
                    : "bg-gradient-to-b from-sky-700 via-sky-600/70 to-slate-800"
                }`}
              >
                <div
                  className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
                  style={{
                    opacity: !simGeceModu ? (simLamelAciklik / 100) * 0.65 : 0,
                    background:
                      "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.7), transparent 70%)",
                  }}
                />

                {simYagmurModu && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                    {Array.from({ length: 28 }).map((_, idx) => (
                      <span
                        key={idx}
                        style={{
                          left: `${(idx * 3.6) % 100}%`,
                          animationDelay: `${(idx % 7) * 0.12}s`,
                        }}
                        className="absolute top-0 w-[1.5px] h-6 bg-gradient-to-b from-transparent to-sky-300/80 animate-rain"
                      />
                    ))}
                  </div>
                )}

                <div
                  className="absolute inset-x-12 top-16 h-44 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none"
                  style={{
                    opacity: simLedAcik ? (simGeceModu ? 0.65 : 0.3) : 0,
                    background: "rgba(224, 242, 254, 0.75)",
                  }}
                />

                <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold">
                  <span className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-slate-200">
                    Tavan Açıklığı: %{simLamelAciklik}
                  </span>
                  <div className="flex items-center gap-2">
                    {simYagmurModu && (
                      <span className="bg-sky-500/20 border border-sky-400 text-sky-300 px-3 py-1 rounded-full">
                        🌧️ Yağmur Aktif
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full border transition ${
                        simLedAcik
                          ? "bg-sky-500/20 border-sky-400 text-sky-300"
                          : "bg-black/60 border-white/10 text-slate-400"
                      }`}
                    >
                      LED: {simLedAcik ? "AÇIK" : "KAPALI"}
                    </span>
                  </div>
                </div>

                <div className="relative z-10 my-auto mx-auto w-full max-w-lg">
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
                        className="w-5 h-2.5 border border-white/25 rounded-sm transition-transform duration-300 shadow"
                      />
                    ))}

                    <div
                      className={`absolute -bottom-1 left-3 right-3 h-1 rounded-full transition-all duration-500 ${
                        simLedAcik
                          ? "bg-sky-200 shadow-[0_4px_24px_rgba(125,211,252,0.95)] opacity-100"
                          : "bg-slate-700 opacity-30"
                      }`}
                    />
                  </div>

                  <div className="relative h-44 flex justify-between px-2">
                    <div
                      className="w-4 h-full transition-colors duration-500 shadow-lg"
                      style={{ backgroundColor: kasaRenkKodu }}
                    />

                    <div className="flex-1 relative overflow-hidden border-x border-white/15 bg-white/[0.03]">
                      <div
                        style={{
                          transform: `translateY(${(simGiyotinKapali - 100) * 0.65}%)`,
                        }}
                        className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-sky-300/25 to-sky-100/10 border-b-2 border-white/45 backdrop-blur-[1px] transition-transform duration-500 flex items-end justify-center pb-1"
                      >
                        <span className="text-[9px] text-white/70 tracking-widest uppercase">
                          Motorlu Giyotin Cam
                        </span>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-sky-300/15 border-t-2 border-white/35 flex items-center justify-center">
                        <span className="text-[9px] text-white/60 tracking-widest uppercase">
                          Sabit Alt Cam Küpeşte
                        </span>
                      </div>
                    </div>

                    <div
                      className="w-4 h-full transition-colors duration-500 shadow-lg"
                      style={{ backgroundColor: kasaRenkKodu }}
                    />
                  </div>

                  <div className="h-4 rounded-b-lg bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-t border-white/15 shadow-2xl" />
                </div>

                <p className="relative z-20 text-center text-[11px] text-slate-300/80">
                  {simYagmurModu && simLamelAciklik > 15
                    ? "⚠️ Yağmur yağıyor! Tavan lamellerini %0 konumuna getirip kapatabilirsiniz."
                    : "Sağdaki akıllı kumandadan tüm fonksiyonları test edebilirsiniz."}
                </p>
              </div>

              <div className="lg:col-span-5 space-y-5 bg-slate-900/90 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                      Akıllı Kumanda Paneli
                    </span>
                    <h3 className="text-lg font-bold text-white">Sistem Kontrolleri</h3>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSimGeceModu(!simGeceModu)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold cursor-pointer"
                    >
                      {simGeceModu ? "🌙 Gece" : "☀️ Gündüz"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const yeniDurum = !simYagmurModu;
                        setSimYagmurModu(yeniDurum);
                        if (yeniDurum) {
                          setSimLamelAciklik(0);
                          setSimGiyotinKapali(100);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer transition ${
                        simYagmurModu
                          ? "bg-sky-500 text-black border-sky-400"
                          : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                      }`}
                    >
                      🌧️ Yağmur
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-300">Tavan Lamel Açısı</span>
                    <span className="text-sky-400">%{simLamelAciklik}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={simLamelAciklik}
                    onChange={(e) => setSimLamelAciklik(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-300">Giyotin Cam Kapanma</span>
                    <span className="text-sky-400">%{simGiyotinKapali}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={simGiyotinKapali}
                    onChange={(e) => setSimGiyotinKapali(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setSimLedAcik(!simLedAcik)}
                    className={`py-3 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      simLedAcik
                        ? "bg-sky-500 text-black border-sky-400 shadow-lg shadow-sky-500/20"
                        : "bg-slate-950 text-slate-300 border-white/10"
                    }`}
                  >
                    💡 LED Işık: {simLedAcik ? "Açık" : "Kapalı"}
                  </button>

                  <div className="bg-slate-950 border border-white/10 rounded-xl p-2 flex items-center justify-around">
                    {[
                      { id: "antrasit", color: "#2d3339", title: "Antrasit" },
                      { id: "siyah", color: "#121316", title: "Siyah" },
                      { id: "titanyum", color: "#525a66", title: "Titanyum" },
                      { id: "ahsap", color: "#78492a", title: "Ahşap" },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() =>
                          setSimKasaRengi(r.id as "antrasit" | "siyah" | "titanyum" | "ahsap")
                        }
                        title={r.title}
                        style={{ backgroundColor: r.color }}
                        className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                          simKasaRengi === r.id ? "border-sky-400 scale-110" : "border-white/25"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => formaGit("Bioklimatik Pergola & Giyotin Cam")}
                  className="w-full bg-white hover:bg-slate-200 text-black font-bold py-3.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Bu Sistem İçin Ücretsiz Keşif Al →
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7. ÖNCESİ / SONRASI KARŞILAŞTIRMA SÜRGÜSÜ */}
      {karsilastirmaGorsel && (
        <section id="oncesi-sonrasi" className="py-24 px-6 max-w-6xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="text-emerald-400 text-xs font-bold tracking-[0.25em] uppercase">
              Mimari Dönüşüm
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-white">
              Uygulama Öncesi & Sonrası Farkı
            </h2>
            <p className="text-slate-400 mt-3 text-sm md:text-base">
              Ortadaki sürgüyü sağa ve sola kaydırarak mekanlardaki değişimi inceleyin.
            </p>
          </Reveal>

          <Reveal>
            <div
              ref={karsilastirmaRef}
              onMouseMove={(e) => {
                if (e.buttons === 1) karsilastirmaKonumGuncelle(e.clientX);
              }}
              onClick={(e) => karsilastirmaKonumGuncelle(e.clientX)}
              onTouchMove={(e) => {
                if (e.touches[0]) karsilastirmaKonumGuncelle(e.touches[0].clientX);
              }}
              className="relative aspect-[16/9] max-h-[520px] w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl select-none cursor-ew-resize"
            >
              <img
                src={karsilastirmaGorsel}
                alt="Pratik Yapı Uygulama Sonrası"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span className="absolute top-4 right-4 bg-emerald-500 text-black font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg">
                PRATİK YAPI SONRASI
              </span>

              <div
                style={{ clipPath: `inset(0 ${100 - karsilastirmaOran}% 0 0)` }}
                className="absolute inset-0"
              >
                <img
                  src={karsilastirmaGorsel}
                  alt="Uygulama Öncesi"
                  className="w-full h-full object-cover grayscale contrast-75 brightness-75"
                />
                <span className="absolute top-4 left-4 bg-slate-950/85 border border-white/15 text-slate-300 font-bold text-xs px-3.5 py-1.5 rounded-full">
                  UYGULAMA ÖNCESİ
                </span>
              </div>

              <div
                style={{ left: `${karsilastirmaOran}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.9)] pointer-events-none"
              >
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-sky-500 text-black font-black text-xs flex items-center justify-center shadow-2xl border-2 border-white">
                  ⇄
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* 8. TAMAMLANMIŞ PROJELER (CANLI FİRESTORE GALERİSİ) */}
      <section id="galeri" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
        <Reveal className="text-center mb-12">
          <span className="text-sky-400 text-xs font-bold tracking-[0.25em] uppercase">
            Referans Galerimiz
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-white">
            Tamamlanmış Projeler
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm md:text-base">
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
                      ? "bg-sky-500 text-black shadow-lg shadow-sky-500/25 scale-105"
                      : "bg-slate-900 text-slate-300 border border-white/10 hover:border-white/30"
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
              <div key={n} className="bg-slate-900 rounded-2xl h-72 animate-pulse border border-white/5" />
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
                className="bg-slate-900/80 rounded-2xl overflow-hidden border border-white/10 hover:border-sky-500/50 transition-all duration-500 cursor-pointer group shadow-lg hover:-translate-y-2"
              >
                <div className="aspect-[16/10] bg-slate-800 overflow-hidden relative">
                  {proje.gorsel ? (
                    <img
                      src={proje.gorsel}
                      alt={proje.baslik}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                      Görsel Yok
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                  <span className="absolute top-3.5 left-3.5 bg-slate-950/85 backdrop-blur-md border border-white/15 text-sky-400 text-[11px] font-bold px-3.5 py-1 rounded-full">
                    {proje.kategori}
                  </span>
                  <span className="absolute bottom-3.5 right-3.5 w-9 h-9 rounded-full bg-sky-500 text-black font-bold flex items-center justify-center text-xs opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    ⤢
                  </span>
                </div>
                <div className="p-5 flex items-center justify-between gap-2">
                  <h3 className="font-bold text-white text-base group-hover:text-sky-400 transition-colors truncate">
                    {proje.baslik}
                  </h3>
                  <span className="text-slate-500 group-hover:text-sky-400 text-sm transition shrink-0">
                    İncele →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 text-sm py-10">
            Bu kategoride henüz proje bulunmuyor.
          </p>
        )}
      </section>

      {/* 9. İNTERAKTİF PROJE KEŞİF SİHİRBAZI */}
      <section id="sihirbaz" className="py-24 px-6 bg-slate-900/40 border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="text-sky-400 text-xs font-bold tracking-[0.25em] uppercase">
              Akıllı Planlayıcı
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-white">
              Projenizi 30 Saniyede Tasarlayın
            </h2>
            <p className="text-slate-400 mt-3 text-sm md:text-base">
              İhtiyacınız olan sistemi ve yaklaşık alanı seçin, size özel teknik keşif paketini tek tıkla oluşturalım.
            </p>
          </Reveal>

          <Reveal>
            <div className="bg-[#0B0F19] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-7">
                <div>
                  <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">
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
                            ? "bg-sky-500 text-black border-sky-400 shadow-lg shadow-sky-500/20"
                            : "bg-slate-900 text-slate-300 border-white/10 hover:border-white/25"
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                      2. Tahmini Alan Genişliği
                    </label>
                    <span className="text-lg font-black text-white bg-slate-900 border border-white/10 px-3.5 py-1 rounded-lg">
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
                    className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>8 m² (Balkon)</span>
                    <span>45 m² (Teras / Bahçe)</span>
                    <span>120 m² (Ticari Mekan)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">
                    3. Tercih Edilen Donanımlar
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Gizli LED Aydınlatma",
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
                              ? "bg-sky-500/20 border-sky-400 text-sky-300"
                              : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
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

              <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-[#07090E] border border-sky-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-sky-400">
                    Seçilen Proje Özeti
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">{sihirbazSistem}</h3>

                  <div className="mt-5 space-y-3 text-xs border-t border-white/10 pt-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Uygulama Alanı:</span>
                      <span className="font-bold text-white">Yaklaşık {sihirbazMetrekare} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tahmini Teslimat:</span>
                      <span className="font-bold text-emerald-400">
                        {sihirbazMetrekare > 50 ? "10 - 15 İş Günü" : "7 - 10 İş Günü"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Yerinde Keşif & Ölçü:</span>
                      <span className="font-bold text-sky-400">Ücretsiz</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-slate-400 block mb-1.5">Seçili Donanımlar:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {sihirbazEkstralar.length > 0 ? (
                          sihirbazEkstralar.map((e) => (
                            <span
                              key={e}
                              className="bg-white/5 border border-white/10 px-2.5 py-1 rounded text-[11px] text-slate-200"
                            >
                              {e}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500">Standart Paket</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={sihirbaziFormaAktar}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl text-sm transition shadow-xl shadow-sky-500/20 cursor-pointer"
                >
                  Bu Özelliklerle Net Fiyat Al →
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 10. KURUMSAL & MÜŞTERİ DENEYİMLERİ */}
      <section id="kurumsal" className="py-24 px-6 max-w-7xl mx-auto space-y-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Reveal direction="left">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-video bg-slate-900 shadow-2xl">
              {kurumsalGorsel ? (
                <img
                  src={kurumsalGorsel}
                  alt="Pratik Yapı Uygulama"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                  PRATİK YAPI MİMARİ
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-md border border-sky-500/30 px-4 py-2.5 rounded-xl">
                <p className="text-xs font-black text-sky-400">20 YILLIK USTALIK</p>
                <p className="text-[11px] text-slate-300">Avcılar / İstanbul Merkez Atölye</p>
              </div>
            </div>
          </Reveal>

          <Reveal direction="right" delay={150}>
            <span className="text-sky-400 text-xs font-bold tracking-[0.25em] uppercase">
              Kurumsal
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-6 text-white">
              Kalite Tesadüf Değil, 20 Yıllık Tecrübenin Sonucudur
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4 text-sm md:text-base">
              Pratik Yapı olarak, 20 yılı aşkın süredir İstanbul başta olmak üzere konut, villa, kafe ve restoran projelerine modern pergola, kış bahçesi ve cam balkon sistemleri üretiyoruz.
            </p>
            <p className="text-slate-400 leading-relaxed mb-8 text-sm md:text-base">
              Amacımız sadece bir alan kapatmak değil; yapınızın mimarisine değer katan, uzun yıllar sorunsuz çalışan estetik yaşam alanları oluşturmaktır.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs md:text-sm">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <span className="text-emerald-400">✓</span> Kendi Atölyemizde Üretim
              </div>
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <span className="text-emerald-400">✓</span> Zamanında Teslimat Sözü
              </div>
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <span className="text-emerald-400">✓</span> Sertifikalı Motor & Aksam
              </div>
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <span className="text-emerald-400">✓</span> Satış Sonrası Teknik Servis
              </div>
            </div>
          </Reveal>
        </div>

        <div>
          <Reveal className="text-center mb-12">
            <span className="text-sky-400 text-xs font-bold tracking-[0.25em] uppercase">
              Müşteri Deneyimleri
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold mt-2 text-white">
              Bizi Tercih Edenler Ne Diyor?
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MUSTERI_YORUMLARI.map((yorum, idx) => (
              <Reveal key={yorum.ad} delay={idx * 110}>
                <div className="bg-slate-900/70 border border-white/10 hover:border-sky-500/30 transition rounded-2xl p-7 h-full flex flex-col justify-between">
                  <div>
                    <div className="text-sky-400 text-sm mb-3">★★★★★</div>
                    <p className="text-slate-300 text-sm leading-relaxed italic">
                      “{yorum.yorum}”
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="font-bold text-white text-sm">{yorum.ad}</p>
                    <p className="text-xs text-slate-400">
                      {yorum.konum} • <span className="text-sky-400">{yorum.sistem}</span>
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 11. SIKÇA SORULAN SORULAR (AKORDEON) */}
      <section id="sss" className="py-24 px-6 bg-slate-900/40 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="text-sky-400 text-xs font-bold tracking-[0.25em] uppercase">
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
                  className="bg-[#0B0F19] border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-white/25"
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
                      className={`text-sky-400 font-bold text-lg transition-transform duration-300 ${
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
                      <p className="px-5 pb-5 text-xs md:text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">
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

      {/* 12. İLETİŞİM & RANDEVU FORMU */}
      <section id="iletisim" className="py-24 px-6 bg-[#07090E] border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-sky-400 text-xs font-bold tracking-[0.25em] uppercase">
              Bize Ulaşın
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-white">
              Ücretsiz Keşif & Fiyat Teklifi
            </h2>
          </Reveal>

          <Reveal>
            <div className="bg-[#0B0F19] border border-white/10 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12 bg-gradient-to-br from-slate-900 via-[#0B0F19] to-black flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Doğrudan İletişim</h3>
                  <p className="text-slate-400 text-sm mb-8">
                    Projeniz için ölçü ve net fiyat bilgisi almak üzere bizi arayabilir veya WhatsApp üzerinden alanınızın fotoğrafını gönderebilirsiniz.
                  </p>

                  <div className="space-y-4">
                    <a
                      href="tel:+905348752122"
                      className="flex items-center gap-3.5 text-base md:text-lg font-bold text-white hover:text-sky-400 transition"
                    >
                      <span className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 text-sm">
                        📞
                      </span>
                      +90 534 875 21 22
                    </a>
                    <a
                      href="tel:+905330874097"
                      className="flex items-center gap-3.5 text-base md:text-lg font-bold text-white hover:text-sky-400 transition"
                    >
                      <span className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 text-sm">
                        📞
                      </span>
                      +90 533 087 40 97
                    </a>
                    <p className="flex items-center gap-3.5 text-sm text-slate-300">
                      <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm">
                        ✉️
                      </span>
                      pratikyapii@gmail.com
                    </p>
                    <p className="flex items-center gap-3.5 text-sm text-slate-300">
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
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-sky-500 hover:text-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition"
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
                    <p className="text-slate-300 text-sm">
                      Sayın <strong>{adSoyad}</strong>, keşif talebiniz ekibimize ulaştı. En kısa sürede sizi arayacağız.
                    </p>
                    <button
                      onClick={() => {
                        setRandevuAlindi(false);
                        setAdSoyad("");
                        setTelefon("");
                      }}
                      className="mt-6 text-xs text-sky-400 underline hover:text-sky-300 cursor-pointer"
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
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Ad Soyad
                      </label>
                      <input
                        type="text"
                        value={adSoyad}
                        onChange={(e) => setAdSoyad(e.target.value)}
                        placeholder="Adınız Soyadınız"
                        className="w-full p-3.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-sky-400 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Telefon Numaranız
                      </label>
                      <input
                        type="tel"
                        value={telefon}
                        onChange={(e) => setTelefon(e.target.value)}
                        placeholder="05XX XXX XX XX"
                        className="w-full p-3.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-sky-400 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        İlgilendiğiniz Sistem / Detay
                      </label>
                      <input
                        type="text"
                        value={hizmet}
                        onChange={(e) => setHizmet(e.target.value)}
                        placeholder="Örn: Pergola, Kış Bahçesi veya Cam Balkon"
                        className="w-full p-3.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-sky-400 outline-none transition"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {["Pergola", "Kış Bahçesi", "Cam Balkon"].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setHizmet(h)}
                            className="text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300 cursor-pointer"
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
                      className="mt-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white p-4 rounded-xl font-bold text-sm transition shadow-lg shadow-sky-500/20 disabled:opacity-50 cursor-pointer active:scale-95"
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

      {/* TEKNİK DETAY & RENK KARTELASI PENCERESİ */}
      {seciliSistemModal && (
        <div
          onClick={() => setSeciliSistemModal(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0B0F19] border border-white/15 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
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

            <p className="text-sm text-slate-300 leading-relaxed">
              {seciliSistemModal.aciklama}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {seciliSistemModal.teknikDetaylar.map((td) => (
                <div
                  key={td.etiket}
                  className="bg-slate-950 border border-white/10 rounded-xl p-3.5"
                >
                  <p className="text-[11px] text-slate-400">{td.etiket}</p>
                  <p className="text-xs font-bold text-white mt-1">{td.deger}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2.5">
                Profil & Cam Renk Kartelası
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {seciliSistemModal.renkSecenekleri.map((renk) => (
                  <div
                    key={renk.ad}
                    className="flex items-center gap-2.5 bg-slate-950 border border-white/10 rounded-xl p-2.5"
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-white/25 shrink-0"
                      style={{ backgroundColor: renk.hex }}
                    />
                    <span className="text-xs text-slate-200 font-medium">{renk.ad}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => formaGit(seciliSistemModal.kategoriAdi)}
                className="flex-1 bg-sky-500 hover:bg-sky-400 text-black font-bold py-3.5 rounded-xl text-sm transition cursor-pointer"
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

      {/* BÜYÜK GALERİ PENCERESİ */}
      {aktifLightboxProje && lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0B0F19] border border-white/15 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative"
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
                    className="absolute left-3 bg-black/70 hover:bg-sky-500 hover:text-black text-white w-11 h-11 rounded-full flex items-center justify-center font-bold transition cursor-pointer"
                    aria-label="Önceki"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % filtreliProjeler.length)
                    }
                    className="absolute right-3 bg-black/70 hover:bg-sky-500 hover:text-black text-white w-11 h-11 rounded-full flex items-center justify-center font-bold transition cursor-pointer"
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
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    {aktifLightboxProje.kategori}
                  </span>
                  <span className="text-xs text-slate-500">
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
                  className="bg-sky-500 hover:bg-sky-400 text-black px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
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
      <footer className="py-10 px-6 text-center text-xs text-slate-500 border-t border-white/10 bg-[#07090E]">
        © 2026 Pratik Yapı — Pergola, Kış Bahçesi & Cam Balkon Sistemleri. Tüm hakları saklıdır.
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