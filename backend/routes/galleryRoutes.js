const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', galleryController.getAll);
router.get('/:id', galleryController.getOne);

// Protected routes (admin only)
router.post('/', auth, galleryController.create);
router.put('/:id', auth, galleryController.update);
router.delete('/:id', auth, galleryController.delete);

module.exports = router;