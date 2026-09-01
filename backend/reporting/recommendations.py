from typing import List, Dict, Any

RECOMMENDATIONS_CATALOG = {
    "Ransomware Outbreak": [
        {"action": "Isolate Affected Host", "priority": "IMMEDIATE", "details": "Disconnect affected endpoints from local network VLANs to prevent wormable encryption spread."},
        {"action": "Disable Suspicious Accounts", "priority": "IMMEDIATE", "details": "Revoke active session tokens and disable compromised user/service credentials."},
        {"action": "Preserve Forensic Memory", "priority": "HIGH", "details": "Capture RAM dumps and unencrypted process artifacts prior to host reboot or re-imaging."},
        {"action": "Investigate Lateral Movement", "priority": "HIGH", "details": "Audit SMB/RPC/PsExec logs on adjacent network subnet hosts for unauthorized execution."}
    ],
    "Data Exfiltration": [
        {"action": "Restrict Outbound IP Connections", "priority": "IMMEDIATE", "details": "Block destination external IP addresses and command-and-control domain endpoints at perimeter firewall."},
        {"action": "Preserve Network & Proxy Logs", "priority": "HIGH", "details": "Export full NetFlow, Web Proxy, and egress gateway transaction logs for data volume estimation."},
        {"action": "Identify Exposed Confidential Data", "priority": "HIGH", "details": "Audit file access logs on targeted database/file storage servers to identify compromised datasets."},
        {"action": "Investigate Egress Infrastructure", "priority": "MEDIUM", "details": "Perform threat intelligence lookup on external IP addresses and protocol signatures."}
    ],
    "Brute Force Attack": [
        {"action": "Block Attacker Source IP", "priority": "IMMEDIATE", "details": "Add originating external IP address to perimeter blocklist / web application firewall rate-limiter."},
        {"action": "Enforce Credential Reset", "priority": "HIGH", "details": "Force mandatory password resets and enforce multi-factor authentication (MFA) on targeted user accounts."},
        {"action": "Review Post-Failure Logins", "priority": "HIGH", "details": "Audit successful authentication attempts originating from the same IP range following failed attempt bursts."},
        {"action": "Inspect Authentication Lockouts", "priority": "MEDIUM", "details": "Monitor Active Directory / LDAP lockout events for account denial-of-service."}
    ],
    "Phishing Campaign": [
        {"action": "Quarantine Malicious Emails", "priority": "IMMEDIATE", "details": "Purge related email messages matching sender domain, subject line, or attachment hash across all mailboxes."},
        {"action": "Block Malicious URLs & Attachments", "priority": "HIGH", "details": "Add phishing URLs to secure web gateway blocklist and attachment hashes to endpoint EDR rules."},
        {"action": "Reset Compromised Credentials", "priority": "HIGH", "details": "Force password reset for users who clicked phishing links or submitted credentials."},
        {"action": "Conduct Fleet Mailbox Search", "priority": "MEDIUM", "details": "Search email logs for similar phishing lures received by other enterprise employees."}
    ],
    "DDoS Attack": [
        {"action": "Activate DDoS Mitigation Controls", "priority": "IMMEDIATE", "details": "Route incoming public traffic through upstream scrubbing center or CDN anti-DDoS protection."},
        {"action": "Analyze Source Distribution", "priority": "HIGH", "details": "Inspect ingress traffic patterns to distinguish botnet IP clusters from legitimate user spikes."},
        {"action": "Monitor Service Availability", "priority": "HIGH", "details": "Track synthetic availability and HTTP response latency metrics across public endpoints."},
        {"action": "Audit Secondary Intrusion Activity", "priority": "MEDIUM", "details": "Investigate underlying servers for secondary intrusion attempts masked by DDoS traffic noise."}
    ],
    "Malware Infection": [
        {"action": "Isolate Infected Endpoint", "priority": "IMMEDIATE", "details": "Isolate affected workstation/server via EDR agent network isolation policy."},
        {"action": "Preserve Malware Executable Sample", "priority": "HIGH", "details": "Quarantine payload sample and submit SHA256 hash to static/dynamic sandbox analysis."},
        {"action": "Investigate Persistence Mechanisms", "priority": "HIGH", "details": "Audit registry run keys, scheduled tasks, and systemd services for backdoor persistence."},
        {"action": "Sweep Fleet for IoCs", "priority": "MEDIUM", "details": "Run enterprise EDR sweep for matching file hashes, IP connections, and mutex names."}
    ],
    "Insider Data Theft": [
        {"action": "Audit User Endpoint Activity", "priority": "IMMEDIATE", "details": "Export endpoint DLP, USB storage, and cloud upload logs for the suspected insider account."},
        {"action": "Restrict Database & Storage Access", "priority": "HIGH", "details": "Temporarily suspend user access permissions to sensitive repositories and database tables."},
        {"action": "Preserve Unaltered Audit Logs", "priority": "HIGH", "details": "Secure SIEM audit trails and file system access logs to preserve legal chain of custody."},
        {"action": "Review File Export Volumes", "priority": "MEDIUM", "details": "Quantify total sensitive files read, copied, or exported during the incident timeframe."}
    ],
    "Unauthorized Access Event": [
        {"action": "Revoke Compromised Sessions", "priority": "IMMEDIATE", "details": "Terminate active Kerberos/OAuth sessions and revoke OAuth application refresh tokens."},
        {"action": "Audit Privilege Escalation Activity", "priority": "HIGH", "details": "Review sudo/admin privilege escalation logs and local group membership modifications."},
        {"action": "Enforce MFA Verification", "priority": "HIGH", "details": "Require mandatory multi-factor authentication re-verification for all administrative logins."},
        {"action": "Inspect Access Log Anomalies", "priority": "MEDIUM", "details": "Compare user login location and device fingerprint against historical baseline profiles."}
    ]
}

DEFAULT_RECOMMENDATIONS = [
    {"action": "Isolate Affected Entity", "priority": "IMMEDIATE", "details": "Restrict network access for compromised assets or users involved in the incident."},
    {"action": "Preserve Security Logs", "priority": "HIGH", "details": "Collect firewall, SIEM, and host endpoint event logs for root cause analysis."},
    {"action": "Audit Account Credentials", "priority": "HIGH", "details": "Reset passwords and review privileges for all accounts associated with the incident alerts."},
    {"action": "Monitor Target Subnet", "priority": "MEDIUM", "details": "Enable heightened logging and IDS monitoring across adjacent network subnets."}
]

def generate_recommendations(incident_type: str, severity: float = 80.0, dominant_factors: List[str] = None) -> List[Dict[str, Any]]:
    """
    Generates rule-based automated investigation and containment recommendations.
    Every recommendation is explicitly labeled as an 'automated recommendation'.
    """
    recs = RECOMMENDATIONS_CATALOG.get(incident_type, DEFAULT_RECOMMENDATIONS)

    formatted_recs = []
    for r in recs:
        formatted_recs.append({
            "type": "automated recommendation",
            "action": r["action"],
            "priority": r["priority"],
            "details": r["details"],
            "status": "PROPOSED",
            "automated_note": "Automated policy guidance for SOC analysts. Action has NOT been executed autonomously."
        })

    return formatted_recs
