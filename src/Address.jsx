import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import mapboxgl from 'mapbox-gl';
import customMarkerImg from './images/logo3.png'; 
import headerImage from './images/cometrainwithus.png'; // Update the path to your image
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapPin } from '@fortawesome/free-solid-svg-icons';
import ContactUsModal from './ContactUsModal';
const key = process.env.REACT_APP_MAPBOX_API_KEY;


mapboxgl.accessToken = key; // Replace with your Mapbox access token

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 350px;
  border-radius: 10px;

  @media (min-width: 768px) {
    flex-direction: column;
    align-items: flex-start;

  }
  @media (max-width: 768px) {
    padding:10px;
    box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2);
    width:85vw;
  }
`;


const MapWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50px;
 font-family: oswald;
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    margin-top: 50px;

  }
`;

const StyledMapContainer = styled.div`
  width: 300px;
  height: 300px;
  border: 4px solid #D56F52;
  //#D56F52;
  border-radius: 20px;
  margin-bottom: 10px; // Space between map and button

  @media (max-width: 768px) {
    width: 90vw;
    height: 340px;
    margin-top: 10px;
  }
`;
const RightContainer= styled.div`
display: flex;
flex-direction: column;
align-items: center;
  @media (max-width: 768px) {
    width: 90vw;
    height: 340px;
    margin-top: 10px;
  }
`;

const HeaderImage = styled.img`
  max-width: 350px; // Ensure the image is responsive
  height: auto; // Maintain aspect ratio
  width: 300px; // Ensure the image is responsive
  margin-bottom: -50px;
  margin-top: -10px;
]
  @media (max-width: 768px) {
    width: 100vw; // Adjusted width for mobile
    height: auto; // Height adjusted to maintain aspect ratio
  

  }
`;
const DirectionsButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #D56F52; // Adjust color as needed
  color: white;
  padding: 10px 15px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  width: 80px;
  cursor: pointer;

  &:hover {
    background-color: #B55C44; // Darken on hover
  }

`;
const ContactButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #D56F52; // Adjust color as needed
  color: white;
  padding: 10px 15px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  margin-top: 20px;
  cursor: pointer;
  width: 80px;
  &:hover {
    background-color: #B55C44; // Darken on hover
  }
`;
const AddressText = styled.p`
  color: white;
  text-align: center;
  margin-top:55px;
`;

const StaffedText = styled.p`
  color: white;
  text-align: center;
  margin-top: 4px; // Adjust spacing as needed
  @media (max-width: 768px) {
    margin-top: 8px; // Adjust spacing as needed
  }
`;

const Icon = styled(FontAwesomeIcon)`
  margin-right: 8px;
`;

const HoursContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 10px; // Adjust spacing as needed
  font-size: 15px;
`;

const DaysColumn = styled.div`
  margin-right: 20px; // Space between days and hours
`;

const HoursColumn = styled.div``;

const Day = styled.p`
  color: white;
  text-align: left; // Align days to the left
  margin: 0; // Remove default margins
`;

const Hours = styled.p`
  color: white;
  text-align: left; // Align hours to the left
  margin: 0; // Remove default margins
`;

const Address = ({handleContactModalSubmit, contactUsRef, openContactUsModal, isContactUsModalOpen, closeContactUsModal, formRef}) => {


  const mapContainerRef = useRef(null);

  useEffect(() => {
    let map; // Define map variable outside the try block

    try {
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/peachesgym/clqea736d005p01of0tvtg9g8',
        center: [-106.536046, 35.115047],
        zoom: 14,
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
    <MapWrapper ref={contactUsRef} id="contact-us-section">
   
      <FlexContainer>
        <HeaderImage src={headerImage} alt="Come Train With Us!" />
        <AddressText>2801 Eubank Blvd, Albuquerque NM, 87110</AddressText>
        {/* <Phone>(505) 555-1234 </Phone> */}
        <StaffedText>Operating Hours</StaffedText>
        <HoursContainer>
        
          <DaysColumn>
            <Day>M-F</Day>

            <Day>Sat Sun</Day>

          </DaysColumn>
          <HoursColumn>
            <Hours>5 AM - 10 PM</Hours>
            <Hours>5 AM - 8 PM</Hours>

          </HoursColumn>
        </HoursContainer>
        <StaffedText>Staffed Hours</StaffedText>
        <HoursContainer>
          <DaysColumn>
            <Day>M-F</Day>

            <Day>Sat Sun</Day>

          </DaysColumn>
          <HoursColumn>
            <Hours>8 AM - 10 PM</Hours>
            <Hours>8 AM - 8 PM</Hours>

          </HoursColumn>
        </HoursContainer>
  
        <ContactButton onClick={openContactUsModal}> Contact Us </ContactButton>
        <ContactUsModal 
        isContactUsModalOpen={isContactUsModalOpen} 
        closeContactUsModal={closeContactUsModal}
        handleContactModalSubmit={handleContactModalSubmit}
        formRef={formRef}
        />
      </FlexContainer>
      <RightContainer>
      <StyledMapContainer ref={mapContainerRef} />
              <DirectionsButton href="https://www.google.com/maps/dir/?api=1&destination=2801+Eubank+Blvd,+Albuquerque+NM,+87110" target="_blank">
          <Icon icon={faMapPin} />
          Directions
        </DirectionsButton>
        </RightContainer>
    </MapWrapper>
  );
};

export default Address;