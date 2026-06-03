import express from 'express';
import {
  createTicket,
  getTickets,
  updateTicketStatus
} from '../controllers/ticketController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createTicket);
router.get('/', auth, getTickets);
router.patch('/:id/status', auth, updateTicketStatus);

export default router;
