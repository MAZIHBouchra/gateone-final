from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

# Import chatbot functionality
from chatbot_api import (
    ChatMessage, 
    ChatResponse, 
    qa_chain, 
    llm, 
    retriever, 
    chat_prompt,
    get_or_create_memory,
    ConversationalRetrievalChain
)

# Create router
chatbot_router = APIRouter(prefix="/chat", tags=["chatbot"])

@chatbot_router.post("/", response_model=ChatResponse)
async def chat(chat_message: ChatMessage):
    """Handle chat messages"""
    print(f"📨 Received message: {chat_message.message[:50]}..." if len(chat_message.message) > 50 else f"📨 Received message: {chat_message.message}")
    
    if qa_chain is None:
        print("❌ QA chain not initialized")
        raise HTTPException(
            status_code=500, 
            detail="Chatbot not initialized. Please check server logs."
        )
    
    try:
        # Get or create memory for this session
        memory = get_or_create_memory(chat_message.session_id)
        
        # Create a new chain instance with session-specific memory
        session_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=retriever,
            memory=memory,
            return_source_documents=True,
            output_key="answer",
            combine_docs_chain_kwargs={"prompt": chat_prompt},
        )
        
        # Get response
        result = session_chain.invoke({"question": chat_message.message})
        
        print(f"✅ Generated response for session {chat_message.session_id}")
        
        return ChatResponse(
            response=result["answer"],
            session_id=chat_message.session_id
        )
        
    except Exception as e:
        print(f"❌ Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@chatbot_router.get("/status")
async def chatbot_status():
    """Check chatbot status"""
    return {
        "chatbot_configured": qa_chain is not None,
        "llm_available": llm is not None,
        "retriever_available": retriever is not None
    }
