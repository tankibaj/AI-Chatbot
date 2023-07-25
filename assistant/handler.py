import json
import os
from dotenv import find_dotenv, load_dotenv
import openai
import logging


class OpenAIQueryHandler:
    # Initialize the class with necessary parameters and configurations
    def __init__(self, model="gpt-3.5-turbo-0613"):
        # Load environment variables
        load_dotenv(find_dotenv())
        # Get the OpenAI API key from environment variables
        openai.api_key = os.environ.get("OPENAI_API_KEY")
        # If the API key is not found, raise an error
        if openai.api_key is None:
            raise ValueError("OPENAI_API_KEY not found in environment variables.")

        self.model = model
        self.logger = logging.getLogger(__name__)

    # Method to initiate a conversation with the OpenAI API
    def conversation(self, messages):
        try:
            # Create a chat completion with the OpenAI API
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=messages,
            )
            response_message = response.choices[0].message['content']
            return response_message
        except openai.error.InvalidRequestError as e:
            if 'maximum context length' in str(e):
                print(f"Error: The conversation exceeded the maximum token limit in {self.model} model.")
            else:
                print(f"Error communicating with OpenAI API: {e}")
            return None
