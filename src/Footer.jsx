import styled from 'styled-components';
import { useHeaderContext } from './HeaderContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';

const FooterContainer = styled.footer`
display: flex; // Add flex display
flex-direction: column; // Set direction to column
align-items: center; // Center items horizontally
justify-content: center; // Center items vertically
  background-color: #D56F52;
  color: white;
  text-align: center;
  padding: 10px; // Reduced padding
  font-size: 8px; // Smaller font size
  height:200px;
  
  @media (max-width: 768px) {
    height:250px;
  }

`;
const SocialMediaContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px; // Adjust as needed
  font-family: 'Oswald', sans-serif; // Oswald font

  .icon {
    margin-left: 10px;
    color: white; // White icon color
    font-size: 28px; // Bigger icon size

    &:hover {
      color: #FACCB5;
    }
  }
  @media (max-width: 768px) {
    margin-top:5px;

  }
`;

const EmailInput = styled.input`
  padding: 5px;
  border: none;
  border-radius: 5px;
  outline: none;
  // additional styles ...
`;
const FollowUs = styled.h1`
font-size:20px;
margin-right:20px;
`;


const LinksAndSignupContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 80px; // Adjust gap as needed

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;
const FooterText = styled.p`
  margin: 0;
  padding: 0;
  line-height: 1.5; // Adjust for better readability
  margin-bottom:10px;
`;

const UtilitiesContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px; // Reduced gap
  margin-bottom: 10px; // Reduced margin

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    margin-bottom: -60px; // Reduced margin
    gap: 0px; // Reduced gap
  }
`;

const UtilityColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UtilityLink = styled.a`
  color: white;
  text-decoration: none;
  font-size: 10px;
  margin-bottom: 5px; // Reduced margin
  @media (max-width: 768px) {
  font-size: 12px;
  }
`;

const NewsletterContainer = styled.div`
  background-color: #B55C44;
  padding: 10px; // Reduced padding
  margin-bottom: 10px; // Reduced margin
  border-radius:10px;
  width: 300px; // Adjust as needed
  padding: 10px;
  border-radius: 10px;
  
  @media (max-width: 768px) {
    width: 80vw; // Adjusted width for mobile
   
  }
`;

const NewsletterTitle = styled.h3`
  margin: 0;
  margin-bottom: 5px; // Reduced margin
  font-size: 12px; // Reduced font size
`;

const NewsletterForm = styled.form`
  display: flex;
  justify-content: center;
  gap: 5px; // Reduced gap

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;



const SubscribeButton = styled.button`
  background-color: #faccb5;
  color: #333;
  border: none;
  padding: 5px 10px; // Reduced padding
  border-radius: 5px;
  cursor: pointer;

`;

const Footer = () => {

  const { handleCareerSubmit, newsletterFormRef, newsletterData, setnewsletterData, handleNewsLetterSubmit} = useHeaderContext();

    return (
      <FooterContainer>
    <SocialMediaContainer>
      <FollowUs>Follow Us!</FollowUs>
      <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
        <FontAwesomeIcon icon={faFacebook} className="icon" />
      </a>
      <a href="https://www.instagram.com/peachesfitnessclub/" target="_blank" rel="noopener noreferrer">
        <FontAwesomeIcon icon={faInstagram} className="icon" />
      </a>
    </SocialMediaContainer>
              <LinksAndSignupContainer>

        <UtilitiesContainer> 
        <UtilityLink href="/careers">Careers</UtilityLink> {/* Add this line */}
          {/* <UtilityColumn> */}
            {/* <UtilityLink href="#">Link 1</UtilityLink>
            <UtilityLink href="#">Link 2</UtilityLink>
            Add more utility links as needed */}
          {/* </UtilityColumn>
          <UtilityColumn> */}
            {/* <UtilityLink href="#">Link 3</UtilityLink>
            <UtilityLink href="#">Link 4</UtilityLink>
            Add more utility links as needed */}
          {/* </UtilityColumn> */}
        </UtilitiesContainer>
        <NewsletterContainer>
          <NewsletterTitle>Sign up for our Newsletter</NewsletterTitle>
          <NewsletterForm ref={newsletterFormRef}>
          <EmailInput
              type="email"
              placeholder="Enter your email"
              name="user_email"
              value={newsletterData}
              onChange={(e) => {
                // Update newsletterData with the value from the input
                setnewsletterData({ ...newsletterData, email: e.target.value });
                console.log(newsletterData, "data is");
              }}
              required
            />
            <SubscribeButton onClick={handleNewsLetterSubmit}>Subscribe</SubscribeButton>
          </NewsletterForm>
        </NewsletterContainer>
        </LinksAndSignupContainer>
        <FooterText> Our services are available to all members of the public regardless of race, gender or sexual orientation.<br/>
        &copy; {new Date().getFullYear()} Peaches Gym. All rights reserved.
      </FooterText>
      <FooterText>
        Terms of Service | Privacy Policy
      </FooterText>
      </FooterContainer>
    );
  };
  
  export default Footer;