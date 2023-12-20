import React from 'react';
import styled from 'styled-components';

const Header = styled.header`
  text-align: center;
  padding: 20px;

  font-size: 24px; // Adjust the font size as needed
  font-weight: bold;
`;

const MissionStatementContainer = styled.div`
background-color: rgba(255, 255, 255, 0); // Semi-transparent white
  padding: 20px; /* Padding around the content */
  text-align: center; /* Center-align the text */
  border-radius: 20px; /* Rounded border */

  margin: 20px; /* Add margin for spacing */
  
  @media (max-width: 768px) {
    padding: 15px; /* Adjust padding for smaller screens */
    border-radius: 10px; /* Adjust border radius for smaller screens */
    margin: 10px; /* Adjust margin for spacing on smaller screens */
  }
`;

const MissionStatementText = styled.p`
  font-size: 1em; /* Font size */
  color: #333; /* Text color */
  max-width: 800px; /* Maximum width for the text */
  margin: 0 auto; /* Center-align the text horizontally */
  line-height: 1.5; /* Line height for readability */

  @media (max-width: 768px) {
    font-size: 18px; /* Adjust font size for smaller screens */
  }
`;

const MissionStatement = () => {
  return (
    <MissionStatementContainer>
        <Header>Peaches Bloom: Where Fitness Shapes Confidence</Header>
      <MissionStatementText>

      At Peaches Fitness Club, we're dedicated to fostering a welcoming, 
      judgment-free environment that empowers clients to achieve their fitness goals. 
      Our commitment to safety, support for women, and emphasis on diversity and 
      inclusivity underpin our community's spirit. With top-notch trainers, advanced facilities, 
      and a nurturing community, we inspire confidence and healthy living, celebrating the joy of self-improvement 
      and the strength found in encouragement. At Peaches, we're more than a gym; we're a community where everyone grows together.      </MissionStatementText>
    </MissionStatementContainer>
  );
};

export default MissionStatement;