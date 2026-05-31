<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMeta } from 'quasar';

// Dynamic SEO Meta configuration
useMeta({
  title: 'Voltaris - Smart Energy Monitoring | Hemat Tagihan Listrik Cerdas',
  meta: {
    description: { name: 'description', content: 'Voltaris membantu Anda memantau dan mengoptimalkan penggunaan daya listrik rumah tangga secara cerdas. Hemat tagihan bulanan hingga 30%.' },
    keywords: { name: 'keywords', content: 'voltaris, monitoring listrik, hemat listrik, kalkulator pln, smart energy, pemantauan daya, dss energy' },
    ogTitle: { property: 'og:title', content: 'Voltaris - Smart Energy Monitoring | Sistem Pemantauan Energi Cerdas' },
    ogDescription: { property: 'og:description', content: 'Pantau & Optimalkan Energi Secara Cerdas Bersama Voltaris. Hitung estimasi pemakaian daya harian Anda secara praktis.' },
    ogImage: { property: 'og:image', content: 'icons/gambar 1.webp' },
    ogType: { property: 'og:type', content: 'website' }
  }
});

// Header scroll state
const isScrolled = ref(false);
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

// Mockup chart simulation
const chartBars = ref([120, 250, 150, 380, 200]);
const currentPower = ref(420);
const currentCost = ref(2450);
let intervalId: number | null = null;

const simulateChart = () => {
  chartBars.value = chartBars.value.map(() => Math.floor(Math.random() * 250) + 50);
  currentPower.value = chartBars.value.reduce((sum, val) => sum + val, 0);
  currentCost.value = Math.round(currentPower.value * 5.8);
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  intervalId = window.setInterval(simulateChart, 3000);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  if (intervalId !== null) window.clearInterval(intervalId);
});

// Calculator states
const watt = ref(500);
const hours = ref(8);

const tariffOptions = [
  { label: 'Subsidi R-1 / 900 VA', value: 1352.00, desc: 'Daya kecil bersubsidi' },
  { label: 'R-1 / 1300 VA - 2200 VA', value: 1444.70, desc: 'Daya standar nonsubsidi' },
  { label: 'R-2 / 3500 VA - 5500 VA', value: 1699.53, desc: 'Daya menengah ke atas' },
  { label: 'R-3 / 6600 VA ke atas', value: 1699.53, desc: 'Daya besar rumah mewah' }
];

const selectedTariffIndex = ref(1); // Default to R-1/1300-2200

const selectedTariff = computed(() => {
  return tariffOptions[selectedTariffIndex.value] ?? tariffOptions[1]!;
});

// kWh = (Watt * Hours * 30 hari) / 1000
const monthlyKwh = computed(() => {
  return (watt.value * hours.value * 30) / 1000;
});

const normalBill = computed(() => {
  return monthlyKwh.value * selectedTariff.value.value;
});

const optimizedBill = computed(() => {
  return normalBill.value * 0.70; // 30% saving
});

const savedAmount = computed(() => {
  return normalBill.value * 0.30;
});

const formatRupiah = (value: number) => {
  return 'Rp ' + Math.round(value).toLocaleString('id-ID');
};
</script>

