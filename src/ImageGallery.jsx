import React, { useState, useRef } from 'react';
import styled from 'styled-components';

const PhotoGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  margin: 20px auto;
  width: 60%;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PhotoCard = styled.div`
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  position: relative;
  width: calc(45% - 7.5px);
  height: 350px;
  cursor: pointer;
  overflow: hidden;
  border-radius: 10px;
  font-family: 'Oswald', sans-serif;
  border: 3px solid #D56F52;

  &::-webkit-scrollbar {
    display: none;
  }

  .photo {
    flex: 0 0 auto;
    width: 100%;
    height: 100%;
    scroll-snap-align: start;
    background-size: cover;
    background-position: center;
  }

  @media (max-width: 768px) {
    width: 90vw;
    height: 300px;
  }
`;

const Title = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  text-align: center;
  padding: 10px 0;
  font-size: 1em;
  font-weight: bold;
`;
const ImageGallery = () => {

    const cardsRef = useRef([]);
  
    const photos = [

      // ... [5 more objects for each card with an array of up to 5 images]
      {
        title: 'Gym',
        images: [require('./images/stockgym4.jpeg') , require('./images/stockgym1.avif'), 
        require('./images/stockgym2.jpeg'),require('./images/stockgym3.avif'),require('./images/stockgym5.jpeg'),
        require('./images/stockgym6.jpeg')]
      },
      {
        title: 'Classes',
        images: [require('./images/classes1.jpg') , require('./images/classes2.jpg'), 
        require('./images/classes3.jpg')]
      },
      {
        title: 'Kids Care',
        images: [require('./images/kidscare4.jpg') , require('./images/kidscare2.jpg')]
      },
      {
        title: 'Cold Plunge',
        images: [require('./images/coldplunge3.png') , require('./images/coldplunge2.png'), 
        require('./images/coldplunge.png')]
      },
      {
        title: 'Peachy Bar',
        images: [require('./images/peachybar.jpg') , require('./images/peachybar2.jpg'), 
        require('./images/peachybar3.jpg')]
      },
      {
        title: 'Sauna',
        images: [require('./images/sauna2.png') , require('./images/sauna.png'),require('./images/sauna3.png')]
      },
      {
        title: 'Exclusive Booty Builder® Equipment',
        images: [require('./images/bootybuilder3.png') , require('./images/bootybuilder.png'),require('./images/bootybuilder2.png')]
      },
      {
        title: 'Peaches Lounge',
        images: [require('./images/lounge3.jpeg') , require('./images/lounge2.jpg'),require('./images/lounge.jpeg')]
      }


    ];




  const handleClick = (e, index) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const card = cardsRef.current[index];

    if (card) {
      const scrollAmount = card.clientWidth;
      if (x < rect.width / 2) {
        card.scrollLeft -= scrollAmount;
      } else {
        card.scrollLeft += scrollAmount;
      }
    }
  };

  return (
    <PhotoGrid>
      {photos.map((photo, index) => {
        return (
          <PhotoCard
            ref={(el) => (cardsRef.current[index] = el)}
            key={index}
            onClick={(e) => handleClick(e, index)}
          >
            {photo.images.map((image, imgIndex) => (
              <div
                key={imgIndex}
                className="photo"
                style={{ backgroundImage: `url(${image})` }}
              >
                <Title>{photo.title}</Title> {/* Title included in each photo */}
              </div>
            ))}
          </PhotoCard>
        );
      })}
    </PhotoGrid>
  );
};



export default ImageGallery;