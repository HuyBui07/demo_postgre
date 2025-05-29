const API_BASE_URL = 'http://localhost:3000/api';

export const fetchTodoTagsAPI = async (todoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todo-items/${todoId}/tags`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tags for todo ${todoId}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in fetchTodoTagsAPI:', error);
    return [];
  }
};

export const fetchAllTagsAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags`);
    if (!response.ok) {
      throw new Error('Failed to fetch all tags');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in fetchAllTagsAPI:', error);
    return [];
  }
};

export const addTagToTodoAPI = async (todoItemId, tagName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todo-items/add-tag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todoItemId, tagName }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Failed to add tag ${tagName} to todo ${todoItemId}: ${response.status}`, errorData);
      throw new Error(`Failed to add tag: ${errorData.message || response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in addTagToTodoAPI:', error);
    throw error;
  }
};

export const removeTagFromTodoAPI = async (todoItemId, tagName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todo-items/remove-tag`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todoItemId, tagName }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Failed to remove tag ${tagName} from todo ${todoItemId}: ${response.status}`, errorData);
      throw new Error(`Failed to remove tag: ${errorData.message || response.statusText}`);
    }

    if (response.status === 204) return { success: true };
    return await response.json();
  } catch (error) {
    console.error('Error in removeTagFromTodoAPI:', error);
    throw error;
  }
};