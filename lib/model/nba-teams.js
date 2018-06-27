'use strict';

import mongoose from 'mongoose';

const nbaTeamsSchema = mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  conference: { type: String, required: true },
  championships: { type: Number, required: true }, 
});

export default mongoose.model('nba-teams', nbaTeamsSchema);

