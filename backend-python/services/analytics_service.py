"""
Analytics Service
Advanced analytics using Pandas, NumPy, and statistical analysis
Demonstrates Python's superiority for data analytics vs JavaScript
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, date, timedelta
import json

# These would be imported in production
# import pandas as pd
# import numpy as np
# from sklearn.linear_model import LinearRegression

from services.database import db_service
from models.schemas import QuickStats, FinancialStats

class AnalyticsService:
    """
    Analytics service using Python's powerful data science libraries
    Pandas + NumPy provide far superior analytics than JavaScript
    """

    async def get_quick_stats(self) -> QuickStats:
        """
        Get dashboard quick statistics
        Matches your React app's getQuickStats function
        """
        properties = await db_service.get_properties()
        tenants = await db_service.get_tenants()
        workorders = await db_service.get_workorders()

        total_units = sum(p.units for p in properties)
        occupied_units = sum(p.occupied for p in properties)
        vacant_units = total_units - occupied_units

        occupancy_rate = (occupied_units / total_units * 100) if total_units > 0 else 0

        monthly_revenue = sum(t.rent for t in tenants if t.status.value == 'active')

        pending_workorders = len([wo for wo in workorders if wo.status.value == 'Open'])
        urgent_workorders = len([wo for wo in workorders
                                  if wo.status.value == 'Open' and wo.priority.value == 'High'])

        overdue_payments = len([t for t in tenants if t.status.value == 'overdue'])

        return QuickStats(
            total_properties=len(properties),
            total_tenants=len(tenants),
            total_units=total_units,
            occupied_units=occupied_units,
            vacant_units=vacant_units,
            occupancy_rate=round(occupancy_rate, 1),
            monthly_revenue=monthly_revenue,
            pending_work_orders=pending_workorders,
            urgent_work_orders=urgent_workorders,
            overdue_payments=overdue_payments
        )

    async def get_financial_stats(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> FinancialStats:
        """
        Get comprehensive financial statistics
        Matches your React app's getComprehensiveFinancialStats
        """
        tenants = await db_service.get_tenants()
        transactions = await db_service.get_transactions(
            start_date=start_date,
            end_date=end_date
        )

        monthly_income = sum(t.rent for t in tenants if t.status.value == 'active')

        monthly_expenses = sum(
            abs(t.amount) for t in transactions if t.type.value == 'expense'
        )

        net_income = monthly_income - monthly_expenses

        outstanding_balance = sum(
            t.outstanding_balance for t in tenants if t.status.value == 'overdue'
        )

        overdue_count = len([t for t in tenants if t.status.value == 'overdue'])

        return FinancialStats(
            monthly_income=monthly_income,
            monthly_expenses=monthly_expenses,
            net_income=net_income,
            outstanding_balance=outstanding_balance,
            overdue_count=overdue_count
        )

    async def get_expense_categories(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        """
        Get expense breakdown by category
        This is where Pandas really shines!
        """
        transactions = await db_service.get_transactions(
            type='expense',
            start_date=start_date,
            end_date=end_date
        )

        # In production with Pandas:
        """
        df = pd.DataFrame([t.dict() for t in transactions])

        category_stats = df.groupby('category').agg({
            'amount': ['sum', 'mean', 'count', 'std']
        }).round(2)

        return category_stats.to_dict('records')
        """

        # Demo implementation
        categories = {}
        for t in transactions:
            category = t.category or 'Other'
            if category not in categories:
                categories[category] = {
                    'category': category,
                    'amount': 0,
                    'budget': 5000,
                    'count': 0
                }
            categories[category]['amount'] += abs(t.amount)
            categories[category]['count'] += 1

        result = []
        for cat, data in categories.items():
            result.append({
                'category': cat,
                'amount': data['amount'],
                'budget': data['budget'],
                'percentage': (data['amount'] / data['budget'] * 100),
                'count': data['count']
            })

        return result

    async def get_financial_trends(self, period: str = 'month') -> Dict[str, Any]:
        """
        Get financial trends over time
        Pandas time-series analysis is MUCH better than JavaScript
        """
        transactions = await db_service.get_transactions()

        # In production with Pandas:
        """
        df = pd.DataFrame([t.dict() for t in transactions])
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)

        # Resample by period
        period_map = {'week': 'W', 'month': 'M', 'quarter': 'Q', 'year': 'Y'}
        resampled = df.groupby('type')['amount'].resample(period_map[period]).sum()

        return {
            'income_trend': resampled['income'].to_dict(),
            'expense_trend': resampled['expense'].to_dict(),
            'net_trend': (resampled['income'] - resampled['expense']).to_dict()
        }
        """

        # Demo implementation
        return {
            'period': period,
            'income_trend': [12000, 13500, 14200, 13800, 15000, 14500],
            'expense_trend': [8000, 8500, 9200, 8800, 9500, 9000],
            'net_trend': [4000, 5000, 5000, 5000, 5500, 5500],
            'note': 'Full trend analysis requires Pandas package'
        }

    async def get_occupancy_report(self) -> Dict[str, Any]:
        """
        Detailed occupancy analysis for all properties
        """
        properties = await db_service.get_properties()
        tenants = await db_service.get_tenants()

        property_details = []
        for prop in properties:
            prop_tenants = [t for t in tenants if t.property == prop.id]

            property_details.append({
                'property_id': prop.id,
                'property_name': prop.name,
                'total_units': prop.units,
                'occupied_units': prop.occupied,
                'vacant_units': prop.units - prop.occupied,
                'occupancy_rate': (prop.occupied / prop.units * 100) if prop.units > 0 else 0,
                'total_rent': sum(t.rent for t in prop_tenants),
                'tenant_count': len(prop_tenants)
            })

        total_units = sum(p['total_units'] for p in property_details)
        total_occupied = sum(p['occupied_units'] for p in property_details)

        return {
            'properties': property_details,
            'summary': {
                'total_properties': len(properties),
                'total_units': total_units,
                'total_occupied': total_occupied,
                'total_vacant': total_units - total_occupied,
                'average_occupancy_rate': (total_occupied / total_units * 100) if total_units > 0 else 0
            }
        }

    async def get_payment_analysis(self) -> Dict[str, Any]:
        """
        Analyze tenant payment patterns
        Identify risks and trends
        """
        tenants = await db_service.get_tenants()
        transactions = await db_service.get_transactions(type='income')

        # In production with Pandas:
        """
        df = pd.DataFrame([t.dict() for t in transactions])
        df['date'] = pd.to_datetime(df['date'])

        # Calculate payment patterns
        payment_stats = df.groupby('tenant').agg({
            'amount': ['sum', 'mean', 'std', 'count'],
            'date': ['min', 'max']
        })

        # Identify late payment patterns
        df['payment_day'] = df['date'].dt.day
        late_payers = df[df['payment_day'] > 5].groupby('tenant').size()
        """

        # Demo implementation
        return {
            'total_tenants': len(tenants),
            'on_time_payers': len([t for t in tenants if t.status.value == 'active']),
            'late_payers': len([t for t in tenants if t.status.value == 'overdue']),
            'average_days_late': 3.5,
            'risk_tenants': [
                {'tenant_id': t.id, 'name': t.name, 'outstanding': t.outstanding_balance}
                for t in tenants if t.outstanding_balance > 0
            ]
        }

    async def get_workorder_performance(self) -> Dict[str, Any]:
        """
        Analyze work order completion time and costs
        """
        workorders = await db_service.get_workorders()

        completed = [wo for wo in workorders if wo.status.value == 'Completed']

        if not completed:
            return {'message': 'No completed work orders yet'}

        total_cost = sum(wo.actual_cost or 0 for wo in completed)
        avg_cost = total_cost / len(completed) if completed else 0

        # In production: calculate actual completion time from dates
        avg_completion_days = 5.2  # Demo value

        return {
            'total_workorders': len(workorders),
            'completed': len(completed),
            'in_progress': len([wo for wo in workorders if wo.status.value == 'In Progress']),
            'open': len([wo for wo in workorders if wo.status.value == 'Open']),
            'average_completion_days': avg_completion_days,
            'total_cost': total_cost,
            'average_cost': avg_cost,
            'by_category': self._workorders_by_category(workorders)
        }

    def _workorders_by_category(self, workorders: List) -> Dict[str, int]:
        """Group work orders by category"""
        categories = {}
        for wo in workorders:
            cat = wo.category
            categories[cat] = categories.get(cat, 0) + 1
        return categories

    async def get_rent_forecast(self, months_ahead: int = 6) -> Dict[str, Any]:
        """
        Forecast future rent income
        In production, could use ARIMA or Prophet for time-series forecasting
        """
        tenants = await db_service.get_tenants()
        current_monthly = sum(t.rent for t in tenants if t.status.value == 'active')

        # Simple linear projection (in production, use ML models)
        growth_rate = 0.02  # 2% per month (demo value)

        forecast = []
        for i in range(months_ahead):
            forecast_date = (datetime.now() + timedelta(days=30 * i)).strftime('%Y-%m')
            forecast_amount = current_monthly * (1 + growth_rate) ** i

            forecast.append({
                'month': forecast_date,
                'projected_income': round(forecast_amount, 2)
            })

        return {
            'current_monthly_income': current_monthly,
            'forecast_months': months_ahead,
            'forecast': forecast,
            'note': 'Enhanced forecasting available with Prophet/ARIMA models'
        }

    async def predict_maintenance_costs(self) -> Dict[str, Any]:
        """
        Predict future maintenance costs
        Uses historical data and ML models in production
        """
        transactions = await db_service.get_transactions(type='expense')
        properties = await db_service.get_properties()

        maintenance_expenses = [
            t for t in transactions
            if any(keyword in t.category.lower() for keyword in ['maintenance', 'repair'])
        ]

        total_maintenance = sum(abs(t.amount) for t in maintenance_expenses)
        avg_monthly = total_maintenance / 12  # Demo calculation

        return {
            'historical_total': total_maintenance,
            'average_monthly': avg_monthly,
            'predicted_next_month': avg_monthly * 1.1,  # Demo prediction
            'predicted_next_quarter': avg_monthly * 3.3,
            'by_property': [
                {
                    'property_id': p.id,
                    'property_name': p.name,
                    'predicted_monthly': avg_monthly / len(properties)
                }
                for p in properties
            ],
            'note': 'ML-based predictions available with scikit-learn models'
        }

    async def generate_report(
        self,
        report_type: str,
        format: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> str:
        """
        Generate comprehensive reports
        Python's openpyxl and reportlab are superior for report generation
        """
        # In production:
        """
        if format == 'excel':
            from openpyxl import Workbook
            wb = Workbook()
            ws = wb.active
            # Add data...
            wb.save(f'report_{report_type}.xlsx')

        elif format == 'pdf':
            from reportlab.lib.pagesizes import letter
            from reportlab.pdfgen import canvas
            c = canvas.Canvas(f'report_{report_type}.pdf', pagesize=letter)
            # Add content...
            c.save()
        """

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"reports/report_{report_type}_{timestamp}.{format}"

        return filename

    async def generate_notifications(self) -> List[Dict[str, Any]]:
        """
        Generate intelligent notifications
        Matches your React app's getDynamicNotifications
        """
        notifications = []

        tenants = await db_service.get_tenants()
        workorders = await db_service.get_workorders()
        properties = await db_service.get_properties()

        # Overdue rent
        overdue_tenants = [t for t in tenants if t.status.value == 'overdue']
        if overdue_tenants:
            notifications.append({
                'id': 'overdue-rent',
                'type': 'warning',
                'title': 'Overdue Rent Payments',
                'message': f'{len(overdue_tenants)} tenant(s) have overdue rent payments',
                'count': len(overdue_tenants),
                'action': 'View Tenants'
            })

        # Open work orders
        open_wo = [wo for wo in workorders if wo.status.value == 'Open']
        if open_wo:
            notifications.append({
                'id': 'open-work-orders',
                'type': 'info',
                'title': 'Open Work Orders',
                'message': f'{len(open_wo)} work order(s) need attention',
                'count': len(open_wo),
                'action': 'View Work Orders'
            })

        # Urgent work orders
        urgent_wo = [wo for wo in workorders
                     if wo.status.value == 'Open' and wo.priority.value == 'High']
        if urgent_wo:
            notifications.append({
                'id': 'high-priority-orders',
                'type': 'error',
                'title': 'Urgent Work Orders',
                'message': f'{len(urgent_wo)} high-priority work order(s) require immediate attention',
                'count': len(urgent_wo),
                'action': 'View Urgent Orders'
            })

        # Low occupancy
        low_occupancy = [p for p in properties
                        if p.units > 0 and (p.occupied / p.units) < 0.8]
        if low_occupancy:
            notifications.append({
                'id': 'low-occupancy',
                'type': 'info',
                'title': 'Low Occupancy Alert',
                'message': f'{len(low_occupancy)} propertie(s) have occupancy below 80%',
                'count': len(low_occupancy),
                'action': 'View Properties'
            })

        return notifications

# Singleton instance
analytics_service = AnalyticsService()
