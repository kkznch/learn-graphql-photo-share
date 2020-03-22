# "初めてのGraphQL" サーバーの実装

## Install

```shell
$ git clone git@github.com:kkznch/learn-graphql-photo-share.git
$ cd learn-graphql-photo-share
$ npm install
```

## Execute

Prepare your `.env`, then add your GitHub client ID and secret.

```shell
$ cp .env.example .env
```

```diff:.env
DB_HOST=mongodb://localhost:27017
DB_USER=root
DB_PASSWORD=root

+ GITHUB_CLIENT=YOUR_CLIENT_ID
+ GITHUB_SECRET=YOUR_CLIENT_SECRET
```

After that, run docker container and npm.

```shell
$ docker-compose up -d 
$ npm run start
```

You can access this url in your browser.

http://localhost:4000/playground
