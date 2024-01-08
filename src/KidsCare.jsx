import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from './Header';
import kidscare from "./images/kidscare.png";
import PreModal from './PreModal';
import blurredBackground from './images/background4.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Footer from './Footer';

const IntroText = styled.div`

  color: white; 
  font-size: 20px;
  padding: 20px;
  margin: 20px auto;
  border-radius: 8px;
  box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2);
  max-width: 670px; /* Adjust based on your design preference */
  text-align: left;
  font-family: oswald;
  background-color: rgba(245, 128, 73, 0.6); // Semi-transparent #a65935

  @media (max-width: 768px) {
    width: 80vw;
  }
`;


const BackgroundImage = styled.div`
  position: fixed; // Changed to fixed for consistent cover
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${blurredBackground});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  filter: blur(10px);
  z-index: -1;
`;
const RootContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh; // Ensure the container fills the viewport height
`;

const KidsCareContainer = styled.div`
  text-align: center;
  flex-grow: 1; // Allows the container to expand to fill available space
  display: flex;
  flex-direction: column;
  justify-content: space-between; // Distributes space between children
  height: 100%;
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
const SubContainer = styled.div`
  margin-bottom: 20px; // Adjust this margin as needed
  @media (max-height: 500px) {
    margin-bottom: 40px; // Increase margin for shorter screens
  }
`;

const CarouselContainer = styled.div`
  width: 100%;
  max-width: 700px;
  overflow: hidden;
  position: relative;
  margin: auto;
  border: 4px solid #D56F52;
  border-radius: 10px;
  margin-bottom: 20px; // Adjust for spacing between carousel and footer
  @media (max-width: 768px) {
    max-width: 90vw;
  }
  @media (max-height: 500px) {
    margin-bottom: 40px; // Increase margin for shorter screens
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
    <RootContainer>
              <BackgroundImage />
      <Header />
      <KidsCareContainer>

        <SubContainer>

    
        <ImageHeader src={kidscare} alt="Kids Care Header" />
        <IntroText> 
        <p>
            Embrace your fitness journey with confidence while we take care of your little ones. For only $15 a month, and $5 for each additional child, delight in the freedom to work out, knowing your kids are enjoying their time just a hop, skip, and a jump away. Step into our women-focused gym where we empower you to prioritize yourself, as we nurture your children with fun and engaging activities.
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
        </SubContainer>
      </KidsCareContainer>
      
      <PreModal />
      <Footer/>
    </RootContainer>
  );
};

export default KidsCare;