# Español 2027

A 294-day Spanish course for listening and speaking, from 16 November 2026 to 5 September 2027. It assumes 30 minutes on weekdays, one to two hours on each weekend day, and 10 new words a day.

Open the course: https://dimausa2006-pixel.github.io/spanish-course/

The page shows the lesson for the current day: 10 words, what to listen to, and a phrase to say out loud.

## How it is built

| File | Language | What it does |
|:--|:--|:--|
| `index.html` | HTML | The page structure and the course text |
| `styles.css` | CSS | Layout and colours, light and dark |
| `app.js` | JavaScript | Reads `words.txt`, works out today's lesson from the date, and draws it |
| `course.py` | Python | Checks the word list and exports it for Anki |
| `words.txt` | plain text | The course data: 42 weeks, 2,940 words, 210 phrases, 42 speaking tasks |
| `anki.tsv` | tab-separated | The word list ready to import into Anki, made by `course.py` |

There is no build step. The page loads `words.txt` in the browser, so editing that one file changes the course.

## Format of words.txt

```
@1|First words               week number and topic
+Me llamo...=My name is...   a phrase (five per week, one per weekday)
!Introduce yourself...       the speaking task for the weekend
hola=hello;adiós=goodbye;... one line per day, 10 words each, 7 lines per week
```

## Commands

```bash
python course.py check    # 42 weeks, 7 days, 10 words a day, no duplicates
python course.py anki     # writes anki.tsv
python course.py stats    # lists the weeks and topics
```

To try the page on your own computer, run `python -m http.server` in this folder and open http://localhost:8000. Opening `index.html` directly does not work, because browsers block a page from reading a local file.

## Anki

Import `anki.tsv` with File, Import. The separator is Tab. Field 1 is the front, field 2 the back, field 3 the tag (the week number).

## Notes

The list uses the Spanish of Spain. The translations have not been reviewed by a native speaker.
