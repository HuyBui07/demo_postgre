import { Pool } from 'pg';

interface TodoItem {
  id: number;
  list_id: number;
  title: string;
  description: string | null;
  due_date: Date | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata: Record<string, any>;
  full_description: string;
  created_at: Date;
  updated_at: Date;
}

interface TodoList {
  id: number;
  title: string;
  created_at: Date;
}

interface Tag {
  id: number;
  name: string;
}

export class TodoService {
  private pool: Pool;

  constructor(connectionConfig: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  }) {
    this.pool = new Pool(connectionConfig);
  }

  // TodoList operations
  async createList(title: string): Promise<TodoList> {
    const result = await this.pool.query('INSERT INTO todo_lists (title) VALUES ($1) RETURNING *', [
      title,
    ]);
    return result.rows[0];
  }

  async getLists(): Promise<TodoList[]> {
    const result = await this.pool.query('SELECT * FROM todo_lists ORDER BY created_at DESC');
    return result.rows;
  }

  async deleteList(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM todo_lists WHERE id = $1', [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // TodoItem operations
  async createTodoItem(
    listId: number,
    title: string,
    description?: string,
    dueDate?: Date,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'low',
    metadata: Record<string, any> = {},
  ): Promise<TodoItem> {
    const result = await this.pool.query(
      `INSERT INTO todo_items 
       (list_id, title, description, due_date, priority, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [listId, title, description, dueDate, priority, metadata],
    );
    return result.rows[0];
  }

  async getTodoItems(listId?: number): Promise<TodoItem[]> {
    const query = listId
      ? 'SELECT * FROM todo_items WHERE list_id = $1 ORDER BY created_at DESC'
      : 'SELECT * FROM todo_items ORDER BY created_at DESC';
    const params = listId ? [listId] : [];
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async updateTodoItem(
    id: number,
    updates: Partial<{
      title: string;
      description: string;
      due_date: Date;
      status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
      priority: 'low' | 'medium' | 'high' | 'urgent';
      metadata: Record<string, any>;
    }>,
  ): Promise<TodoItem | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = Object.values(updates);
    const result = await this.pool.query(
      `UPDATE todo_items 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, ...values],
    );
    return result.rows[0] || null;
  }

  async deleteTodoItem(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM todo_items WHERE id = $1', [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Tag operations
  async createTag(name: string): Promise<Tag> {
    const result = await this.pool.query('INSERT INTO tags (name) VALUES ($1) RETURNING *', [name]);
    return result.rows[0];
  }

  async getTags(): Promise<Tag[]> {
    const result = await this.pool.query('SELECT * FROM tags ORDER BY name');
    return result.rows;
  }

  async addTagToTodoItem(todoItemId: number, tagName: string): Promise<void> {
    // First ensure the tag exists
    const tagResult = await this.pool.query(
      'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
      [tagName],
    );
    const tagId = tagResult.rows[0].id;

    // Then create the association
    await this.pool.query(
      'INSERT INTO todo_item_tags (item_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [todoItemId, tagId],
    );
  }

  async removeTagFromTodoItem(todoItemId: number, tagName: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM todo_item_tags 
       WHERE item_id = $1 
       AND tag_id = (SELECT id FROM tags WHERE name = $2)`,
      [todoItemId, tagName],
    );
  }

  async getTodoItemsByTag(tagName: string): Promise<TodoItem[]> {
    const result = await this.pool.query(
      `SELECT ti.* 
       FROM todo_items ti
       JOIN todo_item_tags tit ON ti.id = tit.item_id
       JOIN tags t ON tit.tag_id = t.id
       WHERE t.name = $1
       ORDER BY ti.created_at DESC`,
      [tagName],
    );
    return result.rows;
  }

  // Search and filter operations
  async searchTodoItems(query: string): Promise<TodoItem[]> {
    const result = await this.pool.query(
      `SELECT * FROM todo_items 
       WHERE title ILIKE $1 
       OR description ILIKE $1 
       OR full_description ILIKE $1
       ORDER BY created_at DESC`,
      [`%${query}%`],
    );
    return result.rows;
  }

  async getTodoItemsByStatus(
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled',
  ): Promise<TodoItem[]> {
    const result = await this.pool.query(
      'SELECT * FROM todo_items WHERE status = $1 ORDER BY created_at DESC',
      [status],
    );
    return result.rows;
  }

  async getTodoItemsByPriority(
    priority: 'low' | 'medium' | 'high' | 'urgent',
  ): Promise<TodoItem[]> {
    const result = await this.pool.query(
      'SELECT * FROM todo_items WHERE priority = $1 ORDER BY created_at DESC',
      [priority],
    );
    return result.rows;
  }

  // Cleanup
  async close(): Promise<void> {
    await this.pool.end();
  }
}
