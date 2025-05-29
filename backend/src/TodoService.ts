import { Pool, PoolConfig } from 'pg';

interface TodoItem {
  id: number;
  list_id: number;
  title: string;
  description?: string | null;
  due_date?: string | null;    // MODIFIED: Changed from Date to string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  full_description?: string | null;
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
    password?: string;
  }) {
    console.log('Connecting to Postgres with:', {
      host: connectionConfig.host,
      port: connectionConfig.port,
      database: connectionConfig.database,
      user: connectionConfig.user,
      // Password is intentionally not logged
    });
    this.pool = new Pool(connectionConfig as PoolConfig);
  }

  // TodoList operations
  async createList(title: string): Promise<TodoList> {
    const result = await this.pool.query(
      'INSERT INTO todo_lists (title) VALUES ($1) RETURNING *',
      [title],
    );
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
    dueDate?: string, // MODIFIED: Changed from Date to string
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'low',
    metadata: Record<string, any> = {},
  ): Promise<TodoItem> {
    const result = await this.pool.query(
      `INSERT INTO todo_items 
       (list_id, title, description, due_date, priority, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      // dueDate is now a 'YYYY-MM-DD' string or undefined/null, which PostgreSQL handles for DATE columns
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
    return result.rows; // due_date will now be a string 'YYYY-MM-DD'
  }

  async updateTodoItem(id: number, updates: Partial<Omit<TodoItem, 'id' | 'list_id' | 'created_at' | 'updated_at' | 'full_description'>>): Promise<TodoItem | null> {
    const validUpdateKeys = Object.keys(updates)
      .filter(key => updates[key as keyof typeof updates] !== undefined);

    if (validUpdateKeys.length === 0) {
      const currentItem = await this.pool.query('SELECT * FROM todo_items WHERE id = $1', [id]);
      return currentItem.rows[0] || null;
    }

    const setClause = validUpdateKeys
      .map((key, index) => `"${key}" = $${index + 2}`) // "due_date" will be handled as string
      .join(', ');
    const values = validUpdateKeys.map(key => updates[key as keyof typeof updates]);

    const result = await this.pool.query(
      `UPDATE todo_items 
       SET ${setClause}, updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, ...values],
    );
    return result.rows[0] || null; // due_date will now be a string 'YYYY-MM-DD'
  }

  async deleteTodoItem(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM todo_items WHERE id = $1', [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Tag operations
  async createTag(name: string): Promise<Tag> {
    const result = await this.pool.query(
      'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING *',
      [name],
    );
    return result.rows[0];
  }

  async getTags(): Promise<Tag[]> {
    const result = await this.pool.query('SELECT * FROM tags ORDER BY name');
    return result.rows;
  }

  async addTagToTodoItem(todoItemId: number, tagName: string): Promise<void> {
    const tagResult = await this.pool.query(
      'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
      [tagName],
    );
    const tagId = tagResult.rows[0].id;
    await this.pool.query(
      'INSERT INTO todo_item_tags (item_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [todoItemId, tagId],
    );
  }

  async removeTagFromTodoItem(todoItemId: number, tagName: string): Promise<void> {
    const result = await this.pool.query(
      `DELETE FROM todo_item_tags 
       WHERE item_id = $1 
       AND tag_id = (SELECT id FROM tags WHERE name = $2)`,
      [todoItemId, tagName],
    );
    if (result.rowCount === 0) {
      console.warn(`Tag '${tagName}' might not have been associated with item ${todoItemId}, or tag does not exist.`);
    }
  }

  async getTodoItemTags(todoItemId: number): Promise<Tag[]> {
    const result = await this.pool.query(
      `SELECT t.* 
       FROM tags t
       JOIN todo_item_tags tit ON t.id = tit.tag_id
       WHERE tit.item_id = $1
       ORDER BY t.name`,
      [todoItemId],
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
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled', // Inline type
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

  // Cleanup
  async close(): Promise<void> {
    await this.pool.end();
  }
}