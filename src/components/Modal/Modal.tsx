import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "primary" | "error" | "inherit" | "secondary" | "success" | "info" | "warning";
  loading?: boolean;
};

export default function Modal({
  open,
  onClose,
  onConfirm,
  title = "Tem certeza?",
  description = "Essa ação não poderá ser desfeita.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmColor = "primary",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <DialogTitle id="dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={confirmColor}
          disabled={loading}
          autoFocus
        >
          {loading ? "Processando..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
