const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Gallery = sequelize.define('Gallery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  src: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  caption: {
    type: DataTypes.STRING,
    defaultValue: 'Untitled'
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'General'
  }
}, {
  timestamps: true,
  tableName: 'gallery'
});

module.exports = Gallery;