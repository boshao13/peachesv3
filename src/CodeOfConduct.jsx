import React from 'react';
import styled, { keyframes } from 'styled-components';
import Header from './Header';
import codeofconduct from './images/codeofconduct.png'
import background from './images/background.png'
import Footer from './Footer';

const BackgroundImage = styled.div`
  position: fixed; // Changed to fixed
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${background});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  filter: blur(10px);
  z-index: -1;
`;
const RulesList = styled.ul`
  color: white;
  font-size: 18px;
  padding: 20px;
  margin: 20px auto;
  border-radius: 8px;
  box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2);
  max-width: 900px;
  text-align: left;
  font-family: Oswald;
  background-color: #f5a882;
  list-style: none; // Remove default list style


  @media (max-width: 768px) {
    width: 80vw;
  }

  li {
    position: relative;
    padding-left: 20px; // Adjust this value as needed

    &::before {
      content: '–'; // Dash character
      position: absolute;
      left: 0; // Align with the start of the text
    }
  }
`;
const RootContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh; // Ensure full viewport height
`;

// ClassesContainer with min-height instead of height
const ClassesContainer = styled.div`
  text-align: center;
  min-height: 91vh; // Adjusted to min-height
  @media (max-width: 768px) {
    width: 100%;
    min-height: 85vh; // Adjusted to min-height
  }
`;
const ImageHeader = styled.img`
  width: 500px;
  margin-top: 100px;
  @media (max-width: 768px) {
    width: 85vw;
    margin-top: 100px;
  }
`;




const IntroText = styled.div`

  color: white; 
  font-size: 20px;
  padding: 20px;
  margin: 20px auto;
  border-radius: 8px;
  box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2);
  max-width: 900px; /* Adjust based on your design preference */
  text-align: left;
  font-family: oswald;
  background-color: #f5a882;


  @media (max-width: 768px) {
    width: 80vw;
  }
`;

const CodeOfConduct = () => {
    return (
      <>
        <RootContainer>
        <Header />
        <ClassesContainer>
          <ImageHeader src={codeofconduct} />
          <IntroText>
            Welcome to Peaches Fitness Club, a sanctuary dedicated to fostering a secure and respectful environment. Our Code of Conduct is crucial in maintaining this atmosphere. All members must strictly adhere to these rules, ensuring our gym remains an empowering and inclusive space. Be aware that any violation may lead to immediate membership termination at management's discretion. Your cooperation helps uplift our community! 
          </IntroText>
          <RulesList>
            <li>Photography and Videography Policy: Members are strictly prohibited from capturing images or videos that include other members in the frame without their express consent.</li>
            <li>Personal Space and Respect: All members must maintain a respectful distance from others, honoring personal space at all times.</li>
            <li>Advice and Safety: While unsolicited advice is discouraged, intervention is permitted if equipment is being misused in a manner that poses a safety risk.</li>
            <li>Respectful Behavior: Any form of staring, unwanted physical contact, catcalling, or making unsolicited comments about the bodies of other members is strictly forbidden.</li>
            <li>Privacy and Personal Boundaries: Members must refrain from requesting personal contact information without clear mutual interest.</li>
            <li>Conduct and Movement within the Facility: Following a member around the gym in a manner that could cause discomfort to others is not permitted.</li>
            <li>Headphone Rule: Members wearing headphones shall only be approached in urgent situations or for essential safety communications.</li>
          </RulesList>
          <BackgroundImage/>
        </ClassesContainer>
        <Footer/>
        </RootContainer>
      </>
    );
  };
  
  export default CodeOfConduct;
