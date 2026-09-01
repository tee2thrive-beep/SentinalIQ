import json

with open("data/alerts.json", "r", encoding="utf-8") as f:
    alerts = json.load(f)

clean_alerts = []
for a in alerts:
    if "description" not in a:
        a["description"] = f"{a.get('alert_type', 'Security Event')} detected on {a.get('asset_id', 'AST-0001')}."
    clean_alerts.append(a)

with open("data/alerts.json", "w", encoding="utf-8") as f:
    json.dump(clean_alerts, f, indent=2)

print(f"Cleaned {len(clean_alerts)} alerts in data/alerts.json")
