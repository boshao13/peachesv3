import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';

const RootContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between; // Space content and footer
  min-height: 100vh; // Full viewport height
`;

const ClassesContainer = styled.div`
  text-align: center;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const IframeContainer = styled.div`
  width: 100%;
  height: 1200px; // Adjust height as needed
  margin-top: 50px;
  @media (max-width: 768px) {
    height: 800px; // Adjust height for mobile view
  }
`;

const Classes = () => {
  return (
    <RootContainer>
      <Header />
      <ClassesContainer>
        <IframeContainer>
          <iframe 
            src="https://app.glofox.com/portal/#/branch/65d38d833aabb0e6490203b0/classes-day-view" 
            frameborder="0" 
            width="100%" 
            height="100%" 
            style={{ border: 'none' }}
          ></iframe>
          <a href="https://www.glofox.com">powered by <b>Glofox</b></a>
        </IframeContainer>
      </ClassesContainer>
      <Footer />
    </RootContainer>
  );
};

export default Classes;
