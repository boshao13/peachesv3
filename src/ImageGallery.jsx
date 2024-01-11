import React, { useState, useRef, useEffect } from 'react';
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

const PhotoCardContainer = styled.div`
  width: calc(45% - 7.5px);
  position: relative;
  margin-bottom: 30px; // Add some space for the dots

  @media (max-width: 768px) {
    width: 90vw;
  }
`;

const PhotoCard = styled.div`
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  height: 350px;
  cursor: pointer;
  overflow: hidden;
  border-radius: 10px;
  font-family: 'Oswald', sans-serif;
  border: 3px solid #D56F52;
  position: relative;

  &:after { // This creates the grey overlay at the bottom of each photo card
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 25px; // Adjust height as needed

    z-index: 1;
  }

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
    position: relative;
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px; // Grey overlay height
      background-color: rgba(0, 0, 0, 0.4); // Grey overlay
      z-index: 1;
    }
  }
  @media (max-width: 768px) {
    height: 300px;
  }
`;


const DotsContainer = styled.div`
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: 10px; // Adjust as needed
  width: 100%;
  z-index: 2; // Ensure it's above the photo card

  .dot {
    height: 6px;
    width: 6px;
    margin: 0 5px;
    background-color: #fddac5; // Light peach
    border-radius: 50%;
    display: inline-block;
  }

  .active-dot {
    background-color: #fb927c; // Darker peach
  }
`;
const Title = styled.div`
  position: absolute;
  bottom: 10px; // Adjusted to avoid overlapping with dots
  width: 100%;

  color: white;
  text-align: center;
  padding: 10px 0;
  font-size: 1em;
  font-weight: bold;
  z-index: 4; // Lower z-index than dots
  paddin-bottom:20px;
`;

const ImageGallery = () => {

  const cardsRef = useRef([]);
  const [activeImage, setActiveImage] = useState([]);

  
    const photos = [

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
    
    useEffect(() => {
      setActiveImage(Array(photos.length).fill(0));
    }, [photos.length]);
  
    const updateActiveImage = (index, scrollLeft) => {
      const activeIndex = Math.round(scrollLeft / cardsRef.current[index].clientWidth);
      setActiveImage((prev) => {
        const newActive = [...prev];
        newActive[index] = activeIndex;
        return newActive;
      });
    };
  
    const handleScroll = (index) => {
      if (cardsRef.current[index]) {
        updateActiveImage(index, cardsRef.current[index].scrollLeft);
      }
    };
  
    useEffect(() => {
      // Attach scroll event listeners to each photo card
      cardsRef.current.forEach((card, index) => {
        if (card) {
          card.addEventListener('scroll', () => handleScroll(index));
        }
      });
  
      // Clean up event listeners
      return () => {
        cardsRef.current.forEach((card, index) => {
          if (card) {
            card.removeEventListener('scroll', () => handleScroll(index));
          }
        });
      };
    }, []);
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
      updateActiveImage(index, card.scrollLeft);
    }
  };



return (
  <PhotoGrid>
    {photos.map((photo, index) => (
      <PhotoCardContainer key={index}>
        <PhotoCard
          ref={(el) => (cardsRef.current[index] = el)}
          onClick={(e) => handleClick(e, index)}
          onScroll={() => handleScroll(index)}
        >
          {photo.images.map((image, imgIndex) => (
            <div
              key={imgIndex}
              className="photo"
              style={{ backgroundImage: `url(${image})` }}
            >

                <Title>{photo.title}</Title>
              
            </div>
          ))}
        </PhotoCard>
        <DotsContainer>
          {photo.images.map((_, imgIndex) => (
            <span
              key={imgIndex}
              className={`dot ${activeImage[index] === imgIndex ? 'active-dot' : ''}`}
            />
          ))}
        </DotsContainer>
      </PhotoCardContainer>
    ))}
  </PhotoGrid>
);

};


export default ImageGallery;