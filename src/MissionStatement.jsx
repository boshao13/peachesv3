import React from 'react';
import styled from 'styled-components';
import asset from "./images/missionstatement.png"
const Header = styled.img`
width: 35vw;


@media (max-width: 768px) {
    width:80vw;
    margin-top: -10px;
  }
`;

const MissionStatementContainer = styled.div`

background-color: rgba(255, 255, 255, 0); // Semi-transparent white
  padding: 20px; /* Padding around the content */
  font-family: 'Oswald', sans-serif;

  border-radius: 20px; /* Rounded border */

  margin: 20px; /* Add margin for spacing */
  text-align: center;
  @media (max-width: 768px) {


  }
`;

const MissionStatementText = styled.p`

  margin-top:50px;
  font-size: 1em; /* Font size */
  color: white; /* Text color */
  max-width: 800px; /* Maximum width for the text */
  margin: 0 auto; /* Center-align the text horizontally */
  line-height: 1.5; /* Line height for readability */
  text-align: left; /* Center-align the text */

  @media (max-width: 768px) {

    font-size: 15px; /* Adjust font size for smaller screens */
  }
`;

const MissionStatement = () => {
  return (
    <MissionStatementContainer>
        <Header src={asset}></Header>
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