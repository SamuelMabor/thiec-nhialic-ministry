const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', memberController.getAll);
router.get('/search', memberController.search);
router.get('/:id', memberController.getOne);

// Protected routes (admin only)
router.post('/', auth, memberController.create);
router.put('/:id', auth, memberController.update);
router.delete('/:id', auth, memberController.delete);

module.exports = router;