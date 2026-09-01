import os
import json
import unittest

from backend.priority.config import FLOAT_TOLERANCE
from backend.priority.tiebreaker import are_scores_equal, compare_incidents, assign_tie_groups
from backend.priority.queue import build_priority_queue

class TestStep6PriorityQueue(unittest.TestCase):

    def setUp(self):
        self.inc_high = {
            "incident_id": "INC-0001",
            "incident_type": "Data Exfiltration",
            "risk_score": 90.0,
            "risk_level": "CRITICAL",
            "maximum_severity": 95,
            "incident_asset_importance": 90.0,
            "incident_business_impact": 85.0,
            "incident_data_sensitivity": 80.0,
            "incident_confidence": 90.0,
            "normalized_affected_users": 10.0,
            "first_seen": "2026-09-01T10:00:00+00:00",
            "alert_count": 5,
            "affected_users": 1,
            "dominant_factors": ["severity", "asset_importance", "business_impact"]
        }
        self.inc_low = {
            "incident_id": "INC-0002",
            "incident_type": "Failed Login Event",
            "risk_score": 30.0,
            "risk_level": "MEDIUM",
            "maximum_severity": 30,
            "incident_asset_importance": 20.0,
            "incident_business_impact": 20.0,
            "incident_data_sensitivity": 10.0,
            "incident_confidence": 70.0,
            "normalized_affected_users": 0.0,
            "first_seen": "2026-09-01T12:00:00+00:00",
            "alert_count": 1,
            "affected_users": 1,
            "dominant_factors": ["attack_confidence", "severity", "asset_importance"]
        }

    # 1. Highest risk score ranks first
    def test_highest_score_ranks_first(self):
        queue, _ = build_priority_queue([self.inc_low, self.inc_high])
        self.assertEqual(queue[0]["incident_id"], "INC-0001")
        self.assertEqual(queue[0]["priority_rank"], 1)

    # 2. Lowest risk score ranks last
    def test_lowest_score_ranks_last(self):
        queue, _ = build_priority_queue([self.inc_low, self.inc_high])
        self.assertEqual(queue[-1]["incident_id"], "INC-0002")
        self.assertEqual(queue[-1]["priority_rank"], 2)

    # 3. Descending score ordering
    def test_descending_ordering(self):
        inc_mid = dict(self.inc_high)
        inc_mid["incident_id"] = "INC-0003"
        inc_mid["risk_score"] = 60.0
        inc_mid["risk_level"] = "HIGH"

        queue, _ = build_priority_queue([self.inc_low, self.inc_high, inc_mid])
        scores = [q["risk_score"] for q in queue]
        self.assertEqual(scores, [90.0, 60.0, 30.0])

    # 4. Exact score tie
    def test_exact_score_tie(self):
        inc_tied = dict(self.inc_high)
        inc_tied["incident_id"] = "INC-0004"
        inc_tied["maximum_severity"] = 99 # Higher severity breaks tie

        queue, _ = build_priority_queue([self.inc_high, inc_tied])
        self.assertEqual(queue[0]["incident_id"], "INC-0004")

    # 5. Floating-point tie tolerance
    def test_floating_point_tolerance(self):
        inc1 = dict(self.inc_high)
        inc1["incident_id"] = "INC-0001"
        inc1["risk_score"] = 85.0000001

        inc2 = dict(self.inc_high)
        inc2["incident_id"] = "INC-0002"
        inc2["risk_score"] = 85.0000000
        inc2["maximum_severity"] = 99

        self.assertTrue(are_scores_equal(inc1["risk_score"], inc2["risk_score"], tolerance=1e-6))
        queue, _ = build_priority_queue([inc1, inc2], tolerance=1e-6)
        self.assertEqual(queue[0]["incident_id"], "INC-0002") # inc2 wins on severity tie-breaker

    # 6. Severity tie-breaker
    def test_severity_tie_breaker(self):
        inc1 = dict(self.inc_high)
        inc1["incident_id"] = "INC-0001"
        inc1["maximum_severity"] = 80

        inc2 = dict(self.inc_high)
        inc2["incident_id"] = "INC-0002"
        inc2["maximum_severity"] = 90

        queue, _ = build_priority_queue([inc1, inc2])
        self.assertEqual(queue[0]["incident_id"], "INC-0002")

    # 7. Asset importance tie-breaker
    def test_asset_importance_tie_breaker(self):
        inc1 = dict(self.inc_high)
        inc1["incident_id"] = "INC-0001"
        inc1["incident_asset_importance"] = 70.0

        inc2 = dict(self.inc_high)
        inc2["incident_id"] = "INC-0002"
        inc2["incident_asset_importance"] = 95.0

        queue, _ = build_priority_queue([inc1, inc2])
        self.assertEqual(queue[0]["incident_id"], "INC-0002")

    # 8. Business impact tie-breaker
    def test_business_impact_tie_breaker(self):
        inc1 = dict(self.inc_high)
        inc1["incident_id"] = "INC-0001"
        inc1["incident_business_impact"] = 50.0

        inc2 = dict(self.inc_high)
        inc2["incident_id"] = "INC-0002"
        inc2["incident_business_impact"] = 90.0

        queue, _ = build_priority_queue([inc1, inc2])
        self.assertEqual(queue[0]["incident_id"], "INC-0002")

    # 9. Data sensitivity tie-breaker
    def test_data_sensitivity_tie_breaker(self):
        inc1 = dict(self.inc_high)
        inc1["incident_id"] = "INC-0001"
        inc1["incident_data_sensitivity"] = 40.0

        inc2 = dict(self.inc_high)
        inc2["incident_id"] = "INC-0002"
        inc2["incident_data_sensitivity"] = 90.0

        queue, _ = build_priority_queue([inc1, inc2])
        self.assertEqual(queue[0]["incident_id"], "INC-0002")

    # 10. Attack confidence tie-breaker
    def test_attack_confidence_tie_breaker(self):
        inc1 = dict(self.inc_high)
        inc1["incident_id"] = "INC-0001"
        inc1["incident_confidence"] = 60.0

        inc2 = dict(self.inc_high)
        inc2["incident_id"] = "INC-0002"
        inc2["incident_confidence"] = 95.0

        queue, _ = build_priority_queue([inc1, inc2])
        self.assertEqual(queue[0]["incident_id"], "INC-0002")

    # 11. Affected-user tie-breaker
    def test_affected_user_tie_breaker(self):
        inc1 = dict(self.inc_high)
        inc1["incident_id"] = "INC-0001"
        inc1["normalized_affected_users"] = 10.0

        inc2 = dict(self.inc_high)
        inc2["incident_id"] = "INC-0002"
        inc2["normalized_affected_users"] = 50.0

        queue, _ = build_priority_queue([inc1, inc2])
        self.assertEqual(queue[0]["incident_id"], "INC-0002")

    # 12. first_seen tie-breaker
    def test_first_seen_tie_breaker(self):
        inc1 = dict(self.inc_high)
        inc1["incident_id"] = "INC-0001"
        inc1["first_seen"] = "2026-09-01T12:00:00+00:00"

        inc2 = dict(self.inc_high)
        inc2["incident_id"] = "INC-0002"
        inc2["first_seen"] = "2026-09-01T08:00:00+00:00" # Earlier first_seen ranks higher

        queue, _ = build_priority_queue([inc1, inc2])
        self.assertEqual(queue[0]["incident_id"], "INC-0002")

    # 13. incident_id final tie-breaker
    def test_incident_id_final_tie_breaker(self):
        inc1 = dict(self.inc_high)
        inc1["incident_id"] = "INC-0005"

        inc2 = dict(self.inc_high)
        inc2["incident_id"] = "INC-0002" # INC-0002 is lexicographically smaller than INC-0005

        queue, _ = build_priority_queue([inc1, inc2])
        self.assertEqual(queue[0]["incident_id"], "INC-0002")

    # 14. Deterministic ordering
    def test_deterministic_ordering(self):
        incidents = [self.inc_high, self.inc_low]
        q1, _ = build_priority_queue(incidents)
        q2, _ = build_priority_queue(incidents)
        self.assertEqual(q1, q2)

    # 15. Unique ranks
    def test_unique_consecutive_ranks(self):
        queue, _ = build_priority_queue([self.inc_high, self.inc_low])
        ranks = [q["priority_rank"] for q in queue]
        self.assertEqual(ranks, [1, 2])

    # 16. Complete queue coverage
    def test_complete_queue_coverage(self):
        queue, summary = build_priority_queue([self.inc_high, self.inc_low])
        self.assertEqual(len(queue), 2)
        self.assertEqual(summary["total_incidents"], 2)

    # 17. No duplicate incidents
    def test_no_duplicate_incidents(self):
        queue, _ = build_priority_queue([self.inc_high, self.inc_low])
        ids = [q["incident_id"] for q in queue]
        self.assertEqual(len(ids), len(set(ids)))

    # 18. Ranking reason correctness
    def test_ranking_reason_correctness(self):
        queue, _ = build_priority_queue([self.inc_high, self.inc_low])
        r1 = queue[0]["ranking_reason"]
        self.assertEqual(r1["primary"], "Higher risk score")
        self.assertEqual(r1["compared_with_next"]["incident_id"], "INC-0002")
        self.assertEqual(r1["compared_with_next"]["score_difference"], 60.0)

    # 19. Adjacent comparison correctness for tied scores
    def test_adjacent_comparison_tied_scores(self):
        inc1 = dict(self.inc_high)
        inc1["incident_id"] = "INC-0001"
        inc1["maximum_severity"] = 80

        inc2 = dict(self.inc_high)
        inc2["incident_id"] = "INC-0002"
        inc2["maximum_severity"] = 90

        queue, _ = build_priority_queue([inc1, inc2])
        r1 = queue[0]["ranking_reason"]
        self.assertEqual(r1["primary"], "Risk scores are tied")
        self.assertIn("maximum severity", r1["tie_breaker"].lower())

    # 20. Empty input
    def test_empty_input(self):
        queue, summary = build_priority_queue([])
        self.assertEqual(len(queue), 0)
        self.assertEqual(summary["total_incidents"], 0)

    # 21. Single incident
    def test_single_incident(self):
        queue, summary = build_priority_queue([self.inc_high])
        self.assertEqual(len(queue), 1)
        self.assertEqual(queue[0]["priority_rank"], 1)
        self.assertIsNone(queue[0]["ranking_reason"]["compared_with_next"])

    # 22. All incidents tied
    def test_all_incidents_tied(self):
        inc1 = dict(self.inc_high)
        inc1["incident_id"] = "INC-0001"
        inc2 = dict(self.inc_high)
        inc2["incident_id"] = "INC-0002"
        inc3 = dict(self.inc_high)
        inc3["incident_id"] = "INC-0003"

        queue, summary = build_priority_queue([inc1, inc2, inc3])
        self.assertEqual(len(queue), 3)
        self.assertEqual(summary["tie_group_count"], 1)
        self.assertIsNotNone(queue[0]["tie_group_id"])

    # 23. Priority band matching risk level
    def test_priority_band_matches_risk_level(self):
        queue, _ = build_priority_queue([self.inc_high])
        self.assertEqual(queue[0]["priority_band"], "CRITICAL")
        self.assertEqual(queue[0]["risk_level"], "CRITICAL")

if __name__ == "__main__":
    unittest.main()
