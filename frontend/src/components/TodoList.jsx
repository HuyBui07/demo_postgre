import {
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Chip,
  Stack,
  Typography,
  Box,
  Button,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useEffect, useState } from 'react';
import { fetchTodoTagsAPI } from '../services/tagService';
import { formatUTCDateToDDMMYYYY } from '../utils/dateUtils';

function getStatusColor(status) {
  switch (status) {
    case 'completed': return 'success';
    case 'in_progress': return 'info';
    case 'cancelled': return 'error';
    default: return 'warning';
  }
}
function getPriorityColor(priority) {
  switch (priority) {
    case 'urgent': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
    default: return 'default';
  }
}

function TodoList({
  todos,
  selectedIds = [],
  onSelectIds = () => { },
  onSelectTodo = () => { },
  onAdd = () => { },
  onDeleteSelected = () => { },
}) {
  const [todoTags, setTodoTags] = useState({});

  // Fetch tags for all todos
  useEffect(() => {
    const loadTags = async () => {
      const tagsData = {};
      for (const todo of todos) {
        tagsData[todo.id] = await fetchTodoTagsAPI(todo.id);
      }
      setTodoTags(tagsData);
    };

    if (todos && todos.length > 0) { // Added a check for todos being defined
      loadTags();
    } else {
      setTodoTags({}); // Clear tags if there are no todos
    }
  }, [todos]);

  const handleToggle = id => {
    if (selectedIds.includes(id)) {
      onSelectIds(selectedIds.filter(sid => sid !== id));
    } else {
      onSelectIds([...selectedIds, id]);
    }
  };

  const allSelected = todos && todos.length > 0 && selectedIds.length === todos.length;

  return (
    <Box sx={{ position: 'relative', height: '100%', overflowY: 'auto', bgcolor: '#fff', borderRadius: 2 }}>
      {/* Sticky/Overlay Buttons */}
      <List disablePadding>
        {todos && todos.map(todo => ( // Added a check for todos being defined
          <ListItem
            key={todo.id}
            alignItems="center"
            disableGutters
            sx={{
              mb: 1,
              cursor: 'pointer',
              transition: 'background 0.2s',
              '&:hover': { background: '#f5f5f5' },
              minHeight: 64,
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={() => onSelectTodo(todo)}
          >
            {/* Checkbox column with fixed width */}
            <Box sx={{ width: 48, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <Checkbox
                edge="start"
                checked={selectedIds.includes(todo.id)}
                onClick={e => e.stopPropagation()}
                onChange={() => handleToggle(todo.id)}
                sx={{ width: 40 }}
              />
            </Box>
            {/* Icon */}
            <Box sx={{ width: 40, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <AssignmentIcon color={getStatusColor(todo.status)} />
            </Box>
            {/* Main content */}
            <ListItemText
              primary={
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography
                    variant="h6"
                    sx={{
                      textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
                      color: todo.status === 'completed' ? 'text.secondary' : 'text.primary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {todo.title}
                  </Typography>
                  <Chip label={todo.status} color={getStatusColor(todo.status)} size="small" />
                  <Chip label={todo.priority} color={getPriorityColor(todo.priority)} size="small" />
                  {/* Show tags */}
                  {todoTags[todo.id]?.map(tag => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Stack>
              }
              secondary={
                <>
                  {todo.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {todo.description}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Due: {formatUTCDateToDDMMYYYY(todo.due_date)}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default TodoList;