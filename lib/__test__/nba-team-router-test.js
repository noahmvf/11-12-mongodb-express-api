'use strict';

import faker from 'faker';
import superagent from 'superagent';
import Team from '../model/nba-teams';
import { startServer, stopServer } from '../server';

const apiUrl = `http://localhost:${process.env.PORT}/api/notes`;

const createMockPromise = () => {
  return new Team({
    name: faker.lorem.words(1),
    location: faker.lorem.words(1),
    conference: faker.lorem.words(1),
    championships: faker.lorem.numbers(2),
  }).save(); // built-in mongoose POST method
};

beforeAll(startServer);
afterAll(stopServer);

afterEach(() => Team.remove({})); //  clean up test database of all our mock instances so we can start fresh

describe('POST requests to /api/nba-teams', () => {
  test('POST 200 for successful creation of team', () => {
    const mockTeamPost = {
      name: faker.lorem.words(1),
      location: faker.lorem.words(1),
      conference: faker.lorem.words(1),
      championships: faker.lorem.numbers(2), 
    };
    return superagent.post(apiUrl)
      .send(mockTeamPost)
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.name).toEqual(mockTeamPost.name);
        expect(response.body.location).toEqual(mockTeamPost.location);
        expect(response.body.conference).toEqual(mockTeamPost.conference);
        expect(response.body.championships).toEqual(mockTeamPost.championships);
        expect(response.body._id).toBeTruthy();
        expect(response.body.createdOn).toBeTruthy();
      })
      .catch((err) => {
        throw err;
      });
  });

  test('POST 400 for not sending in a required TITLE property', () => {
    const mockTeamPost = {
      location: faker.lorem.words(2),
      conference: faker.lorem.words(1),
      championships: faker.lorem.numbers(1),
    };
    return superagent.post(apiUrl)
      .send(mockTeamPost)
      .then((response) => {
        throw response;
      })
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });

  test('POST 409 for duplicate key', () => {
    return createMockPromise()
      .then((newNote) => {
        return superagent.post(apiUrl)
          .send({ title: newNote.title })
          .then((response) => {
            throw response;
          })
          .catch((err) => {
            expect(err.status).toEqual(409);
          });
      })
      .catch((err) => {
        throw err;
      });
  });
});

describe('GET requests to /api/notes', () => {
  test('200 GET for succesful fetching of a note', () => {
    let mockTeamForGet;
    return createMockPromise()
      .then((note) => {
        mockTeamForGet = note;
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
          .send({ title: 'updated title', content: 'updated content' })
          .then((response) => {
            expect(response.status).toEqual(200);
            expect(response.body.name).toEqual('updated name');
            expect(response.body.location).toEqual('updated location');
            expect(response.body.conference).toEqual('updated conference');
            expect(response.body.championships).toEqual('updated championships');
            expect(response.body._id.toString()).toEqual(newTeam._id.toString());
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
