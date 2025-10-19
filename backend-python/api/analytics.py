"""
Analytics API endpoints
Advanced analytics using Pandas/NumPy
"""
from fastapi import APIRouter, Query
from typing import Optional
from datetime import date, datetime, timedelta
from models.schemas import FinancialStats, QuickStats
from services.analytics_service import analytics_service

router = APIRouter()

@router.get("/dashboard/quick-stats", response_model=QuickStats)
async def get_quick_stats():
    """
    Get dashboard quick statistics
    Matches the getQuickStats function in your React app
    """
    stats = await analytics_service.get_quick_stats()
    return stats

@router.get("/financial/stats", response_model=FinancialStats)
async def get_financial_stats(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """
    Get comprehensive financial statistics
    Matches getComprehensiveFinancialStats from your React app
    """
    stats = await analytics_service.get_financial_stats(start_date, end_date)
    return stats

@router.get("/financial/expense-categories")
async def get_expense_categories(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """
    Get expense breakdown by category
    Enhanced with Pandas analytics
    """
    categories = await analytics_service.get_expense_categories(start_date, end_date)
    return categories

@router.get("/financial/trends")
async def get_financial_trends(
    period: str = Query("month", regex="^(week|month|quarter|year)$")
):
    """
    Get financial trends over time
    Uses Pandas for time-series analysis
    """
    trends = await analytics_service.get_financial_trends(period)
    return trends

@router.get("/properties/occupancy-report")
async def get_occupancy_report():
    """
    Get detailed occupancy report for all properties
    """
    report = await analytics_service.get_occupancy_report()
    return report

@router.get("/tenants/payment-analysis")
async def get_payment_analysis():
    """
    Analyze tenant payment patterns
    Identify late payers, payment trends
    """
    analysis = await analytics_service.get_payment_analysis()
    return analysis

@router.get("/workorders/performance")
async def get_workorder_performance():
    """
    Analyze work order completion time and costs
    """
    performance = await analytics_service.get_workorder_performance()
    return performance

@router.get("/predictions/rent-forecast")
async def get_rent_forecast(months_ahead: int = Query(6, ge=1, le=24)):
    """
    Forecast future rent income
    Uses simple trend analysis (can be enhanced with ML)
    """
    forecast = await analytics_service.get_rent_forecast(months_ahead)
    return forecast

@router.get("/predictions/maintenance-costs")
async def predict_maintenance_costs():
    """
    Predict future maintenance costs based on historical data
    """
    predictions = await analytics_service.predict_maintenance_costs()
    return predictions

@router.get("/reports/export")
async def export_report(
    report_type: str = Query(..., regex="^(financial|occupancy|maintenance|full)$"),
    format: str = Query("excel", regex="^(excel|pdf|csv)$"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """
    Generate and export reports in various formats
    Uses openpyxl for Excel, reportlab for PDF
    """
    file_path = await analytics_service.generate_report(
        report_type,
        format,
        start_date,
        end_date
    )

    return {
        "report_type": report_type,
        "format": format,
        "file_path": file_path,
        "generated_at": datetime.now().isoformat()
    }

@router.get("/notifications/generate")
async def generate_notifications():
    """
    Generate intelligent notifications
    Matches getDynamicNotifications from your React app
    """
    notifications = await analytics_service.generate_notifications()
    return notifications
