import os
import json
from backend.reporting.generator import generate_all_reports

def process_reports(
    data_dir: str = "data",
    output_dir: str = "data/reports"
):
    print("=" * 60)
    print("SENTINEL IQ — STEP 8 REPORT GENERATOR EXECUTION")
    print("=" * 60)

    results = generate_all_reports(data_dir=data_dir, output_dir=output_dir)

    print(f"Processed {results['total_incidents_processed']} incidents from priority queue.")
    print(f"Exported {results['total_reports_generated']} JSON reports to {results['json_dir']}/")
    print(f"Exported {results['total_reports_generated']} Markdown reports to {results['md_dir']}/")
    print(f"Exported report index to {results['index_path']}")

    # Read top 1 report for preview
    top1_path = os.path.join(output_dir, "INC-0021.json")
    if not os.path.exists(top1_path):
        # Fallback to first available report in index
        index_path = results["index_path"]
        with open(index_path, "r", encoding="utf-8") as f:
            idx = json.load(f)
            top1_path = os.path.join(data_dir, "..", idx[0]["report_path_json"])

    if os.path.exists(top1_path):
        with open(top1_path, "r", encoding="utf-8") as f:
            top_report = json.load(f)

        inc = top_report["incident"]
        print("\nTop Priority Incident Report Preview (#1 Rank):")
        print(f"  - Incident ID: {inc['incident_id']}")
        print(f"  - Type: {inc['incident_type']}")
        print(f"  - Risk Score: {inc['risk_score']} [{inc['risk_level']}]")
        print(f"  - Executive Summary: {top_report['executive_summary'][:150]}...")
        print(f"  - Recommendations Count: {len(top_report['recommendations'])}")

    print("=" * 60)
    return results["total_reports_generated"]

if __name__ == "__main__":
    process_reports()
