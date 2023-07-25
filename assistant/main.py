from handler import OpenAIQueryHandler
import logging
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel

from fastapi.exceptions import RequestValidationError
from fastapi.responses import PlainTextResponse

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


class Message(BaseModel):
    role: str
    content: str


class Conversation(BaseModel):
    conversation: List[Message]


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(exc):
    return PlainTextResponse(str(exc), status_code=400)


@app.post("/assistant/{conversation_id}")
async def endpoint(conversation_id: str, conversation: Conversation):
    llm = OpenAIQueryHandler()
    # Add the system message at the start of the conversation
    system_message = Message(role='system', content='You are ChatOps, a DevOps chatbot developed by Naim')
    conversation.conversation.insert(0, system_message)
    # Convert Pydantic models to dictionaries
    conversation_dict = [message.dict() for message in conversation.conversation]
    logger.debug(f"Conversation: {conversation_dict}")
    response_message = llm.conversation(conversation_dict)
    logger.debug(f"Reply: {response_message}")
    return {"id": conversation_id, "reply": response_message}


def main():
    uvicorn.run("main:app", port=5000, log_level="debug")


if __name__ == "__main__":
    main()
