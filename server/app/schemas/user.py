from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email:EmailStr
    full_name: str

class UserCreate(UserBase):
    password:str

class UserOut(UserBase):
    id:int
    role:str
    created_at:datetime

    class Config:
        from_attributes = True

    
# Login schema
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
