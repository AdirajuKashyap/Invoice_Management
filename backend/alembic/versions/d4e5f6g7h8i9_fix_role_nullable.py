"""fix role column to be nullable

Revision ID: d4e5f6g7h8i9
Revises: c3d4e5f6g7h8
Create Date: 2026-04-06 14:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6g7h8i9'
down_revision: Union[str, Sequence[str], None] = 'c3d4e5f6g7h8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('users', 'role',
               existing_type=sa.String(),
               nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('users', 'role',
               existing_type=sa.String(),
               nullable=False)
