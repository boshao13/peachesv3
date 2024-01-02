import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FiMenu } from 'react-icons/fi'; 
import { IoMdClose } from 'react-icons/io'; // Importing Close icon
import logo from './images/logo.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';
import { useHeaderContext } from './HeaderContext';
import { useNavigate } from 'react-router-dom';

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;


const HeaderContainer = styled.header`
  background-color: #D56F52;
 
  border-radius: 0 0 10px 10px;
  position: fixed;
  top: 0;
  left: 50%;
  height:10px;
  transform: translateX(-50%);
  z-index: 1000;
  width: 80vw;
  padding: 10px 20px;
  display: flex; // Added for flex layout
  justify-content: space-between; // Space out the logo and navigation
  align-items: center; // Vertically center items

  @media (max-width: 768px) {
  
   height: ${({ isOpen }) => isOpen ? '285px' : '28px'};
   transition: height 0.7s ease-in-out;
  }
`;
const TopBar = styled.div`
display:none;
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #D56F52;
    border-radius: 0 0 10px 10px;
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80vw;
  }

  border-bottom: ${({ isOpen }) => isOpen ? 'none' : 'border-bottom: 3px solid #4e7a51'};

`;

const Logo1 = styled.img`
  width: 25px;
  height: auto;
  margin-bottom: 5px;
  margin-left: -10px;

  @media (max-width: 768px) {
  display:none;
   }

`;
const Logo2 = styled.img`
  display:none;
  width: 25px;
  height: auto;
  margin-bottom: 5px;
  margin-left: -10px;
  @media (max-width: 768px) {
    display:block;
     }
  

`;

const BookTourButton = styled.a`
  display: none; // Hidden by default
  background: linear-gradient(90deg, #faccb5, #fab39d); // Gradient background

  color: white; // Text color
  padding: 7px 14px;
  border-radius: 7px;
  text-decoration: none;
  font-size: 11px;
  align-self: center;
  font-family: 'lato';
  margin-left: 5px;

  @media (max-width: 768px) {
    display: block; // Show only on mobile
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0; 
    background-color: transparent;
    overflow: hidden;
    gap: 14px;
 
    height: ${({ isOpen }) => isOpen ? '280px' : '0'};
    opacity: ${({ isOpen }) => isOpen ? 1 : 0}; // Control opacity
    transition: height 0.7s ease-in-out, opacity 0.7s ease-in-out;
    width: 100%;
    // display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};

   
  

  }
`;
const LeafIcon = styled(FontAwesomeIcon)`
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 8px;
`;

const NavLink = styled.a`
  text-decoration: none;
  font-family: 'Oswald', sans-serif;
  font-size: 13px;
  color: white;
  position: relative;
  margin-top: 3px;
  margin-bottom: 4px;
  &:hover ${LeafIcon} {
    opacity: 1;
  }
  @media (max-width: 768px) {
    font-size: 17px;
  }
`;

const MobileIcon = styled.div`
  display: none;
  color: white;

  @media (max-width: 768px) {
    display: block;
  }
`;
const Header = ({  contactUsRef }) => {
  const navigate = useNavigate();
  const { isOpen, setIsOpen, openModal } = useHeaderContext();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const scrollToTop = () => {
    if (window.location.pathname !== "/" && window.location.pathname !== "/home") {
      navigate('/');
    } else {
      // If already on the homepage
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      // Replace the current URL without the hash
      window.history.replaceState(null, null, ' ');
    }
    setIsOpen(false);
  };

  const scrollToContact = () => {
    if (window.location.pathname !== "/" && window.location.pathname !== "/home") {
      navigate('/#contact-us-section');
      setIsOpen(false);
    } else if (contactUsRef.current) {
      const yOffset = contactUsRef.current.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: yOffset, behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const scrollToPre = () => {
    if (window.location.pathname !== "/" && window.location.pathname !== "/home") {
      navigate('/#pre-enrollment-section');
      setIsOpen(false);
    } else if (contactUsRef.current) {
      openModal();
      setIsOpen(false);
    }
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
    setIsOpen(false);
  };

  const navigateToKids = () => {
    navigate('/kidscare');
    setIsOpen(!isOpen);
  };
  const navigateToHome = () => {
    navigate('/');
    setIsOpen(!isOpen);
  };

  return (
    <HeaderWrapper>
      <HeaderContainer isOpen={isOpen}>
        <Logo1 src={logo} alt="Peaches Gym Logo" onClick={scrollToTop} />
        <TopBar>
          <Logo2 src={logo} alt="Peaches Gym Logo" onClick={scrollToTop} />
          <BookTourButton onClick={scrollToPre}>Pre-Enroll</BookTourButton>
          <MobileIcon onClick={toggleMenu}>
            {isOpen ? <IoMdClose size="1.5em" /> : <FiMenu size="1.5em" />}
          </MobileIcon>
        </TopBar>
        <Nav isOpen={isOpen}>
          <NavLink href="daypass">
            Day Pass
            <LeafIcon icon={faLeaf} />
          </NavLink>
          <NavLink  onClick={navigateToKids}>
            Kids Care
            <LeafIcon icon={faLeaf} />
          </NavLink>
          <NavLink href="classes">
            Classes
            <LeafIcon icon={faLeaf} />
          </NavLink>
          <NavLink onClick={scrollToContact}>
            Contact Us
            <LeafIcon icon={faLeaf} />
          </NavLink>
          <NavLink onClick={scrollToBottom}>
            FAQ
            <LeafIcon icon={faLeaf} />
          </NavLink>
        </Nav>
      </HeaderContainer>
    </HeaderWrapper>
  );
};

export default Header;
