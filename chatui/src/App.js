import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ChakraProvider, CSSReset, Box, extendTheme, Text, VStack} from "@chakra-ui/react";
import ChatInput from './ChatInput';
import MessageList from './MessageList';

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
}

const theme = extendTheme({ config })

// Replace with your actual server URL
const serverUrl = `/conversation/`;

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load the conversation ID from the local storage, or generate a new one if it doesn't exist
  const [conversationId, setConversationId] = useState(() => {
    return localStorage.getItem('conversationId') || uuidv4();
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  useEffect(() => {
    // Store the conversation ID in the local storage whenever it changes
    localStorage.setItem('conversationId', conversationId);
  }, [conversationId]);

  useEffect(() => {
    const fetchConversation = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(serverUrl + conversationId);
        if (response.data.conversation) {
          setMessages(response.data.conversation);
        } else {
          console.warn(`Failed to fetch conversation: ${response.data.error}`);
          setMessages([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId]);

  const sendMessage = async (content) => {
    const newMessage = {
      role: 'user',
      content,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setIsLoading(true);
    try {
      // Send only the new message to the server
      const response = await axios.post(serverUrl + conversationId, { conversation: [newMessage] });
      const reply = response.data.conversation[response.data.conversation.length - 1];
      setMessages((prevMessages) => [...prevMessages, reply]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    // Generate a new conversation ID and clear the message history
    setConversationId(uuidv4());
    setMessages([]);
  };

  return (
      <ChakraProvider theme={theme}>
        <CSSReset />
        <Box minH="100vh" bg="gray.800" p={4}>
          <Box mx="auto" maxW={["full", "full", "full", "60%"]} p={100} bg="gray.800" borderRadius="md" color="white" h="full" display="flex" flexDirection="column">
            <Box flex="1" overflowY="auto" mb={10} pt={20}>
              <VStack align="stretch" spacing={4} py={4}>
                <MessageList messages={messages} />
                {isLoading && <Text>Assistant is typing...</Text>}
                <div ref={messagesEndRef} />
              </VStack>
            </Box>
          </Box>
        </Box>
        <Box w="100%" position="fixed" bottom="0" zIndex="1000" display="flex" justifyContent="center" backgroundColor="gray.800">
          <Box w={["full", "full", "full", "50%"]} p={50}>
            <ChatInput onSend={sendMessage} onReset={resetConversation} isLoading={isLoading} />
          </Box>
        </Box>
      </ChakraProvider>
  );
};

export default App;
