import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import mapboxgl from 'mapbox-gl';
import customMarkerImg from './images/logo3.png'; 
import headerImage from './images/cometrainwithus.png'; // Update the path to your image
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapPin } from '@fortawesome/free-solid-svg-icons';



mapboxgl.accessToken = ; // Replace with your Mapbox access token

const MapWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  margin-bottom:100px;


  @media (max-width: 768px) {
    width: 90vw;
  }
`;

const StyledMapContainer = styled.div`
  width: 300px;
  height: 300px;
  border: 2px solid #CD6E57;
  border-radius: 20px;
  @media (max-width: 768px) {
    width: 100%; // Full width on mobile
    height: 300px; // Adjust height as needed
  }
`;

const HeaderImage = styled.img`
  max-width: 80vw; // Ensure the image is responsive
  height: 100px; // Maintain aspect ratio
  margin-bottom: -40px;
  @media (max-width: 768px) {
    width: 80vw; // Adjusted width for mobile
    height: auto; // Height adjusted to maintain aspect ratio
  }
`;
const DirectionsButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #CD6E57; // Adjust color as needed
  color: white;
  padding: 10px 15px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;

  cursor: pointer;

  &:hover {
    background-color: #B55C44; // Darken on hover
  }
`;
const AddressText = styled.p`
  color: white;
  text-align: center;
  margin-top: 20px; // Adjust spacing as needed
`;

const Icon = styled(FontAwesomeIcon)`
  margin-right: 8px;
`;

const Address = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    let map; // Define map variable outside the try block

    try {
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/peachesgym/clqea736d005p01of0tvtg9g8',
        center: [-106.536046, 35.115047],
        zoom: 16,
        pitch: 60
      });

      // Create a new HTML element for the custom marker
      const markerEl = new Image();
      markerEl.src = customMarkerImg;
      markerEl.style.width = '20px'; // Set the size of the marker
      markerEl.style.height = '20px';

      // Add custom marker to the map
      new mapboxgl.Marker(markerEl)
        .setLngLat([-106.536046, 35.115047])
        .addTo(map);

    } catch (error) {
      console.error("Error setting up the map:", error);
    }

    // Clean up on unmount
    return () => {
      if (map) map.remove();
    };
  }, []);
  return (
    <MapWrapper>
      <HeaderImage src={headerImage} alt="Come Train With Us!" />
      <StyledMapContainer ref={mapContainerRef} />
      <AddressText>2801 Eubank Blvd, Albuquerque NM, 87110</AddressText>
      <DirectionsButton href="https://www.google.com/maps/dir/?api=1&destination=2801+Eubank+Blvd,+Albuquerque+NM,+87110" target="_blank">
        <Icon icon={faMapPin} />
        Directions
      </DirectionsButton>
    </MapWrapper>
  );
};

export default Address;