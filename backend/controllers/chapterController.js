const { Chapter, Member } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const chapters = await Chapter.findAll({
      order: [['name', 'ASC']]
    });
    res.json(chapters);
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const chapter = await Chapter.findByPk(req.params.id);
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    res.json(chapter);
  } catch (error) {
    console.error('Get chapter error:', error);
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
};

exports.create = async (req, res) => {
  try {
    const chapter = await Chapter.create(req.body);
    res.status(201).json(chapter);
  } catch (error) {
    console.error('Create chapter error:', error);
    res.status(500).json({ error: 'Failed to create chapter' });
  }
};

exports.update = async (req, res) => {
  try {
    const chapter = await Chapter.findByPk(req.params.id);
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    await chapter.update(req.body);
    res.json(chapter);
  } catch (error) {
    console.error('Update chapter error:', error);
    res.status(500).json({ error: 'Failed to update chapter' });
  }
};

exports.delete = async (req, res) => {
  try {
    const chapter = await Chapter.findByPk(req.params.id);
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    await chapter.destroy();
    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Delete chapter error:', error);
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
};