
import Header from './Header';
import ParallaxImage from './ParallaxImage';
import ImageGallery from './ImageGallery';
import MissionStatement from './MissionStatement';
import PreEnrollment from './PreEnrollment';
import Address from "./Address"
import Footer from './Footer'; 
import emailjs from '@emailjs/browser';
import FAQ from './FAQ';

import './App.css';
import React, { useState, useEffect,useRef } from 'react'; 
import { styled, createGlobalStyle } from 'styled-components';

const MainContent = styled.main`
transition: filter 0.3s ease-in-out;
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


const Home = () => {

    //refs for sections 
    const contactUsRef = useRef(null);
    // header and modal open
      const [isOpen, setIsOpen] = useState(false);
      const [modalIsOpen, setModalIsOpen] = useState(false);
    
    const form = useRef();
    
    
    
    
      useEffect(() => {
        const body = document.body;
        if (modalIsOpen) {
          body.classList.add('no-scroll');
        } else {
          body.classList.remove('no-scroll');
        }
      }, [modalIsOpen]);
    
      useEffect(() => {
        const body = document.body;
        const elementsToBlur = document.querySelectorAll('main, header');
        
        if (modalIsOpen) {
          body.classList.add('no-scroll');
          elementsToBlur.forEach(el => el.classList.add('blur-background'));
        } else {
          body.classList.remove('no-scroll');
          elementsToBlur.forEach(el => el.classList.remove('blur-background'));
        }
      }, [modalIsOpen, isOpen]);
    
    
      function openModal() {
        setModalIsOpen(true);
        setIsOpen(false); // Collapse the header when opening the modal
        
      }
    
      function closeModal() {
        setModalIsOpen(false);
      }
    
      function handleModalSubmit(event) {
        event.preventDefault();
        emailjs
          .sendForm("service_3ykzhp7", "template_8c53d6n", form.current, "gk157tFkxTFBmQWBQ")
          .then(
            (response) => {
              console.log("Email sent successfully:", response);
              closeModal();
            },
            (error) => {
              console.error("Error sending email:", error);
              // Handle error gracefully
            }
          );
        console.log(form.current, "form data is ");
        closeModal();
      }
    
    
        useEffect(() => {
            if (isOpen) {
              document.body.classList.add('is-blurred');
            } else {
              document.body.classList.remove('is-blurred');
            }
          }, [isOpen]);
          
        
      return (
        <>
         <GlobalStyle/>
     <Header contactUsRef={contactUsRef} openModal={openModal} modalIsOpen={modalIsOpen} isOpen={isOpen} setIsOpen={setIsOpen} />
     <MainContent className={isOpen ? 'blur' : ''}>
    
                <ParallaxImage />
    
                <MissionStatement/>
                <ImageGallery/>
                <PreEnrollment form={form} handleModalSubmit={handleModalSubmit} setModalIsOpen={setModalIsOpen} openModal={openModal} modalIsOpen={modalIsOpen}/>
                <Address contactUsRef={contactUsRef}/>
    
                <FAQ/>
                <Footer/>
                </MainContent>
        </>
      );
    };

    export default Home