

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



const PreEnrollment = ({openModal, modalIsOpen, setModalIsOpen}) => {
  


  return (
    <PreEnrollmentSection> 
        <Heading>Pre Enrollment</Heading>
        <Subheading>Only 150 memberships left!</Subheading>
      <EnrollmentButton onClick={openModal}>Pre Enroll Now</EnrollmentButton>
      <PreModal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} />
    </PreEnrollmentSection>
  );
};

export default PreEnrollment;