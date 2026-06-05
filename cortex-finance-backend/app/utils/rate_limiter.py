import time
import os
import redis
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

class RedisRateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = None):
        super().__init__(app)
        env_limit = os.getenv("RATE_LIMIT_CALLS_PER_MINUTE")
        self.limit = limit or (int(env_limit) if env_limit else 60)
        
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        try:
            self.client = redis.Redis.from_url(redis_url, socket_timeout=5.0)
            self.client.ping()
            self.enabled = True
        except Exception:
            self.enabled = False

    async def dispatch(self, request: Request, call_next):
        if not self.enabled or request.url.path in ["/healthz", "/", "/docs", "/openapi.json"]:
            return await call_next(request)

        client_ip = request.client.host
        now = int(time.time())
        key_name = f"ratelimit:{client_ip}:{now // 60}"

        try:
            current = self.client.incr(key_name)
            if current == 1:
                self.client.expire(key_name, 60)
            
            if current > self.limit:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please try again later."}
                )
        except Exception:
            # Fallback gracefully if Redis is down
            pass

        return await call_next(request)
