const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const memberController = require('../controllers/memberController');
const newsController = require('../controllers/newsController');
const eventController = require('../controllers/eventController');
const galleryController = require('../controllers/galleryController');
const chapterController = require('../controllers/chapterController');
const leaderController = require('../controllers/leaderController');
const testimonialController = require('../controllers/testimonialController');

// ===== MEMBERS =====
router.get('/members', memberController.getAll);
router.get('/members/search', memberController.search);
router.get('/members/:id', memberController.getOne);
router.post('/members', auth, memberController.create);
router.put('/members/:id', auth, memberController.update);
router.delete('/members/:id', auth, memberController.delete);

// ===== NEWS =====
router.get('/news', newsController.getAll);
router.get('/news/:id', newsController.getOne);
router.post('/news', auth, newsController.create);
router.put('/news/:id', auth, newsController.update);
router.delete('/news/:id', auth, newsController.delete);

// ===== EVENTS =====
router.get('/events', eventController.getAll);
router.get('/events/:id', eventController.getOne);
router.post('/events', auth, eventController.create);
router.put('/events/:id', auth, eventController.update);
router.delete('/events/:id', auth, eventController.delete);

// ===== GALLERY =====
router.get('/gallery', galleryController.getAll);
router.get('/gallery/:id', galleryController.getOne);
router.post('/gallery', auth, galleryController.create);
router.put('/gallery/:id', auth, galleryController.update);
router.delete('/gallery/:id', auth, galleryController.delete);

// ===== CHAPTERS =====
router.get('/chapters', chapterController.getAll);
router.get('/chapters/:id', chapterController.getOne);
router.post('/chapters', auth, chapterController.create);
router.put('/chapters/:id', auth, chapterController.update);
router.delete('/chapters/:id', auth, chapterController.delete);

// ===== LEADERS =====
router.get('/leaders', leaderController.getAll);
router.get('/leaders/:id', leaderController.getOne);
router.post('/leaders', auth, leaderController.create);
router.put('/leaders/:id', auth, leaderController.update);
router.delete('/leaders/:id', auth, leaderController.delete);

// ===== TESTIMONIALS =====
router.get('/testimonials', testimonialController.getAll);
router.get('/testimonials/:id', testimonialController.getOne);
router.post('/testimonials', auth, testimonialController.create);
router.put('/testimonials/:id', auth, testimonialController.update);
router.delete('/testimonials/:id', auth, testimonialController.delete);

module.exports = router;