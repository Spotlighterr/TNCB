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

const router = express.Router();

// Public routes
router.get('/', getProperties);
router.get('/detail/:id', getPropertyDetail);

// Private routes for Landlords & Admins
router.get('/my-properties', auth, checkRole(['landlord', 'admin']), getMyProperties);
router.post('/', auth, checkRole(['landlord', 'admin']), createProperty);
router.put('/:id', auth, checkRole(['landlord', 'admin']), updateProperty);
router.delete('/:id', auth, checkRole(['landlord', 'admin']), deleteProperty);
router.patch('/:id/toggle-rented', auth, checkRole(['landlord', 'admin']), toggleRentedStatus);
router.patch('/:id/toggle-unlist', auth, checkRole(['landlord', 'admin']), toggleUnlistedStatus);

// Private routes for Admins only
router.get('/admin/review-queue', auth, checkRole(['admin']), getAdminReviewQueue);
router.patch('/:id/toggle-verify', auth, checkRole(['admin']), toggleVerifyStatus);
router.patch('/:id/approve', auth, checkRole(['admin']), approveProperty);
router.patch('/:id/reject', auth, checkRole(['admin']), rejectProperty);

export default router;
