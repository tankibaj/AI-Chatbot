import os
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import redis
import requests
import json
import logging


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

AGENT_ENDPOINT = os.getenv('AGENT_ENDPOINT')

r = redis.Redis(host='redis', port=6379, db=0)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: str
    content: str


class Conversation(BaseModel):
    conversation: List[Message]


@app.get("/conversation/{conversation_id}")
async def get_conversation(conversation_id: str):
    logger.info(f"Retrieving initial id {conversation_id}")
    existing_conversation_json = r.get(conversation_id)
    if existing_conversation_json:
        existing_conversation = json.loads(existing_conversation_json)
        return existing_conversation
    else:
        return {"error": "Conversation not found"}


@app.post("/conversation/{conversation_id}")
async def process_conversation(conversation_id: str, conversation: Conversation):
    logger.info(f"Sending Conversation with ID {conversation_id} to OpenAI")
    existing_conversation_json = r.get(conversation_id)
    if existing_conversation_json:
        existing_conversation = json.loads(existing_conversation_json)
    else:
        existing_conversation = {"conversation": []}

    logger.debug(f"Before append user message: {existing_conversation}")
    existing_conversation["conversation"].append(conversation.dict()["conversation"][-1])

    logger.debug(f"Sending Conversation to OpenAI: {existing_conversation}")

    response = requests.post(f"{AGENT_ENDPOINT}/{conversation_id}", json=existing_conversation)
    response.raise_for_status()
    assistant_message = response.json()["reply"]

    logger.debug(f"Reply from OpenAI: {assistant_message}")

    existing_conversation["conversation"].append({"role": "assistant", "content": assistant_message})

    r.set(conversation_id, json.dumps(existing_conversation))

    return existing_conversation
