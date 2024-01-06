import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import daypasses from './images/daypasses.png';
import peachasset from './images/peachasset.png'
import blurredBackground from './images/mainphoto.png';
import Footer from './Footer';
const DayPassesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; /* Center horizontally */
  justify-content: center; /* Center vertically */
  height: 100vh; /* Full viewport height */
  padding: 20px;
  font-family: oswald;
  position: relative; /* Add relative positioning */

`;

const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${blurredBackground}); /* Set the background image */
  background-size: cover; /* Cover the entire area */
  background-repeat: no-repeat; /* Prevent repeating the image */
  background-position: center; /* Center the image */
  filter: blur(10px); /* Adjust the blur amount as needed */
  z-index: -1; /* Place it behind the content */
`;


const HeaderImage = styled.img`
  width: 500px; /* Adjust the width as needed */

  margin-bottom: 20px; /* Spacing between header image and cards */
  @media (max-width: 768px) {
    width:100vw;
   
      margin-top: 100px;
  }
`;


const DayPassesFlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; /* Center horizontally */

  @media (min-width: 768px) {
    flex-direction: row; /* Side-by-side layout on web */
    justify-content: space-between; /* Add space between cards */
  }
`;

const DayPassCard = styled.div`
  width: 80vw; /* Full width */
  background-color: #fff; /* Card background color */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Card shadow */
  border-radius: 15px;
  height: 280px;
  text-align: center;
  margin-bottom: 20px; /* Spacing between cards */
  border: 4px solid white; /* Brown border */
  color: white; /* Text color */
  background-image: url(${peachasset}); /* Set the peach asset as the background */
  background-size: cover; /* Adjust background size as needed */
  background-repeat: no-repeat; /* Prevent background image from repeating */



  @media (min-width: 768px) {
    width: 30vw;
    margin: 20px;
    height: 380px;
  }

  transition: transform 0.2s ease-in-out; /* Hover effect */
  &:hover {
    transform: translateY(-5px); /* Move card slightly upward on hover */
  }
`;
const StandardContainer = styled.div`
margin-top:80px;
@media (max-width: 768px) {
  margin-top:60px;

}
`;

const DayPassTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 0px;
  margin-top:50px;
  @media (max-width: 768px) {
    margin-top:40px;
  
  }

`;

const DayPassPrice = styled.p`
  font-size: 40px;
  margin-top:5px;
  @media (max-width: 768px) {
    font-size: 30px;
  }
`;

const DayPassDescription = styled.p`
  font-size: 19px;
  @media (max-width: 768px) {
    font-size: 15px;
    margin-top:-15px;
  }
  
`;

const RootContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between; // Space content and footer
  min-height: 100vh; // Full viewport height
`;


const DayPasses = () => {
  return (
    <RootContainer>
    <DayPassesContainer>
      <Header />
      <HeaderImage src={daypasses} alt="Header Image" />
      <BackgroundImage /> {/* Add the BackgroundImage component */}
      <DayPassesFlexContainer>
       
        <DayPassCard>
        <StandardContainer>
          <DayPassTitle>Standard Day Pass</DayPassTitle>
          <DayPassPrice>$15</DayPassPrice>
          <DayPassDescription>Includes:<br/>
24 Hour Unlimited Gym Use</DayPassDescription>
</StandardContainer>
        </DayPassCard>
     
        <DayPassCard>
          <DayPassTitle>Premium Day Pass</DayPassTitle>
          <DayPassPrice>$25</DayPassPrice>
          <DayPassDescription>Includes:<br/>
24 Hour Unlimited Gym Use<br/>
Sauna<br/>
Cold Plunge<br/>
Classes<br/>
</DayPassDescription>
        </DayPassCard>
      </DayPassesFlexContainer>
    </DayPassesContainer>
    <Footer/>
  </RootContainer>
  );
};

export default DayPasses;
