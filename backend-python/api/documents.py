"""
Documents API endpoints
Handles document upload, processing, and retrieval
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
from models.schemas import Document, DocumentCreate
from services.database import db_service
from services.document_processor import document_processor

router = APIRouter()

@router.get("/", response_model=List[Document])
async def get_documents(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    property_id: Optional[str] = None,
    tenant_id: Optional[str] = None
):
    """Get all documents with optional filters"""
    documents = await db_service.get_documents(
        skip=skip,
        limit=limit,
        category=category,
        property_id=property_id,
        tenant_id=tenant_id
    )
    return documents

@router.get("/{document_id}", response_model=Document)
async def get_document(document_id: str):
    """Get a specific document by ID"""
    document = await db_service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.post("/upload", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(...),
    property_id: Optional[str] = Form(None),
    tenant_id: Optional[str] = Form(None)
):
    """
    Upload a document and process it
    Supports: PDF, DOCX, images (PNG, JPG)
    """
    # Save file
    file_path = await document_processor.save_file(file)

    # Process document based on type
    if file.filename.endswith('.pdf'):
        extracted_data = await document_processor.process_pdf(file_path)
    elif file.filename.endswith('.docx'):
        extracted_data = await document_processor.process_docx(file_path)
    elif file.filename.endswith(('.png', '.jpg', '.jpeg')):
        extracted_data = await document_processor.process_image_ocr(file_path)
    else:
        extracted_data = {"text": None}

    # Create document record
    document_data = DocumentCreate(
        name=file.filename,
        type=file.content_type,
        category=category,
        property=property_id,
        tenant=tenant_id,
        size=file.size,
        url=file_path
    )

    document = await db_service.create_document(document_data)

    return {
        "document": document,
        "extracted_data": extracted_data,
        "message": "Document uploaded and processed successfully"
    }

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """Delete a document"""
    success = await db_service.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully"}

@router.post("/{document_id}/analyze")
async def analyze_document(document_id: str):
    """
    Analyze document content
    Extract key information like dates, amounts, clauses
    """
    document = await db_service.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    analysis = await document_processor.analyze_document(document.url)

    return {
        "document_id": document_id,
        "analysis": analysis
    }
