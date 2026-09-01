import json
import csv
import random
import os
from datetime import datetime, timedelta, timezone

def generate_dataset(seed: int = 42, output_dir: str = "data"):
    random.seed(seed)
    
    os.makedirs(output_dir, exist_ok=True)
    
    # ---------------------------------------------------------
    # 1. GENERATE ASSETS (35 Assets)
    # ---------------------------------------------------------
    departments = ["Finance", "HR", "IT", "Engineering", "Sales", "Operations", "Security", "Executive"]
    
    assets_raw = [
        # CRITICAL (90 - 100)
        ("ast_dc_01", "dc-primary.corp.internal", "domain_controller", "IT", 100, 95, 100, "IT"),
        ("ast_dc_02", "dc-backup.corp.internal", "domain_controller", "IT", 95, 90, 95, "IT"),
        ("ast_db_fin", "fin-db-prod.corp.internal", "database_server", "Finance", 95, 100, 100, "Finance"),
        ("ast_db_cust", "cust-db-cluster.corp.internal", "database_server", "Sales", 90, 95, 95, "Sales"),
        ("ast_pay_01", "payment-gateway.corp.internal", "payment_server", "Finance", 100, 100, 100, "Finance"),
        
        # HIGH (70 - 89)
        ("ast_web_01", "www.company.com", "web_server", "Engineering", 85, 60, 85, "Engineering"),
        ("ast_web_02", "portal.company.com", "web_server", "Engineering", 80, 65, 80, "Engineering"),
        ("ast_app_01", "app-prod-01.corp.internal", "application_server", "Engineering", 85, 75, 85, "Engineering"),
        ("ast_app_02", "app-prod-02.corp.internal", "application_server", "Engineering", 80, 70, 80, "Engineering"),
        ("ast_file_01", "file-share-prod.corp.internal", "file_server", "Operations", 75, 85, 80, "Operations"),
        ("ast_email_01", "mail.corp.internal", "email_server", "IT", 85, 80, 85, "IT"),
        ("ast_fw_01", "fw-edge-01.corp.internal", "firewall", "Security", 90, 50, 90, "Security"),
        ("ast_cloud_01", "aws-prod-k8s.cloud.internal", "cloud_server", "Engineering", 85, 80, 85, "Engineering"),
        
        # MEDIUM (40 - 69)
        ("ast_dev_db", "dev-db-01.corp.internal", "database_server", "Engineering", 50, 55, 50, "Engineering"),
        ("ast_dev_app", "dev-app-01.corp.internal", "application_server", "Engineering", 45, 40, 45, "Engineering"),
        ("ast_stage_web", "staging-web.corp.internal", "web_server", "Engineering", 55, 45, 50, "Engineering"),
        ("ast_internal_tool", "wiki.corp.internal", "application_server", "IT", 60, 60, 60, "IT"),
        ("ast_file_dev", "file-share-dev.corp.internal", "file_server", "Engineering", 45, 50, 45, "Engineering"),
        ("ast_cloud_dev", "aws-dev-sandbox.cloud.internal", "cloud_server", "Engineering", 40, 35, 40, "Engineering"),

        # LOW (10 - 39)
        ("ast_test_01", "test-box-01.corp.internal", "test_server", "IT", 20, 15, 20, "IT"),
        ("ast_test_02", "test-box-02.corp.internal", "test_server", "IT", 15, 10, 15, "IT"),
    ]
    
    # Add Workstations & Laptops (LOW)
    for i in range(1, 15):
        dept = departments[i % len(departments)]
        assets_raw.append((
            f"ast_wkst_{i:02d}",
            f"wkst-{dept.lower()}-{i:02d}.corp.internal",
            "workstation" if i % 2 == 0 else "laptop",
            dept,
            random.randint(15, 35),
            random.randint(10, 30),
            random.randint(15, 35),
            dept
        ))
        
    assets = []
    for a in assets_raw:
        assets.append({
            "asset_id": a[0],
            "hostname": a[1],
            "asset_type": a[2],
            "department": a[3],
            "criticality": a[4],
            "data_sensitivity": a[5],
            "business_value": a[6],
            "owner_department": a[7]
        })
        
    # ---------------------------------------------------------
    # 2. GENERATE USERS (55 Users)
    # ---------------------------------------------------------
    first_names = ["Alice", "Bob", "Charlie", "David", "Emma", "Frank", "Grace", "Henry", "Ivy", "Jack",
                   "Kate", "Liam", "Mia", "Noah", "Olivia", "Peter", "Quinn", "Rachel", "Sam", "Tina",
                   "Umar", "Victor", "Wendy", "Xavier", "Yara", "Zack"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]

    roles_by_dept = {
        "Finance": ["Financial Analyst", "Accountant", "Payroll Specialist", "Finance Manager"],
        "HR": ["HR Generalist", "Recruiter", "HR Director", "Benefits Specialist"],
        "IT": ["Systems Administrator", "Helpdesk Technician", "Network Engineer", "IT Director"],
        "Engineering": ["Software Engineer", "DevOps Engineer", "QA Engineer", "Lead Developer"],
        "Sales": ["Sales Exec", "Account Manager", "Sales Operations", "VP Sales"],
        "Operations": ["Operations Analyst", "Logistics Specialist", "Ops Manager"],
        "Security": ["SOC Analyst", "Security Engineer", "CISO"],
        "Executive": ["CEO", "CFO", "CTO", "VP Operations"]
    }

    users = []
    # Guarantee key users for campaigns
    key_users = [
        ("usr_fin_mgr", "alice.smith", "Finance", "Finance Manager", "elevated", "ast_wkst_01", "medium"),
        ("usr_hr_spec", "bob.johnson", "HR", "HR Specialist", "standard", "ast_wkst_02", "low"),
        ("usr_sysadmin", "charlie.admin", "IT", "Systems Administrator", "administrator", "ast_wkst_03", "high"),
        ("usr_devops", "david.devops", "Engineering", "DevOps Engineer", "elevated", "ast_wkst_04", "medium"),
        ("usr_sales_vp", "emma.vp", "Sales", "VP Sales", "elevated", "ast_wkst_05", "low"),
        ("usr_insider", "frank.insider", "Engineering", "Software Engineer", "standard", "ast_wkst_06", "high"),
        ("usr_sec_analyst", "grace.soc", "Security", "SOC Analyst", "administrator", "ast_wkst_07", "low"),
    ]

    for ku in key_users:
        users.append({
            "user_id": ku[0],
            "username": ku[1],
            "department": ku[2],
            "role": ku[3],
            "privilege_level": ku[4],
            "asset_id": ku[5],
            "risk_level": ku[6]
        })

    user_counter = 8
    workstation_ids = [a["asset_id"] for a in assets if "wkst" in a["asset_id"]]

    while len(users) < 55:
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        uname = f"{fn.lower()}.{ln.lower()}{user_counter}"
        dept = random.choice(departments)
        role = random.choice(roles_by_dept[dept])
        
        # Privileges: standard (70%), elevated (20%), administrator (10%)
        rand_priv = random.random()
        if rand_priv < 0.70:
            priv = "standard"
        elif rand_priv < 0.90:
            priv = "elevated"
        else:
            priv = "administrator"
            
        users.append({
            "user_id": f"usr_{user_counter:03d}",
            "username": uname,
            "department": dept,
            "role": role,
            "privilege_level": priv,
            "asset_id": random.choice(workstation_ids),
            "risk_level": random.choice(["low", "low", "low", "medium", "high"])
        })
        user_counter += 1

    # ---------------------------------------------------------
    # 3. GENERATE RAW ALERTS (160+ Alerts with 8 Hidden Campaigns)
    # ---------------------------------------------------------
    base_time = datetime(2026, 9, 1, 8, 0, 0, tzinfo=timezone.utc)
    alerts = []
    alert_id_counter = 1

    def add_alert(ts_offset_sec, alert_type, src_ip, dst_ip, usr_id, ast_id, severity, confidence, desc, status="open"):
        nonlocal alert_id_counter
        ts = base_time + timedelta(seconds=ts_offset_sec)
        alerts.append({
            "alert_id": f"alt_{alert_id_counter:04d}",
            "timestamp": ts.isoformat(),
            "alert_type": alert_type,
            "source_ip": src_ip,
            "destination_ip": dst_ip,
            "user_id": usr_id,
            "asset_id": ast_id,
            "severity": severity,
            "description": desc,
            "confidence": confidence,
            "status": status
        })
        alert_id_counter += 1

    # --- CAMPAIGN 1: Credential Theft & Financial DB Exfiltration ---
    # Target: ast_db_fin, User: usr_fin_mgr (Finance Manager), Src IP: 192.168.1.105, Ext IP: 185.220.101.5
    t1 = 300  # 8:05 AM
    add_alert(t1, "Suspicious Email", "185.220.101.5", "192.168.1.105", "usr_fin_mgr", "ast_wkst_01", 45, 60, "Phishing email detected with suspicious attachment delivered to Finance Manager")
    add_alert(t1 + 180, "Credential Theft", "192.168.1.105", "192.168.1.105", "usr_fin_mgr", "ast_wkst_01", 85, 90, "LSASS memory dump detected on workstation ast_wkst_01")
    add_alert(t1 + 420, "Successful Login", "192.168.1.105", "10.0.2.10", "usr_fin_mgr", "ast_app_01", 60, 95, "Successful authentication to app server using stolen credentials")
    add_alert(t1 + 720, "Privilege Escalation", "192.168.1.105", "10.0.2.10", "usr_fin_mgr", "ast_app_01", 88, 85, "Token impersonation attempt to elevate privileges to SYSTEM")
    add_alert(t1 + 1020, "Lateral Movement", "10.0.2.10", "10.0.1.50", "usr_fin_mgr", "ast_db_fin", 90, 92, "PsExec lateral movement from app server to Financial Database")
    add_alert(t1 + 1320, "Unauthorized Access", "10.0.2.10", "10.0.1.50", "usr_fin_mgr", "ast_db_fin", 92, 88, "Bulk query execution on restricted financial_records table")
    add_alert(t1 + 1620, "Data Exfiltration", "10.0.1.50", "185.220.101.5", "usr_fin_mgr", "ast_db_fin", 98, 95, "Encrypted HTTPS outbound transfer of 4.2 GB to untrusted IP 185.220.101.5")

    # --- CAMPAIGN 2: Phishing & C2 Malware Campaign ---
    # User: usr_hr_spec, Asset: ast_wkst_02 -> ast_file_01, C2 IP: 198.51.100.44
    t2 = 3600 # 9:00 AM
    add_alert(t2, "Suspicious Email", "198.51.100.44", "192.168.1.106", "usr_hr_spec", "ast_wkst_02", 50, 70, "Email with suspicious macro-enabled document received")
    add_alert(t2 + 240, "Suspicious PowerShell", "192.168.1.106", "192.168.1.106", "usr_hr_spec", "ast_wkst_02", 78, 85, "Encoded PowerShell command executed from Word document process")
    add_alert(t2 + 480, "Malware Detection", "192.168.1.106", "192.168.1.106", "usr_hr_spec", "ast_wkst_02", 85, 95, "Trojan.GenericDropper detected in AppData directory")
    add_alert(t2 + 800, "Command and Control", "192.168.1.106", "198.51.100.44", "usr_hr_spec", "ast_wkst_02", 92, 90, "Beaconing traffic to external C2 node 198.51.100.44 every 30 seconds")
    add_alert(t2 + 1200, "Lateral Movement", "192.168.1.106", "10.0.3.15", "usr_hr_spec", "ast_file_01", 82, 80, "SMB connection attempt to production file server using HR service account")

    # --- CAMPAIGN 3: External Brute Force to Database Access ---
    # Src IP: 203.0.113.15, Target: ast_pay_01 (Payment Server), User: usr_sysadmin
    t3 = 7200 # 10:00 AM
    for i in range(5):
        add_alert(t3 + i * 30, "Failed Login", "203.0.113.15", "10.0.1.99", "usr_sysadmin", "ast_pay_01", 40 + i*5, 80, f"Failed SSH login attempt #{i+1} for admin account")
    add_alert(t3 + 200, "Brute Force", "203.0.113.15", "10.0.1.99", "usr_sysadmin", "ast_pay_01", 85, 95, "Brute force attack threshold reached: 120 failed SSH attempts in 3 minutes")
    add_alert(t3 + 350, "Successful Login After Failures", "203.0.113.15", "10.0.1.99", "usr_sysadmin", "ast_pay_01", 90, 98, "Successful authentication following automated brute force attack")
    add_alert(t3 + 600, "Privilege Escalation", "203.0.113.15", "10.0.1.99", "usr_sysadmin", "ast_pay_01", 94, 90, "Sudo exploitation attempt (CVE-2021-3156) on payment gateway host")
    add_alert(t3 + 900, "Unauthorized Access", "10.0.1.99", "10.0.1.99", "usr_sysadmin", "ast_pay_01", 96, 92, "Direct memory inspection on active credit card transaction buffer")

    # --- CAMPAIGN 4: Web Application SQL Injection to Exfiltration ---
    # Ext IP: 198.51.100.77, Target: ast_web_01 -> ast_db_cust
    t4 = 10800 # 11:00 AM
    add_alert(t4, "Web Attack", "198.51.100.77", "10.0.2.5", "usr_009", "ast_web_01", 65, 75, "Automated web application vulnerability scan detected on /api/v1/products")
    add_alert(t4 + 300, "SQL Injection", "198.51.100.77", "10.0.2.5", "usr_009", "ast_web_01", 88, 92, "SQL injection payload UNION SELECT detected in HTTP GET query parameter")
    add_alert(t4 + 600, "Web Server Compromise", "10.0.2.5", "10.0.2.5", "usr_009", "ast_web_01", 90, 85, "Web shell script webshell.php spawned interactive bash process")
    add_alert(t4 + 900, "Unauthorized Access", "10.0.2.5", "10.0.1.60", "usr_009", "ast_db_cust", 92, 90, "Internal database query dump initiated on customer_pii table from web server")
    add_alert(t4 + 1200, "Data Exfiltration", "10.0.2.5", "198.51.100.77", "usr_009", "ast_web_01", 97, 95, "DNS tunneling data exfiltration detected sending encoded records to attacker NS server")

    # --- CAMPAIGN 5: Multi-Host Ransomware Outbreak ---
    # User: usr_devops, Asset: ast_dev_app -> ast_file_01, ast_file_dev
    t5 = 14400 # 12:00 PM
    add_alert(t5, "Suspicious PowerShell", "192.168.1.108", "10.0.2.20", "usr_devops", "ast_dev_app", 75, 80, "PowerShell script disabling Windows Defender and volume shadow copies")
    add_alert(t5 + 180, "Ransomware Indicator", "10.0.2.20", "10.0.2.20", "usr_devops", "ast_dev_app", 95, 95, "Rapid file renaming pattern (.locked extension appended) on local volumes")
    add_alert(t5 + 400, "Lateral Movement", "10.0.2.20", "10.0.3.15", "usr_devops", "ast_file_01", 90, 88, "WMI remote execution spreading encrypted binaries to file server 01")
    add_alert(t5 + 600, "Ransomware Indicator", "10.0.3.15", "10.0.3.15", "usr_devops", "ast_file_01", 98, 98, "Ransom note README_RESTORE_FILES.txt dropped across shared network drives")
    add_alert(t5 + 750, "Lateral Movement", "10.0.2.20", "10.0.3.16", "usr_devops", "ast_file_dev", 88, 85, "Automated network propagation targeting secondary file server")

    # --- CAMPAIGN 6: DDoS & Edge Service Degradation ---
    # Ext IPs: 45.33.32.1, 45.33.32.2, 45.33.32.3 -> Target: ast_fw_01, ast_web_01, ast_web_02
    t6 = 18000 # 1:00 PM
    add_alert(t6, "Port Scan", "45.33.32.1", "10.0.0.1", "usr_015", "ast_fw_01", 40, 70, "SYN port scan across external gateway subnet 10.0.0.0/24")
    add_alert(t6 + 200, "DDoS", "45.33.32.2", "10.0.0.1", "usr_015", "ast_fw_01", 85, 90, "UDP flood attack generating 50 Gbps inbound traffic to edge firewall")
    add_alert(t6 + 400, "DDoS", "45.33.32.3", "10.0.2.5", "usr_015", "ast_web_01", 88, 92, "HTTP Slowloris flood consuming connection pool on web server 01")
    add_alert(t6 + 600, "Command and Control", "45.33.32.1", "10.0.2.6", "usr_015", "ast_web_02", 82, 75, "Inbound botnet orchestration packets targeting secondary web server")

    # --- CAMPAIGN 7: Account Takeover with Impossible Travel ---
    # User: usr_sales_vp (Emma VP)
    # London IP: 185.125.190.2, Tokyo IP: 103.22.200.5
    t7 = 21600 # 2:00 PM
    add_alert(t7, "Successful Login", "185.125.190.2", "10.0.0.50", "usr_sales_vp", "ast_cloud_01", 30, 95, "User login from London UK IP address")
    add_alert(t7 + 300, "Impossible Travel", "103.22.200.5", "10.0.0.50", "usr_sales_vp", "ast_cloud_01", 90, 95, "Impossible travel detected: Login from Tokyo JP 5 mins after login from London UK")
    add_alert(t7 + 600, "Successful Login", "103.22.200.5", "10.0.0.50", "usr_sales_vp", "ast_cloud_01", 75, 90, "Authenticated cloud portal access from high-risk geolocated IP")
    add_alert(t7 + 900, "New Admin Account", "103.22.200.5", "10.0.0.50", "usr_sales_vp", "ast_cloud_01", 92, 92, "Created backdoor cloud administrator account global_admin_temp")
    add_alert(t7 + 1200, "Unauthorized Access", "103.22.200.5", "10.0.1.60", "usr_sales_vp", "ast_db_cust", 94, 94, "Accessed executive customer contract database using newly assigned admin privileges")

    # --- CAMPAIGN 8: Insider Malicious Data Theft ---
    # User: usr_insider (Software Engineer resigning), Assets: ast_dev_db, ast_cloud_dev -> Ext Cloud IP: 52.84.12.19
    t8 = 25200 # 3:00 PM
    add_alert(t8, "Unauthorized Access", "192.168.1.110", "10.0.2.30", "usr_insider", "ast_dev_db", 65, 80, "Accessing production database backups from developer workstation")
    add_alert(t8 + 450, "Unusual File Access", "192.168.1.110", "10.0.3.15", "usr_insider", "ast_file_01", 78, 85, "Mass downloading of proprietary source code archives and patent drafts")
    add_alert(t8 + 900, "Command and Control", "192.168.1.110", "52.84.12.19", "usr_insider", "ast_wkst_06", 82, 85, "Direct connection to personal cloud storage provider MegaUpload")
    add_alert(t8 + 1400, "Data Exfiltration", "192.168.1.110", "52.84.12.19", "usr_insider", "ast_wkst_06", 95, 95, "Outbound file transfer exceeding 15 GB to personal cloud storage container")

    # --- BENIGN / UNRELATED NOISE ALERTS (115+ Alerts) ---
    noise_alert_types = [
        ("Failed Login", 15, 35, 60, 85, "Routine password mistype during login attempt"),
        ("Port Scan", 10, 30, 40, 70, "Routine internal network audit scan by IT security scanner"),
        ("Suspicious DNS", 20, 40, 50, 75, "DNS query to newly registered domain for marketing software"),
        ("Suspicious Email", 15, 35, 50, 70, "Marketing email flagged by spam filter due to tracking links"),
        ("Unauthorized Access", 25, 45, 45, 65, "User attempted to access restricted intranet page without permissions"),
        ("Successful Login", 5, 15, 90, 99, "Normal user login during standard business hours"),
        ("Suspicious PowerShell", 20, 40, 50, 75, "Automated software update script running via PowerShell"),
        ("Malware Detection", 30, 50, 85, 95, "Adware PUP detected and automatically quarantined by endpoint agent"),
        ("Command and Control", 25, 45, 40, 60, "False positive alert triggered by legitimate web analytics heartbeat"),
    ]

    all_user_ids = [u["user_id"] for u in users]
    all_asset_ids = [a["asset_id"] for a in assets]

    for i in range(115):
        # Time spread over 12 hours
        offset = random.randint(0, 43200)
        atype, min_sev, max_sev, min_conf, max_conf, template_desc = random.choice(noise_alert_types)
        
        src_ip = f"192.168.{random.randint(1, 5)}.{random.randint(2, 250)}" if random.random() > 0.15 else f"172.16.{random.randint(1, 10)}.{random.randint(2, 250)}"
        dst_ip = f"10.0.{random.randint(1, 3)}.{random.randint(2, 200)}"
        
        usr = random.choice(all_user_ids)
        ast = random.choice(all_asset_ids)
        
        sev = random.randint(min_sev, max_sev)
        conf = random.randint(min_conf, max_conf)
        
        add_alert(offset, atype, src_ip, dst_ip, usr, ast, sev, conf, f"{template_desc} ({ast})")

    # Sort alerts chronologically by timestamp
    alerts.sort(key=lambda x: x["timestamp"])

    # ---------------------------------------------------------
    # 4. EXPORT TO JSON AND CSV
    # ---------------------------------------------------------
    # Export Assets
    with open(os.path.join(output_dir, "assets.json"), "w", encoding="utf-8") as f:
        json.dump(assets, f, indent=2)
    with open(os.path.join(output_dir, "assets.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=assets[0].keys())
        writer.writeheader()
        writer.writerows(assets)

    # Export Users
    with open(os.path.join(output_dir, "users.json"), "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)
    with open(os.path.join(output_dir, "users.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=users[0].keys())
        writer.writeheader()
        writer.writerows(users)

    # Export Alerts
    with open(os.path.join(output_dir, "alerts.json"), "w", encoding="utf-8") as f:
        json.dump(alerts, f, indent=2)
    with open(os.path.join(output_dir, "alerts.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=alerts[0].keys())
        writer.writeheader()
        writer.writerows(alerts)

    # ---------------------------------------------------------
    # 5. VALIDATION & SUMMARY REPORT
    # ---------------------------------------------------------
    validate_dataset(assets, users, alerts)

def validate_dataset(assets, users, alerts):
    print("=" * 60)
    print("SENTINEL IQ — SYNTHETIC DATASET VALIDATION SUMMARY")
    print("=" * 60)

    # Count validations
    num_alerts = len(alerts)
    num_assets = len(assets)
    num_users = len(users)

    assert num_alerts >= 150, f"Expected >= 150 alerts, found {num_alerts}"
    assert num_assets >= 30, f"Expected >= 30 assets, found {num_assets}"
    assert num_users >= 50, f"Expected >= 50 users, found {num_users}"

    # Uniqueness checks
    asset_ids = {a["asset_id"] for a in assets}
    user_ids = {u["user_id"] for u in users}
    alert_ids = {alt["alert_id"] for alt in alerts}

    assert len(asset_ids) == num_assets, "Duplicate asset IDs detected!"
    assert len(user_ids) == num_users, "Duplicate user IDs detected!"
    assert len(alert_ids) == num_alerts, "Duplicate alert IDs detected!"

    # Foreign key integrity
    for alt in alerts:
        assert alt["user_id"] in user_ids, f"Alert {alt['alert_id']} references missing user {alt['user_id']}"
        assert alt["asset_id"] in asset_ids, f"Alert {alt['alert_id']} references missing asset {alt['asset_id']}"
        assert 0 <= alt["severity"] <= 100, f"Alert {alt['alert_id']} severity out of 0-100 bounds: {alt['severity']}"
        assert 0 <= alt["confidence"] <= 100, f"Alert {alt['alert_id']} confidence out of 0-100 bounds: {alt['confidence']}"

    # Categorize severities
    critical_alerts = [a for a in alerts if a["severity"] >= 90]
    high_alerts = [a for a in alerts if 70 <= a["severity"] < 90]
    medium_alerts = [a for a in alerts if 40 <= a["severity"] < 70]
    low_alerts = [a for a in alerts if a["severity"] < 40]

    print(f"Total alerts: {num_alerts}")
    print(f"Total assets: {num_assets}")
    print(f"Total users: {num_users}")
    print(f"Attack campaigns embedded: 8 (45 correlated campaign alerts)")
    print(f"Benign/unrelated noise alerts: {num_alerts - 45}")
    print(f"Critical alerts (severity >= 90): {len(critical_alerts)}")
    print(f"High alerts (severity 70-89): {len(high_alerts)}")
    print(f"Medium alerts (severity 40-69): {len(medium_alerts)}")
    print(f"Low alerts (severity < 40): {len(low_alerts)}")
    print("-" * 60)
    print("SUCCESS: All dataset integrity validations PASSED successfully!")
    print("=" * 60)

if __name__ == "__main__":
    generate_dataset(seed=42, output_dir="data")
