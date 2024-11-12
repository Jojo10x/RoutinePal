import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cors({ origin: ['http://localhost:3000', 'https://localhost:5001'], credentials: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!, ).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

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
    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

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



