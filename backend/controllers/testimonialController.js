const { Testimonial } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(testimonials);
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    res.json(testimonial);
  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonial' });
  }
};

exports.create = async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json(testimonial);
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
};

exports.update = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    await testimonial.update(req.body);
    res.json(testimonial);
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
};

exports.delete = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    await testimonial.destroy();
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
};