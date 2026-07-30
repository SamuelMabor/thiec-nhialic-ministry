const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Testimonial = sequelize.define('Testimonial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'testimonials'
});

module.exports = Testimonial;