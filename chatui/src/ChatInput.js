
import React, { useState } from 'react';
import { Input, IconButton, HStack } from '@chakra-ui/react';
import { ArrowForwardIcon, RepeatIcon } from '@chakra-ui/icons';

const ChatInput = ({ onSend, onReset }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      onSend(inputValue);
      setInputValue('');
    }
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <HStack spacing={4}>
      <IconButton
        colorScheme="teal"
        aria-label="Reset"
        fontSize="20px"
        icon={<RepeatIcon />}
        onClick={handleReset}
      />
      <Input
        variant="filled"
        placeholder="Type your message here..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSend();
          }
        }}
        size="lg"
        flexGrow={1}
      />
      <IconButton
        colorScheme="teal"
        aria-label="Send"
        fontSize="20px"
        icon={<ArrowForwardIcon />}
        onClick={handleSend}
      />
    </HStack>
  );
};

export default ChatInput;
