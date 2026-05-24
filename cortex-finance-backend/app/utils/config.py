import os

def load_env_fallback():
    """Manually reads .env variables if python-dotenv is not installed."""
    # Check parent directories for .env
    for path in [".env", "../.env", "../../.env", "../../../.env"]:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if "=" in line and not line.startswith("#"):
                            key, val = line.split("=", 1)
                            os.environ[key.strip()] = val.strip().strip('"').strip("'")
                break
            except Exception:
                pass

# Automatically load env variables on import
load_env_fallback()