<template>
  <div class="landing-page-body">
    <!-- Header / Navigation -->
    <header :class="{ scrolled: isScrolled }">
      <div class="container nav-container">
        <a href="#" class="logo">
          <img src="icons/LOGO VOLTARIS.webp" alt="Voltaris Logo" class="logo-img" />
          <span>Voltaris</span>
        </a>
        <nav>
          <a href="#about">Tentang</a>
          <a href="#features">Fitur Utama</a>
          <a href="#calculator">Kalkulator Hemat</a>
          <a href="#architecture">Teknologi</a>
          <router-link to="/auth" class="btn-app">Buka Aplikasi</router-link>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <main>
      <section class="hero" id="hero-section">
        <div class="container hero-wrapper">
          <div class="hero-content">
            <h1>Pantau &amp; Optimalkan Energi Secara Cerdas Bersama <span>Voltaris</span></h1>
            <p>Catat penggunaan daya listrik rumah tangga Anda secara praktis, ketahui estimasi biaya pemakaian perangkat, dan dapatkan saran optimasi biaya bulanan dengan mudah.</p>
            <div class="hero-ctas">
              <a href="#calculator" class="btn-primary">Mulai Simulasi</a>
              <a href="#features" class="btn-secondary">Pelajari Fitur</a>
            </div>
          </div>
          <div class="hero-visual">
            <div class="mockup-card">
              <div class="mockup-header">
                <span class="mockup-title">Pemantauan Perangkat</span>
                <div class="mockup-status">
                  <span class="mockup-status-dot"></span>
                  <span>Tercatat</span>
                </div>
              </div>
              <div class="mockup-metrics">
                <div class="mockup-metric">
                  <div class="mockup-metric-val">{{ currentPower }} W</div>
                  <div class="mockup-metric-label">Daya Saat Ini</div>
                </div>
                <div class="mockup-metric">
                  <div class="mockup-metric-val">{{ formatRupiah(currentCost) }}</div>
                  <div class="mockup-metric-label">Biaya Hari Ini</div>
                </div>
              </div>
              <div class="mockup-chart-container">
                <div 
                  v-for="(val, index) in chartBars" 
                  :key="index" 
                  class="mockup-bar" 
                  :style="{ height: (val / 500) * 100 + '%' }" 
                  :data-val="val + 'W'"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section id="about">
        <div class="container about-wrapper">
          <div class="about-graphic">
            <img src="icons/gambar 1.webp" alt="Voltaris Smart Energy House" class="about-img" />
          </div>
          <div class="about-text">
            <h3>Solusi Untuk Efisiensi Energi Rumah Tangga</h3>
            <p>Seringkali kita terkejut dengan lonjakan tagihan listrik bulanan tanpa mengetahui peralatan elektronik mana yang menjadi sumber pemborosan terbesar. <strong>Voltaris</strong> hadir untuk memberikan transparansi penuh.</p>
            <p>Melalui sistem pencatatan pemakaian perangkat elektronik yang praktis dan komputasi cerdas, Voltaris membantu memvisualisasikan konsumsi daya serta aktif memandu Anda untuk meminimalkan pemborosan melalui rekomendasi optimasi jadwal penggunaan.</p>
            <ul class="about-list">
              <li>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Hitung biaya pemakaian secara tepat berdasarkan golongan tarif PLN Anda.</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Ubah kebiasaan boros energi dengan panduan Eco-Simulator yang intuitif.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features">
        <div class="container">
          <div class="section-header">
            <h2>Fitur Unggulan Voltaris</h2>
            <p>Kombinasi teknologi canggih yang mempermudah Anda mengelola penggunaan listrik harian secara praktis.</p>
          </div>
          <div class="features-grid">
            <!-- Feature 1 -->
            <div class="feature-card">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <h3>Monitoring Penggunaan</h3>
              <p>Masukkan data Watt dan durasi pemakaian kulkas, AC, TV, atau dispenser Anda. Visualisasi grafik yang intuitif membantu mendeteksi pola pemakaian daya secara berkala.</p>
            </div>
            <!-- Feature 2 -->
            <div class="feature-card">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.59-7.41A2 2 0 1 1 19 12H2"></path>
                </svg>
              </div>
              <h3>DSS Smart Insights</h3>
              <p>Sistem Pendukung Keputusan yang menganalisis efisiensi alat berdasarkan prioritas penggunaan, membantu Anda memangkas jam operasional perangkat non-kritis dengan cerdas.</p>
            </div>
            <!-- Feature 3 -->
            <div class="feature-card">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <h3>PWA Push Notification</h3>
              <p>Aplikasi web dapat dipasang di smartphone Anda seperti aplikasi bawaan (PWA). Terima notifikasi instan ketika batas konsumsi bulanan Anda hampir melampaui limit.</p>
            </div>
            <!-- Feature 4 -->
            <div class="feature-card">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3>Laporan PDF Otomatis</h3>
              <p>Download rangkuman pemakaian daya bulanan Anda dalam format PDF rapi. Gunakan data laporan ini untuk melacak dan mengevaluasi efisiensi energi jangka panjang.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Savings Calculator Section -->
      <section id="calculator">
        <div class="container">
          <div class="section-header">
            <h2>Simulasi Penghematan Listrik Cerdas</h2>
            <p>Gunakan panel kalkulator simulasi PLN Voltaris untuk menghitung kWh bulanan dan memproyeksikan tagihan Anda secara akurat.</p>
          </div>
          
          <div class="calculator-container">
            <!-- Inputs panel (Meteran Listrik Digital Look) -->
            <div class="calc-inputs-meter">
              <div class="meter-header">
                <div class="meter-brand">VOLTARIS METER</div>
                <div class="meter-model">Model VS-2026</div>
              </div>
              
              <div class="calc-inputs-content">
                <!-- Watt Input with ticks -->
                <div class="calc-group">
                  <div class="calc-label-row">
                    <span class="label-title">Total Daya Elektronik</span>
                    <span class="label-val">{{ watt }} W</span>
                  </div>
                  <input type="range" v-model.number="watt" min="50" max="5000" step="50">
                  <div class="slider-ticks">
                    <span>50W</span>
                    <span>1.5kW</span>
                    <span>3kW</span>
                    <span>5kW</span>
                  </div>
                </div>

                <!-- Hours Input with ticks -->
                <div class="calc-group">
                  <div class="calc-label-row">
                    <span class="label-title">Durasi Penggunaan Harian</span>
                    <span class="label-val">{{ hours }} Jam</span>
                  </div>
                  <input type="range" v-model.number="hours" min="1" max="24" step="1">
                  <div class="slider-ticks">
                    <span>1j</span>
                    <span>6j</span>
                    <span>12j</span>
                    <span>18j</span>
                    <span>24j</span>
                  </div>
                </div>

                <!-- Golongan Tarif PLN (Chips/Cards Selector) -->
                <div class="calc-group">
                  <span class="label-title-main">Golongan Tarif PLN Terpilih:</span>
                  <div class="tariff-grid">
                    <button 
                      v-for="(option, idx) in tariffOptions" 
                      :key="idx" 
                      type="button" 
                      class="tariff-card" 
                      :class="{ active: selectedTariffIndex === idx }" 
                      @click="selectedTariffIndex = idx"
                    >
                      <div class="tariff-card-value">{{ option.value.toLocaleString('id-ID') }} / kWh</div>
                      <div class="tariff-card-label">{{ option.label }}</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Results panel (PLN Invoice Struk Digital Look) -->
            <div class="calc-results-invoice">
              <div class="invoice-header">
                <div class="invoice-title">SIMULASI TAGIHAN LISTRIK</div>
                <div class="invoice-subtitle">VOLTARIS ENERGY OPTIMIZATION</div>
              </div>
              
              <div class="invoice-divider"></div>
              
              <div class="invoice-body">
                <div class="invoice-row">
                  <span class="invoice-label">Konsumsi Bulanan</span>
                  <span class="invoice-val highlight">{{ monthlyKwh.toFixed(1) }} kWh</span>
                </div>
                <div class="invoice-row">
                  <span class="invoice-label">Tarif PLN</span>
                  <span class="invoice-val">Rp {{ selectedTariff.value.toFixed(2) }} / kWh</span>
                </div>
                <div class="invoice-row">
                  <span class="invoice-label">Tagihan Dasar</span>
                  <span class="invoice-val">{{ formatRupiah(normalBill) }}</span>
                </div>
                <div class="invoice-row green-bg">
                  <span class="invoice-label font-bold text-green">Optimasi Voltaris</span>
                  <span class="invoice-val font-bold text-green">-30% (Hemat Cerdas)</span>
                </div>
              </div>
              
              <div class="invoice-divider dashed"></div>
              
              <div class="invoice-total-panel">
                <div class="invoice-total-item">
                  <span class="invoice-total-label">Tagihan Akhir (Optimasi)</span>
                  <span class="invoice-total-val neon-green">{{ formatRupiah(optimizedBill) }}</span>
                </div>
                <div class="invoice-total-item saving-glow">
                  <span class="invoice-total-label font-bold text-green">Total Uang Dihemat</span>
                  <span class="invoice-total-val saving-neon">{{ formatRupiah(savedAmount) }}</span>
                </div>
              </div>

              <!-- Barcode simulating realistic bill statement -->
              <div class="invoice-barcode">
                <div class="barcode-lines"></div>
                <div class="barcode-text">VOLTARIS-2026-PLN-SIMULATOR</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Cara Kerja Section -->
      <section id="architecture">
        <div class="container">
          <div class="section-header">
            <h2>Cara Kerja Voltaris</h2>
            <p>Bagaimana sistem cerdas Voltaris membantu Anda memantau dan mengoptimalkan penggunaan listrik secara mudah.</p>
          </div>
          <div class="flow-container">
            <div class="flow-steps">
              <!-- Step 1 -->
              <div class="flow-step">
                <h4>1. Input Penggunaan</h4>
                <p>Masukkan data daya (watt) dan durasi penggunaan perangkat elektronik Anda secara berkala.</p>
              </div>
              <div class="flow-arrow">&rarr;</div>
              <!-- Step 2 -->
              <div class="flow-step">
                <h4>2. Analisis Cerdas</h4>
                <p>Sistem Voltaris menganalisis data untuk mendeteksi peralatan yang menyebabkan pemborosan energi.</p>
              </div>
              <div class="flow-arrow">&rarr;</div>
              <!-- Step 3 -->
              <div class="flow-step">
                <h4>3. Saran &amp; Notifikasi</h4>
                <p>Rekomendasi optimasi jadwal penggunaan dikirim langsung ke handphone atau laptop Anda.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Call To Action Section -->
      <section>
        <div class="container">
          <div class="cta-banner">
            <h2>Mulai Hemat Tagihan Listrik Anda Hari Ini</h2>
            <p>Bergabunglah bersama ribuan pengguna cerdas lainnya yang telah berhasil menghemat konsumsi energi bulanan hingga 30% menggunakan Voltaris.</p>
            <router-link to="/auth" class="btn-primary">Buka Aplikasi Voltaris</router-link>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer>
      <div class="container">
        <div class="footer-wrapper">
          <a href="#" class="footer-logo">
            <img src="icons/LOGO VOLTARIS.webp" alt="Voltaris Logo" class="footer-logo-img" />
            Voltaris<span>.</span>
          </a>
          <div class="footer-links">
            <a href="#about">Tentang</a>
            <a href="#features">Fitur</a>
            <a href="#calculator">Kalkulator</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Voltaris. Hak Cipta Dilindungi Undang-Undang.</p>
          <p>Sistem Pemantauan &amp; Optimasi Energi Cerdas</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Reset & CSS Custom Properties */
