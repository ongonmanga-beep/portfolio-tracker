# Portfolio Tracker

Modern portföy takip uygulaması. Varlıkları yönet, kâr/zarar takip et, temettü gelirlerini izle.

## Özellikler

- **Varlık Yönetimi**: Hisse, kripto, ETF, yatırım fonu, gayrimenkul, nakit
- **Otomatik Fiyat Çekme**: 
  - Hisse & ETF → Yahoo Finance API
  - TEFAS Fonları → Backend API (tefas-crawler)
- **Kâr/Zarar Takibi**: Anlık kâr/zarar hesaplama
- **Temettü Gelirleri**: Aylık/yıllık temettü geliri projeksiyonu
- **Treemap Görselleştirme**: ECharts ile portföy dağılımı
- **CSV Import**: TradingView format desteği
- **LocalStorage**: Veriler tarayıcıda saklanır

## Kurulum

### Frontend

```bash
cd portfolio-tracker
npm install
npm run dev
```

Frontend http://localhost:5175 adresinde çalışır.

### Backend API

```bash
cd portfolio-tracker-api

# Python 3.11 veya 3.12 gerekli (3.14 uyumsuz)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

python main.py
```

API http://localhost:8080 adresinde çalışır.

## Teknolojiler

**Frontend:**
- React 19 + TypeScript
- Vite + TailwindCSS 4
- ECharts (Treemap)
- Lucide Icons

**Backend:**
- FastAPI
- tefas-crawler (TEFAS fon verileri)
- Pandas

## API Endpoints

```
GET /health                          - Sağlık kontrolü
GET /api/v1/stocks/{symbol}          - Hisse fiyatı + temettü (Yahoo Finance)
GET /api/v1/prices/{symbol}          - Fon fiyat geçmişi (TEFAS)
GET /api/v1/funds                    - Fon listesi
GET /api/v1/rates/usd-try            - USD/TRY kuru
```

## Veri Saklama

Tüm veriler `localStorage`'da saklanır:
- `portfolio_assets_v1` - Varlık listesi

## Build

```bash
npm run build
```

Production dosyaları `dist/` klasörüne oluşturulur.

## Deploy

### Vercel

```bash
npm run deploy
```

### GitHub Pages

```bash
npm run deploy
```

## Notlar

- **Python 3.14 uyumsuzluğu**: `tefas-crawler` kütüphanesi Python 3.11/3.12 ile çalışır
- TEFAS API timeout sorunları için Python versiyonunu düşürün
