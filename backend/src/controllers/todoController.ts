import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Todo } from '../entities/Todo';

const todoRepository = AppDataSource.getRepository(Todo);

export const todoController = {
  // Create a new todo
  async create(req: Request, res: Response) {
    try {
      const { title, description } = req.body;
      const todo = todoRepository.create({
        title,
        description,
        completed: false,
      });
      await todoRepository.save(todo);
      return res.status(201).json(todo);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating todo' });
    }
  },

  // Get all todos
  async getAll(req: Request, res: Response) {
    try {
      const todos = await todoRepository.find();
      return res.json(todos);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching todos' });
    }
  },

  // Get todo by id
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const todo = await todoRepository.findOne({ where: { id } });
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
      return res.json(todo);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching todo' });
    }
  },

  // Update todo
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, completed } = req.body;

      const todo = await todoRepository.findOne({ where: { id } });
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }

      todoRepository.merge(todo, { title, description, completed });
      const updatedTodo = await todoRepository.save(todo);
      return res.json(updatedTodo);
    } catch (error) {
      return res.status(500).json({ message: 'Error updating todo' });
    }
  },

  // Delete todo
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const todo = await todoRepository.findOne({ where: { id } });
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }

      await todoRepository.remove(todo);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting todo' });
    }
  },

  // Search todos
  async search(req: Request, res: Response) {
    try {
      const { query } = req.query;
      const todos = await todoRepository
        .createQueryBuilder('todo')
        .where('todo.title ILIKE :query OR todo.description ILIKE :query', {
          query: `%${query}%`,
        })
        .getMany();
      return res.json(todos);
    } catch (error) {
      return res.status(500).json({ message: 'Error searching todos' });
    }
  },
};
