import dotenv from 'dotenv';
import { Router, Request, Response, NextFunction } from 'express';
import { TodoController } from '../controllers/todoController';
import { TodoService } from '../TodoService';

dotenv.config();
const router = Router();

let todoControllerInstance: TodoController | null = null;

// Function to lazily initialize and get the TodoController instance
function getTodoController(): TodoController {
  if (!todoControllerInstance) {
    const todoService = new TodoService({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'todo_db',
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
    todoControllerInstance = new TodoController(todoService);
  }
  return todoControllerInstance;
}

// Todo lists
router.get('/todo-lists', (req, res, next) => getTodoController().getLists(req, res).catch(next));
router.post('/todo-lists', (req, res, next) => getTodoController().createList(req, res).catch(next));
router.delete('/todo-lists/:id', (req, res, next) => getTodoController().deleteList(req, res).catch(next));

// Todo items
router.get('/todo-items', (req, res, next) => getTodoController().getTodoItems(req, res).catch(next));
router.post('/todo-items', (req, res, next) => getTodoController().createTodoItem(req, res).catch(next));

router.put('/todo-items/:id', async (req, res, next) => {
  try {
    const itemId = Number(req.params.id);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid item ID format' });
    }
    await getTodoController().updateTodoItem(req, res);
  } catch (error) {
    next(error);
  }
});

// Todo item tags
router.get('/todo-items/:id/tags', (req, res, next) => getTodoController().getTodoItemTags(req, res).catch(next));
router.post('/todo-items/add-tag', (req, res, next) => getTodoController().addTagToTodoItem(req, res).catch(next));
router.delete('/todo-items/remove-tag', (req: Request, res: Response, next: NextFunction) => {
  getTodoController().removeTagFromTodoItem(req, res).catch(next);
});

router.delete('/todo-items/:id', (req, res, next) => getTodoController().deleteTodoItem(req, res).catch(next));

// Tags
router.get('/tags', (req, res, next) => getTodoController().getTags(req, res).catch(next));
router.post('/tags', (req, res, next) => getTodoController().createTag(req, res).catch(next));

// Search and filter routes
router.get('/todo-items/search', (req, res, next) => getTodoController().searchTodoItems(req, res).catch(next));
router.get('/todo-items/status/:status', (req, res, next) => getTodoController().getTodoItemsByStatus(req, res).catch(next));
router.get('/todo-items/priority/:priority', (req, res, next) => getTodoController().getTodoItemsByPriority(req, res).catch(next));
router.get('/todo-items/tag/:tagName', (req, res, next) => getTodoController().getTodoItemsByTag(req, res).catch(next));


export default router;