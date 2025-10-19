"""
Transactions API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date
from models.schemas import Transaction, TransactionCreate, TransactionUpdate, TransactionType
from services.database import db_service

router = APIRouter()

@router.get("/", response_model=List[Transaction])
async def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    type: Optional[TransactionType] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    property_id: Optional[str] = None,
    tenant_id: Optional[str] = None
):
    """Get all transactions with optional filters"""
    transactions = await db_service.get_transactions(
        skip=skip,
        limit=limit,
        type=type,
        start_date=start_date,
        end_date=end_date,
        property_id=property_id,
        tenant_id=tenant_id
    )
    return transactions

@router.get("/{transaction_id}", response_model=Transaction)
async def get_transaction(transaction_id: str):
    """Get a specific transaction by ID"""
    transaction = await db_service.get_transaction(transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.post("/", response_model=Transaction, status_code=201)
async def create_transaction(transaction_data: TransactionCreate):
    """Create a new transaction"""
    transaction = await db_service.create_transaction(transaction_data)
    return transaction

@router.put("/{transaction_id}", response_model=Transaction)
async def update_transaction(transaction_id: str, transaction_data: TransactionUpdate):
    """Update an existing transaction"""
    transaction = await db_service.update_transaction(transaction_id, transaction_data)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.delete("/{transaction_id}")
async def delete_transaction(transaction_id: str):
    """Delete a transaction"""
    success = await db_service.delete_transaction(transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}

@router.get("/summary/totals")
async def get_transaction_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Get transaction summary (income vs expenses)"""
    transactions = await db_service.get_transactions(
        start_date=start_date,
        end_date=end_date
    )

    income = sum(t.amount for t in transactions if t.type == TransactionType.INCOME)
    expenses = sum(abs(t.amount) for t in transactions if t.type == TransactionType.EXPENSE)

    return {
        "total_income": income,
        "total_expenses": expenses,
        "net_income": income - expenses,
        "transaction_count": len(transactions),
        "start_date": start_date,
        "end_date": end_date
    }
