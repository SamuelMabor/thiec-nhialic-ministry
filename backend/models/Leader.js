const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Leader = sequelize.define('Leader', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.TEXT
  },
  bio: {
    type: DataTypes.TEXT
  },
  contact: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  tableName: 'leaders'
});

module.exports = Leader;