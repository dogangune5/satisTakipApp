import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller.js';

const router = express.Router();

// Tüm müşterileri getir
router.get('/', getAllCustomers);

// ID'ye göre müşteri getir
router.get('/:id', getCustomerById);

// Yeni müşteri oluştur
router.post('/', createCustomer);

// Müşteri güncelle
router.put('/:id', updateCustomer);

// Müşteri sil
router.delete('/:id', deleteCustomer);

export default router;
