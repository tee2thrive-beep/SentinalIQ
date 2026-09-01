from typing import Dict, Any

def generate_executive_summary(
    incident_id: str,
    incident_type: str,
    priority_rank: int,
    risk_score: float,
    risk_level: str,
    alert_count: int,
    affected_user_count: int,
    primary_assets: list,
    dominant_factors: list
) -> str:
    """Generates a dynamic natural language executive summary for the report."""
    asset_str = ", ".join([a.get("name", a.get("asset_id")) for a in primary_assets[:2]]) if primary_assets else "N/A"
    drivers_str = ", ".join([f.replace("_", " ").title() for f in dominant_factors[:3]])

    summary = (
        f"{incident_id} is a {risk_level} {incident_type} ranked #{priority_rank} in the "
        f"SentinelIQ investigation queue with a defensible risk score of {risk_score:.2f} / 100. "
        f"The incident contains {alert_count} correlated alerts affecting {affected_user_count} unique user(s) "
        f"and target asset(s) ({asset_str}). "
        f"The primary risk drivers elevating this incident's priority rank are {drivers_str}."
    )
    return summary

def render_markdown_report(report: Dict[str, Any]) -> str:
    """Renders a structured, human-readable Markdown investigation report for security analysts."""
    inc = report["incident"]
    ra = report["risk_analysis"]
    pe = report["priority_explanation"]
    cl = report["classification"]

    md = []
    md.append(f"# SentinelIQ Incident Investigation Report — {inc['incident_id']}")
    md.append(f"**Generated At:** `{report['generated_at']}` | **Report Version:** `{report['report_version']}`\n")
    md.append("---")
    md.append("## Executive Summary\n")
    md.append(f"> {report['executive_summary']}\n")

    md.append("### Incident Overview")
    md.append(f"- **Incident ID:** `{inc['incident_id']}`")
    md.append(f"- **Incident Type:** `{inc['incident_type']}`")
    md.append(f"- **Priority Rank:** `#{inc['priority_rank']}` (`{inc['priority_band']}` Band)")
    md.append(f"- **Risk Score:** `{inc['risk_score']:.2f} / 100.0` (`{inc['risk_level']}`)")
    md.append(f"- **Timeline Bounds:** `{inc['first_seen']}` to `{inc['last_seen']}`")
    md.append(f"- **Correlated Alerts:** `{inc['alert_count']}`")
    md.append(f"- **Affected Users:** `{inc['affected_user_count']}`\n")

    md.append("---")
    md.append("## Risk Score & Six-Factor Analysis\n")
    md.append(f"**Six-Factor Formula:** `${ra['formula']}$`  ")
    md.append(f"**Calculated Score:** `{ra['risk_score']:.2f}` (Sum of Weighted Contributions: `{ra['contribution_sum']:.2f}`)\n")

    md.append("| Factor Name | Raw Value | Weight | Contribution | Status | Evidence Summary |")
    md.append("| :--- | :---: | :---: | :---: | :---: | :--- |")
    for f in ra["factors"]:
        md.append(f"| **{f['name'].replace('_', ' ').title()}** | `{f['value']:.2f}` | `{f['weight']:.2f}` | **`+{f['contribution']:.2f}`** | `{f['status']}` | {f['evidence']} |")
    md.append("")

    md.append("### Dominant Risk Drivers")
    for idx, df_name in enumerate(ra["dominant_factors"][:3], start=1):
        f_info = next((item for item in ra["factors"] if item["name"] == df_name), {})
        md.append(f"{idx}. **{df_name.replace('_', ' ').title()}** — `{f_info.get('contribution', 0.0):.2f}` pts contribution (Raw: `{f_info.get('value', 0.0):.2f}`, Weight: `{f_info.get('weight', 0.0):.2f}`). *Evidence:* {f_info.get('evidence', 'N/A')}")
    md.append("")

    md.append("---")
    md.append("## Priority Queue & Comparative Explanation\n")
    md.append(f"- **Priority Rank:** `#{inc['priority_rank']}`")
    md.append(f"- **Tie Group ID:** `{inc['tie_group_id'] or 'None (Unique Score)'}`")
    md.append(f"- **Primary Ranking Reason:** `{pe.get('primary_reason', 'Higher risk score')}`")

    if pe.get("compared_with_next"):
        cn = pe["compared_with_next"]
        md.append(f"- **Compared with Next Item (`{cn['incident_id']}`):** Score Difference `+{cn['score_difference']:.2f}` pts (Deciding Factor: `{cn['deciding_factor']}`).")
    md.append("")

    md.append("---")
    md.append("## Incident Classification Evidence\n")
    md.append(f"**Classified Incident Type:** `{cl['incident_type']}`  ")
    md.append("**Precedence Evidence Rules:**")
    for ev in cl.get("classification_evidence", []):
        md.append(f"- ✓ {ev}")
    md.append("")

    md.append("---")
    md.append("## Chronological Attack Timeline\n")
    md.append("| Timestamp | Alert ID | Category | Alert Type | Source IP | Target Asset | User | Severity |")
    md.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |")
    for event in report["timeline"]:
        md.append(f"| `{event['timestamp']}` | `{event['alert_id']}` | `{event['category']}` | `{event['alert_type']}` | `{event['source_ip']}` | `{event['asset_name']}` | `{event['username']}` | `{event['severity']}` |")
    md.append("")

    md.append("---")
    md.append("## Correlation Evidence Relationships\n")
    if report["correlation_evidence"]:
        for corr in report["correlation_evidence"]:
            md.append(f"- **Pair `{corr['alert_id_1']}` ↔ `{corr['alert_id_2']}`** (Correlation Score: `{corr['correlation_score']:.2f}`): {corr['evidence_summary']}")
    else:
        md.append("*No multi-alert correlation pairs (Singleton Incident).*")
    md.append("")

    md.append("---")
    md.append("## Affected Entities\n")
    md.append("### Affected Assets")
    for ast in report["affected_assets"]:
        md.append(f"- **`{ast['asset_id']}` ({ast['name']})**: Type: `{ast['asset_type']}` | Criticality: `{ast['criticality']}` | Impact: `{ast['business_impact']}` | Data Sensitivity: `{ast['data_sensitivity']}`")

    md.append("\n### Affected Users")
    for usr in report["affected_users"]:
        md.append(f"- **`{usr['user_id']}` ({usr['username']})**: Role: `{usr['role']}` | Dept: `{usr['department']}` | Privilege: `{usr['privilege_level']}`")
    md.append("")

    md.append("---")
    md.append("## Recommended Investigation & Containment Actions\n")
    for rec in report["recommendations"]:
        md.append(f"- **[{rec['priority']}] {rec['action']}**: {rec['details']} *(Automated Policy Recommendation)*")
    md.append("")

    md.append("---")
    md.append("## Limitations & System Context\n")
    for lim in report["limitations"]:
        md.append(f"- ⚠️ {lim}")
    md.append("")

    return "\n".join(md)
