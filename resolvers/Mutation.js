module.exports = {
  addFakeUsers: async (root, { count }, { db }) => {
    let randomUserApi = `https://randomuser.me/api/?results=${count}`;
    let { results } = await fetch(randomUserApi).then(res => res.json());
    let users = results.map(r => ({
      githubLogin: r.login.username,
      name: `${r.name.first} ${r.name.last}`,
      avatar: r.picture.thumbnail,
      githubToken: r.login.sha1,
    }));

    await db.collection('users').insert(users);

    return users;
  },

  async fakeUserAuth(parent, { githubLogin }, { db }) {
    let user = await db.collection('users').findOne({ githubLogin });
    if (!user) {
      throw new Error(`Cannot find users with githubLogin ${githubLogin}`);
    }

    return {
      token: user.githubToken,
      user
    }
  },

  async githubAuth(parent, { code }, { db }) {
    let {
      message,
      access_token,
      avatar_url,
      login,
      name
    } = await authorizeWithGithub({
      client_id: process.env.GITHUB_CLIENT,
      client_secret: process.env.GITHUB_SECRET,
      code,
    });

    if (message) {
      throw new Error(message);
    }

    let latestUserInfo = {
      name,
      githubLogin: login,
      githubToken: access_token,
      avatar: avatar_url,
    };

    const { ops: [user] } = await db
      .collection('users')
      .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

    return { user, token: access_token };
  },

  async postPhoto(parent, args, { db, currentUser }) {
    if (!currentUser) {
      throw new Error('Only an authorized user can post a photo.');
    }

    const newPhoto = {
      ...args.input,
      userID: currentUser.githubLogin,
      created: new Date(),
    };

    const { insertedIds } = await db.collection('photos').insert(newPhoto);
    newPhoto.id = insertedIds[0];

    return newPhoto;
  },
};

const fetch = require('node-fetch');

const requestGithubToken = credentials => {
  return fetch(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(credentials),
    }
  )
    .then(res => res.json())
    .catch(error => {
      throw new Error(JSON.stringify(error));
    });
};

const requestGithubUserAccount = token => {
  return fetch(`https://api.github.com/user?access_token=${token}`)
    .then(res => res.json())
    .catch(error => {
      throw new Error(JSON.stringify(error));
    });
};

async function authorizeWithGithub(credentials) {
  const { access_token } = await requestGithubToken(credentials);
  const githubUser = await requestGithubUserAccount(access_token);
  return { ...githubUser, access_token };
}
