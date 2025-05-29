const API_BASE_URL = 'http://localhost:3000/api';

export const fetchAllListsAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/todo-lists`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(errorData.message || `Failed to fetch lists: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching all lists:', error);
    throw error;
  }
};

export const createListAPI = async (title) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todo-lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(errorData.message || `Failed to create list: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
};

export const deleteListAPI = async (listId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todo-lists/${listId}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) { // 204 No Content is a success for DELETE
      const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(errorData.message || `Failed to delete list ${listId}: ${response.status}`);
    }
    if (response.status === 204) {
        return { success: true, message: `List ${listId} deleted successfully.` };
    }
    return await response.json();
  } catch (error) {
    console.error(`Error deleting list ${listId}:`, error);
    throw error;
  }
};

export const fetchListDetailsAPI = async (listId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todo-lists/${listId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(errorData.message || `Failed to fetch list details for ${listId}: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching list details for ${listId}:`, error);
    throw error;
  }
};

export async function fetchTodoListsAPI() {
  const res = await fetch(`${API_BASE_URL}/todo-lists`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

export const fetchListByIdAPI = async (listId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/todo-lists/${listId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(errorData.message || `Failed to fetch list: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching list ${listId}:`, error);
    throw error;
  }
};