const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', newsController.getAll);
router.get('/:id', newsController.getOne);

// Protected routes (admin only)
router.post('/', auth, newsController.create);
router.put('/:id', auth, newsController.update);
router.delete('/:id', auth, newsController.delete);

module.exports = router;