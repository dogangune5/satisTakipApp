import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Rotaları içe aktar
import customerRoutes from './routes/customer.routes.js';

// Ortam değişkenlerini yükle
dotenv.config();

// ES modül desteği için __dirname oluşturma
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express uygulamasını oluştur
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ana rota
app.get('/', (req, res) => {
  res.json({ message: 'Satış Takip API çalışıyor!' });
});

// API rotaları
app.use('/api/customers', customerRoutes);

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
