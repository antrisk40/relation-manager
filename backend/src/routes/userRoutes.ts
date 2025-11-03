import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as userService from '../services/userService';

const router = express.Router();

// Validation schemas
const createUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  age: z.number().int().positive('Age must be a positive integer'),
  hobbies: z.array(z.string()).min(1, 'At least one hobby is required')
});

const updateUserSchema = z.object({
  username: z.string().min(1).optional(),
  age: z.number().int().positive().optional(),
  hobbies: z.array(z.string()).optional()
});

const linkUserSchema = z.object({
  friendId: z.string().uuid('Invalid friend ID format')
});

// Validation middleware
const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }
      next(error);
    }
  };
};

// GET /api/users - Fetch all users
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get single user
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create new user
router.post('/', validate(createUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    next(error);
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', validate(updateUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);
    res.json(user);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    next(error);
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (error.message.includes('Cannot delete user with existing friendships')) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
});

// POST /api/users/:id/link - Create relationship
router.post('/:id/link', validate(linkUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { friendId } = req.body as { friendId: string };
    await userService.linkUsers(id, friendId);
    res.status(201).json({ message: 'Friendship created successfully' });
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('cannot be friends with themselves')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// DELETE /api/users/:id/unlink - Remove relationship
router.delete('/:id/unlink', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { friendId } = req.query;
    
    if (!friendId || typeof friendId !== 'string') {
      return res.status(400).json({ error: 'friendId query parameter is required' });
    }
    
    await userService.unlinkUsers(id, friendId);
    res.status(204).send();
  } catch (error: any) {
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

export default router;

