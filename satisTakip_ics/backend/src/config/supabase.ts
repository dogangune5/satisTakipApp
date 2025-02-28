import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Ortam değişkenlerini yükle
dotenv.config();

// Supabase bağlantı bilgilerini al
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Supabase istemcisini oluştur
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL ve Key ortam değişkenlerinde tanımlanmalıdır.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
