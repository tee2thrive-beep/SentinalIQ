from typing import Dict, Set, Tuple, Optional

# MITRE ATT&CK / Kill Chain Stage Order Mapping
KILL_CHAIN_STAGES: Dict[str, int] = {
    # Stage 1: Recon & Initial Access
    "Port Scan": 1,
    "Web Attack": 1,
    "Phishing": 1,
    "Suspicious Email": 1,
    "Impossible Travel": 1,

    # Stage 2: Execution
    "Suspicious PowerShell": 2,
    "Malware Detection": 2,
    "Ransomware Indicator": 2,

    # Stage 3: Persistence & Credential Theft & Privilege Escalation
    "Credential Theft": 3,
    "Privilege Escalation": 3,
    "New Admin Account": 3,

    # Stage 4: Authentication & Defense Evasion
    "Failed Login": 4,
    "Brute Force": 4,
    "Successful Login": 4,
    "Successful Login After Failures": 4,

    # Stage 5: Lateral Movement
    "Lateral Movement": 5,

    # Stage 6: Command & Control
    "Command and Control": 6,
    "Suspicious DNS": 6,
    "DDoS": 6,

    # Stage 7: Collection & Internal Access
    "Unauthorized Access": 7,
    "Unusual File Access": 7,
    "SQL Injection": 7,
    "Web Server Compromise": 7,

    # Stage 8: Exfiltration & Impact
    "Data Exfiltration": 8,
    "Large Data Transfer": 8,
}

STAGE_NAMES: Dict[int, str] = {
    1: "Recon / Initial Access",
    2: "Execution",
    3: "Credential Access / PrivEsc",
    4: "Authentication",
    5: "Lateral Movement",
    6: "Command & Control",
    7: "Collection / Internal Access",
    8: "Exfiltration / Impact"
}

# Explicit Threat Category Relationships (Bi-directional)
_RELATED_PAIRS = [
    # Campaign 1: Credential Theft -> DB Exfiltration
    ("Suspicious Email", "Credential Theft"),
    ("Credential Theft", "Successful Login"),
    ("Credential Theft", "Privilege Escalation"),
    ("Privilege Escalation", "Lateral Movement"),
    ("Lateral Movement", "Unauthorized Access"),
    ("Unauthorized Access", "Data Exfiltration"),

    # Campaign 2: Phishing & C2 Malware
    ("Suspicious Email", "Suspicious PowerShell"),
    ("Suspicious PowerShell", "Malware Detection"),
    ("Malware Detection", "Command and Control"),
    ("Command and Control", "Lateral Movement"),

    # Campaign 3: Brute Force -> DB Access
    ("Failed Login", "Brute Force"),
    ("Brute Force", "Successful Login After Failures"),
    ("Successful Login After Failures", "Privilege Escalation"),
    ("Privilege Escalation", "Unauthorized Access"),

    # Campaign 4: SQL Injection -> Exfiltration
    ("Web Attack", "SQL Injection"),
    ("SQL Injection", "Web Server Compromise"),
    ("Web Server Compromise", "Unauthorized Access"),
    ("Unauthorized Access", "Data Exfiltration"),

    # Campaign 5: Ransomware Outbreak
    ("Suspicious PowerShell", "Ransomware Indicator"),
    ("Ransomware Indicator", "Lateral Movement"),
    ("Ransomware Indicator", "Malware Detection"),

    # Campaign 6: DDoS & Edge Flood
    ("Port Scan", "DDoS"),
    ("DDoS", "Command and Control"),

    # Campaign 7: Impossible Travel / ATO
    ("Impossible Travel", "Successful Login"),
    ("Successful Login", "New Admin Account"),
    ("New Admin Account", "Unauthorized Access"),

    # Campaign 8: Insider Data Theft
    ("Unauthorized Access", "Unusual File Access"),
    ("Unusual File Access", "Large Data Transfer"),
    ("Large Data Transfer", "Data Exfiltration"),
]

RELATED_PAIRS_SET: Set[Tuple[str, str]] = set()
for t1, t2 in _RELATED_PAIRS:
    RELATED_PAIRS_SET.add((t1, t2))
    RELATED_PAIRS_SET.add((t2, t1))

def are_alert_types_related(type_a: str, type_b: str) -> bool:
    """Checks if two alert types have a documented threat category relationship."""
    if type_a == type_b:
        return True
    return (type_a, type_b) in RELATED_PAIRS_SET

def get_kill_chain_stage(alert_type: str) -> Optional[int]:
    """Returns the kill-chain stage index (1-8) for an alert type."""
    return KILL_CHAIN_STAGES.get(alert_type)

def check_attack_progression(type_a: str, type_b: str) -> Tuple[bool, Optional[str]]:
    """
    Evaluates whether type_a and type_b form a plausible attack progression sequence.
    Returns (is_progression, stage_description).
    """
    stage_a = get_kill_chain_stage(type_a)
    stage_b = get_kill_chain_stage(type_b)

    if stage_a is None or stage_b is None:
        return False, None

    # Check if type_a stage precedes or matches type_b stage in sequence
    if are_alert_types_related(type_a, type_b) and (stage_a <= stage_b):
        desc = f"Plausible attack progression: {type_a} ({STAGE_NAMES[stage_a]}) -> {type_b} ({STAGE_NAMES[stage_b]})"
        return True, desc

    return False, None
