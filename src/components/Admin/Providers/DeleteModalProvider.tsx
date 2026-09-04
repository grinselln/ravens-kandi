import { useCallback, useMemo, useState } from "react";
import { IDeleteModalContext } from "./IDeleteModalContext";
import { DeleteModalContext } from "./DeleteModalContext";

export const DeleteModalProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [recordType, setRecordType] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [onConfirmWarning, setOnConfirmWarning] = useState<(() => void) | null>(null)

  const assignRecordType = useCallback((type: string | null) => {
    setRecordType(type);
  }, []);

  const assignPendingDeleteId = useCallback((recordId: number) => {
    setPendingDeleteId(recordId)
  }, []);

  const assignWarningMessage = useCallback((message: string) => {
    setWarningMessage(message);
  }, []);

  const assignOnConfirm = useCallback((onWarningConfirm: (() => void)) => {
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
