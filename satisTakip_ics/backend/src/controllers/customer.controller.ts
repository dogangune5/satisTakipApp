import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

// Tüm müşterileri getir
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Müşteriler getirilirken hata oluştu:', error);
    return res
      .status(500)
      .json({ error: 'Müşteriler getirilirken bir hata oluştu' });
  }
};

// ID'ye göre müşteri getir
export const getCustomerById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Müşteri bulunamadı' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Müşteri getirilirken hata oluştu:', error);
    return res
      .status(500)
      .json({ error: 'Müşteri getirilirken bir hata oluştu' });
  }
};

// Yeni müşteri oluştur
export const createCustomer = async (req: Request, res: Response) => {
  const customerData = req.body;

  // createdAt alanını ekle
  customerData.createdAt = new Date();

  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select();

    if (error) throw error;

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error('Müşteri oluşturulurken hata oluştu:', error);
    return res
      .status(500)
      .json({ error: 'Müşteri oluşturulurken bir hata oluştu' });
  }
};

// Müşteri güncelle
export const updateCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const customerData = req.body;

  // updatedAt alanını güncelle
  customerData.updatedAt = new Date();

  try {
    const { data, error } = await supabase
      .from('customers')
      .update(customerData)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (data.length === 0) {
      return res
        .status(404)
        .json({ error: 'Güncellenecek müşteri bulunamadı' });
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error('Müşteri güncellenirken hata oluştu:', error);
    return res
      .status(500)
      .json({ error: 'Müşteri güncellenirken bir hata oluştu' });
  }
};

// Müşteri sil
export const deleteCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from('customers').delete().eq('id', id);

    if (error) throw error;

    return res.status(200).json({ message: 'Müşteri başarıyla silindi' });
  } catch (error) {
    console.error('Müşteri silinirken hata oluştu:', error);
    return res
      .status(500)
      .json({ error: 'Müşteri silinirken bir hata oluştu' });
  }
};
