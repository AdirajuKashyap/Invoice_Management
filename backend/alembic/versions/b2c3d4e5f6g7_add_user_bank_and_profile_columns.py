"""add user bank and profile columns

Revision ID: b2c3d4e5f6g7
Revises: 54c531230393
Create Date: 2026-04-06 14:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6g7'
down_revision: Union[str, Sequence[str], None] = '54c531230393'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add user bank account columns
    op.add_column('users', sa.Column('bank_name', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('bank_account_number', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('bank_ifsc', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('bank_branch', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('upi_id', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('profile_picture', sa.String(length=255), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'profile_picture')
    op.drop_column('users', 'upi_id')
    op.drop_column('users', 'bank_branch')
    op.drop_column('users', 'bank_ifsc')
    op.drop_column('users', 'bank_account_number')
    op.drop_column('users', 'bank_name')
