
import './App.css';
import React, { useState, useEffect } from 'react'; 
import { styled, createGlobalStyle } from 'styled-components';
import Header from './Header';
import ParallaxImage from './ParallaxImage';
import ImageGallery from './ImageGallery';
import MissionStatement from './MissionStatement';
import PreEnrollment from './PreEnrollment';
import Address from "./Address"
import Footer from './Footer'; 
require('dotenv').config()



//#D56F52
//#FACCB5
//#4E7A51 dark green
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
const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);


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
    // Handle form submission here
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
        <div>
 <GlobalStyle/>
 <Header openModal={openModal} modalIsOpen={modalIsOpen} isOpen={isOpen} setIsOpen={setIsOpen} />
 <MainContent className={isOpen ? 'blur' : ''}>

            <ParallaxImage />

            <MissionStatement/>
            <ImageGallery/>
            <PreEnrollment setModalIsOpen={setModalIsOpen} openModal={openModal} modalIsOpen={modalIsOpen}/>
            <Address/>
            <Footer/>
            </MainContent>
        </div>
    );
};

export default App;
