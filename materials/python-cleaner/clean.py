"""CSV validation reference. Standard library only, compatible with Python 3.9+."""
import argparse
import csv
from pathlib import Path


def clean(source, output):
    source, output = Path(source), Path(output)
    valid, errors, seen = [], [], set()
    with source.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if not {"id", "score"}.issubset(reader.fieldnames or []):
            raise ValueError("缺少 id 或 score 表头")
        for number, row in enumerate(reader, 1):
            student = (row.get("id") or "").strip()
            reason = ""
            score = None
            if not student:
                reason = "id 为空"
            elif student in seen:
                reason = "重复 id"
            else:
                try:
                    score = int(row.get("score") or "")
                    if not 0 <= score <= 100:
                        reason = "score 不在 0-100"
                except ValueError:
                    reason = "score 格式错误"
            if reason:
                errors.append({"record": number, "id": student, "reason": reason})
            else:
                seen.add(student)
                valid.append({"id": student, "score": score})
    output.mkdir(parents=True, exist_ok=True)
    for name, fields, rows in [("valid.csv", ["id", "score"], valid),
                               ("errors.csv", ["record", "id", "reason"], errors)]:
        target = output / name
        if source.resolve() == target.resolve():
            raise ValueError("输出不能覆盖输入文件")
        temporary = target.with_suffix(".tmp")
        with temporary.open("w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)
        temporary.replace(target)
    return len(valid), len(errors)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="校验成绩 CSV，分别导出有效和错误记录")
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    try:
        ok, bad = clean(args.input, args.output)
        print("有效={} 错误={}".format(ok, bad))
    except (OSError, ValueError) as exc:
        parser.exit(2, "失败：{}\n".format(exc))
