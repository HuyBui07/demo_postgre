import { useState, useEffect } from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  Chip,
  Button,
  Stack,
  Typography,
  Tabs,
  Tab
} from '@mui/material';
import { fetchTodoListsAPI } from '../services/listService';
import { fetchAllTagsAPI } from '../services/tagService';

function TodoFilters({ onFilterChange }) {
  const [lists, setLists] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filters, setFilters] = useState({
    listId: '',
    status: '',
    priority: '',
    tagId: '',
    searchQuery: ''
  });

  // Load lists and tags on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [listsData, tagsData] = await Promise.all([
          fetchTodoListsAPI(),
          fetchAllTagsAPI()
        ]);
        
        setLists(listsData);
        setAllTags(tagsData);
      } catch (error) {
        console.error('Error loading filter data:', error);
      }
    };
    
    loadData();
  }, []);

  // Handle filter category change
  const handleCategoryChange = (event, newValue) => {
    setFilterCategory(newValue);
    // Clear previous filters when changing categories
    const newFilters = {
      listId: '',
      status: '',
      priority: '',
      tagId: '',
      searchQuery: ''
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Handle filter changes based on category
  const handleFilterChange = (value) => {
    const newFilters = {
      listId: '',
      status: '',
      priority: '',
      tagId: '',
      searchQuery: ''
    };
    
    // Set only the active filter based on the selected category
    switch (filterCategory) {
      case 'list':
        newFilters.listId = value;
        break;
      case 'status':
        newFilters.status = value;
        break;
      case 'priority':
        newFilters.priority = value;
        break;
      case 'tag':
        newFilters.tagId = value;
        break;
      case 'search':
        newFilters.searchQuery = value;
        break;
      default:
        // No filter for 'all'
        break;
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilterCategory('all');
    const resetFilters = {
      listId: '',
      status: '',
      priority: '',
      tagId: '',
      searchQuery: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Box sx={{borderRadius: 1}}>
      
      <Tabs 
        value={filterCategory} 
        onChange={handleCategoryChange}
        variant="standard"
        centered
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label="All" value="all" />
        <Tab label="By List" value="list" />
        <Tab label="By Status" value="status" />
        <Tab label="By Priority" value="priority" />
        <Tab label="By Tag" value="tag" />
        <Tab label="Search" value="search" />
      </Tabs>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {filterCategory === 'list' && (
        <FormControl fullWidth size="small">
          <InputLabel>List</InputLabel>
          <Select
            value={filters.listId}
            onChange={(e) => handleFilterChange(e.target.value)}
            label="List"
          >
            <MenuItem value="">All Lists</MenuItem>
            {lists.map((list) => (
              <MenuItem key={list.id} value={list.id}>
                {list.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      
      {filterCategory === 'status' && (
        <FormControl fullWidth size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange(e.target.value)}
            label="Status"
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      )}
      
      {filterCategory === 'priority' && (
        <FormControl fullWidth size="small">
          <InputLabel>Priority</InputLabel>
          <Select
            value={filters.priority}
            onChange={(e) => handleFilterChange(e.target.value)}
            label="Priority"
          >
            <MenuItem value="">All Priorities</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </Select>
        </FormControl>
      )}
      
      {filterCategory === 'tag' && (
        <FormControl fullWidth size="small">
          <InputLabel>Tag</InputLabel>
          <Select
            value={filters.tagId}
            onChange={(e) => handleFilterChange(e.target.value)}
            label="Tag"
          >
            <MenuItem value="">All Tags</MenuItem>
            {allTags.map((tag) => (
              <MenuItem key={tag.id} value={tag.id}>
                {tag.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      
      {filterCategory === 'search' && (
        <TextField
          fullWidth
          size="small"
          label="Search"
          value={filters.searchQuery}
          onChange={(e) => handleFilterChange(e.target.value)}
          placeholder="Search by title or description"
        />
      )}
      
      {filterCategory !== 'all' && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end'}}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={handleClearFilters}
          >
            Clear
          </Button>
        </Box>
      )}
      </Box>
    </Box>
  );
}

export default TodoFilters;