const { Op } = require('sequelize');
const { Member, Chapter } = require('../models');

// Generate member number
function generateMemberNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `TN${year}${month}${day}${random}`;
}

// Get all members
exports.getAll = async (req, res) => {
  try {
    console.log('📊 Fetching all members...');
    const members = await Member.findAll({
      include: [{ model: Chapter, as: 'chapter', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });
    console.log(`✅ Found ${members.length} members`);
    res.json(members);
  } catch (error) {
    console.error('❌ Get members error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch members',
      details: error.message 
    });
  }
};

// Get single member
exports.getOne = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [{ model: Chapter, as: 'chapter', attributes: ['id', 'name'] }]
    });
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    console.error('❌ Get member error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch member',
      details: error.message 
    });
  }
};

// Create new member
exports.create = async (req, res) => {
  try {
    console.log('📝 Creating member with data:', req.body);
    
    // Validate required fields
    if (!req.body.fullName) {
      return res.status(400).json({ 
        error: 'Full Name is required' 
      });
    }
    
    if (!req.body.phone) {
      return res.status(400).json({ 
        error: 'Phone number is required' 
      });
    }
    
    if (!req.body.gender) {
      return res.status(400).json({ 
        error: 'Gender is required' 
      });
    }
    
    if (!req.body.country) {
      return res.status(400).json({ 
        error: 'Country is required' 
      });
    }
    
    // Generate member number
    const memberNumber = generateMemberNumber();
    console.log('🔢 Generated member number:', memberNumber);
    
    // Prepare member data - ONLY include fields that exist in the model
    const memberData = {
      memberNumber: memberNumber,
      fullName: req.body.fullName.trim(),
      title: req.body.title || 'Member',
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth || null,
      phone: req.body.phone.trim(),
      email: req.body.email || null,
      nationality: req.body.nationality || 'South Sudanese',
      country: req.body.country,
      state: req.body.state || null,
      city: req.body.city || null,
      refugeeCamp: req.body.refugeeCamp || null,
      localChurch: req.body.localChurch || null,
      chapterId: req.body.chapterId ? parseInt(req.body.chapterId) : null,
      position: req.body.position || null,
      dateJoined: req.body.dateJoined || new Date().toISOString().split('T')[0],
      membershipStatus: req.body.membershipStatus || 'Active',
      baptismStatus: req.body.baptismStatus || 'Not Baptized',
      occupation: req.body.occupation || null,
      biography: req.body.biography || null,
      profilePicture: req.body.profilePicture || null,
      emergencyContactName: req.body.emergencyContactName || null,
      emergencyContactPhone: req.body.emergencyContactPhone || null,
      emergencyContactRelation: req.body.emergencyContactRelation || null
    };
    
    console.log('📤 Prepared member data:', memberData);
    
    // Create member
    const member = await Member.create(memberData);
    console.log('✅ Member created successfully with ID:', member.id);
    console.log('✅ Member data:', member.toJSON());
    
    // Fetch the created member with chapter info
    const createdMember = await Member.findByPk(member.id, {
      include: [{ model: Chapter, as: 'chapter', attributes: ['id', 'name'] }]
    });
    
    res.status(201).json(createdMember);
    
  } catch (error) {
    console.error('❌ Create member error:', error);
    console.error('❌ Error details:', error.message);
    
    // Handle specific Sequelize errors
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(e => e.message);
      return res.status(400).json({ 
        error: 'Validation error',
        details: errors 
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Duplicate entry',
        details: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create member',
      details: error.message 
    });
  }
};

// Update member
exports.update = async (req, res) => {
  try {
    console.log('🔄 Updating member ID:', req.params.id);
    console.log('📝 Update data:', req.body);
    
    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Prepare update data
    const updateData = {};
    
    // Only include fields that are provided
    const fields = [
      'fullName', 'title', 'gender', 'dateOfBirth', 'phone', 'email',
      'nationality', 'country', 'state', 'city', 'refugeeCamp', 'localChurch',
      'chapterId', 'position', 'dateJoined', 'membershipStatus', 'baptismStatus',
      'occupation', 'biography', 'profilePicture', 'emergencyContactName',
      'emergencyContactPhone', 'emergencyContactRelation'
    ];
    
    for (const field of fields) {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        updateData[field] = req.body[field];
      }
    }
    
    // Convert chapterId to integer if provided
    if (updateData.chapterId) {
      updateData.chapterId = parseInt(updateData.chapterId);
    }
    
    console.log('📤 Update data prepared:', updateData);
    
    // Update member
    await member.update(updateData);
    console.log('✅ Member updated successfully:', member.id);
    
    // Fetch updated member with chapter info
    const updatedMember = await Member.findByPk(member.id, {
      include: [{ model: Chapter, as: 'chapter', attributes: ['id', 'name'] }]
    });
    
    res.json(updatedMember);
    
  } catch (error) {
    console.error('❌ Update member error:', error);
    console.error('❌ Error details:', error.message);
    
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(e => e.message);
      return res.status(400).json({ 
        error: 'Validation error',
        details: errors 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update member',
      details: error.message 
    });
  }
};

// Delete member
exports.delete = async (req, res) => {
  try {
    console.log('🗑️ Deleting member ID:', req.params.id);
    
    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    await member.destroy();
    console.log('✅ Member deleted successfully:', req.params.id);
    
    res.json({ 
      message: 'Member deleted successfully',
      id: req.params.id 
    });
    
  } catch (error) {
    console.error('❌ Delete member error:', error);
    res.status(500).json({ 
      error: 'Failed to delete member',
      details: error.message 
    });
  }
};

// Search members
exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 1) {
      return res.json([]);
    }
    
    console.log('🔍 Searching members for:', q);
    
    const members = await Member.findAll({
      where: {
        [Op.or]: [
          { memberNumber: { [Op.iLike]: `%${q}%` } },
          { fullName: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } },
          { phone: { [Op.iLike]: `%${q}%` } }
        ]
      },
      include: [{ model: Chapter, as: 'chapter', attributes: ['id', 'name'] }],
      limit: 20
    });
    
    console.log(`✅ Found ${members.length} members`);
    res.json(members);
    
  } catch (error) {
    console.error('❌ Search members error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      details: error.message 
    });
  }
};

// Get members by chapter
exports.getByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    
    const members = await Member.findAll({
      where: { chapterId: chapterId },
      include: [{ model: Chapter, as: 'chapter', attributes: ['id', 'name'] }],
      order: [['fullName', 'ASC']]
    });
    
    res.json(members);
    
  } catch (error) {
    console.error('❌ Get members by chapter error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch members by chapter',
      details: error.message 
    });
  }
};

// Get member statistics
exports.getStats = async (req, res) => {
  try {
    const totalMembers = await Member.count();
    const activeMembers = await Member.count({ 
      where: { membershipStatus: 'Active' } 
    });
    const inactiveMembers = await Member.count({ 
      where: { membershipStatus: 'Inactive' } 
    });
    
    const genderStats = await Member.findAll({
      attributes: [
        'gender',
        [Member.sequelize.fn('COUNT', Member.sequelize.col('id')), 'count']
      ],
      group: ['gender']
    });
    
    res.json({
      total: totalMembers,
      active: activeMembers,
      inactive: inactiveMembers,
      byGender: genderStats
    });
    
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: error.message 
    });
  }
};