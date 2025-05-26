import { Router } from 'express';
import { TodoController } from '../controllers/todoController';
import { TodoService } from '../TodoService';

const router = Router();

const todoService = new TodoService({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
});
const todoController = new TodoController(todoService);

// Todo lists
router.get('/todo-lists', (req, res) => todoController.getLists(req, res));
router.post('/todo-lists', (req, res) => todoController.createList(req, res));
router.delete('/todo-lists/:id', (req, res) => todoController.deleteList(req, res));

// Todo items
router.get('/todo-items', (req, res) => todoController.getTodoItems(req, res));
router.post('/todo-items', (req, res) => todoController.createTodoItem(req, res));
router.put('/todo-items/:id', (req, res) => todoController.updateTodoItem(req, res));
router.delete('/todo-items/:id', (req, res) => todoController.deleteTodoItem(req, res));

// Tags
router.get('/tags', (req, res) => todoController.getTags(req, res));
router.post('/tags', (req, res) => todoController.createTag(req, res));

export default router;
