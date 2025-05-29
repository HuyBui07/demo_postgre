import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, IconButton, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TwoPaneLayout } from '../components/TwoPaneLayout';
import TodoList from '../components/TodoList';
import TodoDetails from '../components/TodoDetails';
import ActionBar from '../components/ActionBar';
import { useTodos } from '../hooks/useTodos';
import { fetchListByIdAPI } from '../services/listService';

function ListTodosPage() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [listTitle, setListTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Pass the listId to useTodos to get filtered todos
  const { 
    todos, 
    todoLoading, 
    selectedTodo, 
    isEditing, 
    allLists, 
    actions
  } = useTodos(Number(listId));

  // Fetch the list details to get the title
  useEffect(() => {
    const fetchListDetails = async () => {
      try {
        setLoading(true);
        const list = await fetchListByIdAPI(Number(listId));
        if (list) {
          setListTitle(list.title);
        }
      } catch (error) {
        console.error('Error fetching list details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListDetails();
  }, [listId]);

  const handleBack = () => {
    navigate('/lists');
  };

  const handleSelectAll = () => {
    if (selectedIds.length === todos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(todos.map(todo => todo.id));
    }
  };

  const handleDeleteSelected = () => {
    actions.deleteTodos(selectedIds);
    setSelectedIds([]);
  };

  // Allow adding a new todo directly to this list
  const handleAddTodo = () => {
    actions.startAdd(Number(listId));
  };

  if (loading && !listTitle) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  const allSelected = todos.length > 0 && selectedIds.length === todos.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < todos.length;

  return (
    <Paper elevation={2} sx={{ m: 2, height: '97%', display: 'flex', flexDirection: 'column' }}>
      <TwoPaneLayout
        leftWidth="90%"
        rightWidth="20%"
        leftPane={
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid #eee', 
              display: 'flex', 
              alignItems: 'center',
              gap: 2
            }}>
              <IconButton onClick={handleBack} size="small">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5">
                {listTitle}
              </Typography>
            </Box>

            <ActionBar
              onAdd={handleAddTodo}
              onDeleteSelected={handleDeleteSelected}
              onSelectAll={handleSelectAll}
              isAllSelected={allSelected}
              isIndeterminate={isIndeterminate}
              selectedItemsCount={selectedIds.length}
              itemTypeLabel="todos"
            />

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <TodoList
                todos={todos}
                selectedIds={selectedIds}
                onSelectIds={setSelectedIds}
                onSelectTodo={actions.selectTodo}
                loading={todoLoading && todos.length === 0}
                emptyMessage={`No todos in this list. Click "Add" to create one.`}
              />
            </Box>
          </Box>
        }
        rightPane={
          <Box sx={{ height: '100%', overflowY: 'auto' }}>
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
    </Paper>
  );
}

export default ListTodosPage;