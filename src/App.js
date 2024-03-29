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
import Modal from 'react-modal';
import { useHeaderContext } from './HeaderContext';
import { useLocation } from 'react-router-dom';
import { faQ } from '@fortawesome/free-solid-svg-icons';


Modal.setAppElement('#root');

const MainContent = styled.main`
transition: filter 0.3s ease-in-out;
`;


const RootContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between; // Space content and footer
  min-height: 100vh; // Full viewport height
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

//#9dbbaa
//#D56F52 dark peach
//#FACCB5
//#4E7A51 dark green
//#f5a882;




const App = () => {
        
    //refs for sections 
    const location = useLocation();
    const contactUsRef = useRef(null);
    const preEnrollmentRef = useRef(null);
    const faqRef= useRef(null)
    // header and pre modal open
    const { newsletterFormRef, newsletterData, setnewsletterData, handleNewsLetterSubmit, isOpen, setIsOpen, openModal, modalIsOpen, setModalIsOpen } = useHeaderContext();
    // state for thank you message on modal
    const [isSubmitted, setIsSubmitted] = useState(false);



      // Contact Us Modal
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
      }, [location.hash, contactUsRef, preEnrollmentRef]);

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

      //pre enroll modal
         function handleModalSubmit(event) {
         event.preventDefault();
         setIsSubmitted(true)
         emailjs
          .sendForm("service_3ykzhp7", "template_8c53d6n", form.current, "gk157tFkxTFBmQWBQ")
          .then(
            (response) => {
              console.log("Email sent successfully34:", response);
              // closeModal();
            },
            (error) => {
              console.error("Error sending email:", error);
              // Handle error gracefully
            }
          );
 

          }

          useEffect(() => {
            if (isOpen) {
              document.body.classList.add('is-blurred');
            } else {
              document.body.classList.remove('is-blurred');
            }
          }, [isOpen]);
          

          // CONTACT US MODAL
         
          function openContactUsModal() {
            setContactUsModalOpen(true);

          }
        
          function closeContactUsModal() {
            setContactUsModalOpen(false);
            setIsSubmitted(false)
          }

          function handleContactModalSubmit(event) {
            event.preventDefault();
            emailjs
             .sendForm("service_3ykzhp7", "template_ccrczzg", formRef.current, "gk157tFkxTFBmQWBQ")
             .then(
               (response) => {
                 console.log("Email sent successfully:", response);
                 setIsSubmitted(true)
               },
               (error) => {
                 console.error("Error sending email:", error);
                 // Handle error gracefully
               }
             );
             //NEWSLETTER FORM
              }

              const handleCareerSubmit = (event) => {
                event.preventDefault();
                emailjs.sendForm("service_3ykzhp7", "template_9ntam3d", formRef.current, "gk157tFkxTFBmQWBQ")
                  .then(
                    (response) => {
                      console.log("Email sent successfully:", response);
                      setIsSubmitted(true); // Update the state to reflect submission success
                    },
                    (error) => {
                      console.error("Error sending email:", error);
                      // Optionally, handle the error state here (e.g., show an error message)
                    }
                  );
              };
            
  return (
    <>
     <GlobalStyle/>
    <RootContainer>
            <Header contactUsRef={contactUsRef} 
            openModal={openModal} 
            modalIsOpen={modalIsOpen} 
            isOpen={isOpen} 
            setIsOpen={setIsOpen} />
            
            <MainContent className={isOpen ? 'blur' : ''}>
            <ParallaxImage />
            <MissionStatement/>
            <ImageGallery/>

            <PreEnrollment 
            preEnrollmentRef={preEnrollmentRef}
            form={form} 
            handleModalSubmit={handleModalSubmit} 
            setModalIsOpen={setModalIsOpen} 
            openModal={openModal} 
            modalIsOpen={modalIsOpen}
            isSubmitted={isSubmitted}
            setIsSubmitted={setIsSubmitted}/>
            <Address  
            openContactUsModal={openContactUsModal}
            closeContactUsModal={closeContactUsModal}
            isContactUsModalOpen={isContactUsModalOpen}
            handleContactModalSubmit={handleContactModalSubmit}
            formRef={formRef}
            contactUsRef={contactUsRef}
            isSubmitted={isSubmitted}

            />

            <FAQ
            faqRef={faqRef}/>
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

export default App
