import React from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';

const CustomModal = styled(Modal)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  outline: none;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: none;
  cursor: pointer;
`;

const ModalHeading = styled.h2`
  text-align: center;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FormField = styled.input`
  width: 90%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const PreModal = ({ isOpen, onRequestClose }) => {
  return (
    <CustomModal isOpen={isOpen} onRequestClose={onRequestClose}>
      <CloseButton onClick={onRequestClose}>X</CloseButton>
      <ModalHeading>Save Your Spot Today</ModalHeading>
      <Form>
        <FormField type="text" placeholder="Name" />
        <FormField type="text" placeholder="Address" />
        <FormField type="tel" placeholder="Phone Number" />
        <FormField type="email" placeholder="Email" />
        <SubmitButton type="submit">Submit</SubmitButton>
      </Form>
    </CustomModal>
  );
};

export default PreModal;