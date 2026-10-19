import { useContext } from "react";
import { ModalContext } from "../context/modalContext.js";

function useModals() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModals must be used inside <ModalProvider>");
  }

  return context;
}

export default useModals;
