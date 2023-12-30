import React from 'react';
import styled, { keyframes } from 'styled-components';
import Header from './Header';
import kidscare from "./images/kidscare.png"
import PreModal from './PreModal';
const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const KidsCareContainer = styled.div`
  text-align: center;
  @media (max-width: 768px) {
    width:100%;
  }
`;

const ImageHeader = styled.img`
  width: 30vw;

  margin-top: 100px;
  @media (max-width: 768px) {
    width:80vw;
    margin-top: 100px;
  }
`;

const InfoBox = styled.div`
  background-color: #FACCB5;
  padding: 20px;
  margin: 20px;
`;

const CarouselContainer = styled.div`
  width: 700px; /* Fixed width */
  overflow: hidden;
  position: relative;
  margin: auto; /* Center the carousel */  @media (max-width: 768px) {
    width:80vw;

  }
`;

const CarouselSlider = styled.div`
  display: flex;
  animation: ${scroll} 30s linear infinite; /* Adjust time for speed */
`;

const CarouselImage = styled.img`
  flex-shrink: 0;
  opacity: 0.7;
  width: 300px; /* Image width */
 
`;

const KidsCare = () => {
  const images = [require('./images/stockgym4.jpeg'), require('./images/stockgym1.avif'), 
                  require('./images/stockgym2.jpeg'), require('./images/stockgym3.avif'), 
                  require('./images/stockgym5.jpeg'), require('./images/stockgym6.jpeg')];

  return (
    <>
      <Header />
      <KidsCareContainer>
        <ImageHeader src={kidscare} alt="Kids Care Header" />
        <InfoBox>
          <h2>Pricing and Hours</h2>
          <p>Information about pricing and hours of availability goes here.</p>
        </InfoBox>
        <CarouselContainer>
          <CarouselSlider>
            {/* Duplicate images for a seamless loop */}
            {images.concat(images).map((image, index) => (
              <CarouselImage key={index} src={image} alt={`Carousel Image ${index + 1}`} />
            ))}
          </CarouselSlider>
        </CarouselContainer>
      </KidsCareContainer>
    <PreModal/>
    </>
  );
};

export default KidsCare;
