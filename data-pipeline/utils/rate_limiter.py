"""
Token Bucket Rate Limiter
Thread-safe and async-safe token bucket rate limiter for governing external scrapers.
"""

import asyncio
import time


class TokenBucketRateLimiter:
    """
    Asynchronous token bucket rate limiter.
    """

    def __init__(self, requests_per_second: float, burst_limit: int = 1):
        if requests_per_second <= 0:
            raise ValueError("requests_per_second must be greater than 0")
        
        self.rate = requests_per_second
        self.capacity = max(1, burst_limit)
        self.tokens = float(self.capacity)
        self.last_update = time.monotonic()
        self._lock = asyncio.Lock()

    async def acquire(self) -> None:
        """
        Wait until a token is available and consume it.
        """
        async with self._lock:
            while True:
                now = time.monotonic()
                elapsed = now - self.last_update
                self.last_update = now

                # Replenish tokens based on elapsed time
                self.tokens = min(float(self.capacity), self.tokens + elapsed * self.rate)

                if self.tokens >= 1.0:
                    self.tokens -= 1.0
                    return
                
                # Calculate sleep duration needed for next token
                needed = 1.0 - self.tokens
                sleep_time = needed / self.rate
                await asyncio.sleep(sleep_time)
