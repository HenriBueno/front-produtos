import { useEffect, useState } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';

interface FieldOption {
  label: string;
  value: string;
}

interface Field {
  name: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'select'; // só permitir esses dois tipos
  options?: FieldOption[]; // apenas para select
}

// Torna a interface genérica
interface GenericFormModalProps<T> {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: Field[];
  onSubmit: (data: T) => void;
  loading?: boolean;
  error?: string | null;
  success?: boolean;
  initialValues?: Partial<T>;
}

export default function GenericForm<T extends Record<string, any>>({
  open,
  onClose,
  title,
  fields,
  onSubmit,
  loading = false,
  error,
  success,
  initialValues = {},
}: GenericFormModalProps<T>) {
  const [form, setForm] = useState<T>({} as T);

  useEffect(() => {
    if (open) {
      setForm((prevForm) => {
        const newForm: any = {};
        fields.forEach((field) => {
          newForm[field.name] = initialValues?.[field.name as keyof T] ?? '';
        });
        return newForm;
      });
    }
  }, [open]); 

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
  ) => {
    const name = e.target.name || (e.target as any).name;
    const value = e.target.value as string;
    if (!name) return;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          {fields.map((field) =>
            field.type === 'select' ? (
              <TextField
                key={field.name}
                select
                fullWidth
                name={field.name}
                label={field.label}
                required={field.required}
                value={(form as any)[field.name] || ''}
                onChange={handleChange}
                sx={{ mb: 3 }}
                SelectProps={{ native: true }}
                autoComplete="off"
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            ) : (
              <TextField
                key={field.name}
                fullWidth
                name={field.name}
                label={field.label}
                type={field.type || 'text'}
                required={field.required}
                value={(form as any)[field.name] || ''}
                onChange={handleChange}
                sx={{ mb: 3 }}
                slotProps={{ inputLabel: { shrink: true } }}
                autoComplete="off"
              />
            )
          )}

          {error && <Box sx={{ color: 'error.main', mb: 2 }}>{error}</Box>}
          {success && <Box sx={{ color: 'success.main', mb: 2 }}>Criado com sucesso!</Box>}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Criar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
