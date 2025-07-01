"use client";

import { useState } from 'react';

export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    description: '',
    confirmText: '',
    onConfirm: null,
  });

  const openDialog = ({ 
    title = "Confirmar eliminación", 
    description = "¿Estás seguro de que deseas eliminar este elemento?",
    confirmText = "Eliminar",
    onConfirm 
  }) => {
    setDialogConfig({
      title,
      description,
      confirmText,
      onConfirm,
    });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setDialogConfig({
      title: '',
      description: '',
      confirmText: '',
      onConfirm: null,
    });
  };

  const handleConfirm = async () => {
    if (dialogConfig.onConfirm) {
      await dialogConfig.onConfirm();
    }
    closeDialog();
  };

  return {
    isOpen,
    dialogConfig,
    openDialog,
    closeDialog,
    handleConfirm,
  };
}; 