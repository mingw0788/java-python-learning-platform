"""Local-only educational collector; standard library, no external website requests."""
import argparse
import json
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import urlopen
from urllib.error import URLError


class CourseParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.current = None
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        if tag == "article":
            self.current = {"id": dict(attrs).get("data-id", ""), "title": ""}
        if tag == "h2" and self.current is not None:
            self.in_title = True

    def handle_data(self, data):
        if self.in_title and self.current is not None:
            self.current["title"] += data

    def handle_endtag(self, tag):
        if tag == "h2":
            self.in_title = False
        if tag == "article" and self.current is not None:
            self.current["title"] = self.current["title"].strip()
            self.rows.append(self.current)
            self.current = None


def collect(base, output):
    parsed = urlparse(base)
    if parsed.scheme != "http" or parsed.hostname not in {"localhost", "127.0.0.1"}:
        raise ValueError("本练习仅允许本地 HTTP 服务")
    records, errors, visited = {}, [], []
    for page in range(1, 4):
        url = base.rstrip("/") + "/page{}.html".format(page)
        try:
            with urlopen(url, timeout=5) as response:
                if urlparse(response.geturl()).hostname not in {"localhost", "127.0.0.1"}:
                    raise ValueError("来源发生改变")
                parser = CourseParser()
                parser.feed(response.read().decode("utf-8"))
            visited.append(page)
            if not parser.rows:
                break
            for row in parser.rows:
                if not row["id"] or not row["title"]:
                    errors.append({"url": url, "reason": "缺少 id 或 title"})
                    continue
                records[row["id"]] = dict(row, source_url=url)
        except (URLError, OSError, ValueError) as exc:
            errors.append({"url": url, "reason": str(exc)})
            break
        time.sleep(0.2)
    result = {"items": list(records.values()), "errors": errors,
              "visited_pages": visited, "complete": not errors}
    Path(output).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="采集本地练习页并去重")
    parser.add_argument("--base", default="http://127.0.0.1:8000")
    parser.add_argument("--output", default="result.json")
    args = parser.parse_args()
    result = collect(args.base, args.output)
    print("唯一记录={} 完整={}".format(len(result["items"]), result["complete"]))
    if result["errors"]:
        raise SystemExit(1)
