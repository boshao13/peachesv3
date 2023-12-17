import React from 'react';
import styled from 'styled-components';
import { Parallax } from 'react-parallax';
import parallaxImage from './images/parallax.png';
import Slogan from './Slogan';
import MissionStatement from './MissionStatement';

const ParallaxContainer = styled.div`
  height: 100vh; // Default height for larger screens
  @media (max-width: 768px) {
    height: 100vh; // Smaller height for mobile screens
  }
`;


const ParallaxImage = () => {


    return (
        <Parallax bgImage={parallaxImage} strength={500}>
            <ParallaxContainer>
  
            <Slogan />
        
            </ParallaxContainer>
        </Parallax>
    );
};

export default ParallaxImage;