.landing-page-body {
  --bg-dark: #070a13;
  --bg-card: #0e1626;
  --text-white: #ffffff;
  --text-gray: #94a3b8;
  --primary: #10b981;
  --primary-hover: #059669;
  --accent: #34d399;
  --border-color: rgba(255, 255, 255, 0.08);
  --font-outfit: 'Outfit', sans-serif;
  --font-inter: 'Inter', sans-serif;
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  background-color: var(--bg-dark);
  color: var(--text-white);
  font-family: var(--font-inter);
  line-height: 1.6;
  min-height: 100vh;
  width: 100%;
}

h1, h2, h3, h4 {
  font-family: var(--font-outfit);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Header Nav */
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background: rgba(7, 10, 19, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  transition: var(--transition-smooth);
}

header.scrolled {
  padding: 12px 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  transition: var(--transition-smooth);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-outfit);
  font-size: 24px;
  font-weight: 800;
  color: var(--text-white);
  text-decoration: none;
}

.logo-img {
  height: 38px;
  width: auto;
  object-fit: contain;
}

.logo span {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

nav a {
  color: var(--text-gray);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: var(--transition-smooth);
}

nav a:hover {
  color: var(--primary);
}

.btn-app {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: var(--bg-dark);
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
  transition: var(--transition-smooth);
}

.btn-app:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* Hero Section */
.hero {
  position: relative;
  padding: 160px 0 100px 0;
  background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.08), transparent 45%),
              radial-gradient(circle at bottom left, rgba(52, 211, 153, 0.05), transparent 45%);
  min-height: 90vh;
  display: flex;
  align-items: center;
}

