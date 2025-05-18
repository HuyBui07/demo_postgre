import { Router } from 'express';
import { todoController } from '../controllers/todoController';

const router = Router();

// Create a new todo
router.post('/', todoController.create);

// Get all todos
router.get('/', todoController.getAll);

// Search todos
router.get('/search', todoController.search);

// Get todo by id
router.get('/:id', todoController.getById);

// Update todo
router.put('/:id', todoController.update);

// Delete todo
router.delete('/:id', todoController.delete);

export default router;
