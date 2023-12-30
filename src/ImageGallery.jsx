import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const PhotoGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  margin: 20px auto; // Centering the grid
  width: 60%; // Occupying 60% of the screen width]]
  @media (max-width: 768px) {
    width: 100%; // Full width for mobile
  }
`;

const PhotoCard = styled.div`
  background-image: url(${props => props.image}) ;
  background-size: cover;
  position: relative;
  width: calc(45% - 7.5px); // accounting for gap
  height: 300px; // Adjust as needed
  cursor: pointer;
  overflow: hidden;
  border-radius: 10px; 
  font-family: 'Oswald', sans-serif;
  border: 2px solid #CD6E57;

  transition: none; 

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    width: 95vw;
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
  font-size: 1em;
  font-weight: bold;
  transition: transform 0.3s ease-in-out;

  PhotoCard:hover & {
    transform: translateY(-100%);
  }
`;
const ImageGallery = () => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(new Array(6).fill(0));
    const cardsRef = useRef([]);
  
    const photos = [
      {
        title: 'Peaches Lounge',
        images: [require('./images/stockgym4.jpeg') , require('./images/stockgym1.avif'), 
        require('./images/stockgym2.jpeg'),require('./images/stockgym3.avif'),require('./images/stockgym5.jpeg'),
        require('./images/stockgym6.jpeg')]
      },
      // ... [5 more objects for each card with an array of up to 5 images]
      {
        title: 'Gym',
        images: [require('./images/stockgym4.jpeg') , require('./images/stockgym1.avif'), 
        require('./images/stockgym2.jpeg'),require('./images/stockgym3.avif'),require('./images/stockgym5.jpeg'),
        require('./images/stockgym6.jpeg')]
      },
      {
        title: 'Kids Care',
        images: [require('./images/kids.png') , require('./images/stockgym1.avif'), 
        require('./images/stockgym2.jpeg'),require('./images/stockgym3.avif'),require('./images/stockgym5.jpeg'),
        require('./images/stockgym6.jpeg')]
      },
      {
        title: 'Cold Plunge',
        images: [require('./images/coldplunge.png') , require('./images/coldplunge2.png'), 
        require('./images/coldplunge3.png')]
      },
      {
        title: 'Peachy Bar',
        images: [require('./images/stockgym4.jpeg') , require('./images/stockgym1.avif'), 
        require('./images/stockgym2.jpeg'),require('./images/stockgym3.avif'),require('./images/stockgym5.jpeg'),
        require('./images/stockgym6.jpeg')]
      },
      {
        title: 'Sauna',
        images: [require('./images/sauna.png') , require('./images/sauna2.png'),require('./images/sauna3.png')]
      },
    ];

//   useEffect(() => {
//     const isNotMobile = window.innerWidth > 768;

//     if (isNotMobile) {
//       const observer = new IntersectionObserver(
//         (entries) => {
//           entries.forEach((entry) => {
//             if (entry.isIntersecting) {
//               entry.target.classList.add("show");
//               entry.target.classList.remove("hidden");
//               observer.unobserve(entry.target); // Stop observing once it's shown
//             }
//           });
//         },
//         { threshold: 0.1 }
//       );

//       cardsRef.current.forEach((card) => {
//         if (card) {
//           observer.observe(card);
//         }
//       });

//       return () => {
//         observer.disconnect();
//       };
//     } else {
//       // For mobile, directly show all elements
//       cardsRef.current.forEach((card) => {
//         if (card) {
//           card.classList.add("show");
//           card.classList.remove("hidden");
//         }
//       });
//     }
//   }, []);


  const handlePhotoChange = (cardIndex, direction) => {
    setCurrentPhotoIndex(prev => {
      const newIndexes = [...prev];
      if (direction === 'right') {
        newIndexes[cardIndex] = (prev[cardIndex] + 1) % photos[cardIndex].images.length;
      } else {
        newIndexes[cardIndex] = (prev[cardIndex] - 1 + photos[cardIndex].images.length) % photos[cardIndex].images.length;
      }
      return newIndexes;
    });
  };

  const handleClick = (e, index) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      handlePhotoChange(index, 'left');
    } else {
      handlePhotoChange(index, 'right');
    }
  };

  return (
    <PhotoGrid>
      {photos.map((photo, index) => {
        // console.log("Image URL for card", index, ": ", photo.images[currentPhotoIndex[index]]); // Debugging line
        return (
          <PhotoCard
            ref={(el) => (cardsRef.current[index] = el)}
            className="show"
            key={index}
            image={photo.images[currentPhotoIndex[index]]}
            onClick={(e) => handleClick(e, index)}
          >
            <Title>{photo.title}</Title>
          </PhotoCard>
        );
      })}
    </PhotoGrid>
  );
};

export default ImageGallery;