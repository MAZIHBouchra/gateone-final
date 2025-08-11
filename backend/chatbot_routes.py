from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

# Import chatbot module (module import keeps live references)
import chatbot_api as ca

# Create router
chatbot_router = APIRouter(prefix="/chat", tags=["chatbot"])

@chatbot_router.post("/", response_model=ca.ChatResponse)
async def chat(chat_message: ca.ChatMessage):
    """Handle chat messages"""
    print(f"📨 Received message: {chat_message.message[:50]}..." if len(chat_message.message) > 50 else f"📨 Received message: {chat_message.message}")
    
    # Lazy init if needed
    if ca.qa_chain is None:
        print("⚙️ QA chain not initialized, attempting initialization...")
        try:
            ok = ca.initialize_rag_system()
            if ok:
                print("✅ Chatbot initialized on-demand")
            else:
                print("❌ On-demand initialization failed")
        except Exception as e:
            print(f"❌ Init error: {e}")
    
    if ca.qa_chain is None:
        raise HTTPException(
            status_code=500, 
            detail="Chatbot not initialized. Check dataset and API keys."
        )
    
    try:
        # Get or create memory for this session
        memory = ca.get_or_create_memory(chat_message.session_id)
        
        # Create a new chain instance with session-specific memory
        session_chain = ca.ConversationalRetrievalChain.from_llm(
            llm=ca.llm,
            retriever=ca.retriever,
            memory=memory,
            return_source_documents=True,
            output_key="answer",
            combine_docs_chain_kwargs={"prompt": ca.chat_prompt},
        )
        
        # Get response
        result = session_chain.invoke({"question": chat_message.message})
        
        print(f"✅ Generated response for session {chat_message.session_id}")
        
        return ca.ChatResponse(
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
        "chatbot_configured": ca.qa_chain is not None,
        "llm_available": ca.llm is not None,
        "retriever_available": ca.retriever is not None
    }
