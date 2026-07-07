import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';
import Seo from './Seo';

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

const Intro = styled.div`
  max-width: 760px;
  margin: 120px auto 0;
  padding: 0 20px;
  font-family: 'Oswald', sans-serif;

  h1 {
    font-size: clamp(28px, 5vw, 42px);
    text-transform: uppercase;
    letter-spacing: -0.5px;
    color: #d56f52;
    margin: 0 0 14px;
  }
  p {
    font-size: 17px;
    line-height: 1.65;
    color: #6b4f42;
    margin: 0 auto;
    max-width: 680px;
  }

  @media (max-width: 768px) {
    margin-top: 100px;
  }
`;

const IframeContainer = styled.div`
  width: 100%;
  height: 1200px; // Adjust height as needed
  margin-top: 30px;
  @media (max-width: 768px) {
    height: 800px; // Adjust height for mobile view
  }
`;

const Classes = () => {
  return (
    <RootContainer>
      <Seo
        path="/classes"
        title="Group Fitness Classes | Peaches Fitness Club Albuquerque"
        description="Browse and book women's group classes at Peaches in Albuquerque — yoga, Pilates, strength, Zumba and more. See the live schedule."
      />
      <Header />
      <ClassesContainer>
        <Intro>
          <h1>Group Fitness Classes in Albuquerque</h1>
          <p>
            From strength and HIIT to yoga, Pilates, barre, cycle and Zumba, Peaches
            Fitness Club runs women's group classes all week long at our Albuquerque
            studio on Eubank Blvd. Every class is included with your membership — browse
            the live schedule below and book your spot.
          </p>
        </Intro>
        <IframeContainer>
          <iframe
            title="Peaches Fitness Club group class schedule"
            src="https://app.glofox.com/portal/#/branch/65d38d833aabb0e6490203b0/classes-day-view"
            frameBorder="0"
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