.hero-wrapper {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 60px;
}

.hero-content h1 {
  font-size: 56px;
  line-height: 1.1;
  margin-bottom: 24px;
}

.hero-content h1 span {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-content p {
  font-size: 18px;
  color: var(--text-gray);
  margin-bottom: 40px;
  max-width: 520px;
}

.hero-ctas {
  display: flex;
  gap: 16px;
  align-items: center;
}

.btn-primary {
  background: var(--primary);
  color: var(--bg-dark);
  padding: 14px 28px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
  transition: var(--transition-smooth);
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

.btn-secondary {
  border: 1px solid var(--border-color);
  color: var(--text-white);
  background: rgba(255, 255, 255, 0.03);
  padding: 14px 28px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: var(--transition-smooth);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Hero Mockup Graphic */
.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mockup-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 24px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
}

.mockup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}

.mockup-title {
  font-size: 16px;
  font-weight: 600;
}

.mockup-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--primary);
  background: rgba(16, 185, 129, 0.1);
  padding: 4px 8px;
  border-radius: 20px;
}

.mockup-status-dot {
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.mockup-chart-container {
  height: 180px;
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-top: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

.mockup-bar {
  flex: 1;
  background: linear-gradient(to top, var(--primary), var(--accent));
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  transition: height 1s ease-in-out;
  position: relative;
}

.mockup-bar::after {
  content: attr(data-val);
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: var(--text-gray);
}

.mockup-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 20px;
}

.mockup-metric {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.mockup-metric-val {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.mockup-metric-label {
  font-size: 11px;
  color: var(--text-gray);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Section Styles */
section {
  padding: 100px 0;
  border-top: 1px solid var(--border-color);
}

.section-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 60px auto;
}

.section-header h2 {
  font-size: 40px;
  margin-bottom: 16px;
}

.section-header p {
  color: var(--text-gray);
  font-size: 16px;
}

/* About Section */
.about-wrapper {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  align-items: center;
  gap: 60px;
}

.about-text h3 {
  font-size: 28px;
  margin-bottom: 16px;
  color: var(--primary);
}

.about-text p {
  color: var(--text-gray);
  margin-bottom: 24px;
  font-size: 16px;
}

.about-list {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 0;
  margin: 24px 0 0 0;
}

.about-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.about-list li svg {
  color: var(--primary);
  flex-shrink: 0;
  margin-top: 2px;
}

@media (max-width: 640px) {
  .about-list {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.about-graphic {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.12), transparent 70%);
  padding: 0;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.about-img {
  max-width: 100%;
  height: auto;
  -webkit-mask-image: radial-gradient(circle, rgba(0,0,0,1) 68%, rgba(0,0,0,0) 98%);
  mask-image: radial-gradient(circle, rgba(0,0,0,1) 68%, rgba(0,0,0,0) 98%);
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 25px rgba(16, 185, 129, 0.15));
  animation: float-img-animation 6s ease-in-out infinite;
}

@keyframes float-img-animation {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.02);
  }
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 32px;
  transition: var(--transition-smooth);
  position: relative;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  width: 54px;
  height: 54px;
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.feature-card h3 {
  font-size: 20px;
  margin-bottom: 12px;
  line-height: 1.3;
  letter-spacing: -0.01em;
  font-weight: 700;
}

.feature-card p {
  color: var(--text-gray);
  font-size: 14px;
  line-height: 1.6;
}

/* Savings Calculator Section - Meteran Listrik & Struk */
.calculator-container {
  background: #0b0f19;
  border: 1px solid var(--border-color);
  border-radius: 28px;
  padding: 32px;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 40px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255,255,255,0.05);
}

.calc-inputs-meter {
  background: #111827;
  border: 2px solid #1f2937;
  border-radius: 20px;
  padding: 24px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.2);
}

