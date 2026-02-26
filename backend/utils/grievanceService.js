const Grievance = require('../models/Grievance');

/**
 * Auto-escalate grievances that are open for more than X days
 */
const autoEscalateGrievances = async () => {
  try {
    const daysSinceCreation = 7; // Escalate after 7 days
    const dateThreshold = new Date(Date.now() - daysSinceCreation * 24 * 60 * 60 * 1000);

    const grievancesToEscalate = await Grievance.find({
      status: { $in: ['Open', 'In Progress'] },
      createdAt: { $lt: dateThreshold },
      escalationLevel: { $lt: 3 }
    });

    const escalationPromises = grievancesToEscalate.map(async grievance => {
      grievance.escalationLevel += 1;
      grievance.status = 'Escalated';
      grievance.responses.push({
        respondent: 'System',
        message: `Auto-escalated to level ${grievance.escalationLevel} due to pending resolution`,
        date: new Date()
      });
      await grievance.save();
    });

    await Promise.all(escalationPromises);

    return {
      escalatedCount: grievancesToEscalate.length
    };
  } catch (error) {
    throw new Error('Error in auto-escalation');
  }
};

module.exports = {
  autoEscalateGrievances
};
