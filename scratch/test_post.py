import urllib.request
import json
import urllib.error

url = 'https://sentinaliq.onrender.com/api/alerts'
payload = {
    "alert_type": "Data Exfiltration Attempt",
    "category": "Exfiltration",
    "severity": 90.0,
    "confidence": 85.0,
    "source_ip": "192.168.1.150",
    "destination_ip": "10.0.4.22",
    "asset_id": "AST-0001",
    "user_id": "USR-0005"
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    res = urllib.request.urlopen(req)
    print('POST Status:', res.status)
    print('Response:', res.read().decode())
except urllib.error.HTTPError as e:
    print('HTTPError Status:', e.code)
    print('Response:', e.read().decode())
except Exception as e:
    print('Exception:', str(e))
