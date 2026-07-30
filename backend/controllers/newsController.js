const { News } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const news = await News.findAll({
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });
    res.json(news);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }
    res.json(news);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

exports.create = async (req, res) => {
  try {
    const news = await News.create(req.body);
    res.status(201).json(news);
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Failed to create news' });
  }
};

exports.update = async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }
    await news.update(req.body);
    res.json(news);
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Failed to update news' });
  }
};

exports.delete = async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    if (!news) {
      return res.status(404).json({ error: 'News not found' });
    }
    await news.destroy();
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Failed to delete news' });
  }
};