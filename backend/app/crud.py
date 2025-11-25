from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app import models, schemas
from app.auth import get_password_hash
from sqlalchemy import text

# User CRUD
def create_user(db: Session, user: schemas.UserCreate):
    print(f"=== CREATE USER START ===")
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    
    try:
        # Check if user already exists
        existing_user = get_user_by_email(db, user.email)
        if existing_user:
            print(f"User with email {user.email} already exists")
            return None
            
        existing_username = get_user_by_username(db, user.username)
        if existing_username:
            print(f"User with username {user.username} already exists")
            return None
        
        hashed_password = get_password_hash(user.password)
        print(f"Password hashed successfully")
        
        db_user = models.User(
            email=user.email,
            username=user.username,
            hashed_password=hashed_password
        )
        print(f"User model created")
        
        db.add(db_user)
        print(f"User added to session")
        
        db.commit()
        print(f"Committed to database")
        
        db.refresh(db_user)
        print(f"User created with ID: {db_user.id}")
        print(f"=== CREATE USER SUCCESS ===")
        
        return db_user
        
    except SQLAlchemyError as e:
        print(f"=== DATABASE ERROR ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        traceback.print_exc()
        print(f"=== END ERROR ===")
        db.rollback()
        return None
    except Exception as e:
        print(f"=== UNEXPECTED ERROR ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        traceback.print_exc()
        print(f"=== END ERROR ===")
        db.rollback()
        return None

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

# Project CRUD
def create_project(db: Session, project: schemas.ProjectCreate, user_id: int):
    try:
        db_project = models.Project(
            user_id=user_id,
            title=project.title,
            document_type=project.document_type,
            topic=project.topic,
            structure=project.structure
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project
    except SQLAlchemyError:
        db.rollback()
        return None

def get_user_projects(db: Session, user_id: int):
    return db.query(models.Project).filter(models.Project.user_id == user_id).all()

def get_project(db: Session, project_id: int, user_id: int):
    return db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == user_id
    ).first()

def update_project(db: Session, project_id: int, user_id: int, project_update: schemas.ProjectUpdate):
    try:
        project = get_project(db, project_id, user_id)
        if not project:
            return None
            
        update_data = project_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)
            
        db.commit()
        db.refresh(project)
        return project
    except SQLAlchemyError:
        db.rollback()
        return None

def delete_project(db: Session, project_id: int, user_id: int):
    try:
        project = get_project(db, project_id, user_id)
        if project:
            db.delete(project)
            db.commit()
            return True
        return False
    except SQLAlchemyError:
        db.rollback()
        return False

# Section CRUD - FIXED VERSION (without order parameter)
def create_section(db: Session, project_id: int, title: str):
    try:
        db_section = models.Section(
            project_id=project_id,
            title=title
            # Removed order parameter since it doesn't exist in the model
        )
        db.add(db_section)
        db.commit()
        db.refresh(db_section)
        return db_section
    except SQLAlchemyError as e:
        print(f"Error creating section: {e}")
        db.rollback()
        return None
    except Exception as e:
        print(f"Unexpected error creating section: {e}")
        db.rollback()
        return None

def update_section_content(db: Session, section_id: int, content: str):
    try:
        section = db.query(models.Section).filter(models.Section.id == section_id).first()
        if section:
            section.content = content
            db.commit()
            db.refresh(section)
        return section
    except SQLAlchemyError:
        db.rollback()
        return None

def get_section(db: Session, section_id: int):
    return db.query(models.Section).filter(models.Section.id == section_id).first()

def get_project_sections(db: Session, project_id: int):
    return db.query(models.Section).filter(models.Section.project_id == project_id).all()

def update_section(db: Session, section_id: int, section_update: schemas.SectionUpdate):
    try:
        section = get_section(db, section_id)
        if not section:
            return None
            
        update_data = section_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(section, field, value)
            
        db.commit()
        db.refresh(section)
        return section
    except SQLAlchemyError:
        db.rollback()
        return None

# Refinement CRUD
def create_refinement(db: Session, section_id: int, prompt: str, old_content: str, new_content: str):
    try:
        db_refinement = models.Refinement(
            section_id=section_id,
            prompt=prompt,
            old_content=old_content,
            new_content=new_content
        )
        db.add(db_refinement)
        db.commit()
        db.refresh(db_refinement)
        return db_refinement
    except SQLAlchemyError:
        db.rollback()
        return None

def get_section_refinements(db: Session, section_id: int):
    return db.query(models.Refinement).filter(models.Refinement.section_id == section_id).order_by(models.Refinement.created_at.desc()).all()

# Feedback CRUD
def create_feedback(db: Session, feedback: schemas.FeedbackCreate):
    try:
        db_feedback = models.Feedback(
            section_id=feedback.section_id,
            feedback_type=feedback.feedback_type,
            comment=feedback.comment
        )
        db.add(db_feedback)
        db.commit()
        db.refresh(db_feedback)
        return db_feedback
    except SQLAlchemyError:
        db.rollback()
        return None

def get_section_feedbacks(db: Session, section_id: int):
    return db.query(models.Feedback).filter(models.Feedback.section_id == section_id).order_by(models.Feedback.created_at.desc()).all()
