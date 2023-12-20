import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMenu } from 'react-icons/fi'; 
import { IoMdClose } from 'react-icons/io'; // Importing Close icon
import logo from './images/logo.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';

const HeaderContainer = styled.header`
  display: flex;
  height:20px;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #D56F52;
  border-bottom: 3px solid #4e7a51; // Adds the bottom border
  border-radius: 0 0 10px 10px; // Rounds the bottom corners
  width:80vw;
  position: fixed; // Fixes the header at the top of the viewport
  top: 0; // Aligns the header to the top of the viewport
  left: 50%; // Centers the header horizontally
  transform: translateX(-50%); // Adjusts for the horizontal centering
  z-index: 1000; // Ensures the header stays on top of other elements
`;
const HeaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const CenteredHeader = styled.div`
  width: 80%;
  0margin: 0 auto;
`;

const Logo = styled.img`
  width: 28px; // Fixed width
  height: auto; // Maintains aspect ratio
  margin-bottom: 5px;
  margin-left: -10px
`;
const Nav = styled.nav`
  display: flex;
  gap: 20px;
  @media (max-width: 768px) {
    display: none; // Hide on mobile
    flex-direction: column;
    position: absolute;
    text: bold;
  margin-top: 20px;
    left: 0;
    right: 0;
  

    background-color: white;

    ${({ isOpen }) => isOpen && `
      display: flex;
    `}
  }
`;
const LeafIcon = styled(FontAwesomeIcon)`
  position: absolute;
  top: -10px; // Adjusted to be less negative
  left: 50%;
  transform: translateX(-50%);
  opacity: 0; // Initially hidden
  transition: opacity 0.3s ease;
  font-size: 12px; // Smaller leaf icon
`;

const NavLink = styled.a`
  text-decoration: none;
  font-family: 'Oswald', sans-serif;
  font-size: 13px;

  color: white;
  position: relative; // For positioning the leaf icon
  margin-top: 8px; // Added margin at the top
  margin-bottom: 8px; 
  &:hover ${LeafIcon} {
    opacity: 1; // Show the icon on hover
  }
`;

const MobileIcon = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    color: white;
    
  }
`;

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scroll
    });
  };
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return (
    <HeaderWrapper>
      <CenteredHeader>
        <HeaderContainer>
          <Logo src={logo} alt="Peaches Gym Logo" onClick={scrollToTop} />
          <MobileIcon onClick={toggleMenu}>
            {isOpen ? <IoMdClose size="1.5em"/> : <FiMenu size="1.5em"/>}
          </MobileIcon>
          <Nav isOpen={isOpen}>
            {["Memberships", "Kids Care", "Classes", "Contact Us", "FAQ"].map((item, index) => (
              item === "Contact Us" ? (
                // Special handling for "Contact Us"
                <NavLink key={index} onClick={scrollToBottom}>
                  {item}
                  <LeafIcon icon={faLeaf} />
                </NavLink>
              ) : (
                // Default handling for other links
                <NavLink key={index} href={`#${item.toLowerCase().replace(/\s+/g, '')}`}>
                  {item}
                  <LeafIcon icon={faLeaf} />
                </NavLink>
              )
            ))}
          </Nav>
        </HeaderContainer>
      </CenteredHeader>
    </HeaderWrapper>
  );
};

export default Header;