'use strict';

import faker from 'faker';
import superagent from 'superagent';
import Team from '../model/nba-teams';
import { startServer, stopServer } from '../server';

const apiUrl = `http://localhost:${process.env.PORT}/api/nba-teams`;

const createMockPromise = () => {
  return new Team({
    name: faker.lorem.words(1),
    location: faker.lorem.words(1),
    conference: faker.lorem.words(1),
    championships: Math.floor(Math.random() * 10),
  }).save(); // built-in mongoose POST method
};

beforeAll(startServer);
afterAll(stopServer);

afterEach(() => Team.remove({})); //  clean up test database of all our mock instances so we can start fresh

describe('POST requests to /api/nba-teams', () => {
  const mockTeamPost = {
    name: faker.lorem.words(2),
    location: faker.lorem.words(2),
    conference: faker.lorem.words(1),
    championships: Math.floor(Math.random() * 10),
  };
 
  test('POST 200 for successful creation of team', () => {
    // const mockTeamPost = {
    //   name: faker.lorem.words(1),
    //   location: faker.lorem.words(1),
    //   conference: faker.lorem.words(1),
    //   championships: Math.floor(Math.random() * 10), 
    // };
    return superagent.post(apiUrl)
      .send(mockTeamPost)
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.name).toEqual(mockTeamPost.name);
        expect(response.body.location).toEqual(mockTeamPost.location);
        expect(response.body.conference).toEqual(mockTeamPost.conference);
        expect(response.body.championships).toEqual(mockTeamPost.championships);
        expect(response.body._id).toBeTruthy();
      })
      .catch((err) => {
        throw err;
      });
  });

  test('POST 400 for not sending in a required NAME property', () => {
    const tempTeam = mockTeamPost;
    tempTeam.name = null;
    return superagent.post(apiUrl)
      .send(tempTeam)
      .then((response) => {
        throw response;
      })
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });

  test('POST 409 for duplicate key', () => {
    return superagent.post(apiUrl)
      .send(mockTeamPost)
      .then((response) => {
        throw response;
      })
      .catch((err) => {
        expect(err.status).toEqual(409);
      });
  });
});

describe('GET requests to /api/notes', () => {
  test('200 GET for succesful fetching of a note', () => {
    let mockTeamForGet;
    return createMockPromise()
      .then((team) => {
        mockTeamForGet = team;
        // I can return this to the next then block because superagent requests are also promisfied
        return superagent.get(`${apiUrl}/${mockTeamForGet._id}`);
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.name).toEqual(mockTeamForGet.name);
        expect(response.body.location).toEqual(mockTeamForGet.location);
        expect(response.body.conference).toEqual(mockTeamForGet.conference);
        expect(response.body.championships).toEqual(mockTeamForGet.championships);
      })
      .catch((err) => {
        throw err;
      });
  });

  test('404 GET: no note with this id', () => {
    return superagent.get(`${apiUrl}/THISISABADID`)
      .then((response) => {
        throw response;
      })
      .catch((err) => {
        expect(err.status).toEqual(404);
      });
  });
});

describe('PUT request to /api/notes', () => {
  test('200 PUT for successful update of a resource', () => {
    return createMockPromise()
      .then((newTeam) => {
        return superagent.put(`${apiUrl}/${newTeam._id}`)
          .send({ name: 'updated name', location: 'updated location' })
          .then((response) => {
            expect(response.status).toEqual(200);
            expect(response.body.name).toEqual('updated name');
            expect(response.body.location).toEqual('updated location');
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  });
});

