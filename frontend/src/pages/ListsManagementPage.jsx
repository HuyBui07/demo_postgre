import { Box, Typography, TextField, Button, Paper, ListItemText, Alert, ListItemIcon } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListManagement } from '../hooks/useListManagement';
import ItemListView from '../components/ItemListView';
import ActionBar from '../components/ActionBar';

function ListsManagementPage() {
  const {
    lists,
    loading,
    error,
    addList,
    deleteLists,
    selectedListIds,
    toggleSelectId,
    toggleSelectAll,
    setSelectedListIds
  } = useListManagement();
  
  const [newListName, setNewListName] = useState('');
  const navigate = useNavigate();

  const handleAddList = async () => {
    if (newListName.trim()) {
      const newList = await addList(newListName);
      if (newList) {
        setNewListName(''); // Clear input on success
      }
    }
  };

  const handleDeleteSelectedLists = async () => {
    if (selectedListIds.length > 0) {
      await deleteLists(selectedListIds);
    }
  };

  // Get a consistent color based on list title
  const getListColor = (title) => {
    const colors = ['primary', 'secondary', 'success', 'info', 'warning'];
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

const renderListItem = (list) => {
  // Format the creation date
  const formattedDate = list.created_at 
    ? new Date(list.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'No date available';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <ListItemIcon sx={{ minWidth: 40 }}>
        <FolderIcon color={getListColor(list.title)} />
      </ListItemIcon>
      <ListItemText 
        primary={list.title} 
        secondary={`Created: ${formattedDate}`}
        primaryTypographyProps={{ fontWeight: 500 }}
        secondaryTypographyProps={{ fontSize: '0.75rem', color: 'text.secondary' }}
      />
    </Box>
  );
};

  const handleListClick = (list) => {
    navigate(`/lists/${list.id}`);
  };

  return (
    <Paper elevation={2} sx={{ m: 2, display: 'flex', flexDirection: 'column', height: '97%' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
          Manage Todo Lists
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', gap: 1}}>
          <TextField
            label="New List Name"
            variant="outlined"
            size="small"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddList()}
            sx={{ flexGrow: 1 }}
          />
          <Button variant="contained" onClick={handleAddList} disabled={loading || !newListName.trim()}>
            Add List
          </Button>
        </Box>
      </Box>
      
      <ActionBar
        onDeleteSelected={handleDeleteSelectedLists}
        onSelectAll={toggleSelectAll}
        isAllSelected={lists.length > 0 && selectedListIds.length === lists.length}
        isIndeterminate={selectedListIds.length > 0 && selectedListIds.length < lists.length}
        selectedItemsCount={selectedListIds.length}
        itemTypeLabel="lists"
      />

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <ItemListView
          items={lists}
          renderItem={renderListItem}
          onItemClick={handleListClick}
          selectedItemIds={selectedListIds}
          onToggleSelectItem={toggleSelectId}
          loading={loading && lists.length === 0}
          emptyStateMessage="No lists found. Add one above!"
        />
      </Box>
    </Paper>
  );
}

export default ListsManagementPage;