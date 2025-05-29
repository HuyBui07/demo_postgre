import { Request, Response, NextFunction } from 'express';
import { TodoService } from '../TodoService';

export class TodoController {
  private todoService: TodoService;

  constructor(todoService: TodoService) {
    this.todoService = todoService;
  }

  // TodoList endpoints
  async createList(req: Request, res: Response): Promise<void> {
    try {
      const { title } = req.body;
      if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
      }
      const list = await this.todoService.createList(title);
      res.status(201).json(list);
    } catch (error) {
      console.error('Error in createList:', error);
      res.status(500).json({ error: 'Failed to create list' });
    }
  }

  async getLists(req: Request, res: Response): Promise<void> {
    try {
      const lists = await this.todoService.getLists();
      res.json(lists);
    } catch (error) {
      console.error('Error in getLists:', error);
      res.status(500).json({ error: 'Failed to fetch lists' });
    }
  }

  async deleteList(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.todoService.deleteList(Number(id));
      if (!success) {
        res.status(404).json({ error: 'List not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteList:', error);
      res.status(500).json({ error: 'Failed to delete list' });
    }
  }

  // TodoItem endpoints
  async createTodoItem(req: Request, res: Response): Promise<void> {
    try {
      // Change property names to match frontend
      const { list_id, title, description, due_date, status, priority, metadata } = req.body;

      console.log('Creating todo item with data:', req.body);

      if (!list_id || !title) {
        res.status(400).json({ error: 'List ID and title are required' });
        return;
      }

      const todo = await this.todoService.createTodoItem(
        Number(list_id),
        title,
        description,
        due_date, // Pass the date string directly
        priority,
        metadata || {}
      );

      res.status(201).json(todo);
    } catch (error: any) {
      console.error('Error in createTodoItem:', error);
      res.status(500).json({ error: 'Failed to create todo item', details: error.message });
    }
  }

  async getTodoItems(req: Request, res: Response): Promise<void> {
    try {
      const listId = req.query.list_id ? Number(req.query.list_id) : undefined;
      const todos = await this.todoService.getTodoItems(listId ? Number(listId) : undefined);
      res.json(todos); // due_date in todos will be 'YYYY-MM-DD' string
    } catch (error: any) {
      console.error('Error in getTodoItems:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch todo items' });
    }
  }

  async updateTodoItem(req: Request, res: Response): Promise<void> {
    try {
      const itemId = Number(req.params.id);
      const updates = req.body;

      if (isNaN(itemId)) {
        res.status(400).json({ error: 'Invalid item ID format' });
        return;
      }
      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'No update data provided' });
        return;
      }

      const updatedTodo = await this.todoService.updateTodoItem(itemId, updates);
      if (updatedTodo) {
        res.json(updatedTodo);
      } else {
        res.status(404).json({ error: 'Todo item not found or no changes applied' });
      }
    } catch (error: any) {
      console.error('Error in updateTodoItem:', error);
      res.status(500).json({
        error: 'Failed to update todo item',
        details: error.message || 'An unexpected error occurred.'
      });
    }
  }

  async deleteTodoItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.todoService.deleteTodoItem(Number(id));
      if (!success) {
        res.status(404).json({ error: 'Todo item not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error in deleteTodoItem:', error);
      res.status(500).json({ error: 'Failed to delete todo item' });
    }
  }

  // Tag endpoints
  async createTag(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Tag name is required' });
        return;
      }
      const tag = await this.todoService.createTag(name);
      res.status(201).json(tag);
    } catch (error) {
      console.error('Error in createTag:', error);
      res.status(500).json({ error: 'Failed to create tag' });
    }
  }

  async getTags(req: Request, res: Response): Promise<void> {
    try {
      const tags = await this.todoService.getTags();
      res.json(tags);
    } catch (error) {
      console.error('Error in getTags:', error);
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  }

  async addTagToTodoItem(req: Request, res: Response): Promise<void> {
    try {
      const { todoItemId, tagName } = req.body;
      if (todoItemId === undefined || tagName === undefined || typeof tagName !== 'string' || tagName.trim() === '' || isNaN(Number(todoItemId))) {
        res.status(400).json({ error: 'Valid todo item ID and tag name are required' });
        return;
      }
      await this.todoService.addTagToTodoItem(Number(todoItemId), tagName);
      res.status(200).json({ message: 'Tag added successfully' });
    } catch (error: any) {
      console.error('Error in addTagToTodoItem:', error);
      res.status(500).json({ error: 'Failed to add tag to todo item', details: error.message });
    }
  }

  async removeTagFromTodoItem(req: Request, res: Response): Promise<void> {
    try {
      const { todoItemId, tagName } = req.body;
      if (todoItemId === undefined || tagName === undefined || typeof tagName !== 'string' || tagName.trim() === '' || isNaN(Number(todoItemId))) {
        res.status(400).json({ error: 'Valid todo item ID and tag name are required' });
        return;
      }
      await this.todoService.removeTagFromTodoItem(Number(todoItemId), tagName);
      res.status(200).json({ message: 'Tag removed successfully' });
    } catch (error: any) {
      console.error('Error in removeTagFromTodoItem:', error);
      res.status(500).json({ error: 'Failed to remove tag from todo item', details: error.message });
    }
  }

  async getTodoItemTags(req: Request, res: Response): Promise<void> {
    try {
      const itemId = Number(req.params.id);
      if (isNaN(itemId)) {
        res.status(400).json({ error: 'Invalid item ID format' });
        return;
      }
      const tags = await this.todoService.getTodoItemTags(itemId);
      res.json(tags);
    } catch (error: any) {
      console.error('Error in getTodoItemTags:', error);
      res.status(500).json({ error: 'Failed to fetch todo item tags', details: error.message });
    }
  }

  // Search and filter endpoints
  async searchTodoItems(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Search query string is required' });
        return;
      }
      const todos = await this.todoService.searchTodoItems(query);
      res.json(todos);
    } catch (error: any) {
      console.error('Error in searchTodoItems:', error);
      res.status(500).json({ error: 'Failed to search todo items', details: error.message });
    }
  }

  async getTodoItemsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      // Add validation for status if necessary
      const todos = await this.todoService.getTodoItemsByStatus(status as any);
      res.json(todos);
    } catch (error: any) {
      console.error('Error in getTodoItemsByStatus:', error);
      res.status(500).json({ error: 'Failed to fetch todo items by status', details: error.message });
    }
  }

  async getTodoItemsByPriority(req: Request, res: Response): Promise<void> {
    try {
      const { priority } = req.params;
      // Add validation for priority if necessary
      const todos = await this.todoService.getTodoItemsByPriority(priority as any);
      res.json(todos);
    } catch (error: any) {
      console.error('Error in getTodoItemsByPriority:', error);
      res.status(500).json({ error: 'Failed to fetch todo items by priority', details: error.message });
    }
  }

  async getTodoItemsByTag(req: Request, res: Response): Promise<void> {
    try {
      const { tagName } = req.params;
      if (!tagName || typeof tagName !== 'string') {
        res.status(400).json({ error: 'Tag name string is required' });
        return;
      }
      const todos = await this.todoService.getTodoItemsByTag(tagName);
      res.json(todos);
    } catch (error: any) {
      console.error('Error in getTodoItemsByTag:', error);
      res.status(500).json({ error: 'Failed to fetch todo items by tag', details: error.message });
    }
  }
}