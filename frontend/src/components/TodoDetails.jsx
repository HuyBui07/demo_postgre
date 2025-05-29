import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Autocomplete
} from '@mui/material';
import { fetchTodoTagsAPI, fetchAllTagsAPI, addTagToTodoAPI, removeTagFromTodoAPI } from '../services/tagService';

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

const formatUTCDateToDDMMYYYY = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  // Ensure we are getting parts from the UTC date, not local
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // getUTCMonth is 0-indexed
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to format a date string (or Date object) to 'YYYY-MM-DD' for date input
const formatDateToInput = (dateStringOrObject) => {
  if (!dateStringOrObject) return '';
  const date = new Date(dateStringOrObject);
  // To avoid timezone shifts when only date is relevant, extract UTC parts
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


function TodoDetails({ todo, isEditing, onEdit, onSave, onCancel, allLists }) {
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    due_date: '', // Will be in 'YYYY-MM-DD' for the input field
    status: 'pending',
    priority: 'low',
    list_id: ''
  });
  const [todoTags, setTodoTags] = useState([]);
  const [allAvailableTags, setAllAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    if (isEditing) {
      // Set up form for editing an existing todo or adding a new one
      setEditForm({
        title: todo?.title || '',
        description: todo?.description || '',
        // Use formatDateToInput for the date input field
        due_date: todo?.due_date ? formatDateToInput(todo.due_date) : '',
        status: todo?.status || 'pending',
        priority: todo?.priority || 'low',
        // Set list_id: if editing an existing todo, use its list_id.
        // If adding a new todo, default to the first available list if lists exist, else empty.
        list_id: todo?.list_id || (allLists && allLists.length > 0 ? allLists[0].id : '')
      });

      // Load tags for the current todo being edited
      const loadInitialTags = async () => {
        if (todo?.id) {
          const initialTodoTags = await fetchTodoTagsAPI(todo.id);
          setSelectedTags(initialTodoTags);
        } else {
          setSelectedTags([]);
        }
      };
      loadInitialTags();

      // Fetch all available tags for the Autocomplete
      const loadAllAvailableTagsForAutocomplete = async () => {
        const tags = await fetchAllTagsAPI();
        setAllAvailableTags(tags);
      };
      loadAllAvailableTagsForAutocomplete();

    } else { // When not editing (view mode)
      if (todo?.id) {
        // Keep editForm somewhat in sync for potential quick edit, or clear it
        setEditForm({
          title: todo.title || '',
          description: todo.description || '',
          due_date: todo.due_date ? formatDateToInput(todo.due_date) : '',
          status: todo.status || 'pending',
          priority: todo.priority || 'low',
          list_id: todo.list_id || ''
        });
      } else {
        // Clear form if no todo and not editing
        setEditForm({
          title: '', description: '', due_date: '',
          status: 'pending', priority: 'low', list_id: ''
        });
      }
    }
  }, [todo, isEditing, allLists]);

  // Fetch tags for display when todo changes (primarily for view mode)
  useEffect(() => {
    const loadDisplayTags = async () => {
      if (todo?.id) {
        const tags = await fetchTodoTagsAPI(todo.id);
        setTodoTags(tags);
        if (!isEditing) {
          setSelectedTags(tags);
        }
      } else {
        setTodoTags([]);
        if (!isEditing) {
          setSelectedTags([]);
        }
      }
    };
    loadDisplayTags();
  }, [todo, isEditing]);


  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
  try {
    // Ensure list_id exists and is properly formatted
    if (!editForm.list_id) {
      console.error("List ID is required");
      return;
    }

    const todoDataForSave = {
      // Include id when editing an existing todo
      ...(todo?.id ? { id: todo.id } : {}),
      
      // Match the database column names for update operations
      list_id: parseInt(editForm.list_id, 10),
      title: editForm.title.trim(),
      description: editForm.description,
      due_date: editForm.due_date || null,
      status: editForm.status,
      priority: editForm.priority
    };

    console.log("Attempting to save:", todoDataForSave);
    console.log("JSON payload:", JSON.stringify(todoDataForSave));

    const savedTodoItem = await onSave(todoDataForSave);

    if (savedTodoItem && savedTodoItem.id) {
      console.log("Todo saved successfully:", savedTodoItem);
      await updateTodoTags(savedTodoItem.id, selectedTags);
      onCancel();
    } else {
      console.error("Save returned invalid data:", savedTodoItem);
    }
  } catch (error) {
    console.error("Error saving todo:", error);
  }
};

  const updateTodoTags = async (todoId, newSelectedTags) => {
    try {
      const currentItemTags = await fetchTodoTagsAPI(todoId);

      const tagsToRemove = currentItemTags.filter(
        currentTag => !newSelectedTags.some(newTag =>
          (newTag.id && newTag.id === currentTag.id) || // Existing tag match by ID
          (newTag.name === currentTag.name) // Match by name (covers new tags or existing ones if ID not present in newTag)
        )
      );

      const tagsToAdd = newSelectedTags.filter(
        newTag => !currentItemTags.some(currentTag =>
          (newTag.id && newTag.id === currentTag.id) ||
          (newTag.name === currentTag.name)
        )
      );

      // Process removals
      for (const tag of tagsToRemove) {
        console.log('Frontend: Removing tag:', tag.name, 'from todoId:', todoId);
        await removeTagFromTodoAPI(todoId, tag.name);
      }

      // Process additions
      for (const tag of tagsToAdd) {
        const tagName = tag.name;
        console.log('Frontend: Adding tag:', tagName, 'to todoId:', todoId);
        await addTagToTodoAPI(todoId, tagName);
      }

      // Refresh tag data after operations complete
      const updatedTodoItemTags = await fetchTodoTagsAPI(todoId);
      const updatedAllAvailableTagsForAutocomplete = await fetchAllTagsAPI();

      // Update component state with fresh data
      setTodoTags(updatedTodoItemTags);
      setAllAvailableTags(updatedAllAvailableTagsForAutocomplete);
      setSelectedTags(updatedTodoItemTags);

      return true;
    } catch (error) {
      console.error('Error updating tags in TodoDetails:', error);
      // Attempt to refresh to actual DB state even on error
      try {
        const finalTodoItemTags = await fetchTodoTagsAPI(todoId);
        const finalAllAvailableTagsForAutocomplete = await fetchAllTagsAPI();
        setTodoTags(finalTodoItemTags);
        setAllAvailableTags(finalAllAvailableTagsForAutocomplete);
        setSelectedTags(finalTodoItemTags);
      } catch (refreshError) {
        console.error('Error during tag state refresh after update error:', refreshError);
      }
      return false;
    }
  };

  if (!todo && !isEditing) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="text.secondary">
          Select a todo to see details here.
        </Typography>
      </Box>
    );
  }

  if (isEditing) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          {todo ? 'Edit Todo' : 'Add New Todo'}
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Title"
            value={editForm.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Description"
            value={editForm.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            fullWidth
            multiline
            rows={3}
          />

          <TextField
            label="Due Date"
            type="date"
            value={editForm.due_date} // This should be in 'YYYY-MM-DD'
            onChange={(e) => handleInputChange('due_date', e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* NEW: Select for Todo List */}
          <FormControl fullWidth required>
            <InputLabel id="todo-list-select-label">List</InputLabel>
            <Select
              labelId="todo-list-select-label"
              value={editForm.list_id || ''} // Handle undefined initial value
              onChange={(e) => handleInputChange('list_id', e.target.value)}
              label="List"
            >
              {(!allLists || allLists.length === 0) && <MenuItem value="" disabled><em>Loading lists...</em></MenuItem>}
              {allLists && allLists.map((list) => (
                <MenuItem key={list.id} value={list.id}>
                  {list.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>


          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={editForm.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={editForm.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>

          {/* Tags Editor */}
          <Autocomplete
            multiple
            options={allAvailableTags}
            value={selectedTags}
            onChange={(event, newValue) => {
              // newValue is an array of selected items.
              // An item can be:
              // 1. A string (if user typed and pressed Enter - freeSolo)
              // 2. An existing tag object from `allTags` {id, name}
              // 3. The special "Add..." suggestion object from `filterOptions`
              const newProcessedTags = newValue.map(item => {
                if (typeof item === 'string') {
                  // User typed a new tag and pressed Enter
                  // Check if this tag (by name) already exists in allTags to use its ID
                  const existingTag = allAvailableTags.find(tag => tag.name.toLowerCase() === item.toLowerCase());
                  return existingTag ? existingTag : { id: null, name: item };
                }
                if (item && item.inputValue && item.name && item.name.startsWith('Add "')) {
                  // User selected the "Add '...'" suggestion
                  // item.inputValue has the clean tag name
                  const existingTag = allAvailableTags.find(tag => tag.name.toLowerCase() === item.inputValue.toLowerCase());
                  return existingTag ? existingTag : { id: null, name: item.inputValue };
                }
                return item;
              }).filter(tag => tag && tag.name && tag.name.trim() !== ''); // Filter out null/empty tags

              // Deduplicate based on tag name, preferring existing tags (with ID)
              const uniqueTags = [];
              const namesEncountered = new Set();
              for (const tag of newProcessedTags) {
                const lowerCaseName = tag.name.toLowerCase();
                if (!namesEncountered.has(lowerCaseName)) {
                  namesEncountered.add(lowerCaseName);
                  uniqueTags.push(tag);
                } else {
                  // If name is repeated, ensure we keep the version with an ID if one exists
                  const existingIndex = uniqueTags.findIndex(ut => ut.name.toLowerCase() === lowerCaseName);
                  if (existingIndex !== -1 && !uniqueTags[existingIndex].id && tag.id) {
                    uniqueTags[existingIndex] = tag; // Prefer the one with an ID
                  }
                }
              }
              setSelectedTags(uniqueTags);
            }}
            freeSolo
            getOptionLabel={(option) => {
              if (typeof option === 'string') {
                return option;
              }
              if (option.inputValue && option.name && option.name.startsWith('Add "')) {
                // This is for the "Add '...'" suggestion object when it's being rendered as an option
                return option.name; // Display "Add '...'" in the dropdown
              }
              return option.name || ''; // Regular tag object
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                {option.inputValue && option.name && option.name.startsWith('Add "')
                  ? `Add "${option.inputValue}"` // Display for "Add..." suggestion
                  : option.name}
              </li>
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option.name}
                  {...getTagProps({ index })}
                  key={option.id || option.name} // Use name as key if ID is null (new tag)
                />
              ))
            }
            isOptionEqualToValue={(option, value) => {
              // Handles matching between options and selected values
              if (!option || !value) return false;
              if (typeof option === 'string' && typeof value === 'string') return option.toLowerCase() === value.toLowerCase();
              if (typeof option === 'object' && typeof value === 'object') {
                // Prioritize ID match if both have IDs
                if (option.id && value.id) return option.id === value.id;
                // Fallback to name match if IDs are not conclusive (e.g., new tags)
                return option.name?.toLowerCase() === value.name?.toLowerCase();
              }
              // Handle cases where one is string (freeSolo input) and other is object
              if (typeof option === 'object' && typeof value === 'string') return option.name?.toLowerCase() === value.toLowerCase();
              if (typeof option === 'string' && typeof value === 'object') return option.toLowerCase() === value.name?.toLowerCase();
              return false;
            }}
            filterOptions={(options, params) => {
              const filtered = options.filter(option =>
                option.name.toLowerCase().includes(params.inputValue.toLowerCase())
              );

              const { inputValue } = params;
              const isExistingInAllTags = options.some(option =>
                option.name.toLowerCase() === inputValue.toLowerCase()
              );
              const isExistingInSelected = selectedTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase());

              if (inputValue !== '' && !isExistingInAllTags && !isExistingInSelected) {
                filtered.push({
                  id: null,
                  name: `Add "${inputValue}"`,
                  inputValue: inputValue,
                });
              }
              return filtered;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Type to add new tags or select existing ones..."
                helperText="Select existing tags, type new ones, or click X to remove tags"
              />
            )}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.preventDefault(); // Prevent any default form behavior
                console.log("Save button clicked");
                handleSave();
              }}
              disabled={!editForm.title.trim()}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }

  // View mode
  const listName = todo?.list_id && allLists && allLists.find(l => l.id === todo.list_id)?.title;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}>
        {todo.title}
      </Typography>

      {listName && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
          In list: <Chip label={listName} size="small" variant="outlined" />
        </Typography>
      )}

      {todo.description && (
        <Typography variant="body1" sx={{
          mb: 2, whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {todo.description}
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
        <Chip
          label={todo.status}
          color={getStatusColor(todo.status)}
          size="small"
        />
        <Chip
          label={todo.priority}
          color={getPriorityColor(todo.priority)}
          size="small"
        />
      </Stack>

      {/* Tags Section */}
      {todoTags.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tags:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
            {todoTags.map(tag => (
              <Chip
                key={tag.id}
                label={tag.name}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  mb: 1  // Add margin bottom for row spacing
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {/* formatUTCDateToDDMMYYYY is used for display */}
        Due: {formatUTCDateToDDMMYYYY(todo.due_date)}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Created: {new Date(todo.created_at).toLocaleDateString('en-GB')} {new Date(todo.created_at).toLocaleTimeString('en-GB')}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Updated: {new Date(todo.updated_at).toLocaleDateString('en-GB')} {new Date(todo.updated_at).toLocaleTimeString('en-GB')}
      </Typography>

      <Button variant="outlined" onClick={onEdit}>
        Edit
      </Button>
    </Box>
  );
}

export default TodoDetails;