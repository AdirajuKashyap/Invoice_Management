"""add company details columns

Revision ID: c3d4e5f6g7h8
Revises: b2c3d4e5f6g7
Create Date: 2026-04-06 14:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6g7h8'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6g7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Contact information
    op.add_column('companies', sa.Column('email', sa.String(length=100), nullable=True))
    op.add_column('companies', sa.Column('phone', sa.String(length=20), nullable=True))
    op.add_column('companies', sa.Column('address', sa.String(length=255), nullable=True))
    op.add_column('companies', sa.Column('city', sa.String(length=50), nullable=True))
    op.add_column('companies', sa.Column('state', sa.String(length=50), nullable=True))
    op.add_column('companies', sa.Column('pincode', sa.String(length=10), nullable=True))
    
    # Business bank account details
    op.add_column('companies', sa.Column('bank_name', sa.String(length=100), nullable=True))
    op.add_column('companies', sa.Column('bank_account_number', sa.String(length=50), nullable=True))
    op.add_column('companies', sa.Column('bank_ifsc', sa.String(length=20), nullable=True))
    op.add_column('companies', sa.Column('bank_branch', sa.String(length=100), nullable=True))
    op.add_column('companies', sa.Column('upi_id', sa.String(length=50), nullable=True))
    
    # Logo and signature for company
    op.add_column('companies', sa.Column('logo_path', sa.String(length=255), nullable=True))
    op.add_column('companies', sa.Column('signature_path', sa.String(length=255), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('companies', 'signature_path')
    op.drop_column('companies', 'logo_path')
    op.drop_column('companies', 'upi_id')
    op.drop_column('companies', 'bank_branch')
    op.drop_column('companies', 'bank_ifsc')
    op.drop_column('companies', 'bank_account_number')
    op.drop_column('companies', 'bank_name')
    op.drop_column('companies', 'pincode')
    op.drop_column('companies', 'state')
    op.drop_column('companies', 'city')
    op.drop_column('companies', 'address')
    op.drop_column('companies', 'phone')
    op.drop_column('companies', 'email')