.meter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #374151;
  padding-bottom: 12px;
  margin-bottom: 24px;
}

.meter-brand {
  font-family: var(--font-outfit);
  font-size: 14px;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: 0.1em;
}

.meter-model {
  font-size: 10px;
  color: var(--text-gray);
  background: #1f2937;
  padding: 2px 8px;
  border-radius: 4px;
}

.calc-inputs-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.calc-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.calc-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label-title {
  font-family: var(--font-inter);
  font-size: 15px;
  color: var(--text-gray);
  font-weight: 500;
}

.label-title-main {
  font-family: var(--font-inter);
  font-size: 14px;
  color: var(--text-gray);
  font-weight: 600;
  margin-bottom: 4px;
}

.label-val {
  font-family: var(--font-outfit);
  font-size: 18px;
  color: var(--accent);
  font-weight: 700;
}

/* Custom range slider styling */
input[type=range] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 100%;
  background: transparent;
}

input[type=range]:focus {
  outline: none;
}

input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  background: #374151;
  border-radius: 3px;
}

input[type=range]::-webkit-slider-thumb {
  height: 22px;
  width: 22px;
  border-radius: 50%;
  background: radial-gradient(circle, #34d399 30%, #10b981 100%);
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin-top: -8px;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.6), 0 2px 4px rgba(0,0,0,0.5);
  transition: var(--transition-smooth);
  border: 2px solid #ffffff;
}

