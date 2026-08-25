import sqlite3

def upgrade_schema():
    conn = sqlite3.connect('data-pipeline/verdict_pipeline.db')
    c = conn.cursor()

    columns_to_add = [
        ("attendance_percent", "NUMERIC(5, 2)"),
        ("questions_asked", "INTEGER"),
        ("debates_count", "INTEGER"),
        ("criminal_case_count", "INTEGER"),
        ("worst_case_severity", "VARCHAR(50)"),
        ("party_switch_count", "INTEGER"),
        ("asset_growth_percent", "NUMERIC(6, 2)"),
        ("mplads_allocated", "NUMERIC(15, 2)"),
        ("mplads_utilised", "NUMERIC(15, 2)"),
        ("mplads_utilisation_percent", "NUMERIC(5, 2)"),
    ]

    c.execute("PRAGMA table_info(politicians)")
    existing_cols = {r[1] for r in c.fetchall()}

    for col_name, col_type in columns_to_add:
        if col_name not in existing_cols:
            c.execute(f"ALTER TABLE politicians ADD COLUMN {col_name} {col_type}")
            print(f"Added column: {col_name} ({col_type})")
        else:
            print(f"Column already exists: {col_name}")

    conn.commit()
    conn.close()
    print("Schema upgrade complete.")

if __name__ == "__main__":
    upgrade_schema()
