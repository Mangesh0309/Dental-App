from datetime import datetime
import hashlib
import hmac

import razorpay

from ..config import Config
from ..models import PaymentStatus


class PaymentGateway:
    def __init__(self):
        self.key_id = Config.RAZORPAY_KEY_ID
        self.key_secret = Config.RAZORPAY_KEY_SECRET
        self.client = None
        if self.key_id and self.key_secret:
            self.client = razorpay.Client(auth=(self.key_id, self.key_secret))

    def create_order(self, amount, currency="INR", receipt=None):
        if self.client:
            return self.client.order.create(
                {"amount": amount, "currency": currency, "receipt": receipt}
            )
        fallback = receipt or f"local_{int(datetime.utcnow().timestamp())}"
        return {
            "id": f"order_{fallback}",
            "amount": amount,
            "currency": currency,
            "status": PaymentStatus.CREATED.value,
        }

    def verify_signature(self, order_id, payment_id, signature):
        if self.client:
            payload = f"{order_id}|{payment_id}"
            digest = hmac.new(
                self.key_secret.encode("utf-8"),
                payload.encode("utf-8"),
                hashlib.sha256,
            ).hexdigest()
            return hmac.compare_digest(digest, signature)
        return bool(order_id and payment_id and signature)


payment_gateway = PaymentGateway()
