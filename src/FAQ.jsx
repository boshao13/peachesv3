import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import faq from './images/Faq.png'

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  margin-bottom: 50px;
  font-family: oswald;
  
`;
const HeaderContainer = styled.div`
justify-content:center;
display:flex;
align-items:center;
  
`;
const Header = styled.img`
width:380px;
margin-bottom:20px;
display:flex;
align-items:center;

@media (max-width: 768px) {
    width:80vw;
    
  }
`

const Question = styled.h3`
  background-color: #D56F52;
  padding: 10px;
  cursor: pointer;
  margin: 0;
  border: none;
  outline: none;
  transition: background-color 0.3s ease;
  border-radius: 5px;

  font-size: 15px;
  color: white;
  margin-bottom: 3px;
  margin-top: 3px;
  &:hover {
      background-color: #FAb39d;
  }
`;

const Answer = styled.div`
  overflow: hidden;
  padding-left: 10px;
  padding-right: 5px;
  padding-top:3px;
  padding-bottom:2px;
  transition: max-height 0.7s ease;
//   background-color: #9dbbaa;
  background-color: #4E7A51;
  border-radius: 5px;
  color: white;
  font-size: 13px;

  max-height: ${props => props.maxHeight}px;
`;


const faqs = [
    { question: 'What makes Peaches unique for women?', answer: "Peaches is tailored specifically for women, offering a safe and supportive environment. Our equipment, classes, and programs are designed with women's fitness needs and goals in mind, ensuring a comfortable and effective workout experience." },
    { question: 'Are there any classes specifically designed for women at Peaches?', answer: "Yes, we offer a variety of classes geared towards women, including yoga, Pilates, Zumba, strength training, and more. These classes focus on areas that most interest our female clientele, such as core strength, flexibility, and overall wellness." },
    { question: 'Do you offer personal training services at Peaches?', answer: "Absolutely! Our certified personal trainers specialize in women's fitness and can create customized workout plans to meet your individual goals, whether it's weight loss, strength building, or improving overall fitness."
},
    { question: "Is the gym equipped with amenities specific to women's needs?", answer: "Yes, we provide amenities like private changing rooms, secure lockers, women-specific fitness equipment, and a lounge area for relaxation and socializing. Our goal is to make your gym experience as comfortable and convenient as possible." },
    { question: "Are there any membership packages available at Peaches?", answer: "We offer a range of membership options to suit different needs and budgets, including monthly, quarterly, and annual plans. Each membership comes with access to all gym facilities and classes."
},    { question: "How do I sign up for classes at Peaches?", answer: "You can sign up for classes through our website, mobile app, or in person at the gym. We recommend booking in advance to secure your spot."
},
{ question: "Are men and non-binary people able to get memberships at Peaches?", answer: "Yes, definitely! At Peaches, we welcome everyone, including men and nonbinary individuals. Our gym is committed to creating an inclusive and supportive environment for all genders. While our focus is on women's fitness, we recognize the importance of inclusivity and the value that a diverse membership brings to our community. Everyone can benefit from our range of classes, personal training options, and amenities. We strive to ensure that all our members feel comfortable and supported in their fitness journey, regardless of gender."
},
];


const FAQ = () => {
  const [openQuestion, setOpenQuestion] = useState(null);
  const [heights, setHeights] = useState([]);
  const answerRefs = useRef([]);



  useEffect(() => {
    setHeights(answerRefs.current.map(ref => ref ? ref.scrollHeight : 0));
  }, [faqs]);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <Container>
        <HeaderContainer>
      <Header src={faq}/>
      </HeaderContainer>
      {faqs.map((faq, index) => (
        <div key={index}>
          <Question onClick={() => toggleQuestion(index)}>
            {faq.question}
          </Question>
          <Answer 
            ref={el => answerRefs.current[index] = el}
            isOpen={openQuestion === index}
            maxHeight={openQuestion === index ? heights[index] : 0}
          >
            {faq.answer}
          </Answer>
        </div>
      ))}
    </Container>
  );
};

export default FAQ;
