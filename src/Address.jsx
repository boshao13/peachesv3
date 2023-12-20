import React from 'react';
import styled from 'styled-components';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';


const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 60vw;
  margin: auto;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 90vw;
  }
`;

const Title = styled.h2`
  /* Title styles */
`;

const Subheading = styled.h3`
  /* Subheading styles */
`;

const StyledGoogleMap = styled(GoogleMap)`
  /* Map styles */
  width: 300px;
  height: 300px;
  border: 1px solid black;
`;

const libraries = ['places'];
const mapContainerStyle = {
  width: '20rem',
  height: '20rem',
};
const center = {
  lat: 7.2905715, // default latitude
  lng: 80.6337262, // default longitude
};

const Address = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,

    libraries,
  });

  if (loadError) {
    console.log(`${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`)
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return (
    <div>
    <Container>
      <div>
        <Title>Our Location</Title>
        <Subheading>2801 Eubank Blvd NE Suite P, Albuquerque NM, 87112</Subheading>
      </div>
      <StyledGoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={center}
      >
        <Marker position={center} />
      </StyledGoogleMap>
    </Container>

    </div>
  );
};

export default Address;