input[type=range]::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 0 14px rgba(16, 185, 129, 0.8), 0 2px 6px rgba(0,0,0,0.5);
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
  margin-top: -4px;
}

.slider-ticks span {
  font-size: 10px;
  color: #4b5563;
  font-weight: 500;
}

/* Tariff Grid chips styling */
.tariff-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.tariff-card {
  background: #1f2937;
  border: 1.5px solid #374151;
  border-radius: 12px;
  padding: 12px;
  text-align: left;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.tariff-card-value {
  font-family: var(--font-outfit);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-white);
  margin-bottom: 2px;
}

.tariff-card-label {
  font-size: 10px;
  color: var(--text-gray);
}

.tariff-card:hover {
  border-color: rgba(16, 185, 129, 0.5);
  background: #273142;
}

.tariff-card.active {
  background: rgba(16, 185, 129, 0.08);
  border-color: var(--primary);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
}

.tariff-card.active .tariff-card-value {
  color: var(--accent);
}

/* Struk Invoice Styling */
.calc-results-invoice {
  background: #fdfdfd;
  color: #1f2937;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid #e5e7eb;
}

.calc-results-invoice::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 5%;
  right: 5%;
  height: 6px;
  background-image: radial-gradient(circle, #fdfdfd 4px, transparent 5px);
  background-size: 10px 10px;
  background-repeat: repeat-x;
  transform: rotate(180deg);
}

.invoice-header {
  text-align: center;
  margin-bottom: 18px;
}

.invoice-title {
  font-family: var(--font-outfit);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #1f2937;
}

.invoice-subtitle {
  font-size: 9px;
  color: #6b7280;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.invoice-divider {
  border-bottom: 1.5px solid #e5e7eb;
  margin: 8px 0;
}

.invoice-divider.dashed {
  border-bottom: 1.5px dashed #9ca3af;
  margin: 16px 0;
}

.invoice-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0;
}

.invoice-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.invoice-label {
  color: #4b5563;
}

.invoice-val {
  font-weight: 600;
  color: #1f2937;
}

.invoice-val.highlight {
  color: #059669;
  font-weight: 700;
}

.green-bg {
  background: rgba(16, 185, 129, 0.08);
  padding: 4px 8px;
  border-radius: 6px;
  margin: 4px -8px;
}

.font-bold {
  font-weight: 700;
}

.text-green {
  color: #059669;
}

.invoice-total-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.invoice-total-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.invoice-total-label {
  font-size: 13px;
  color: #1f2937;
}

.invoice-total-val {
  font-family: var(--font-outfit);
  font-size: 20px;
  font-weight: 800;
  color: #111827;
}

