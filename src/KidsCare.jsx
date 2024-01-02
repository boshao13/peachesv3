import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from './Header';
import kidscare from "./images/kidscare.png";
import PreModal from './PreModal';
import blurredBackground from './images/background4.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const IntroText = styled.div`

  color: white; 
  font-size: 1em;
  padding: 20px;
  margin: 20px auto;
  border-radius: 8px;
  box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2);
  max-width: 650px; /* Adjust based on your design preference */
  text-align: left;
  font-family: oswald;


  @media (max-width: 768px) {
    width: 80vw;
  }
`;

const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${blurredBackground}); /* Set the background image */
  filter: blur(10px); /* Adjust the blur amount as needed */
  z-index: -1; /* Place it behind the content */
`;

const KidsCareContainer = styled.div`
  text-align: center;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ImageHeader = styled.img`
  width: 30vw;
  margin-top: 100px;
  @media (max-width: 768px) {
    width: 80vw;
    margin-top: 100px;
  }
`;



const CarouselContainer = styled.div`
  width: 100%; /* Full width of the container */
  max-width: 700px; /* Max width to show one image at a time */
  overflow: hidden;
  position: relative;
  margin: auto; /* Center the carousel */
  border: 4px solid #D56F52; 
  border-radius: 10px; /* Rounded corners */

  @media (max-width: 768px) {
    max-width: 90vw;
  }
`;

const CarouselSlider = styled.div`
  display: flex;
  transition: transform 0.5s ease; // Smooth transition for sliding effect
  transform: ${props => `translateX(-${props.currentIndex * 100}%)`}; // Translate based on current index
`;

const CarouselImage = styled.img`
  flex-shrink: 0;
  width: 100%; /* Image width to fill the container */
  height: auto; /* Maintain aspect ratio */

`;


const CarouselArrow = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 2;
  color: white; // Dark brown color for arrows

  // Left arrow specific style
  ${props => props.direction === 'left' && `
    left: 10px;
  `}

  // Right arrow specific style
  ${props => props.direction === 'right' && `
    right: 10px;
  `}
`;



const KidsCare = () => {
  const images = [require('./images/kidscare4.jpg')];
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <>
      <Header />
      <KidsCareContainer>
        <BackgroundImage />
        <ImageHeader src={kidscare} alt="Kids Care Header" />
        <IntroText> 
        <p>
            Embrace your fitness journey with confidence while we take care of your little ones. Our Kids Care service offers a playful haven for your children, allowing you to focus on achieving your wellness goals. For an additional $15 a month, delight in the freedom to work out, knowing your kids are enjoying their time just a hop, skip, and a jump away. Step into our women-focused gym where we empower you to prioritize yourself, as we nurture your children with fun and engaging activities.
        </p> 
        </IntroText>
        <CarouselContainer>
          <CarouselSlider currentIndex={currentIndex}>
            {images.map((image, index) => (
              <CarouselImage key={index} src={image} alt={`Carousel Image ${index + 1}`} />
            ))}
          </CarouselSlider>
          <CarouselArrow direction="left" onClick={goToPrevious}>
            <FontAwesomeIcon icon={faChevronLeft} size="2x" />
          </CarouselArrow>
          <CarouselArrow direction="right" onClick={goToNext}>
            <FontAwesomeIcon icon={faChevronRight} size="2x" />
          </CarouselArrow>
        </CarouselContainer>
      </KidsCareContainer>
      <PreModal />
    </>
  );
};

export default KidsCare;