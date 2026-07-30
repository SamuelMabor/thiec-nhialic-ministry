const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
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
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  organizer: {
    type: DataTypes.STRING
  },
  category: {
    type: DataTypes.ENUM('Conference', 'Youth', 'Women', 'Worship', 'Crusade', 'Training', 'General'),
    defaultValue: 'General'
  },
  poster: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'events'
});

module.exports = Event;