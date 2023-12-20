import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMenu } from 'react-icons/fi'; // Importing Menu icon
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
  background-color: #faccb5;
  border-bottom: 3px solid #4e7a51; // Adds the bottom border
  border-radius: 0 0 10px 10px; // Rounds the bottom corners
  width:80vw;
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
  width: 30px; // Fixed width
  height: auto; // Maintains aspect ratio
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
  }
`;

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <HeaderWrapper>
      <CenteredHeader>
    <HeaderContainer>
      <Logo src={logo} alt="Peaches Gym Logo" />
      <MobileIcon onClick={toggleMenu}>
        {isOpen ? <IoMdClose size="1.5em"/> : <FiMenu size="1.5em"/>}
      </MobileIcon>
      <Nav isOpen={isOpen}>
            {["Memberships", "Kids Care", "Classes", "Contact Us", "FAQ"].map((item, index) => (
              <NavLink key={index} href={`#${item.toLowerCase().replace(/\s+/g, '')}`}>
                {item}
                <LeafIcon icon={faLeaf} />
              </NavLink>
            ))}
          </Nav>
    </HeaderContainer>
    </CenteredHeader>
    </HeaderWrapper>
  );
};

export default Header;