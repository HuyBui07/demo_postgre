import { Box, Button, Checkbox, Typography, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

function ActionBar({ 
  onAdd, 
  onDeleteSelected, 
  onSelectAll, 
  isAllSelected, 
  isIndeterminate, 
  selectedItemsCount,
  itemTypeLabel = 'items' 
}) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 1, 
        borderBottom: '1px solid #eee',
        gap: 1
      }}
    >
      <Tooltip title={`Select all ${itemTypeLabel}`}>
        <Checkbox 
          indeterminate={isIndeterminate} 
          checked={isAllSelected} 
          onChange={onSelectAll}
        />
      </Tooltip>
      
      {/* Only render Add button if onAdd function is provided */}
      {onAdd && (
        <Button 
          startIcon={<AddIcon />} 
          onClick={onAdd} 
          variant="contained" 
          size="small"
        >
          Add
        </Button>
      )}
      
      <Button 
        startIcon={<DeleteIcon />} 
        onClick={onDeleteSelected} 
        disabled={selectedItemsCount === 0}
        color="error" 
        variant="outlined" 
        size="small"
      >
        Delete
      </Button>
      
      {selectedItemsCount > 0 && (
        <Typography variant="body2" sx={{ ml: 'auto' }}>
          {selectedItemsCount} {itemTypeLabel} selected
        </Typography>
      )}
    </Box>
  );
}

export default ActionBar;