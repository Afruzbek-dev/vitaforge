import hmac, hashlib, json, time
from urllib.parse import unquote

def verify_telegram_init_data(init_data: str, bot_token: str) -> dict | None:
    try:
        params = dict(p.split("=", 1) for p in init_data.split("&"))
        received_hash = params.pop("hash", None)
        if not received_hash:
            return None
        auth_date = int(params.get("auth_date", 0))
        if time.time() - auth_date > 86400:
            return None
        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(params.items())
        )
        secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
        expected = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, received_hash):
            return None
        return json.loads(unquote(params.get("user", "{}")))
    except Exception:
        return None

def verify_telegram_widget(data: dict, bot_token: str) -> bool:
    received_hash = data.pop("hash", None)
    if not received_hash:
        return False
    check_string = "\n".join(f"{k}={v}" for k, v in sorted(data.items()))
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    expected = hmac.new(secret_key, check_string.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, received_hash)
