#!/usr/bin/env python3
"""
Ground Truth Daily News Ingestion Engine
Fetches investigative civic reports from verified Indian journalism RSS feeds.
"""

import os
import sys
import json
import datetime
import urllib.request
import urllib.error
import feedparser
from dateutil import parser as date_parser

SOURCES = {
    "The Reporters' Collective": {
        "url": "https://www.reporterscollective.in/feed",
        "category": "Investigative",
        "badge_color": "#FF4545",
        "credibility": "High"
    },
    "Indian Express": {
        "url": "https://indianexpress.com/section/india/rss/",
        "category": "National",
        "badge_color": "#003580",
        "credibility": "High"
    },
    "The Hindu": {
        "url": "https://www.thehindu.com/news/national/feeder/default.rss",
        "category": "National",
        "badge_color": "#1a1a6e",
        "credibility": "High"
    },
    "The Wire": {
        "url": "https://thewire.in/category/politics/feed/",
        "category": "Politics",
        "badge_color": "#8B0000",
        "credibility": "High"
    },
    "Scroll.in": {
        "url": "https://scroll.in/rss/india",
        "category": "India",
        "badge_color": "#333333",
        "credibility": "High"
    },
    "NDTV India": {
        "url": "https://feeds.feedburner.com/ndtvnews-india-news",
        "category": "National",
        "badge_color": "#E50914",
        "credibility": "High"
    },
}

CIVIC_KEYWORDS = [
    'corruption', 'scam', 'fraud', 'arrested', 'crore',
    'minister', 'politician', 'parliament', 'government',
    'environment', 'pollution', 'factory', 'industrial',
    'farmer', 'tribal', 'adivasi', 'forest', 'RTI',
    'whistleblower', 'investigation', 'expose', 'alleged',
    'bribery', 'tender', 'contractor', 'scheme', 'diversion',
    'CBI', 'ED', 'income tax', 'raid', 'probe',
    'Supreme Court', 'High Court', 'PIL', 'conviction',
    'FIR', 'chargesheet', 'custody', 'bail',
    'land grab', 'mine', 'encroachment', 'displaced',
    'lok sabha', 'rajya sabha', 'eci', 'election', 'affidavit'
]

def clean_html(text):
    if not text:
        return ""
    import re
    cleaned = re.sub(r'<[^>]+>', '', text)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def get_supabase_credentials():
    env_file = os.path.join(os.path.dirname(__file__), '..', '.env.local')
    url, key = None, None
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('NEXT_PUBLIC_SUPABASE_URL='):
                    url = line.split('=', 1)[1].strip().strip('"').strip("'")
                elif line.startswith('SUPABASE_SERVICE_ROLE_KEY='):
                    key = line.split('=', 1)[1].strip().strip('"').strip("'")
    return url, key

def main():
    print("=" * 60)
    print("VERDICT Ground Truth: Real RSS Ingestion Engine")
    print("=" * 60)

    now = datetime.datetime.now(datetime.timezone.utc)
    seven_days_ago = now - datetime.timedelta(days=7)

    all_articles = []
    seen_urls = set()

    # Load existing local articles if present to preserve history
    local_data_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'ground-truth-news.json')
    if os.path.exists(local_data_path):
        try:
            with open(local_data_path, 'r', encoding='utf-8') as f:
                existing = json.load(f)
                for a in existing:
                    url = a.get("source_url") or a.get("url")
                    if url:
                        seen_urls.add(url)
                        all_articles.append(a)
            print(f"Loaded {len(all_articles)} existing historical articles from local cache.")
        except Exception as e:
            print(f"[!] Warning reading existing cache: {e}")

    newly_inserted = []

    for source_name, config in SOURCES.items():
        feed_url = config["url"]
        print(f"\nFetching RSS: {source_name} ({feed_url})...")
        try:
            req = urllib.request.Request(
                feed_url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) VERDICT-News-Bot/1.0"}
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                feed_content = response.read()

            feed = feedparser.parse(feed_content)
            fetched_count = len(feed.entries)
            source_inserted = 0

            for entry in feed.entries:
                url = entry.get("link") or entry.get("id") or ""
                if not url or url in seen_urls:
                    continue

                title = clean_html(entry.get("title", ""))
                summary = clean_html(entry.get("summary", "") or entry.get("description", ""))

                # Date parsing
                pub_date = None
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    try:
                        pub_date = datetime.datetime(*entry.published_parsed[:6], tzinfo=datetime.timezone.utc)
                    except Exception:
                        pass
                elif hasattr(entry, "published"):
                    try:
                        pub_date = date_parser.parse(entry.published)
                        if pub_date.tzinfo is None:
                            pub_date = pub_date.replace(tzinfo=datetime.timezone.utc)
                    except Exception:
                        pass

                if pub_date and pub_date < seven_days_ago:
                    continue

                # Civic keyword matching
                combined_text = f"{title} {summary}".lower()
                matches = [kw for kw in CIVIC_KEYWORDS if kw in combined_text]

                if not matches:
                    continue

                article_obj = {
                    "id": f"gt-{len(all_articles) + len(newly_inserted) + 1}",
                    "title": title,
                    "summary": summary[:450] + ("..." if len(summary) > 450 else ""),
                    "source_name": source_name,
                    "source_url": url,
                    "category": config["category"],
                    "badge_color": config["badge_color"],
                    "credibility": config["credibility"],
                    "published_at": (pub_date or now).isoformat(),
                    "status": "Ongoing",
                    "matched_keywords": matches[:4]
                }

                seen_urls.add(url)
                newly_inserted.append(article_obj)
                source_inserted += 1

            print(f"  [OK] Fetched: {fetched_count} entries | Inserted (Civic Matched): {source_inserted}")
        except Exception as ex:
            print(f"  [!] Failed fetching {source_name}: {ex}")

    # Combine and save locally
    combined_list = newly_inserted + all_articles
    # Sort reverse chronologically
    combined_list.sort(key=lambda x: x.get("published_at", ""), reverse=True)

    os.makedirs(os.path.dirname(local_data_path), exist_ok=True)
    with open(local_data_path, 'w', encoding='utf-8') as f:
        json.dump(combined_list, f, indent=2, ensure_ascii=False)
    print(f"\n[OK] Saved {len(combined_list)} total verified articles to {local_data_path}")

    # Upsert to Supabase if configured
    url, key = get_supabase_credentials()
    if url and key and newly_inserted:
        print(f"Upserting {len(newly_inserted)} new articles to Supabase...")
        endpoint = f"{url.rstrip('/')}/rest/v1/ground_truth_articles"
        headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        }
        sb_rows = [
            {
                "title": a["title"],
                "summary": a["summary"],
                "source_name": a["source_name"],
                "source_url": a["source_url"],
                "category": a["category"],
                "badge_color": a["badge_color"],
                "credibility": a["credibility"],
                "published_at": a["published_at"],
                "status": a["status"]
            }
            for a in newly_inserted
        ]
        try:
            req = urllib.request.Request(
                endpoint,
                data=json.dumps(sb_rows).encode('utf-8'),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15) as res:
                print(f"[OK] Supabase sync completed with status: {res.status}")
        except Exception as e:
            print(f"[!] Supabase sync notice: {e} (Local fallback active and synced)")

    print("\n" + "=" * 60)
    print(f"SUMMARY: {len(newly_inserted)} new investigative reports added.")
    print("=" * 60)

if __name__ == "__main__":
    main()
