import "dotenv/config";

const config = {
  app: {
    port: process.env.PORT || 8000,
    env: process.env.PROJECT_ENV,
  },

  db: {},

  key: {
    secret: process.env.JWT_SECRET_KEY,
    x_key: process.env.API_KEY,
    refreshSecret: process.env.JWT_REFRESH_SECRET_KEY,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },

  url: {
    local: `http://localhost:${process.env.PORT || 8000}/api`,
    forward: `${process.env.PORT_FORWARD_URL}api`,
  },

  token: {
    secret: process.env.ACCESS_SECRET_KEY,
    refreshSecret: process.env.REFRESH_SECRET_KEY,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },

  discord: {
    token: process.env.DISCORD_TOKEN,
  },
};

export default config;
