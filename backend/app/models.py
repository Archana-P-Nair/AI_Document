# backend/app/models.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"
   
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
   
    projects = relationship("Project", back_populates="owner")


class Project(Base):
    __tablename__ = "projects"
   
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    document_type = Column(String, nullable=False)  # 'docx' or 'pptx'
    topic = Column(Text, nullable=False)
    structure = Column(JSON, nullable=True)  # Store outline/slides as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
   
    owner = relationship("User", back_populates="projects")
    sections = relationship("Section", back_populates="project", cascade="all, delete-orphan")


class Section(Base):
    __tablename__ = "sections"
   
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    
    # TEMPORARILY REMOVED — your production DB doesn't have this column yet
    # section_order = Column(Integer, nullable=False, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
   
    project = relationship("Project", back_populates="sections")
    refinements = relationship("Refinement", back_populates="section", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="section", cascade="all, delete-orphan")


class Refinement(Base):
    __tablename__ = "refinements"
   
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    prompt = Column(Text, nullable=False)
    old_content = Column(Text, nullable=True)
    new_content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
   
    section = relationship("Section", back_populates="refinements")


class Feedback(Base):
    __tablename__ = "feedbacks"
   
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    feedback_type = Column(String, nullable=False)  # 'like', 'dislike', 'comment'
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
   
    section = relationship("Section", back_populates="feedbacks")
