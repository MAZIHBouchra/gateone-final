from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import os
from typing import Optional
import uvicorn
from contextlib import asynccontextmanager

# Updated LangChain imports
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain_core.prompts import (
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    ChatPromptTemplate
)

qa_chain = None
memory_store = {}
vectorstore = None

llm = None
retriever = None
chat_prompt = None


# Path to your private data file
DATA_FILE_PATH = "gateone_chatbot.csv"  # Place your CSV file in the same directory as main.py

def format_for_embedding(text: str) -> str:
    """Format text for embedding with instruction prefix"""
    return f"Represent this passage for retrieval: {text}"

def initialize_rag_system():
    """Initialize the RAG system with the private data file"""
    global qa_chain, vectorstore
    
    try:
        # Check if data file exists
        if not os.path.exists(DATA_FILE_PATH):
            print(f"Error: Data file '{DATA_FILE_PATH}' not found!")
            return False
        
        # Read the private CSV file
        df = pd.read_csv(DATA_FILE_PATH)
        
        # Validate required columns
        if 'question' not in df.columns or 'answer' not in df.columns:
            print("Error: CSV must contain 'question' and 'answer' columns")
            return False
        
        print(f"Loading {len(df)} Q&A pairs from {DATA_FILE_PATH}")

        
        # Text splitter for chunking
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        
        # Create documents from DataFrame
        documents = []
        for idx, row in df.iterrows():
            chunks = text_splitter.split_text(str(row["answer"]))
            for i, chunk in enumerate(chunks):
                documents.append(Document(
                    page_content=format_for_embedding(chunk),
                    metadata={"question": row["question"], "chunk_id": i}
                ))
        
        # Initialize embeddings
        embedding_model = HuggingFaceEmbeddings(
            model_name="BAAI/bge-base-en-v1.5",
            encode_kwargs={'normalize_embeddings': True}
        )
        
        # Create vector store
        vectorstore = FAISS.from_documents(documents, embedding_model)
        global retriever
        retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
        
        # Initialize LLM with updated parameters
        global llm
        llm = ChatOpenAI(
        model="mistralai/mistral-small-3.1-24b-instruct",
        base_url="https://openrouter.ai/api/v1",
        api_key="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",
        temperature=0.1,  # Slightly higher for more natural responses
        max_tokens=1024,
        top_p=0.9,
        frequency_penalty=0.1,
        presence_penalty=0.1
    )
        
        # Create custom prompt
        system_template = """
        You are a helpful real estate agent working for GateOne Real Estate Agency.
        You are friendly, knowledgeable, and your job is to help clients by answering questions
        based on the context provided below.

        If you don't know the answer, politely say so instead of guessing and suggest contacting the agency.

        Context:
        {context}
        """
        system_message_prompt = SystemMessagePromptTemplate.from_template(system_template)
        human_message_prompt = HumanMessagePromptTemplate.from_template("{question}")
        global chat_prompt
        chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt, human_message_prompt])
        
        # Create base QA chain (we'll create individual chains per session)
        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=retriever,
            return_source_documents=True,
            output_key="answer",
            combine_docs_chain_kwargs={"prompt": chat_prompt},
        )
        
        return True
    except Exception as e:
        print(f"Error initializing RAG system: {e}")
        return False

# Updated lifespan event handler (replaces deprecated on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    print("🚀 Starting Orchid Island Chatbot API...")
    success = initialize_rag_system()
    if success:
        print("✅ Chatbot initialized successfully!")
        print("🌐 Server ready to accept connections")
    else:
        print("❌ Failed to initialize chatbot!")
    
    yield
    
    # Shutdown (if needed)
    print("👋 Shutting down Orchid Island Chatbot API...")

# Create FastAPI app with lifespan
app = FastAPI(
    title="Orchid Island Chatbot API", 
    version="1.0.0",
    lifespan=lifespan
)

# Updated CORS middleware with more explicit settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Pydantic models
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = "default"

class ChatResponse(BaseModel):
    response: str
    session_id: str

def get_or_create_memory(session_id: str):
    """Get or create memory for a specific session"""
    if session_id not in memory_store:
        memory_store[session_id] = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key="answer"
        )
    return memory_store[session_id]

@app.post("/chat", response_model=ChatResponse)
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

@app.delete("/clear-session/{session_id}")
async def clear_session(session_id: str):
    """Clear conversation history for a specific session"""
    if session_id in memory_store:
        del memory_store[session_id]
        print(f"🗑️ Cleared session: {session_id}")
        return {"message": f"Session {session_id} cleared successfully"}
    return {"message": f"Session {session_id} not found"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "chatbot_initialized": qa_chain is not None,
        "active_sessions": len(memory_store)
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Orchid Island Chatbot API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "chat": "/chat",
            "clear_session": "/clear-session/{session_id}",
            "health": "/health"
        }
    }

# Add a simple test endpoint
@app.get("/test")
async def test_endpoint():
    """Simple test endpoint"""
    return {"message": "Backend is working!", "timestamp": pd.Timestamp.now().isoformat()}

if __name__ == "__main__":
    print("🚀 Starting Orchid Island Chatbot Server...")
    # Remove reload=True to avoid the import string warning
    uvicorn.run(app, host="127.0.0.1", port=8000)