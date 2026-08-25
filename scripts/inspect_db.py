import sqlite3

conn = sqlite3.connect('data-pipeline/verdict_pipeline.db')
c = conn.cursor()

c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in c.fetchall() if not r[0].startswith('sqlite_')]
print('Tables in verdict_pipeline.db:', tables)

for t in sorted(tables):
    c.execute(f"SELECT COUNT(*) FROM {t}")
    print(f" - {t}: {c.fetchone()[0]} rows")

c.execute("PRAGMA table_info(politicians)")
cols = [(r[1], r[2]) for r in c.fetchall()]
print('\nPoliticians columns:')
for col in cols:
    print(f"  {col[0]} ({col[1]})")
