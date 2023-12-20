import React, { useState } from 'react';

import styled from 'styled-components';
import PreModal from './PreModal';

const PreEnrollmentSection = styled.section`
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
height: 50vh; // Half the view height
text-align: center;
padding: 20px;
background-color: rgba(255, 255, 255, 0); // Semi-transparent white

`;
const Heading = styled.h1`
  font-size: 2.5em;
  margin-bottom: 0.5em;
`;

const Subheading = styled.h2`
  font-size: 1.5em;
  color: #007bff;
  margin-bottom: 1em;
`;
// Styled components
const EnrollmentButton = styled.button`
background-color: #007bff;
color: white;
padding: 10px 20px;
border: none;
border-radius: 5px;
font-size: 1em;
cursor: pointer;

&:hover {
  background-color: #0056b3;
}
`;



const Form = styled.form`
  /* Form styles */
`;



const PreEnrollment = () => {
  const [modalIsOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    // Handle form submission here
    closeModal();
  }

  return (
    <PreEnrollmentSection> 
        <Heading>Pre Enrollment</Heading>
        <Subheading>Only 150 memberships left!</Subheading>
      <EnrollmentButton onClick={openModal}>Pre Enroll Now</EnrollmentButton>
      <PreModal isOpen={modalIsOpen} onRequestClose={() => setIsOpen(false)} />
    </PreEnrollmentSection>
  );
};

export default PreEnrollment;