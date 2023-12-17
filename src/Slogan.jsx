import React from 'react';
import styled, { keyframes } from 'styled-components';

// Define keyframes
const wordSlider = keyframes`
  0%, 27% {
    transform: translateY(0%);
  }
  33%, 60% {
    transform: translateY(-25%);
  }
  66%, 93% {
    transform: translateY(-50%);
  }
  100% {
    transform: translateY(-75%);
  }
`;

// Styled components
const CarouselContainer = styled.div`
display: flex;
justify-content: center;
align-items: center;
height: 100vh;
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
  font-size: 4rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.4);
`;

const MaskedText = styled.div`
  display: inline-block;
  height: 9rem; /* Adjust to fit the text size */
  overflow: hidden;
  vertical-align: middle;
  margin-left: 0.2rem; /* Adjust spacing as needed */
`;

const WordList = styled.ul`
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
  animation-name: ${wordSlider};
  animation-timing-function: ease-out;
  animation-iteration-count: infinite;
  animation-duration: 8s;
  overflow:hidden;
`;

const WordItem = styled.li`
  display: block;
  line-height: 2em;
  text-align: left;
  background:linear-gradient(transparent 150px, white);
  color: green;

`;

const Carousel = () => {
  return (
    <CarouselContainer>
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