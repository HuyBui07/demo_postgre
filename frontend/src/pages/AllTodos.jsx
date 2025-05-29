import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { TwoPaneLayout } from '../components/TwoPaneLayout';
import TodoList from '../components/TodoList';
import TodoDetails from '../components/TodoDetails';
import ActionBar from '../components/ActionBar';
import TodoFilters from '../components/TodoFilters';
import { useTodos } from '../hooks/useTodos';
import {
  fetchTodosAPI,
  fetchTodosByListAPI,
  fetchTodosByStatusAPI,
  fetchTodosByPriorityAPI,
  fetchTodosByTagAPI,
  searchTodosAPI
} from '../services/todoService';
import { fetchAllTagsAPI } from '../services/tagService';

function AllTodos() {
  const { selectedTodo, isEditing, allLists, actions } = useTodos();
  const [todos, setTodos] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    listId: '',
    status: '',
    priority: '',
    tags: [],
    searchQuery: ''
  });

  // Load todos based on active filters
  useEffect(() => {
    const loadFilteredTodos = async () => {
      setLoading(true);
      try {
        let filteredTodos;

        if (activeFilters.searchQuery) {
          filteredTodos = await searchTodosAPI(activeFilters.searchQuery);
        } else if (activeFilters.tagId) {
          // Get tag name from ID
          const tag = await fetchAllTagsAPI()
            .then(tags => tags.find(t => t.id === Number(activeFilters.tagId)));

          if (tag) {
            filteredTodos = await fetchTodosByTagAPI(tag.name);
          } else {
            filteredTodos = await fetchTodosAPI();
          }
        } else if (activeFilters.status) {
          filteredTodos = await fetchTodosByStatusAPI(activeFilters.status);
        } else if (activeFilters.priority) {
          filteredTodos = await fetchTodosByPriorityAPI(activeFilters.priority);
        } else if (activeFilters.listId) {
          filteredTodos = await fetchTodosByListAPI(activeFilters.listId);
        } else {
          filteredTodos = await fetchTodosAPI();
        }

        setTodos(filteredTodos);
      } catch (error) {
        console.error('Error loading filtered todos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilteredTodos();
  }, [activeFilters]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    setSelectedIds([]); // Reset selection when filters change
  };

  const handleDeleteSelected = () => {
    actions.deleteTodos(selectedIds);
    setSelectedIds([]);
  };

  return (
    <TwoPaneLayout
      leftWidth="65%"
      rightWidth="35%"
      leftPane={
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{p: 1 ,bgcolor: 'white', borderBottom: '1px solid #eee' }}>
            <Typography variant="h4" textAlign={'center'}>
              All Todos
            </Typography>
          </Box>

          <Box sx={{bgcolor: 'white', mb: 1, mx: 2, mt: 1, borderRadius: 1, boxShadow: 1, p: 1 }}>
            <TodoFilters onFilterChange={handleFilterChange}/>
          </Box>
          <Box sx={{ bgcolor: 'white', mb: 1, mx: 2, borderRadius: 1, boxShadow: 1 }}>
            <ActionBar
              onAdd={actions.startAdd}
              onDeleteSelected={handleDeleteSelected}
              onSelectAll={() => {
                if (selectedIds.length === todos.length) {
                  setSelectedIds([]);
                } else {
                  setSelectedIds(todos.map(t => t.id));
                }
              }}
              isAllSelected={todos.length > 0 && selectedIds.length === todos.length}
              isIndeterminate={selectedIds.length > 0 && selectedIds.length < todos.length}
              selectedItemsCount={selectedIds.length}
            />
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto',  px: 2, pb: 2  }}>
            <TodoList
              todos={todos}
              selectedIds={selectedIds}
              onSelectIds={setSelectedIds}
              onSelectTodo={actions.selectTodo}
              loading={loading}
              emptyMessage={
                Object.values(activeFilters).some(v =>
                  Array.isArray(v) ? v.length > 0 : Boolean(v)
                )
                  ? "No todos match your filters"
                  : "No todos found. Click 'Add' to create one."
              }
            />
          </Box>
        </Box>
      }
      rightPane={
        <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: 'white', p: 2 }}>
          <TodoDetails
            todo={selectedTodo}
            isEditing={isEditing}
            onEdit={actions.startEdit}
            onSave={actions.saveTodo}
            onCancel={actions.cancelEdit}
            allLists={allLists}
          />
        </Box>
      }
    />
  );
}

export default AllTodos;