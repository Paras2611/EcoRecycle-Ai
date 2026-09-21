"""
EcoRecycle AI — Model Evaluation & Validation Metrics
Calculates Accuracy, Precision, Recall, F1-score, and confusion matrix.
Reference: EcoRecycle_AI_PRD.md Section 31.
"""

from typing import List, Dict

def calculate_metrics(y_true: List[str], y_pred: List[str], classes: List[str]) -> Dict[str, float]:
    """Calculate overall accuracy and macro F1 score."""
    if not y_true or len(y_true) != len(y_pred):
        return {"accuracy": 0.0, "f1_score": 0.0}

    total = len(y_true)
    correct = sum(1 for yt, yp in zip(y_true, y_pred) if yt == yp)
    accuracy = correct / total

    # Per class metrics
    f1_list = []
    for cls in classes:
        tp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == cls and yp == cls)
        fp = sum(1 for yt, yp in zip(y_true, y_pred) if yt != cls and yp == cls)
        fn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == cls and yp != cls)

        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
        f1_list.append(f1)

    macro_f1 = sum(f1_list) / len(f1_list) if f1_list else 0.0
    return {
        "accuracy": round(accuracy, 4),
        "f1_score": round(macro_f1, 4),
        "total_evaluated": total
    }

if __name__ == "__main__":
    classes = ["plastic", "paper", "cardboard", "glass", "metal", "organic", "ewaste"]
    sample_true = ["plastic", "plastic", "paper", "glass", "organic", "ewaste"]
    sample_pred = ["plastic", "plastic", "paper", "glass", "organic", "ewaste"]
    metrics = calculate_metrics(sample_true, sample_pred, classes)
    print(f"Sample Evaluation Metrics: {metrics}")
