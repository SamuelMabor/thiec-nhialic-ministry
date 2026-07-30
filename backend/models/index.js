const sequelize = require('../config/database');
const MemberModel = require('./Member');
const NewsModel = require('./News');
const EventModel = require('./Event');
const GalleryModel = require('./Gallery');
const ChapterModel = require('./Chapter');
const LeaderModel = require('./Leader');
const TestimonialModel = require('./Testimonial');
const AdminModel = require('./Admin');

// Initialize models
const Member = MemberModel;
const News = NewsModel;
const Event = EventModel;
const Gallery = GalleryModel;
const Chapter = ChapterModel;
const Leader = LeaderModel;
const Testimonial = TestimonialModel;
const Admin = AdminModel;

// Define associations
Chapter.hasMany(Member, { 
  foreignKey: 'chapterId', 
  as: 'chapterMembers'
});
Member.belongsTo(Chapter, { 
  foreignKey: 'chapterId', 
  as: 'chapter' 
});

// Export models
const models = {
  sequelize,
  Sequelize: require('sequelize'),
  Member,
  News,
  Event,
  Gallery,
  Chapter,
  Leader,
  Testimonial,
  Admin
};

module.exports = models;