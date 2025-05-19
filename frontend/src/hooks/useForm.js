import { useState, useCallback } from 'react';

export const useForm = (initialState = {}, onSubmit) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      await onSubmit(formData);
      setErrors({});
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: 'Error al procesar el formulario' });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formData, onSubmit]);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
  }, [initialState]);

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData
  };
}; 