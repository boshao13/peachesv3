import React from 'react';
import styled, { keyframes } from 'styled-components';
import Header from './Header';
import comingsoon from './images/comingsoon.png'
import background from './images/background.png'
import Footer from './Footer';
const scroll = keyframes`
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-600%); /* Adjust this value based on the number of images */
  }
`;
const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${background}); /* Set the background image */
  filter: blur(10px); /* Adjust the blur amount as needed */
  z-index: -1; /* Place it behind the content */
`;


const ClassesContainer = styled.div`
  text-align: center;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ImageHeader = styled.img`
  width: 50vw;
  margin-top: 100px;
  @media (max-width: 768px) {
    width: 100vw;
    margin-top: 300px;
  }
`;

const InfoBox = styled.div`
  padding: 20px;
  margin: 20px;
`;

const CarouselContainer = styled.div`
  width: 80vw; /* Fixed width */
  overflow: hidden;
  position: relative;

  margin-bottom:530px;
  border-radius: 10px; /* Rounded corners */
  
  background-color: #D56F52; /* White background */
  @media (max-width: 768px) {
    width: 90vw;
    margin-top: 100px;
    margin-bottom:200px;
  }
`;

const CarouselSlider = styled.div`
  display: flex;
  animation: ${scroll} 30s linear infinite; /* Adjust the duration (20s) as needed */
`;

const CarouselImage = styled.img`
  flex-shrink: 0;
  opacity: 0.7;
  width: 300px; /* Image width */
  padding: 6px; /* Spacing around each photo */
`;

const Classes = () => {
  const images = [
    require('./images/stockgym4.jpeg'),
    require('./images/stockgym1.avif'),
    require('./images/stockgym2.jpeg'),
    require('./images/stockgym3.avif'),
    require('./images/stockgym5.jpeg'),
    require('./images/stockgym6.jpeg'),
  ];

  return (
    <>
      <Header />
      <ClassesContainer>
        <ImageHeader src={comingsoon} />
        <BackgroundImage/>
        {/* <InfoBox>
          <h2>Pricing and Hours</h2>
          <p>Information about pricing and hours of availability goes here.</p>
        </InfoBox> */}
        <CarouselContainer>
          {/* <CarouselSlider>

            {images.concat(images).map((image, index) => (
              <CarouselImage key={index} src={image} alt={`Carousel Image ${index + 1}`} />
            ))}
          </CarouselSlider> */}
        </CarouselContainer> 
      </ClassesContainer>
      <Footer/>
    </>
  );
};

export default Classes;
