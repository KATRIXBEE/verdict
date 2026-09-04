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
    "Reuters India": {
        "url": "https://news.google.com/rss/search?q=site:reuters.com+india+politics&hl=en-IN&gl=IN&ceid=IN:en",
        "category": "Governance",
        "badge_color": "#FF8000",
        "credibility": "High"
    },
    "The Reporters' Collective": {
        "url": "https://www.reporters-collective.in/stories?format=rss",
        "fallback_url": "https://news.google.com/rss/search?q=site:reporters-collective.in&hl=en-IN&gl=IN&ceid=IN:en",
        "category": "Investigative",
        "badge_color": "#FF4545",
        "credibility": "High"
    },
    "Newslaundry": {
        "url": "https://www.newslaundry.com/feed",
        "category": "Media Accountability",
        "badge_color": "#E50914",
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
        "fallback_url": "https://news.google.com/rss/search?q=site:thewire.in+politics&hl=en-IN&gl=IN&ceid=IN:en",
        "category": "Investigative",
        "badge_color": "#8B0000",
        "credibility": "High"
    },
    "Scroll.in": {
        "url": "https://scroll.in/feed",
        "fallback_url": "https://news.google.com/rss/search?q=site:scroll.in+india&hl=en-IN&gl=IN&ceid=IN:en",
        "category": "Deep Reporting",
        "badge_color": "#333333",
        "credibility": "High"
    }
}

# TIER 1: Core Civic & Political Keywords
TIER_1_CIVIC_KEYWORDS = [
    'mp', 'mla', 'minister', 'parliament', 'lok sabha', 'rajya sabha', 
    'election', 'scam', 'cbi', 'ed', 'court', 'judge', 'verdict', 
    'bill', 'law', 'corruption', 'fraud', 'whistleblower', 'bribery', 
    'tender', 'scheme', 'income tax', 'supreme court', 'high court', 
    'pil', 'conviction', 'fir', 'chargesheet', 'custody', 'bail', 
    'affidavit', 'pollution', 'tribal', 'forest', 'rti'
]

# TIER 2: High Interest / Spicy Keywords
TIER_2_INTERESTING_KEYWORDS = [
    'raid', 'arrest', 'suspended', 'bribe', 'disproportionate', 
    'absconding', 'defamation', 'disqualif', 'sting', 'taped', 
    'leak', 'clash', 'boycott', 'outrage', 'unaccounted', 
    'extortion', 'black money'
]

# Noise keywords to filter out irrelevant cultural/sports stories
NOISE_KEYWORDS = [
    'cricket', 'bollywood', 'box office', 'horoscope', 'zodiac', 
    'ipl', 't20', 'fashion week', 'movie review', 'recipe', 'trailer'
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
        
        urls_to_try = [feed_url]
        if "fallback_url" in config:
            urls_to_try.append(config["fallback_url"])

        entries = []
        for u in urls_to_try:
            try:
                req = urllib.request.Request(
                    u,
                    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) VERDICT-News-Bot/1.0"}
                )
                with urllib.request.urlopen(req, timeout=12) as response:
                    feed_content = response.read()
                feed = feedparser.parse(feed_content)
                if len(feed.entries) > 0:
                    entries = feed.entries
                    break
            except Exception as ex:
                print(f"  [!] URL failed ({u}): {ex}")

        if not entries:
            print(f"  [!] Could not fetch entries for {source_name}, skipping.")
            continue

        try:
            fetched_count = len(entries)
            source_inserted = 0

            for entry in entries:
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

                combined_text = f"{title} {summary}".lower()

                # Noise filter: skip if contains noise keywords unless overridden by Tier 2
                noise_matched = any(nk in combined_text for nk in NOISE_KEYWORDS)

                # Two-tier keyword classification
                tier2_matches = [kw for kw in TIER_2_INTERESTING_KEYWORDS if kw in combined_text]
                tier1_matches = [kw for kw in TIER_1_CIVIC_KEYWORDS if kw in combined_text]

                if noise_matched and not tier2_matches:
                    continue

                if not tier2_matches and not tier1_matches:
                    continue

                is_interesting = len(tier2_matches) > 0
                all_matched = (tier2_matches + tier1_matches)[:4]

                # Classify unsolved status
                if 'chargesheet' in combined_text:
                    unsolved_status = 'chargesheeted'
                elif 'hearing' in combined_text or 'scheduled' in combined_text:
                    unsolved_status = 'hearing_scheduled'
                elif any(k in combined_text for k in ['probe', 'investigat', 'cbi', 'ed', 'raid', 'arrest', 'fir']):
                    unsolved_status = 'under_investigation'
                else:
                    unsolved_status = 'no_action_taken'

                days_elapsed = (now - (pub_date or now)).days

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
                    "is_interesting": is_interesting,
                    "unsolved_status": unsolved_status,
                    "last_checked_at": now.isoformat(),
                    "days_since_first_reported": max(1, days_elapsed),
                    "matched_keywords": all_matched
                }

                seen_urls.add(url)
                newly_inserted.append(article_obj)
                source_inserted += 1

            print(f"  [OK] Fetched: {fetched_count} entries | Inserted (Civic Matched): {source_inserted}")
        except Exception as ex:
            print(f"  [!] Failed parsing {source_name}: {ex}")

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
                "status": a["status"],
                "is_interesting": a.get("is_interesting", False),
                "unsolved_status": a.get("unsolved_status", "under_investigation"),
                "last_checked_at": a.get("last_checked_at"),
                "days_since_first_reported": a.get("days_since_first_reported", 1)
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
