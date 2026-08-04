import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface IDeleteModalContext {
  pendingDeleteId: number | null;
  assignPendingDeleteId: (recordId: number) => void;
  recordType: string | null;
  assignRecordType: (type: string | null) => void;
  warningMessage: string | null;
  assignWarningMessage: (message: string) => void;
  onConfirmWarning: Function | null;
  assignOnConfirm: (confirmFunc: Function) => void;
  onDismissWarningMessage: () => void;
}

const DeleteModalContext = createContext<IDeleteModalContext | undefined>(undefined);

export const DeleteModalProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [recordType, setRecordType] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [onConfirmWarning, setOnConfirmWarning] = useState<Function | null>(null)

  const assignRecordType = useCallback((type: string | null) => {
    setRecordType(type);
  }, []);

  const assignPendingDeleteId = useCallback((recordId: number) => {
    setPendingDeleteId(recordId)
  }, []);

  const assignWarningMessage = useCallback((message: string) => {
    setWarningMessage(message);
  }, []);

  const assignOnConfirm = useCallback((onWarningConfirm: Function) => {
    setOnConfirmWarning(() => onWarningConfirm);
  }, []);

  const onDismissWarningMessage = useCallback(() => {
    setPendingDeleteId(null);
    setWarningMessage(null);
    setOnConfirmWarning(null);
    setRecordType(null);
  }, []);


  const value = useMemo<IDeleteModalContext>(() => ({
      recordType,
      assignRecordType,
      pendingDeleteId,
      assignPendingDeleteId,
      warningMessage,
      assignWarningMessage,
      onConfirmWarning,
      assignOnConfirm,
      onDismissWarningMessage
    }), [recordType, assignRecordType, pendingDeleteId, assignPendingDeleteId, warningMessage, assignWarningMessage, onConfirmWarning, assignOnConfirm, onDismissWarningMessage]);


  return (
    <DeleteModalContext.Provider value={value}>
      {children}
    </DeleteModalContext.Provider>
  )
}

export const useDeleteConfirmation = (): IDeleteModalContext => {
  const context = useContext(DeleteModalContext);
  if (!context) {
    throw new Error("useDeleteConfirmation must be used within DeleteModalProvider");
  }
  return context;
};