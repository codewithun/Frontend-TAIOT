/* eslint-disable no-unused-vars */
// Mock data untuk simulasi monitoring energi listrik

export const generateHourlyData = () => {
  const hours = []
  const now = new Date()
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now)
    time.setHours(now.getHours() - i, 0, 0, 0)
    const hour = time.getHours()
    // Pola konsumsi realistis: pagi naik, siang tinggi, malam turun
    // eslint-disable-next-line no-useless-assignment
    let base = 120
    if (hour >= 6 && hour <= 9) base = 180 + Math.random() * 40
    else if (hour >= 9 && hour <= 17) base = 220 + Math.random() * 60
    else if (hour >= 17 && hour <= 21) base = 260 + Math.random() * 80
    else if (hour >= 21 && hour <= 23) base = 150 + Math.random() * 30
    else base = 80 + Math.random() * 20

    hours.push({
      time: time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      konsumsi: Math.round(base),
      biaya: Math.round(base * 1.444), // Rp 1.444/kWh (tarif PLN R-2)
      tegangan: Math.round(218 + Math.random() * 8),
      arus: parseFloat((base / 220).toFixed(2)),
    })
  }
  return hours
}

export const generateDailyData = () => {
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
  return days.map((day, i) => ({
    day,
    konsumsi: Math.round(3200 + Math.random() * 1800),
    target: 4500,
    biaya: Math.round((3200 + Math.random() * 1800) * 1.444),
  }))
}

export const generateMonthlyData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return months.map((month, i) => ({
    month,
    konsumsi: Math.round(85000 + Math.random() * 45000),
    biaya: Math.round((85000 + Math.random() * 45000) * 1.444),
    prevYear: Math.round(90000 + Math.random() * 40000),
  }))
}

export const perangkat = [
  { id: 1, nama: 'AC Split 1 PK', ruang: 'Ruang Tamu', daya: 900, status: 'aktif', jam: 8.5, warna: '#22d3ee' },
  { id: 2, nama: 'Water Heater', ruang: 'Kamar Mandi', daya: 1500, status: 'aktif', jam: 1.2, warna: '#4ade80' },
  { id: 3, nama: 'Kulkas 2 Pintu', ruang: 'Dapur', daya: 150, status: 'aktif', jam: 24, warna: '#a78bfa' },
  { id: 4, nama: 'Mesin Cuci', ruang: 'Belakang', daya: 450, status: 'nonaktif', jam: 1.0, warna: '#facc15' },
  { id: 5, nama: 'TV LED 55"', ruang: 'Kamar Utama', daya: 120, status: 'aktif', jam: 6.0, warna: '#fb923c' },
  { id: 6, nama: 'Pompa Air', ruang: 'Luar', daya: 375, status: 'aktif', jam: 2.5, warna: '#f87171' },
  { id: 7, nama: 'Komputer + Monitor', ruang: 'Kantor', daya: 350, status: 'aktif', jam: 10.0, warna: '#38bdf8' },
  { id: 8, nama: 'Lampu LED (12 titik)', ruang: 'Semua Ruang', daya: 96, status: 'aktif', jam: 12.0, warna: '#86efac' },
]

export const generateAlerts = () => [
  { id: 1, type: 'warning', msg: 'Konsumsi AC melebihi rata-rata 23%', time: '2 mnt lalu', icon: 'alert' },
  { id: 2, type: 'info', msg: 'Tagihan bulan ini Rp 487.200 (estimasi)', time: '1 jam lalu', icon: 'info' },
  { id: 3, type: 'success', msg: 'Efisiensi hari ini 94% — di atas target', time: '3 jam lalu', icon: 'check' },
  { id: 4, type: 'error', msg: 'Tegangan drop terdeteksi: 208V (21:32)', time: '6 jam lalu', icon: 'zap' },
]

export const kwhStats = {
  dayKwh: 18.4,
  monthKwh: 412.8,
  voltage: 223,
  current: 8.36,
  frequency: 50.0,
  powerFactor: 0.97,
  totalBiayaBulan: 596,
  efficiency: 94,
  co2: 0.87, // ton CO2 per bulan
  dayTarget: 22,
  monthTarget: 450,
}