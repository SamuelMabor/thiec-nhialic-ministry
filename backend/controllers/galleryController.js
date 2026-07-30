const { Gallery } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const gallery = await Gallery.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(gallery);
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const image = await Gallery.findByPk(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json(image);
  } catch (error) {
    console.error('Get gallery item error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
};

exports.create = async (req, res) => {
  try {
    const image = await Gallery.create(req.body);
    res.status(201).json(image);
  } catch (error) {
    console.error('Create gallery error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

exports.update = async (req, res) => {
  try {
    const image = await Gallery.findByPk(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    await image.update(req.body);
    res.json(image);
  } catch (error) {
    console.error('Update gallery error:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
};

exports.delete = async (req, res) => {
  try {
    const image = await Gallery.findByPk(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    await image.destroy();
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete gallery error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};