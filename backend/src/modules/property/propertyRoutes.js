import express from 'express';
import {
  getProperties,
  getMyProperties,
  getPropertyDetail,
  createProperty,
  updateProperty,
  deleteProperty,
  toggleRentedStatus,
  toggleUnlistedStatus,
  toggleVerifyStatus,
  getAdminReviewQueue,
  approveProperty,
  rejectProperty
} from './propertyController.js';
import { auth, checkRole } from '../../middleware/auth.js';
import { checkPropertyBloomFilter } from './propertyBloomFilter.js';

const router = express.Router();

// Public routes
router.get('/', getProperties);
router.get('/detail/:id', checkPropertyBloomFilter, getPropertyDetail);

// Private routes for Landlords & Admins
router.get('/my-properties', auth, checkRole(['landlord', 'admin']), getMyProperties);
router.post('/', auth, checkRole(['landlord', 'admin']), createProperty);
router.put('/:id', auth, checkRole(['landlord', 'admin']), checkPropertyBloomFilter, updateProperty);
router.delete('/:id', auth, checkRole(['landlord', 'admin']), checkPropertyBloomFilter, deleteProperty);
router.patch('/:id/toggle-rented', auth, checkRole(['landlord', 'admin']), checkPropertyBloomFilter, toggleRentedStatus);
router.patch('/:id/toggle-unlist', auth, checkRole(['landlord', 'admin']), checkPropertyBloomFilter, toggleUnlistedStatus);

// Private routes for Admins only
router.get('/admin/review-queue', auth, checkRole(['admin']), getAdminReviewQueue);
router.patch('/:id/toggle-verify', auth, checkRole(['admin']), checkPropertyBloomFilter, toggleVerifyStatus);
router.patch('/:id/approve', auth, checkRole(['admin']), checkPropertyBloomFilter, approveProperty);
router.patch('/:id/reject', auth, checkRole(['admin']), checkPropertyBloomFilter, rejectProperty);

export default router;
