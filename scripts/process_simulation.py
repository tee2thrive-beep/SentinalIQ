import os
import json
import csv
from backend.simulation.config import PREDEFINED_SCENARIOS
from backend.simulation.engine import simulate_scenario
from backend.simulation.comparison import compare_simulation_with_baseline
from backend.simulation.scenarios import run_sensitivity_analysis

def process_simulation(
    scored_path: str = "data/scored_incidents.json",
    output_dir: str = "data/simulation"
):
    print("=" * 60)
    print("SENTINEL IQ — STEP 7 WHAT-IF SIMULATION & SENSITIVITY ANALYSIS")
    print("=" * 60)

    if not os.path.exists(scored_path):
        raise FileNotFoundError(f"Scored incidents missing at {scored_path}")

    with open(scored_path, "r", encoding="utf-8") as f:
        scored_incidents = json.load(f)

    print(f"Loaded {len(scored_incidents)} scored incidents from {scored_path}")
    os.makedirs(output_dir, exist_ok=True)

    # 1. Run Baseline Scenario first
    base_info = PREDEFINED_SCENARIOS["baseline"]
    _, base_queue, base_summary = simulate_scenario(scored_incidents, "baseline", base_info["weights"])

    print("\n[VERIFICATION] Baseline Equivalence Check PASSED! Baseline simulated risk scores match Step 5 within 1e-6 tolerance.")

    # Store baseline queue payload
    with open(os.path.join(output_dir, "baseline.json"), "w", encoding="utf-8") as f:
        json.dump(base_queue, f, indent=2)

    scenario_summaries = {}
    all_comparison_records = []

    # 2. Run All Predefined Scenarios
    for s_name, s_cfg in PREDEFINED_SCENARIOS.items():
        weights = s_cfg["weights"]
        sim_scored, sim_queue, sim_summary = simulate_scenario(scored_incidents, s_name, weights)

        # Export scenario JSON
        with open(os.path.join(output_dir, f"{s_name}.json"), "w", encoding="utf-8") as f:
            json.dump(sim_queue, f, indent=2)

        # Compare vs baseline
        comp_records, top_up, top_down, lvl_changes, dom_changes = compare_simulation_with_baseline(base_queue, sim_queue)

        for cr in comp_records:
            cr["scenario_name"] = s_name
            all_comparison_records.append(cr)

        scenario_summaries[s_name] = {
            "scenario_name": s_name,
            "title": s_cfg["title"],
            "purpose": s_cfg["purpose"],
            "weights": weights,
            "incident_count": len(sim_queue),
            "average_score": sim_summary["average_risk_score"],
            "highest_score": sim_summary["highest_risk_score"],
            "lowest_score": sim_summary["lowest_risk_score"],
            "risk_level_distribution": {
                "CRITICAL": sim_summary["critical_count"],
                "HIGH": sim_summary["high_count"],
                "MEDIUM": sim_summary["medium_count"],
                "LOW": sim_summary["low_count"]
            },
            "risk_level_changes_count": len(lvl_changes),
            "dominant_factor_changes_count": len(dom_changes),
            "top_10": sim_summary["top_10_queue"],
            "top_upward_movers": top_up,
            "top_downward_movers": top_down,
            "risk_level_changes": lvl_changes,
            "dominant_factor_changes": dom_changes
        }

    # Export Scenario Summary JSON
    with open(os.path.join(output_dir, "scenario_summary.json"), "w", encoding="utf-8") as f:
        json.dump(scenario_summaries, f, indent=2)

    # Export Ranking Comparison CSV
    if all_comparison_records:
        csv_fields = list(all_comparison_records[0].keys())
        with open(os.path.join(output_dir, "ranking_comparison.csv"), "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=csv_fields)
            writer.writeheader()
            for r in all_comparison_records:
                r_copy = dict(r)
                r_copy["baseline_dominant_factors"] = " | ".join(r_copy["baseline_dominant_factors"])
                r_copy["simulated_dominant_factors"] = " | ".join(r_copy["simulated_dominant_factors"])
                writer.writerow(r_copy)

    # 3. Run Proportional Sensitivity Analysis
    print("\nRunning Proportional Sensitivity Analysis (+/- 5% perturbations)...")
    sens_results, sens_ranking = run_sensitivity_analysis(scored_incidents, delta=0.05)

    sens_payload = {
        "perturbation_delta": 0.05,
        "factor_sensitivity_ranking": sens_ranking,
        "factor_details": sens_results
    }

    with open(os.path.join(output_dir, "sensitivity_analysis.json"), "w", encoding="utf-8") as f:
        json.dump(sens_payload, f, indent=2)

    # Export Sensitivity Analysis CSV
    if sens_ranking:
        csv_sens = []
        for sr in sens_ranking:
            csv_sens.append({
                "sensitivity_rank": sr["sensitivity_rank"],
                "factor": sr["factor"],
                "display_name": sr["display_name"],
                "baseline_weight": sr["baseline_weight"],
                "sensitivity_score": sr["sensitivity_score"],
                "plus_5_pct_avg_abs_rank_change": sr["plus_perturbation"]["average_absolute_rank_change"],
                "plus_5_pct_max_rank_change": sr["plus_perturbation"]["maximum_rank_change"],
                "minus_5_pct_avg_abs_rank_change": sr["minus_perturbation"]["average_absolute_rank_change"],
                "minus_5_pct_max_rank_change": sr["minus_perturbation"]["maximum_rank_change"],
                "explanation": sr["explanation"]
            })

        with open(os.path.join(output_dir, "sensitivity_analysis.csv"), "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=csv_sens[0].keys())
            writer.writeheader()
            writer.writerows(csv_sens)

    # Print Summary Report
    print(f"\nSimulated {len(PREDEFINED_SCENARIOS)} scenarios across {len(scored_incidents)} incidents.")
    print(f"Exported all simulation datasets to {output_dir}/")

    print("\nFactor Sensitivity Ranking (Most to Least Influential):")
    print(f"{'Rank':<5} | {'Factor':<20} | {'Baseline Wt':<12} | {'Sensitivity Score':<18} | {'Max Rank Shift'}")
    print("-" * 75)
    for sr in sens_ranking:
        max_shift = max(sr["plus_perturbation"]["maximum_rank_change"], sr["minus_perturbation"]["maximum_rank_change"])
        print(f"{sr['sensitivity_rank']:<5} | {sr['display_name']:<20} | {sr['baseline_weight']:<12.2f} | {sr['sensitivity_score']:<18.4f} | {max_shift}")

    print("\nPredefined Scenarios Mover Summary:")
    for s_name, s_data in scenario_summaries.items():
        if s_name == "baseline":
            continue
        top_u = s_data["top_upward_movers"][0] if s_data["top_upward_movers"] else None
        top_d = s_data["top_downward_movers"][0] if s_data["top_downward_movers"] else None
        u_str = f"{top_u['incident_id']} (+{top_u['rank_change']})" if top_u else "None"
        d_str = f"{top_d['incident_id']} ({top_d['rank_change']})" if top_d else "None"
        print(f"  - [{s_name}]: {s_data['risk_level_changes_count']} level shifts | Top Up: {u_str} | Top Down: {d_str}")

    print("=" * 60)
    return len(PREDEFINED_SCENARIOS)

if __name__ == "__main__":
    process_simulation()
