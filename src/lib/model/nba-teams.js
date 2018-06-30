'use strict';

import mongoose from 'mongoose';

const nbaTeamsSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  conference: { type: String, required: true },
  championships: { type: Number, required: true }, 
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('nba-teams', nbaTeamsSchema, 'nba-teams', skipInit);

