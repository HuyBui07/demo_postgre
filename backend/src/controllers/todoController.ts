import { Request, Response } from 'express';
import { TodoService } from '../TodoService';

export class TodoController {
  private todoService: TodoService;

  constructor(todoService: TodoService) {
    this.todoService = todoService;
  }

  // TodoList endpoints
  async createList(req: Request, res: Response) {
    try {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      const list = await this.todoService.createList(title);
      res.status(201).json(list);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create list' });
    }
  }

  async getLists(req: Request, res: Response) {
    try {
      const lists = await this.todoService.getLists();
      res.json(lists);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch lists' });
    }
  }

  async deleteList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await this.todoService.deleteList(Number(id));
      if (!success) {
        return res.status(404).json({ error: 'List not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete list' });
    }
  }

  // TodoItem endpoints
  async createTodoItem(req: Request, res: Response) {
    try {
      const { listId, title, description, dueDate, priority, metadata } = req.body;
      if (!listId || !title) {
        return res.status(400).json({ error: 'List ID and title are required' });
      }
      const todo = await this.todoService.createTodoItem(
        Number(listId),
        title,
        description,
        dueDate ? new Date(dueDate) : undefined,
        priority,
        metadata,
      );
      res.status(201).json(todo);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create todo item' });
    }
  }

  async getTodoItems(req: Request, res: Response) {
    try {
      const { listId } = req.query;
      const todos = await this.todoService.getTodoItems(listId ? Number(listId) : undefined);
      res.json(todos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTodoItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const todo = await this.todoService.updateTodoItem(Number(id), updates);
      if (!todo) {
        return res.status(404).json({ error: 'Todo item not found' });
      }
      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update todo item' });
    }
  }

  async deleteTodoItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await this.todoService.deleteTodoItem(Number(id));
      if (!success) {
        return res.status(404).json({ error: 'Todo item not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete todo item' });
    }
  }

  // Tag endpoints
  async createTag(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Tag name is required' });
      }
      const tag = await this.todoService.createTag(name);
      res.status(201).json(tag);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create tag' });
    }
  }

  async getTags(req: Request, res: Response) {
    try {
      const tags = await this.todoService.getTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  }

  async addTagToTodoItem(req: Request, res: Response) {
    try {
      const { todoItemId, tagName } = req.body;
      if (!todoItemId || !tagName) {
        return res.status(400).json({ error: 'Todo item ID and tag name are required' });
      }
      await this.todoService.addTagToTodoItem(Number(todoItemId), tagName);
      res.status(200).json({ message: 'Tag added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add tag to todo item' });
    }
  }

  async removeTagFromTodoItem(req: Request, res: Response) {
    try {
      const { todoItemId, tagName } = req.body;
      if (!todoItemId || !tagName) {
        return res.status(400).json({ error: 'Todo item ID and tag name are required' });
      }
      await this.todoService.removeTagFromTodoItem(Number(todoItemId), tagName);
      res.status(200).json({ message: 'Tag removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove tag from todo item' });
    }
  }

  // Search and filter endpoints
  async searchTodoItems(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const todos = await this.todoService.searchTodoItems(String(query));
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search todo items' });
    }
  }

  async getTodoItemsByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const todos = await this.todoService.getTodoItemsByStatus(status as any);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch todo items by status' });
    }
  }

  async getTodoItemsByPriority(req: Request, res: Response) {
    try {
      const { priority } = req.params;
      const todos = await this.todoService.getTodoItemsByPriority(priority as any);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch todo items by priority' });
    }
  }

  async getTodoItemsByTag(req: Request, res: Response) {
    try {
      const { tagName } = req.params;
      const todos = await this.todoService.getTodoItemsByTag(tagName);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch todo items by tag' });
    }
  }
}

export default TodoController;
