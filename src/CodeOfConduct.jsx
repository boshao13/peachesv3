import React from 'react';
import styled, { keyframes } from 'styled-components';
import Header from './Header';
import codeofconduct from './images/codeofconduct.png'
import background from './images/background.png'
import Footer from './Footer';

const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${background}); /* Set the background image */
  background-size: cover; /* Cover the entire area */
  background-repeat: no-repeat; /* Prevent repeating the image */
  background-position: center; /* Center the image */
  filter: blur(10px); /* Adjust the blur amount as needed */
  z-index: -1; /* Place it behind the content */
`;


const ClassesContainer = styled.div`
  text-align: center;
  height:91vh;
  @media (max-width: 768px) {
    width: 100%;
    height:85vh;
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


  @media (max-width: 768px) {
    width: 80vw;
  }
`;

const CodeOfConduct = () => {

  return (
    <>
      <Header />
      <ClassesContainer>
        <ImageHeader src={codeofconduct} />
        <IntroText>
        Welcome to Peaches Fitness Club, a sanctuary dedicated to fostering a secure and respectful environment. Our Code of Conduct is crucial in maintaining this atmosphere. All members must strictly adhere to these rules, ensuring our gym remains an empowering and inclusive space. Be aware that any violation may lead to immediate membership termination at management's discretion. Your cooperation helps uplift our community! 
        </IntroText>
        <BackgroundImage/>

      </ClassesContainer>
      <Footer/>
    </>
  );
};

export default CodeOfConduct;
