require('dotenv').config();
const { MongoClient } = require('mongodb');
const expressPlayground = require('graphql-playground-middleware-express').default;
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const { readFileSync } = require('fs');
const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');
const resolvers = require('./resolvers');

async function start() {
  const client = await MongoClient.connect(
    process.env.DB_HOST,
    {
      useNewUrlParser: true,
      auth: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
    }
  );
  const db = client.db();

  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const githubToken = req.headers.authorization;
      const currentUser = await db.collection('users').findOne({ githubToken });
      return { db, currentUser };
    },
  });
  server.applyMiddleware({app});

  app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'));
  app.get('/playground', expressPlayground({endpoint: '/graphql'}));

  app.listen({port: 4000}, () => {
    console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`);
  });
}

start();


