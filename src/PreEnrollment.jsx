import styled from 'styled-components';
import PreModal from './PreModal';
import CountdownTimer from './CountdownTimer.jsx';
import title from "./images/signuptoday.png"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';


const Title = styled.img`
  width: 40vw;
  height: auto;
 
  @media (max-width: 768px) {
    width: 85vw;
    margin-bottom: 40px;
    margin-top: 30px;
    max-width: 350px; // Ensure the image is responsive
  }
`;

const PreEnrollmentSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 40vh; // Adjust the height
  text-align: center;
  font-family: Oswald;
  margin-bottom: 90px;
  margin-top: 100px;
  
  @media (max-width: 768px) {
    margin-top: 10px;
    margin-bottom: 25px;
    height: 50vh; // Adjust the height
  }
`;

const PreContainer = styled.div`
  @media (max-width: 768px) {
    border-radius: 10px;
    box-shadow: 0px -6px 6px -2px rgba(0, 0, 0, 0.2); // Shadow pointing upward
    width: 90vw;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
    margin-left: auto; // Set left margin to auto
    margin-right: auto; // Set right margin to auto
  }
  margin-left: auto; // Set left margin to auto for non-mobile view
  margin-right: auto; // Set right margin to auto for non-mobile view
`;

const Subheading = styled.h2`
  font-size: 1.5em;
  color: white;
  margin-bottom: 20px;
`;

const Launch = styled.img`
  width: 200px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    width: 55vw;
  }
`;

const EnrollmentButton = styled.button`
  background-color: #D56F52;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  border: 2px solid white;
  font-size: 1em;
  cursor: pointer;
  margin-top: 20px;
  font-family: oswald;
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

const PreEnrollment = ({ setIsSubmitted, preEnrollmentRef, handleModalSubmit, openModal, modalIsOpen, setModalIsOpen, form, isSubmitted }) => {
  const launchDate = new Date('2024-02-01');

  const handleGlofoxClick = () => {
    window.location.href = 'https://app.glofox.com/portal/#/branch/65d38d833aabb0e6490203b0/memberships';
  };

  return (
    <PreContainer>
      <PreEnrollmentSection ref={preEnrollmentRef} id="pre-enrollment-section">
        <Title src={title} />
        <Subheading>
          Grand Opening Special Membership Rate Available For<br />A Limited Time! Click The Link Below!
        </Subheading>
        <EnrollmentButton onClick={handleGlofoxClick}>
          GloFox Registration<CheckmarkIcon />
        </EnrollmentButton>
        <PreModal setIsSubmitted={setIsSubmitted} isSubmitted={isSubmitted} form={form} handleModalSubmit={handleModalSubmit} isOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} />
      </PreEnrollmentSection>
    </PreContainer>
  );
}

export default PreEnrollment;
