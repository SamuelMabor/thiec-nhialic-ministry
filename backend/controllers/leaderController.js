const { Leader } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const leaders = await Leader.findAll({
      order: [['createdAt', 'ASC']]
    });
    res.json(leaders);
  } catch (error) {
    console.error('Get leaders error:', error);
    res.status(500).json({ error: 'Failed to fetch leaders' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const leader = await Leader.findByPk(req.params.id);
    if (!leader) {
      return res.status(404).json({ error: 'Leader not found' });
    }
    res.json(leader);
  } catch (error) {
    console.error('Get leader error:', error);
    res.status(500).json({ error: 'Failed to fetch leader' });
  }
};

exports.create = async (req, res) => {
  try {
    const leader = await Leader.create(req.body);
    res.status(201).json(leader);
  } catch (error) {
    console.error('Create leader error:', error);
    res.status(500).json({ error: 'Failed to create leader' });
  }
};

exports.update = async (req, res) => {
  try {
    const leader = await Leader.findByPk(req.params.id);
    if (!leader) {
      return res.status(404).json({ error: 'Leader not found' });
    }
    await leader.update(req.body);
    res.json(leader);
  } catch (error) {
    console.error('Update leader error:', error);
    res.status(500).json({ error: 'Failed to update leader' });
  }
};

exports.delete = async (req, res) => {
  try {
    const leader = await Leader.findByPk(req.params.id);
    if (!leader) {
      return res.status(404).json({ error: 'Leader not found' });
    }
    await leader.destroy();
    res.json({ message: 'Leader deleted successfully' });
  } catch (error) {
    console.error('Delete leader error:', error);
    res.status(500).json({ error: 'Failed to delete leader' });
  }
};