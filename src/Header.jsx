import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMenu } from 'react-icons/fi'; // Importing Menu icon
import { IoMdClose } from 'react-icons/io'; // Importing Close icon
import logo from './images/logo.png'
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: white;
`;

const Logo = styled.img`
  width: 4vw;
  height: 4vh;
`

const Nav = styled.nav`
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    display: none; // Hide on mobile
    flex-direction: column;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background-color: white;

    ${({ isOpen }) => isOpen && `
      display: flex;
    `}
  }
`;

const NavLink = styled.a`
  text-decoration: none;
  color: black;
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
    <HeaderContainer>
      <Logo src={logo} alt="Peaches Gym Logo" />
      <MobileIcon onClick={toggleMenu}>
        {isOpen ? <IoMdClose size="1.5em"/> : <FiMenu size="1.5em"/>}
      </MobileIcon>
      <Nav isOpen={isOpen}>
        <NavLink href="#memberships">Memberships</NavLink>
        <NavLink href="#kidscare">Kids Care</NavLink>
        <NavLink href="#contact">Contact Us</NavLink>
        <NavLink href="#classes">Classes</NavLink>
        <NavLink href="#faq">FAQ</NavLink>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;