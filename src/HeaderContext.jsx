// HeaderContext.js
import React, { useState, createContext, useContext } from 'react';

// Create the context
const HeaderContext = createContext();

// Provider component
export const HeaderProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  function openModal() {
    console.log('modal clicked')
    setModalIsOpen(true);
    setIsOpen(false); // Collapse the header when opening the modal
  }

  return (
    <HeaderContext.Provider value={{ isOpen, setIsOpen, openModal, setModalIsOpen, modalIsOpen }}>
      {children}
    </HeaderContext.Provider>
  );
};

// Hook to use the context
export const useHeaderContext = () => useContext(HeaderContext);