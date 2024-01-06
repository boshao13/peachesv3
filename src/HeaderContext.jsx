// HeaderContext.js
import React, { useRef, useState, createContext, useContext } from 'react';
import emailjs from '@emailjs/browser';
// Create the context
const HeaderContext = createContext();

// Provider component
export const HeaderProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);


  const newsletterFormRef = useRef();
  const [newsletterData, setnewsletterData] = useState('');

  function handleNewsLetterSubmit(event) {
    event.preventDefault();
    emailjs
      .sendForm("service_3ykzhp7", "template_2q0mhqd", newsletterFormRef.current, "gk157tFkxTFBmQWBQ")
      .then(
        (response) => {
          setnewsletterData({ email: '' }); // Reset the email input in newsletterData
          newsletterFormRef.current.reset(); // Reset the form
          console.log("Email sent successfully:", response);
        },
        (error) => {
          console.error("Error sending email:", error);
          // Handle error gracefully
        }
      );
  }

  function openModal() {
    console.log('modal clicked')
    setModalIsOpen(true);
    setIsOpen(false); // Collapse the header when opening the modal
  }

  return (
    <HeaderContext.Provider value={{setnewsletterData, newsletterFormRef, handleNewsLetterSubmit, isOpen, setIsOpen, openModal, setModalIsOpen, modalIsOpen }}>
      {children}
    </HeaderContext.Provider>
  );
};

// Hook to use the context
export const useHeaderContext = () => useContext(HeaderContext);