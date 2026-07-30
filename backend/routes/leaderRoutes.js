const express = require('express');
const router = express.Router();
const leaderController = require('../controllers/leaderController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', leaderController.getAll);
router.get('/:id', leaderController.getOne);

// Protected routes (admin only)
router.post('/', auth, leaderController.create);
router.put('/:id', auth, leaderController.update);
router.delete('/:id', auth, leaderController.delete);

module.exports = router;