from pydantic import BaseModel, EmailStr
from typing import Optional

class AgentCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role: str = "agent" # 'admin' or 'agent'