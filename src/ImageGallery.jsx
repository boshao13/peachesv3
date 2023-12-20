import React from 'react';
import styled from 'styled-components';


const PhotoGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  margin: 20px auto; // Centering the grid
  width: 60%; // Occupying 60% of the screen width

  @media (max-width: 768px) {
    width: 100%; // Full width for mobile
  }
`;

const PhotoCard = styled.div`
  background-image: url(${props => props.image});
  background-size: cover;
  position: relative;
  width: calc(50% - 7.5px); // accounting for gap
  height: 300px; // Adjust as needed
  cursor: pointer;
  overflow: hidden;
  border-radius: 10px; // Rounded corners like in alphalandstore

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Title = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  text-align: center;
  padding: 10px 0;
  font-size: 1.2em;
  font-weight: bold;
  transition: transform 0.3s ease-in-out;

  PhotoCard:hover & {
    transform: translateY(-100%);
  }
`;

const ImageGallery = () => {
  const photos = [

    { title: 'Lockers', img: require('./images/stockgym1.avif') },
    { title: 'Classes', img: require('./images/stockgym2.jpeg') },
    { title: 'Equipment', img: require('./images/stockgym3.avif') },
    { title: 'Drink Bar', img: require('./images/stockgym4.jpeg') },
    { title: 'Cosmetics', img: require('./images/stockgym5.jpeg') },
    { title: 'Private Workout Studio', img: require('./images/stockgym6.jpeg') }
  ];

  return (
    <PhotoGrid>
      {photos.map((photo, index) => (
        <PhotoCard key={index} image={photo.img}>
          <Title>{photo.title}</Title>
        </PhotoCard>
      ))}
    </PhotoGrid>
  );
};

export default ImageGallery;