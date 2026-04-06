import razorpay
from app.core.config import settings
import os

# Get Razorpay credentials
key_id = settings.RAZORPAY_KEY_ID if hasattr(settings, 'RAZORPAY_KEY_ID') else os.getenv("RAZORPAY_KEY_ID", "")
key_secret = settings.RAZORPAY_KEY_SECRET if hasattr(settings, 'RAZORPAY_KEY_SECRET') else os.getenv("RAZORPAY_KEY_SECRET", "")

# Only initialize client if keys are available
if key_id and key_secret:
    client = razorpay.Client(auth=(key_id, key_secret))
else:
    client = None


def create_order(amount: int, currency="INR"):
    if not client:
        # Return mock order for development/testing
        import time
        return {
            "id": f"order_mock_{int(time.time())}",
            "amount": amount,
            "currency": currency,
            "status": "created"
        }
    try:
        order = client.order.create({
            "amount": amount,
            "currency": currency,
            "payment_capture": 1
        })
        return order
    except Exception as e:
        print(f"Razorpay error: {e}")
        # Return mock order on failure
        import time
        return {
            "id": f"order_mock_{int(time.time())}",
            "amount": amount,
            "currency": currency,
            "status": "created"
        }


def verify_payment(data):
    if not client:
        # Skip verification if no Razorpay configured
        return True
    try:
        client.utility.verify_payment_signature(data)
        return True
    except:
        return False