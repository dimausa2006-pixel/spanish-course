"""Read words.txt, check it, and export it for Anki.

Usage:
    python course.py check    # verify the list: 42 weeks, 7 days, 10 words, no duplicates
    python course.py anki     # write anki.tsv (Spanish, English, week tag) for Anki import
    python course.py stats    # print the size of the course
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WEEKS, DAYS, WORDS, PHRASES = 42, 7, 10, 5


def load():
    """Parse words.txt into a list of weeks."""
    weeks = []
    for line in (ROOT / "words.txt").read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        mark = line[0]
        if mark == "@":
            number, topic = line[1:].split("|", 1)
            weeks.append({"number": int(number), "topic": topic.strip(), "phrases": [], "task": "", "days": []})
        elif mark == "+":
            es, en = line[1:].split("=", 1)
            weeks[-1]["phrases"].append((es.strip(), en.strip()))
        elif mark == "!":
            weeks[-1]["task"] = line[1:].strip()
        else:
            pairs = [pair.split("=", 1) for pair in line.split(";")]
            weeks[-1]["days"].append([(es.strip(), en.strip()) for es, en in pairs])
    return weeks


def check(weeks):
    """Return a list of problems. An empty list means the file is fine."""
    problems = []
    if len(weeks) != WEEKS:
        problems.append(f"expected {WEEKS} weeks, found {len(weeks)}")
    seen = {}
    for week in weeks:
        n = week["number"]
        if len(week["days"]) != DAYS:
            problems.append(f"week {n}: {len(week['days'])} days")
        if len(week["phrases"]) != PHRASES:
            problems.append(f"week {n}: {len(week['phrases'])} phrases")
        if not week["task"]:
            problems.append(f"week {n}: no speaking task")
        for d, day in enumerate(week["days"], start=1):
            if len(day) != WORDS:
                problems.append(f"week {n} day {d}: {len(day)} words")
            for es, en in day:
                if not es or not en:
                    problems.append(f"week {n} day {d}: empty side in '{es}={en}'")
                key = es.lower()
                if key in seen:
                    problems.append(f"duplicate '{es}': {seen[key]} and week {n} day {d}")
                seen[key] = f"week {n} day {d}"
    return problems


def write_anki(weeks):
    """Write one tab-separated line per word: Spanish, English, tag."""
    lines = [
        f"{es}\t{en}\tweek{week['number']:02d}"
        for week in weeks for day in week["days"] for es, en in day
    ]
    out = ROOT / "anki.tsv"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
    return out, len(lines)


def main():
    command = sys.argv[1] if len(sys.argv) > 1 else "check"
    weeks = load()
    if command == "check":
        problems = check(weeks)
        for problem in problems:
            print("PROBLEM:", problem)
        if not problems:
            print(f"OK: {len(weeks)} weeks, {sum(len(d) for w in weeks for d in w['days'])} words, no duplicates")
        return 1 if problems else 0
    if command == "anki":
        out, count = write_anki(weeks)
        print(f"wrote {count} cards to {out.name}")
        return 0
    if command == "stats":
        words = sum(len(d) for w in weeks for d in w["days"])
        print(f"{len(weeks)} weeks, {words} words, {sum(len(w['phrases']) for w in weeks)} phrases")
        for week in weeks:
            print(f"  week {week['number']:2d}: {week['topic']}")
        return 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main())
