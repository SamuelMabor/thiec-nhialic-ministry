const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const News = sequelize.define('News', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  author: {
    type: DataTypes.STRING,
    defaultValue: 'Admin'
  },
  category: {
    type: DataTypes.ENUM('Conference', 'Youth', 'Women', 'Chapters', 'Evangelism', 'Worship', 'General'),
    defaultValue: 'General'
  },
  image: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'news'
});

module.exports = News;