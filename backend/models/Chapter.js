const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chapter = sequelize.define('Chapter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  coordinator: {
    type: DataTypes.STRING
  },
  members: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  address: {
    type: DataTypes.STRING
  },
  phone: {
    type: DataTypes.STRING
  },
  activities: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'chapters'
});

module.exports = Chapter;