.invoice-total-val.neon-green {
  color: #111827;
}

.saving-glow {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(52, 211, 153, 0.05) 100%);
  border: 1px dashed rgba(16, 185, 129, 0.4);
  padding: 8px 12px;
  border-radius: 10px;
  margin: 0 -4px;
}

.saving-neon {
  color: #059669;
  font-size: 24px;
  text-shadow: 0 0 10px rgba(16,185,129,0.1);
}

.invoice-barcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
}

.barcode-lines {
  width: 100%;
  height: 32px;
  background: repeating-linear-gradient(
    90deg,
    #111827,
    #111827 2px,
    transparent 2px,
    transparent 5px,
    #111827 5px,
    #111827 6px,
    transparent 6px,
    transparent 9px
  );
  opacity: 0.85;
}

.barcode-text {
  font-size: 9px;
  font-family: monospace;
  color: #6b7280;
  margin-top: 4px;
  letter-spacing: 0.1em;
}

/* Tech Stack / Architecture Simple Flow */
.flow-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
}

.flow-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 900px;
  gap: 20px;
  position: relative;
}

.flow-step {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 18px 24px;
  text-align: center;
  flex: 1;
  position: relative;
  z-index: 2;
}

.flow-step h4 {
  font-size: 15px;
  color: var(--primary);
  margin-bottom: 4px;
}

.flow-step p {
  font-size: 12px;
  color: var(--text-gray);
}

.flow-arrow {
  color: var(--primary);
  font-size: 24px;
  animation: bounceHorizontal 1.5s infinite;
  z-index: 1;
}

/* CTA Section Banner */
.cta-banner {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 24px;
  padding: 60px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta-banner h2 {
  font-size: 40px;
  margin-bottom: 16px;
}

.cta-banner p {
  color: var(--text-gray);
  max-width: 600px;
  margin: 0 auto 32px auto;
  font-size: 16px;
}

/* Footer */
footer {
  background: #04060b;
  padding: 60px 0 40px 0;
  border-top: 1px solid var(--border-color);
  color: var(--text-gray);
  font-size: 14px;
}

.footer-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-outfit);
  font-size: 22px;
  font-weight: 800;
  color: var(--text-white);
  text-decoration: none;
}

.footer-logo span {
  color: var(--primary);
}

.footer-logo-img {
  height: 34px;
  width: auto;
  object-fit: contain;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-links a {
  color: var(--text-gray);
  text-decoration: none;
  transition: var(--transition-smooth);
}

.footer-links a:hover {
  color: var(--primary);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  padding-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

/* Animations */
@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

@keyframes bounceHorizontal {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(6px);
  }
}

/* Responsive Grid Layouts */
@media (max-width: 968px) {
  /* Headings & Typo */
  .hero-content h1 {
    font-size: 36px;
    margin-bottom: 16px;
  }
  .section-header h2, .cta-banner h2 {
    font-size: 30px;
  }
  .hero {
    padding: 120px 0 60px 0;
  }

  /* Layout wrappers */
  .hero-wrapper {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;
  }
  .hero-content p {
    margin-left: auto;
    margin-right: auto;
    font-size: 16px;
  }
  .hero-ctas {
    justify-content: center;
  }
  
  .about-wrapper {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
  .about-text h3 {
    font-size: 24px;
  }
  .about-list {
    text-align: left;
  }

  .calculator-container {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 24px;
  }
  
  .flow-steps {
    flex-direction: column;
    gap: 16px;
  }
  .flow-arrow {
    transform: rotate(90deg);
    animation: none;
  }

  /* Navigation: Hide nav links, but keep the "Buka Aplikasi" button */
  nav {
    display: flex !important;
    gap: 12px;
    align-items: center;
  }
  nav a:not(.btn-app) {
    display: none;
  }
  .btn-app {
    padding: 8px 16px;
    font-size: 13px;
  }

  /* Footer */
  .footer-wrapper {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  .footer-links {
    justify-content: center;
    gap: 16px;
  }
  .footer-bottom {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
