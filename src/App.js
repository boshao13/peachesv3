import React, { useRef, useState, useEffect } from 'react'; 
import { useLocation } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import emailjs from 'emailjs-com';
import Header from './Header';
import ParallaxImage from './ParallaxImage';
import ImageGallery from './ImageGallery';
import MissionStatement from './MissionStatement';
import PreEnrollment from './PreEnrollment';
import Address from "./Address";
import Footer from './Footer';
import FAQ from './FAQ';
import { useHeaderContext } from './HeaderContext';

import './App.css';

const MainContent = styled.main`
  transition: filter 0.3s ease-in-out;
`;

const RootContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
`;

const GlobalStyle = createGlobalStyle`
  .blur {
    filter: blur(5px);
  }
  .blur-background {
    filter: blur(5px);
  }
  .no-scroll {
    overflow: hidden;
  }
`;

const App = () => {
  const location = useLocation();
  const contactUsRef = useRef(null);
  const preEnrollmentRef = useRef(null);
  const faqRef = useRef(null);

  const { newsletterFormRef, newsletterData, setnewsletterData, handleNewsLetterSubmit, isOpen, setIsOpen, openModal, modalIsOpen, setModalIsOpen } = useHeaderContext();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [isContactUsModalOpen, setContactUsModalOpen] = useState(false);
  const form = useRef();
  const formRef = useRef();

  useEffect(() => {
    if (location.hash === '#contact-us-section' && contactUsRef.current) {
      const yOffset = contactUsRef.current.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: yOffset, behavior: 'smooth' });
    } else if (location.hash === '#pre-enrollment-section' && preEnrollmentRef.current) {
      const yOffset = preEnrollmentRef.current.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: yOffset, behavior: 'smooth' });
    } else if (location.hash === '#faq' && faqRef.current) {
      const yOffset = faqRef.current.getBoundingClientRect().top + window.pageYOffset - 200;
      window.scrollTo({ top: yOffset, behavior: 'smooth' });
    }
  }, [location.hash, contactUsRef, preEnrollmentRef, faqRef]);

  useEffect(() => {
    const body = document.body;
    if (modalIsOpen || isContactUsModalOpen) {
      body.classList.add('no-scroll');
    } else {
      body.classList.remove('no-scroll');
    }
  }, [modalIsOpen, isContactUsModalOpen]);

  useEffect(() => {
    const body = document.body;
    const elementsToBlur = document.querySelectorAll('main, header');
    
    if (modalIsOpen || isContactUsModalOpen) {
      body.classList.add('no-scroll');
      elementsToBlur.forEach(el => el.classList.add('blur-background'));
    } else {
      body.classList.remove('no-scroll');
      elementsToBlur.forEach(el => el.classList.remove('blur-background'));
    }
  }, [modalIsOpen, isOpen, isContactUsModalOpen]);

  const handleModalSubmit = (event) => {
    event.preventDefault();
    setIsSubmitted(true);
    emailjs.sendForm("service_3ykzhp7", "template_8c53d6n", form.current, "gk157tFkxTFBmQWBQ")
      .then(
        (response) => {
          console.log("Email sent successfully34:", response);
        },
        (error) => {
          console.error("Error sending email:", error);
        }
      );
  };

  const openContactUsModal = () => {
    setContactUsModalOpen(true);
  };

  const closeContactUsModal = () => {
    setContactUsModalOpen(false);
    setIsSubmitted(false);
  };

  const handleContactModalSubmit = (event) => {
    event.preventDefault();
    emailjs.sendForm("service_3ykzhp7", "template_ccrczzg", formRef.current, "gk157tFkxTFBmQWBQ")
      .then(
        (response) => {
          console.log("Email sent successfully:", response);
          setIsSubmitted(true);
        },
        (error) => {
          console.error("Error sending email:", error);
        }
      );
  };

  const handleCareerSubmit = (event) => {
    event.preventDefault();
    emailjs.sendForm("service_3ykzhp7", "template_9ntam3d", formRef.current, "gk157tFkxTFBmQWBQ")
      .then(
        (response) => {
          console.log("Email sent successfully:", response);
          setIsSubmitted(true);
        },
        (error) => {
          console.error("Error sending email:", error);
        }
      );
  };

  return (
    <>
      <GlobalStyle />
      <RootContainer>
        <Header 
          contactUsRef={contactUsRef}
          preEnrollmentRef={preEnrollmentRef} 
          openModal={openModal} 
          modalIsOpen={modalIsOpen} 
          isOpen={isOpen} 
          setIsOpen={setIsOpen} 
        />
        <MainContent className={isOpen ? 'blur' : ''}>
          <ParallaxImage />
          <MissionStatement />
          <ImageGallery />
          <PreEnrollment 
            preEnrollmentRef={preEnrollmentRef}
            form={form} 
            handleModalSubmit={handleModalSubmit} 
            setModalIsOpen={setModalIsOpen} 
            openModal={openModal} 
            modalIsOpen={modalIsOpen}
            isSubmitted={isSubmitted}
            setIsSubmitted={setIsSubmitted}
          />
          <Address  
            openContactUsModal={openContactUsModal}
            closeContactUsModal={closeContactUsModal}
            isContactUsModalOpen={isContactUsModalOpen}
            handleContactModalSubmit={handleContactModalSubmit}
            formRef={formRef}
            contactUsRef={contactUsRef}
            isSubmitted={isSubmitted}
          />
          <FAQ faqRef={faqRef} />
          <Footer
            newsletterFormRef={newsletterFormRef}
            handleNewsLetterSubmit={handleNewsLetterSubmit}
            newsletterData={newsletterData}
            setnewsletterData={setnewsletterData}
          />
        </MainContent>
      </RootContainer>
    </>
  );
};

export default App;
