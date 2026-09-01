from collections import Counter
from typing import List, Dict, Any

def classify_incident_type(alerts: List[Dict[str, Any]], observed_stages: List[str]) -> str:
    """
    Determines a human-readable incident type classification using a
    deterministic precedence hierarchy based on alert threat types and stages.
    """
    alert_types = {alt.get("alert_type") for alt in alerts if alt.get("alert_type")}

    # Precedence Rules
    if "Ransomware Indicator" in alert_types:
        return "Ransomware Outbreak"

    if "Data Exfiltration" in alert_types or "Large Data Transfer" in alert_types:
        return "Data Exfiltration"

    if len(observed_stages) >= 3:
        return "Multi-stage Attack"

    if "Impossible Travel" in alert_types or "New Admin Account" in alert_types:
        return "Account Takeover"

    if "SQL Injection" in alert_types or "Web Attack" in alert_types or "Web Server Compromise" in alert_types:
        return "Web Application Attack"

    if "DDoS" in alert_types:
        return "DDoS Attack"

    if "Brute Force" in alert_types:
        return "Brute Force Attack"

    if "Malware Detection" in alert_types or "Suspicious PowerShell" in alert_types:
        return "Malware Infection"

    if "Unusual File Access" in alert_types:
        return "Insider Data Theft"

    # Fallback to most frequent alert type
    counts = Counter(alt.get("alert_type") for alt in alerts if alt.get("alert_type"))
    if counts:
        most_common = counts.most_common(1)[0][0]
        return f"{most_common} Event"

    return "Security Event"
