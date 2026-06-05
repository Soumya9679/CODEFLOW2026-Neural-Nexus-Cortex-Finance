import os
import json
import redis
import logging

logger = logging.getLogger("cache")

class RedisCache:
    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        try:
            self.client = redis.Redis.from_url(redis_url, socket_timeout=5.0)
            # Ping to verify connection
            self.client.ping()
            self.enabled = True
        except Exception as e:
            logger.error(f"Failed to connect to Redis for cache: {e}. Falling back to disabled cache.")
            self.enabled = False

    def get(self, key: str):
        if not self.enabled:
            return None
        try:
            val = self.client.get(key)
            if val:
                return json.loads(val)
        except Exception as e:
            logger.warn(f"Redis cache get error: {e}")
        return None

    def set(self, key: str, value, ttl: int = 3600):
        if not self.enabled:
            return
        try:
            self.client.setex(key, ttl, json.dumps(value))
        except Exception as e:
            logger.warn(f"Redis cache set error: {e}")

    def delete(self, key: str):
        if not self.enabled:
            return
        try:
            self.client.delete(key)
        except Exception as e:
            logger.warn(f"Redis cache delete error: {e}")

global_cache = RedisCache()
