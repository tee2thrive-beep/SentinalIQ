from backend.api.schemas import CreateAlertRequest
from backend.api.routes import ingest_custom_alert

req = CreateAlertRequest(
    alert_type="Data Exfiltration Attempt",
    category="Exfiltration",
    severity=90.0,
    confidence=85.0,
    source_ip="192.168.1.150",
    destination_ip="10.0.4.22",
    asset_id="AST-0001",
    user_id="USR-0005"
)

try:
    res = ingest_custom_alert(req)
    print("Success:", res)
except Exception as e:
    import traceback
    traceback.print_exc()
