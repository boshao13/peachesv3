import React from 'react';
import styled from 'styled-components';

const MissionStatementContainer = styled.div`
  background: linear-gradient(180deg, #ff9f84 0%, #e26d51 100%); /* Peach to darker peach gradient */
  padding: 20px; /* Padding around the content */
  text-align: center; /* Center-align the text */
  border-radius: 20px; /* Rounded border */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Box shadow for depth */
  margin: 20px; /* Add margin for spacing */
  
  @media (max-width: 768px) {
    padding: 15px; /* Adjust padding for smaller screens */
    border-radius: 10px; /* Adjust border radius for smaller screens */
    margin: 10px; /* Adjust margin for spacing on smaller screens */
  }
`;

const MissionStatementText = styled.p`
  font-size: 24px; /* Font size */
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
      <MissionStatementText>
        At Peaches Gym, our mission is to empower women to embrace their strength, achieve their fitness goals, and thrive in a supportive community. We believe that fitness is not just about physical health but also about mental well-being. We provide a safe and inclusive space where you can focus on your journey to a healthier and happier you.
      </MissionStatementText>
    </MissionStatementContainer>
  );
};

export default MissionStatement;