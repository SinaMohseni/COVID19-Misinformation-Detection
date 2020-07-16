const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;

const interactionSchema = mongoose.Schema({
  hit_id: String,
  log: Mixed,
}, { timestamps: { createdAt: 'createdAt', updatedAt : 'updatedAt' } })

module.exports = mongoose.model('Interaction', interactionSchema);

// 
// 
// taskRun : {
  //   type: ObjectId,
  //   ref : 'TaskRun'
  // },
