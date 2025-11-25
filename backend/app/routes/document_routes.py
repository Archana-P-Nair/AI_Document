from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app import models, schemas, crud
from app.database import get_db
from app.auth import get_current_user
from app.services import llm_service
from fastapi.responses import StreamingResponse
from app.services import document_service

router = APIRouter()

@router.post("/generate-section-content")
def generate_section_content(
    request: schemas.ContentGenerate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Generate AI content for a specific section"""
    
    # Get the section
    section = crud.get_section(db, section_id=request.section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Get the project to verify ownership
    project = crud.get_project(db, project_id=section.project_id, user_id=current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        # Generate content using LLM
        content = llm_service.generate_section_content(
            topic=project.topic,
            section_title=section.title,
            document_type=project.document_type,
            context=""
        )
        
        # Update section with generated content
        section = crud.update_section_content(db, section_id=section.id, content=content)
        
        return {"success": True, "content": content, "section_id": section.id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refine-section-content")
def refine_section_content(
    request: schemas.ContentRefine,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Refine content of a section based on user prompt"""
    
    # Get the section
    section = crud.get_section(db, section_id=request.section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Get the project to verify ownership
    project = crud.get_project(db, project_id=section.project_id, user_id=current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not section.content:
        raise HTTPException(status_code=400, detail="Section has no content to refine")
    
    try:
        # Store old content
        old_content = section.content
        
        # Refine content using LLM
        new_content = llm_service.refine_content(
            original_content=old_content,
            refinement_prompt=request.prompt,
            document_type=project.document_type
        )
        
        # Save refinement history
        crud.create_refinement(
            db,
            section_id=section.id,
            prompt=request.prompt,
            old_content=old_content,
            new_content=new_content
        )
        
        # Update section with refined content
        section = crud.update_section_content(db, section_id=section.id, content=new_content)
        
        return {"success": True, "content": new_content, "section_id": section.id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/feedback")
def add_feedback(
    request: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Add feedback (like/dislike/comment) to a section"""
    
    # Get the section
    section = crud.get_section(db, section_id=request.section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Get the project to verify ownership
    project = crud.get_project(db, project_id=section.project_id, user_id=current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Create feedback
    feedback = crud.create_feedback(db, feedback=request)
    
    return {"success": True, "feedback_id": feedback.id}

@router.post("/generate-all-content/{project_id}")
def generate_all_content(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Generate content for all sections in a project"""
    
    # Get project
    project = crud.get_project(db, project_id=project_id, user_id=current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Create sections if they don't exist
    if project.structure and 'sections' in project.structure:
        existing_sections = len(project.sections)
        sections_to_create = project.structure['sections']
        
        # Create sections if not already created
        if existing_sections == 0:
            for idx, section_title in enumerate(sections_to_create):
                # Pass section_order (idx) to match DB schema
                crud.create_section(db, project_id=project.id, title=section_title, section_order=idx)
            
            # Refresh project
            db.refresh(project)
    
    # Generate content for each section
    results = []
    for section in project.sections:
        if not section.content:  # Only generate if no content exists
            try:
                content = llm_service.generate_section_content(
                    topic=project.topic,
                    section_title=section.title,
                    document_type=project.document_type,
                    context=""
                )
                crud.update_section_content(db, section_id=section.id, content=content)
                results.append({"section_id": section.id, "title": section.title, "success": True})
            except Exception as e:
                results.append({"section_id": section.id, "title": section.title, "success": False, "error": str(e)})
    
    return {"success": True, "results": results}

@router.get("/export/{project_id}")
def export_document(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Export project as .docx or .pptx file"""
    
    # Get project
    project = crud.get_project(db, project_id=project_id, user_id=current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get sections
    sections = project.sections
    if not sections:
        raise HTTPException(status_code=400, detail="Project has no sections to export")
    
    try:
        if project.document_type == "docx":
            # Generate Word document
            file_stream = document_service.create_word_document(project, sections)
            filename = f"{project.title.replace(' ', '_')}.docx"
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
        elif project.document_type == "pptx":
            # Generate PowerPoint presentation
            file_stream = document_service.create_powerpoint_presentation(project, sections)
            filename = f"{project.title.replace(' ', '_')}.pptx"
            media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        
        else:
            raise HTTPException(status_code=400, detail="Invalid document type")
        
        return StreamingResponse(
            file_stream,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export document: {str(e)}")
