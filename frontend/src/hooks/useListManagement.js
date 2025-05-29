import { useState, useEffect, useCallback } from 'react';
import { fetchAllListsAPI, createListAPI, deleteListAPI } from '../services/listService'; // Assuming deleteListAPI exists

export function useListManagement() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListIds, setSelectedListIds] = useState([]);

  const loadLists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllListsAPI();
      setLists(data);
    } catch (err) {
      console.error("Failed to load lists:", err);
      setError(err.message || 'Failed to load lists');
      setLists([]); // Clear lists on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const addList = async (title) => {
    if (!title || !title.trim()) {
      setError("List title cannot be empty.");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const newList = await createListAPI(title);
      setLists(prevLists => [...prevLists, newList]);
      setLoading(false);
      return newList;
    } catch (err) {
      console.error("Failed to add list:", err);
      setError(err.message || 'Failed to add list');
      setLoading(false);
      return null;
    }
  };

  const deleteLists = async (idsToDelete) => {
    if (!idsToDelete || idsToDelete.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      for (const id of idsToDelete) {
        await deleteListAPI(id);
      }
      setLists(prevLists => prevLists.filter(list => !idsToDelete.includes(list.id)));
      setSelectedListIds(prevSelected => prevSelected.filter(id => !idsToDelete.includes(id))); // Clear deleted from selection
      setLoading(false);
    } catch (err) {
      console.error("Failed to delete lists:", err);
      setError(err.message || 'Failed to delete lists');
      setLoading(false);
    }
  };
  
  const toggleSelectId = (id) => {
    setSelectedListIds(prev =>
      prev.includes(id) ? prev.filter(selId => selId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedListIds.length === lists.length) {
      setSelectedListIds([]);
    } else {
      setSelectedListIds(lists.map(list => list.id));
    }
  };


  return {
    lists,
    loading,
    error,
    loadLists,
    addList,
    deleteLists,
    selectedListIds,
    toggleSelectId,
    toggleSelectAll,
    setSelectedListIds
  };
}