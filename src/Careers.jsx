import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';
import emailjs from 'emailjs-com';
import careers from './images/careers.png'

const RootContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
`;
const ImageHeader = styled.img`
  width: 50vw;
  margin-top: 40px;
  @media (max-width: 768px) {
    width: 70vw;
    margin-top: 40px;
  }
`;
const CareersContainer = styled.div`
  text-align: center;
  padding: 20px;
  z-index: 2;
  position: relative;
`;

const FormContainer = styled.div`
  margin: auto;
  padding: 20px;
  background-color:#D56F52;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  position: relative;
  margin-bottom: 20px;
`;

const StyledForm = styled.form`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color:#D56F52;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 300px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #D56F52;
  border-radius: 5px;
  &:focus {
    outline: none;
    border-color: #FACCB5;
  }
  @media (max-width: 768px) {
    width: 70vw;
  }
`;

const TextArea = styled.textarea`
  width: 300px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #D56F52;
  border-radius: 5px;
  resize: vertical;
  font-family: 'Arial', sans-serif; // Set the font to match other inputs
  font-size: 14px; // Match the font size of other input fields if needed
  &:focus {
    outline: none;
    border-color: #FACCB5;
  }
  @media (max-width: 768px) {
    width: 70vw;
  }
`;


const Select = styled.select`
  width: 300px; // Match other input fields
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #D56F52;
  border-radius: 5px;
  background-color: white;
  box-sizing: border-box; // This ensures padding is included in the width
  &:focus {
    outline: none;
    border-color: #FACCB5;
  }
  @media (max-width: 768px) {
    width: 75vw; // Ensure consistency on smaller screens
  }
`;


const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #FAb39d;
  color: white;
  cursor: pointer;
  &:hover {
    background-color: #FACCB5;
  }
`;
const ThankYouMessage = styled.div`
  background-color: #D56F52; // The specified background color
  color: white; // White text
  padding: 20px;
  margin: 20px 0; // Add some margin to separate it from other elements
  border-radius: 10px; // Optional: rounded corners
  font-size: 1.2em; // Larger font size
  text-align: center; // Center the text
`;

const Careers = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef();

  const handleCareerSubmit = (event) => {
    event.preventDefault();
    emailjs.sendForm('service_3ykzhp7', 'template_9ntam3d', formRef.current, 'gk157tFkxTFBmQWBQ')
      .then(
        (response) => {
          console.log("Email sent successfully:", response);
          setIsSubmitted(true);
        },
        (error) => {
          console.error("Error sending email:", error);
        }
      );
  };

  return (
    <RootContainer>
      <Header  />
      <CareersContainer>
<ImageHeader src={careers}/>
        <FormContainer>
          {!isSubmitted ? (
            <StyledForm ref={formRef} onSubmit={handleCareerSubmit}>
              <Input type="text" name="name" placeholder="Name" required />
              <Input type="email" name="email" placeholder="Email" required />
              <Input type="text" name="phone" placeholder="Phone Number" required />
              <Input type="text" name="address" placeholder="Address" required />
              <TextArea name="experience" placeholder="Relevant Work Experience" required></TextArea>
              <Input type="number" name="age" placeholder="Age" required />
              <Select name="gender" required>
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Non-Binary</option>
              </Select>
              {/* Note: Handling file uploads requires additional logic */}
              <Button type="submit">Submit Application</Button>
            </StyledForm>
          ) : (
            <ThankYouMessage>
            Your application has been submitted. Thank you!
          </ThankYouMessage>

          )}
        </FormContainer>
      </CareersContainer>
     

      <Footer />
    </RootContainer>
  );
};

export default Careers;

