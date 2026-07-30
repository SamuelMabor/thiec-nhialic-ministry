const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', testimonialController.getAll);
router.get('/:id', testimonialController.getOne);

// Protected routes (admin only)
router.post('/', auth, testimonialController.create);
router.put('/:id', auth, testimonialController.update);
router.delete('/:id', auth, testimonialController.delete);

module.exports = router;