const expressPlayground = require('graphql-playground-middleware-express').default;
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const { readFileSync } = require('fs');

let _id = 0;
let users = [
  { "githubLogin": "jotaro", "name": "承太郎" },
  { "githubLogin": "polnareff", "name": "ポルナレフ" },
  { "githubLogin": "abdul", "name": "アブドゥル" },
];
let photos = [
  {
    "id": "1",
    "name": "Star",
    "description": "Platinum",
    "category": "ACTION",
    "githubUser": "jotaro",
    "created": "3-28-1977"
  },
  {
    "id": "2",
    "name": "Silver",
    "description": "Chariots",
    "category": "SELFIE",
    "githubUser": "polnareff",
    "created": "1-2-1985"
  },
  {
    "id": "3",
    "name": "Magicians",
    "description": "Red",
    "category": "LANDSCAPE",
    "githubUser": "abdul",
    "created": "2028-04-15T19:09:57.308Z"
  },
];
let tags = [
  { "photoID": "1", "userID": "jotaro" },
  { "photoID": "2", "userID": "polnareff" },
  { "photoID": "2", "userID": "abdul" },
  { "photoID": "2", "userID": "jotaro" },
];

const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');
const resolvers = require('./resolvers');

let app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.applyMiddleware({ app });

app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'));

app.listen({ port: 4000 }, () => {
  console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`);
});
