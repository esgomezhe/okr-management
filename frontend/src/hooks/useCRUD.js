import { useState, useCallback } from 'react';

export const useCRUD = (service) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadItems = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const data = await service.getAll(params);
      setItems(data.results || data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [service]);

  const createItem = useCallback(async (data) => {
    try {
      setLoading(true);
      const newItem = await service.create(data);
      setItems(prev => [newItem, ...prev]);
      setError(null);
      return newItem;
    } catch (err) {
      setError('Error al crear el elemento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const updateItem = useCallback(async (id, data) => {
    try {
      setLoading(true);
      const updatedItem = await service.update(id, data);
      setItems(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ));
      setError(null);
      return updatedItem;
    } catch (err) {
      setError('Error al actualizar el elemento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const deleteItem = useCallback(async (id) => {
    try {
      setLoading(true);
      await service.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
      setError(null);
    } catch (err) {
      setError('Error al eliminar el elemento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  return {
    items,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    deleteItem
  };
}; 