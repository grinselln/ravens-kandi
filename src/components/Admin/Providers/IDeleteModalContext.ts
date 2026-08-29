export interface IDeleteModalContext {
  pendingDeleteId: number | null;
  assignPendingDeleteId: (recordId: number) => void;
  recordType: string | null;
  assignRecordType: (type: string | null) => void;
  warningMessage: string | null;
  assignWarningMessage: (message: string) => void;
  onConfirmWarning: (() => void) | null;
  assignOnConfirm: (confirmFunc: () => void) => void;
  onDismissWarningMessage: () => void;
}