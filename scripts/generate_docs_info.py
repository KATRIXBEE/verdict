import sqlite3
import json

conn = sqlite3.connect('data-pipeline/verdict_pipeline.db')
c = conn.cursor()

c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in c.fetchall() if not r[0].startswith('sqlite_')]

for t in sorted(tables):
    count = conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
    print(f"### `{t}` ({count} rows)")
    cols = conn.execute(f"PRAGMA table_info({t})").fetchall()
    print("| Column | Type | Nullable | Primary Key |")
    print("|---|---|---|---|")
    for col in cols:
        print(f"| `{col[1]}` | {col[2]} | {'No' if col[3] else 'Yes'} | {'Yes' if col[5] else 'No'} |")
    print()
