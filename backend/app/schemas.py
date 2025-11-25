from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Project Schemas
class ProjectBase(BaseModel):
    title: str
    document_type: str  # 'docx' or 'pptx'
    topic: str
    structure: Optional[Dict[str, Any]] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None
    document_type: Optional[str] = None
    structure: Optional[Dict[str, Any]] = None

class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Section Schemas - UPDATED: Changed 'order' to 'section_order'
class SectionBase(BaseModel):
    title: str
    section_order: Optional[int] = 0  # ✅ Changed from 'order' to 'section_order'

class SectionCreate(SectionBase):
    project_id: int

class SectionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    section_order: Optional[int] = None  # ✅ Changed from 'order' to 'section_order'

class SectionResponse(SectionBase):
    id: int
    project_id: int
    content: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Content Generation Schemas
class ContentGenerate(BaseModel):
    section_id: int

class ContentRefine(BaseModel):
    section_id: int
    prompt: str

class ContentResponse(BaseModel):
    content: str
    section_id: int

# Feedback Schemas
class FeedbackBase(BaseModel):
    feedback_type: str  # 'like', 'dislike', 'comment'
    comment: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    section_id: int

class FeedbackResponse(FeedbackBase):
    id: int
    section_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Refinement Schemas
class RefinementResponse(BaseModel):
    id: int
    section_id: int
    prompt: str
    old_content: Optional[str]
    new_content: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Project with sections
class ProjectWithSections(ProjectResponse):
    sections: List[SectionResponse] = []
