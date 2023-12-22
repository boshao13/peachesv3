import React from 'react';
import styled, { keyframes } from 'styled-components';
import logo from './images/peacheslogo4.png'; // Import your logo

// Define keyframes
const wordSlider = keyframes`
  0%, 27% {
    transform: translateY(0%);
\
  }
  33%, 60% {
    transform: translateY(-25%);

  }
  66%, 93% {
    transform: translateY(-50%);
\
  }
  100% {
    transform: translateY(-75%);
  }
`;
const wordFade = keyframes`
0%, 3% {
    opacity:0
    }
  3%, 97% {
  opacity:1
\
  }
  97%, 100% {
  opacity:0
  }
`;

// Styled components
const CarouselContainer = styled.div`
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
height: 80vh;
// font-family: pacifico;
font-family: 'Vujahday Script', cursive;
`;

const Header = styled.header`
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;

`;

const HeaderTitle = styled.h1`
  flex: 1;
  text-align: center;
  font-size: 3rem;
  font-weight: bold;
//   color: #FAB39D;
color: white;
  text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.4);
  @media (max-width: 768px) {
    font-size: 1.5rem; // Smaller size for mobile
   
  }
`;

const MaskedText = styled.div`
  display: inline-block;
  height:6rem; /* Adjust to fit the text size */
  margin-bottom: .4rem;
  overflow: hidden;
  vertical-align: middle;
  padding-left: 0.1rem; /* Adjust spacing as needed */
  @media (max-width: 768px) {
    height: 3rem; // Smaller size for mobile
  }
`;

const WordList = styled.ul`
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
  animation-name: ${wordSlider};

  animation-iteration-count: infinite;
  animation-duration: 9s;
  overflow:hidden;
`;

const WordItem = styled.li`
-webkit-animation: ${wordFade} 3s infinite;
  display: block;
  line-height: 2em;
  text-align: left;
  color: green;
  
  padding-left: 0.2rem; /* Adjust spacing as needed */

`;
const Logo = styled.img`
margin-top: 0px;
  width:600px;
  margin-bottom: -150px;
  @media (max-width: 768px) {
    width: 110vw;
    margin-top: 120px
   // Adjusted width for smaller screens
  }
`;

const Carousel = () => {
  return (
    <CarouselContainer>
    <Logo src={logo} alt="Peaches Gym Logo" />
      <Header>
        <HeaderTitle>
          Where good things are&nbsp;
          <MaskedText>
            <WordList>
              <WordItem>growing</WordItem>
              <WordItem>thriving</WordItem>
              <WordItem>happening</WordItem>
              <WordItem>growing</WordItem>
            </WordList>
          </MaskedText>
        </HeaderTitle>
      </Header>
    </CarouselContainer>
  );
};

export default Carousel;