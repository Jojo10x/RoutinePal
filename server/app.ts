import express, { NextFunction, Request, Response } from 'express';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5001', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!, ).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

  // Passport serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

  // Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: 'http://localhost:5001/api/auth/google/callback',
},  async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails?.[0]?.value
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err as Error, undefined);
  }
}
));

// Google login route
app.post('/api/google-login', (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.body;
  // Use Google token to authenticate with Passport
  passport.authenticate('google', (err: any, user: { _id: any; }) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Google login failed' });
    }
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.json({ token: jwtToken });
  })(req, res, next);
});


// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, sparse: true },
  email: { type: String, sparse: true }
});

// Google OAuth Routes
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    
    // Make sure this matches your frontend URL exactly
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5174';
    res.redirect(`${frontendURL}/oauth-callback?token=${token}`);
  }
);



const User = mongoose.model('User', userSchema);

type RouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;


// Signup Route
const signupHandler: RouteHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ username: newUser.username }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', err });
    next(err);
  }
};

app.post('/api/signup', signupHandler);

// Login Route
const loginHandler: RouteHandler = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { username, password } = req.body;

    // Check if the password is provided
    if (!password || typeof password !== 'string') {
      res.status(400).json({ message: 'Password is required' });
      return;
    }

    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    // Ensure user.password is a valid string
    if (!user.password) {
      res.status(400).json({ message: 'Password not set for this user' });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login error', err });
    next(err);
  }
};


app.post('/api/login', loginHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



