import React from 'react';
import {styled, keyframes} from 'styled-components';
import Modal from 'react-modal';
import modalheader from "./images/contactus1.png"
import thankyou from './images/thankyou.png'

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;
const ThankYouHeader = styled.img`
  max-width: 300px;
  margin-top: 20px; // Adjust as needed
  @media (max-width: 768px) {
    width: 70vw;
    height: auto;
  }
`;

const ThankYouMessage = styled.div`
  font-size: 1em;
  font-family: oswald;
  color: white;
  text-align: center;
  margin-top: 20px; // Adjust as needed to center the message
`;

const CustomModal = styled(Modal)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 350px; // Fixed height
  display: flex;
  flex-direction: column;
  justify-content: center; // Center content vertically
  align-items: center; // Center content horizontally
  background: #D56F52;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  outline: none;
  animation: ${fadeIn} 1s ease-in-out;
  @media (max-width: 768px) {
    width: 80vw; 
    height: 350px;
  }
`;


const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 10px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 18px; // Larger font size for visibility
  color: #fab39d; // Peach color for the button
`;

const ModalHeading = styled.img`
max-width: 300px; // Ensure the image is responsive
display: block; // To center the image in its container
margin-bottom: 30px;
margin-top:20px;
@media (max-width: 768px) {
    margin-top:10px;
  width: 80vw; // Adjusted width for mobile
  height: auto; // Height adjusted to maintain aspect ratio
}
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FormField = styled.input`
  width: 300px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #D56F52; // Peach border
  border-radius: 5px;
  &:focus {
    outline: none;
    border-color: #FACCB5; // Light peach border on focus
  }
  @media (max-width: 768px) {
width:70vw;
}
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #FAb39d; // Peach background color
  color: white;
  cursor: pointer;
  &:hover {
    background-color: #FAb39d; // Light peach color on hover
  }
`;
const TextAreaField = styled.textarea`
  width: 300px;
  padding: 10px;
  margin-bottom: 10px;
  font-family: lato;
  border: 1px solid #D56F52; // Peach border
  border-radius: 5px;
  resize: vertical; // Allow vertical resize
  &:focus {
    outline: none;
    border-color: #FACCB5; // Light peach border on focus
  }
  @media (max-width: 768px) {
    width:70vw;
    }
`;

const ContactUsModal = ({ isSubmitted, handleContactModalSubmit, openContactUsModal, closeContactUsModal, formRef , isContactUsModalOpen}) => {
    
  return (
      <CustomModal   
        isOpen={isContactUsModalOpen}
        onRequestClose={closeContactUsModal} 
        overlayClassName="custom-overlay">
      <CloseButton onClick={closeContactUsModal}>X</CloseButton>
      {isSubmitted ? (
        <>
          <ThankYouHeader src={thankyou} alt="Thank You" />
          <ThankYouMessage>We will get back to you shortly!</ThankYouMessage>
        </>
      ) : (
        <>
      <ModalHeading src={modalheader}/>
      <Form ref={formRef} >
      <FormField type="text" placeholder="Name" name="user_name"/>
      <FormField type="tel" placeholder="Phone Number" name="user_phone" />
      <FormField type="email" placeholder="Email" name="user_email" />
      <TextAreaField placeholder="Your comments" name="message" />
      <SubmitButton  onClick={handleContactModalSubmit}
      type="submit">Submit</SubmitButton>
      </Form>
      </>
      )}
    </CustomModal>
  );
};

export default ContactUsModal;