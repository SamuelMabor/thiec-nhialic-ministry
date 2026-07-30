const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', chapterController.getAll);
router.get('/:id', chapterController.getOne);

// Protected routes (admin only)
router.post('/', auth, chapterController.create);
router.put('/:id', auth, chapterController.update);
router.delete('/:id', auth, chapterController.delete);

module.exports = router;