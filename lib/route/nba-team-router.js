'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import Team from '../model/nba-teams';
import logger from '../logger';


// this is a third party module we are using to tit replace 
// the body-parser we wrote from scratch in labs 8-9
// only pass this is as middleware to POST and PUT requests
const jsonParser = bodyParser.json();
const nbaTeamRouter = new Router();

nbaTeamRouter.post('/api/nba-teams', jsonParser, (request, response) => {
  logger.log(logger.INFO, 'NBA-TEAM-ROUTER POST to /api/nba-teams - processing a request');
  if (!request.body.name) {
    logger.log(logger.INFO, 'NBA-TEAM-ROUTER POST /api/nba-teams: Responding with 400 error for no name');
    return response.sendStatus(400);
  }

  Team.init() //  init sets up our indexes
    .then(() => {
      return new Team(request.body).save(); //  .save() is given by mongoose, it returns a promise
    })
    .then((newTeam) => { // newTeam is what gets returned when we run the .save()
      logger.log(logger.INFO, `NBA-TEAM-ROUTER POST:  a new team was saved: ${JSON.stringify(newTeam)}`);
      return response.json(newTeam);
    })
    .catch((err) => {
      // we will hit here if we have some misc. mongodb error or parsing id error
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `Team-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed, ${err.message}`);
        return response.sendStatus(404);
      }

      // a required property was not included, i.e. in this case, "title"
      if (err.message.toLowerCase().includes('validation failed')) {
        logger.log(logger.ERROR, `Team-ROUTER PUT: responding with 400 status code for bad request ${err.message}`);
        return response.sendStatus(400);
      }
      // we passed in a title that already exists on a resource in the db because in our Team model, we set title to be "unique"
      if (err.message.toLowerCase().includes('duplicate key')) {
        logger.log(logger.ERROR, `Team-ROUTER PUT: responding with 409 status code for dup key ${err.message}`);
        return response.sendStatus(409);
      }

      // if we hit here, something else not accounted for occurred
      logger.log(logger.ERROR, `Team-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500); // Internal Server Error
    });
  return undefined;
});

// you need this question mark after ":id" or else Express will skip to the catch-all in lib/server.js 
nbaTeamRouter.get('/api/nba-teams/:id?', (request, response) => {
  logger.log(logger.INFO, 'NBA-TEAM-ROUTER GET /api/nba-teams/:id = processing a request');

  // TODO:
  // if (!request.params.id) do logic here to return an array of all resources, else do the logic below

  return Team.findOne({ _id: request.params.id })
    .then((team) => {
      if (!team) {
        logger.log(logger.INFO, 'NBA-TEAM-ROUTER GET /api/nba-teams/:id: responding with 404 status code for no team found');
        return response.sendStatus(404);
      }
      logger.log(logger.INFO, 'NBA-TEAM-ROUTER GET /api/nba-teams/:id: responding with 200 status code for successful get');
      return response.json(team);
    })
    .catch((err) => {
      // we will hit here if we have a mongodb error or parsing id error
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `NBA-TEAM-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed`);
        return response.sendStatus(404);
      }

      // if we hit here, something else not accounted for occurred
      logger.log(logger.ERROR, `NBA-TEAM-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
});

nbaTeamRouter.put('/api/nba-teams/:id?', jsonParser, (request, response) => {
  if (!request.params.id) {
    logger.log(logger.INFO, 'NBA-TEAM-ROUTER PUT /api/nba-teams: Responding with a 400 error code for no id passed in');
    return response.sendStatus(400);
  }

  // we need to pass these options into "findByIdAndUpdate" so we can actually return the newly modified document in the promise per "new", and "runValidators" ensures that the original validators we set on the model
  const options = {
    new: true,
    runValidators: true,
  };

  Team.init()
    .then(() => {
      return Team.findByIdAndUpdate(request.params.id, request.body, options);
    })
    .then((updatedTeam) => {
      logger.log(logger.INFO, `NBA-TEAM-ROUTER PUT - responding with a 200 status code for successful updated team: ${JSON.stringify(updatedTeam)}`);
      return response.json(updatedTeam);
    })
    .catch((err) => {
      // we will hit here if we have some misc. mongodb error or parsing id error
      if (err.message.toLowerCase().includes('cast to objectid failed')) {
        logger.log(logger.ERROR, `NBA-TEAM-ROUTER PUT: responding with 404 status code to mongdb error, objectId ${request.params.id} failed, ${err.message}`);
        return response.sendStatus(404);
      }

      // a required property was not included, i.e. in this case, "title"
      if (err.message.toLowerCase().includes('validation failed')) {
        logger.log(logger.ERROR, `NBA-TEAM-ROUTER PUT: responding with 400 status code for bad request ${err.message}`);
        return response.sendStatus(400);
      }
      // we passed in a title that already exists on a resource in the db because in our Team model, we set title to be "unique"
      if (err.message.toLowerCase().includes('duplicate key')) {
        logger.log(logger.ERROR, `NBA-TEAM-ROUTER PUT: responding with 409 status code for dup key ${err.message}`);
        return response.sendStatus(409);
      }

      // if we hit here, something else not accounted for occurred
      logger.log(logger.ERROR, `NBA-TEAM-ROUTER GET: 500 status code for unaccounted error ${JSON.stringify(err)}`);
      return response.sendStatus(500);
    });
  return undefined;
});

export default nbaTeamRouter;
