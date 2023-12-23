import React, { useState } from 'react';
import styled from 'styled-components';


const Container = styled.div`
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    margin-bottom:50px;
`;

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

    
    &:hover {
        background-color: #FAb39d;
    }
`;

const Answer = styled.div`
    overflow: hidden;
    padding-left:10px;
    padding-top:5px;
    transition: height .7s;
    font-size: 15px;
    height: ${props => (props.isOpen ? '30px' : '0')}; 
`;

const FAQ = () => {
    const [openQuestion, setOpenQuestion] = useState(null);

    const toggleQuestion = (index) => {
        setOpenQuestion(openQuestion === index ? null : index);
    };

    const faqs = [
        { question: 'What is your return policy?', answer: 'We accept returns within 30 days of purchase.' },
        { question: 'How long does shipping take?', answer: 'Shipping usually takes 5-7 business days.' },
        { question: 'How long does shipping take?', answer: 'Shipping usually takes 5-7 business days.' },
        { question: 'How long does shipping take?', answer: 'Shipping usually takes 5-7 business days.' },
        { question: 'How long does shipping take?', answer: 'Shipping usually takes 5-7 business days.' },
    ];

    return (
        <Container>
            <h2>Frequently Asked Questions</h2>
            {faqs.map((faq, index) => (
                <div key={index}>
                    <Question onClick={() => toggleQuestion(index)}>
                        {faq.question}
                    </Question>
                    <Answer isOpen={openQuestion === index}>
                        {faq.answer}
                    </Answer>
                </div>
            ))}
        </Container>
    );
};

export default FAQ;
