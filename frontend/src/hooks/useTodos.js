import { useState, useCallback, useEffect } from 'react';
import {
  fetchTodosAPI,
  createTodoItemAPI,
  updateTodoItemAPI,
  deleteTodoItemAPI,
  fetchTodosByListAPI
} from '../services/todoService';
import { fetchTodoListsAPI } from '../services/listService';

export function useTodos(listId = null) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [allLists, setAllLists] = useState([]);

  const loadTodos = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (listId) {
        console.log(`Loading todos for list ${listId}`);
        data = await fetchTodosByListAPI(listId);
      } else {
        data = await fetchTodosAPI();
      }
      console.log('Loaded todos:', data.length);
      setTodos(data);
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  const loadLists = useCallback(async () => {
    try {
      const lists = await fetchTodoListsAPI();
      setAllLists(lists);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  }, []);

  useEffect(() => {
    loadTodos();
    loadLists();
  }, [loadTodos, loadLists]);

  const saveTodo = async (todoData) => {
    try {
      let saved;
      if (todoData.id) {
        saved = await updateTodoItemAPI(todoData.id, todoData);
        setTodos(prev => prev.map(t => t.id === saved.id ? saved : t));
      } else {
        saved = await createTodoItemAPI(todoData);
        setTodos(prev => [...prev, saved]);
      }
      setSelectedTodo(saved);
      setIsEditing(false);
      return saved;
    } catch (error) {
      console.error('Error saving todo:', error);
      return null;
    }
  };

  const deleteTodos = async (ids) => {
    if (!ids.length) return;
    setLoading(true);
    try {
      await Promise.all(ids.map(id => deleteTodoItemAPI(id)));
      setTodos(prev => prev.filter(t => !ids.includes(t.id)));
      setSelectedTodo(null);
    } catch (error) {
      console.error('Error deleting todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectTodo = (todo) => {
    setSelectedTodo(todo);
    setIsEditing(false);
  };

  const startAdd = () => {
    setSelectedTodo(null);
    setIsEditing(true);
  };

  const startEdit = () => {
    if (selectedTodo) setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  return {
    todos,
    loading,
    selectedTodo,
    isEditing,
    allLists,
    actions: {
      loadTodos,
      loadLists,
      saveTodo,
      deleteTodos,
      selectTodo,
      startAdd,
      startEdit,
      cancelEdit
    }
  };
}