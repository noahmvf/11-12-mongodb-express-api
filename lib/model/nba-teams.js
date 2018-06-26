'use strict';

import mongoose from 'mongoose';

const nbaTeamsSchema = mongoose.Schema({
  general: {
    name: 'Magic',
    location: 'Orlando',
    conference: 'Eastern',
  },
  awards: {
    championships: 0,
  },
  traits: {
    mascot: 'Magic Dragon',
    colors: ['blue', 'black'],
  },
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('nba-teams', nbaTeamsSchema, 'nba-teams', skipInit);

