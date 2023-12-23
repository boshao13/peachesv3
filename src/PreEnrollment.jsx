

import styled from 'styled-components';
import PreModal from './PreModal';
import CountdownTimer from './CountdownTimer.jsx';
import title from "./images/preenrollment.png"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';



const Title = styled.img`
  width: 350px;
  height: auto;

  @media (max-width: 768px) {
    width: 80vw;
    margin-bottom:-10px;
  }
`;
const PreEnrollmentSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh; // Adjust the height
  text-align: center;
  font-family: lato;
  margin-top: 50px;
  @media (max-width: 768px) {
  margin-top: -50px;
  }

`;


const Subheading = styled.h2`
  font-size: 1.5em;
  color: white;
  margin-bottom: 1em;
`;
// Styled components
const EnrollmentButton = styled.button`
  background-color: #D56F52;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  margin-top: 25px;

  transition: transform 0.2s ease; // Button click transition

  &:hover {
    transform: scale(1.05); // Increase size on hover
  }
`;

const CheckmarkIcon = styled(FontAwesomeIcon).attrs({
    icon: faCheck,
  })`
    margin-left: 8px; // Adjust spacing between icon and text
    
  `;
  



const Form = styled.form`
  /* Form styles */
`;


const PreEnrollment = ({ handleModalSubmit, openModal, modalIsOpen, setModalIsOpen, form }) => {
    const launchDate = new Date('2024-02-01');

      return (
        <PreEnrollmentSection>
          <Title src={title} />
          <Subheading>We Launch In</Subheading>
          <div >
            <CountdownTimer targetDate={launchDate} />
          </div>
          <EnrollmentButton onClick={openModal}>
            Pre Enroll Now! <CheckmarkIcon />
          </EnrollmentButton>
          <PreModal form={form} handleModalSubmit={handleModalSubmit} isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} />
        </PreEnrollmentSection>
      );
}
export default PreEnrollment;