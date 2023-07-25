
import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';

const MessageList = ({ messages }) => {
  return (
    <VStack align="stretch" spacing={4}>
      {messages.map((message, i) => (
        <Box
          key={i}
          p={2}
          borderRadius="lg"
          bg={message.role === 'user' ? 'gray.700' : 'green.900'}
          alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
          maxWidth="80%"
        >
          <Text fontSize="md" color="white">{`${message.content}`}</Text>
        </Box>
      ))}
    </VStack>
  );
};

export default MessageList;
