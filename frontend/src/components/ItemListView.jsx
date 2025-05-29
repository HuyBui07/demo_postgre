import { List, ListItem, Checkbox, Box, Typography, CircularProgress } from '@mui/material';

function ItemListView({
  items,
  renderItem,
  onItemClick,
  selectedItemIds = [],
  onToggleSelectItem,
  loading = false,
  emptyStateMessage = "No items to display."
}) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyStateMessage}</Typography>
      </Box>
    );
  }

  return (
    <List disablePadding>
      {items.map((item) => (
        <ListItem
          key={item.id}
          alignItems="flex-start"
          disableGutters
          sx={{
            mb: 1,
            cursor: onItemClick ? 'pointer' : 'default',
            transition: 'background 0.2s',
            '&:hover': { background: onItemClick ? '#f5f5f5' : 'transparent' },
            display: 'flex',
            alignItems: 'center',
            p: 1,
            borderBottom: '1px solid #eee',
            '&:last-child': {
              borderBottom: 'none',
            }
          }}
          onClick={() => onItemClick && onItemClick(item)}
        >
          {onToggleSelectItem && (
            <Checkbox
              edge="start"
              checked={selectedItemIds.includes(item.id)}
              onClick={(e) => {
                e.stopPropagation(); // Prevent ListItem's onClick if checkbox is clicked
                onToggleSelectItem(item.id);
              }}
              sx={{ mr: 1 }}
            />
          )}
          <Box sx={{ flexGrow: 1 }}> {/* Box to allow item content to grow */}
            {renderItem(item)}
          </Box>
        </ListItem>
      ))}
    </List>
  );
}

export default ItemListView;