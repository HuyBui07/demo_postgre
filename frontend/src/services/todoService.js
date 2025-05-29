const API_BASE_URL = 'http://localhost:3000/api';

export async function fetchTodosAPI() {
  const res = await fetch(`${API_BASE_URL}/todo-items`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createTodoItemAPI(todoData) {
  const res = await fetch(`${API_BASE_URL}/todo-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todoData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateTodoItemAPI(id, todoData) {
  const res = await fetch(`${API_BASE_URL}/todo-items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todoData),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteTodoItemAPI(id) {
  const res = await fetch(`${API_BASE_URL}/todo-items/${id}`, {
    method: 'DELETE',
  });
  // backend returns 204 No Content
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
  return;
}

export const fetchTodosByListAPI = async (listId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todo-items?list_id=${listId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(errorData.message || `Failed to fetch todos by list: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching todos for list ${listId}:`, error);
    throw error;
  }
};

export async function fetchTodosByStatusAPI(status) {
  const res = await fetch(`${API_BASE_URL}/todo-items/status/${status}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchTodosByPriorityAPI(priority) {
  const res = await fetch(`${API_BASE_URL}/todo-items/priority/${priority}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchTodosByTagAPI(tagName) {
  const res = await fetch(`${API_BASE_URL}/todo-items/tag/${tagName}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function searchTodosAPI(query) {
  const res = await fetch(`${API_BASE_URL}/todo-items/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}