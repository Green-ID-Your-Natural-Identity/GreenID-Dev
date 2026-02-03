import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
dotenv.config();

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'super-secret-session-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'adminSessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // 'none' required for cross-site
  }
});

export default sessionMiddleware;
