import { createContext, useContext } from "react";
import { IDeleteModalContext } from "./IDeleteModalContext";

export const DeleteModalContext = createContext<IDeleteModalContext | undefined>(undefined);

export const useDeleteConfirmation = (): IDeleteModalContext => {
  const context = useContext(DeleteModalContext);
  if (!context) {
    throw new Error("useDeleteConfirmation must be used within DeleteModalProvider");
  }
  return context;
};