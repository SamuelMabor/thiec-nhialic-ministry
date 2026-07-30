const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  memberNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    defaultValue: 'Member'
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female'),
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  nationality: {
    type: DataTypes.STRING,
    defaultValue: 'South Sudanese'
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING
  },
  city: {
    type: DataTypes.STRING
  },
  refugeeCamp: {
    type: DataTypes.STRING
  },
  localChurch: {
    type: DataTypes.STRING
  },
  chapterId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  position: {
    type: DataTypes.STRING
  },
  dateJoined: {
    type: DataTypes.DATEONLY
  },
  membershipStatus: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Suspended'),
    defaultValue: 'Active'
  },
  baptismStatus: {
    type: DataTypes.ENUM('Baptized', 'Not Baptized', 'In Progress'),
    defaultValue: 'Not Baptized'
  },
  occupation: {
    type: DataTypes.STRING
  },
  biography: {
    type: DataTypes.TEXT
  },
  profilePicture: {
    type: DataTypes.TEXT
  },
  emergencyContactName: {
    type: DataTypes.STRING
  },
  emergencyContactPhone: {
    type: DataTypes.STRING
  },
  emergencyContactRelation: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  tableName: 'members'
});

module.exports = Member;