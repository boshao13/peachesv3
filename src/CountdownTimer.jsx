import React, { useEffect, useState,  } from 'react';
import styled from 'styled-components';

// Styled components
const CountdownContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const TimeCard = styled.div`
  background: #D56F52;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  text-align: center;
  padding: 20px;
  min-width: 60px;
  transform-style: preserve-3d;
`;

const CardValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color:white;
  margin-bottom:5px;
`;

const CardLabel = styled.div`
  font-size: 1rem;
  color: white;
`;

const CountdownTimer = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const renderTimeCard = (unit, value) => {
    return (
      <TimeCard key={unit}>
        <CardValue>{value}</CardValue>
        <CardLabel>{unit.toUpperCase()}</CardLabel>
      </TimeCard>
    );
  };

  return (
    <CountdownContainer>
      {Object.keys(timeLeft).map((unit) => (
        renderTimeCard(unit, timeLeft[unit])
      ))}
    </CountdownContainer>
  );
};

export default CountdownTimer;
