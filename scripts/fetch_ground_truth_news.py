import feedparser
import json
import time
import os
import sys
import asyncio
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "data-pipeline"))

FEEDS = {
    "The Reporters' Collective": "https://www.reporterscollective.in/feed",
    "Indian Express": "https://indianexpress.com/section/india/rss/",
    "The Hindu": "https://www.thehindu.com/news/national/feeder/default.rss",
    "The Wire": "https://thewire.in/category/politics/feed/",
    "Scroll.in": "https://scroll.in/rss/india",
}

KEYWORDS = [
    'corruption', 'scam', 'fraud', 'arrested', 'crore',
    'minister', 'politician', 'parliament', 'government',
    'environment', 'pollution', 'farmer', 'tribal',
    'adivasi', 'forest', 'land', 'RTI', 'whistleblower',
    'investigation', 'expose', 'alleged', 'bribery',
    'tender', 'contractor', 'scheme', 'fund', 'diversion',
    'CBI', 'ED', 'income tax', 'raid', 'probe',
    'Supreme Court', 'High Court', 'PIL', 'conviction',
    'election', 'lok sabha', 'rajya sabha', 'modi', 'bjp',
    'congress', 'affidavit', 'assets', 'criminal', 'mp'
]


def is_relevant(title, summary):
    text = (str(title) + ' ' + str(summary)).lower()
    return any(kw.lower() in text for kw in KEYWORDS)


def clean_html(raw_html):
    if not raw_html:
        return ""
    import re
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext.strip()


def fetch_all_feeds():
    articles = []
    
    for source_name, feed_url in FEEDS.items():
        print(f"Fetching: {source_name}")
        try:
            feed = feedparser.parse(feed_url)
            
            for entry in feed.entries[:25]:
                title = clean_html(entry.get('title', ''))
                summary = clean_html(entry.get('summary', '') or entry.get('description', ''))
                url = entry.get('link', '')
                
                # Parse published date
                published = entry.get('published_parsed')
                if published:
                    pub_date = datetime(*published[:6]).isoformat()
                else:
                    pub_date = datetime.now().isoformat()
                
                # Assign topic category
                text = (title + ' ' + summary).lower()
                category = "Governance & Politics"
                if any(w in text for w in ['corruption', 'scam', 'fraud', 'bribery', 'cbi', 'ed', 'raid']):
                    category = "Financial & Corruption"
                elif any(w in text for w in ['environment', 'pollution', 'forest', 'water', 'mining']):
                    category = "Environment & Ecology"
                elif any(w in text for w in ['farmer', 'agriculture', 'crop', 'mandi']):
                    category = "Agriculture & Rural"
                elif any(w in text for w in ['court', 'judge', 'pil', 'supreme court', 'high court']):
                    category = "Judiciary & Law"
                elif any(w in text for w in ['health', 'hospital', 'clinic', 'phc', 'medicine']):
                    category = "Public Health"

                if is_relevant(title, summary) or len(articles) < 15:
                    articles.append({
                        'id': f"news-{len(articles) + 1}",
                        'source': source_name,
                        'title': title,
                        'summary': summary[:400] + ("..." if len(summary) > 400 else ""),
                        'url': url,
                        'published_at': pub_date,
                        'category': category,
                        'fetched_at': datetime.now().isoformat(),
                    })
                    
        except Exception as e:
            print(f"  [!] Failed fetching {source_name}: {e}")
        
        time.sleep(0.5)
    
    # Sort by date, newest first
    articles.sort(key=lambda x: x['published_at'], reverse=True)
    
    # Remove duplicates by URL
    seen_urls = set()
    unique = []
    for a in articles:
        if a['url'] and a['url'] not in seen_urls:
            seen_urls.add(a['url'])
            unique.append(a)
    
    return unique


def main():
    print("=" * 60)
    print("VERDICT — Ground Truth Daily News Scraper")
    print("=" * 60)
    
    articles = fetch_all_feeds()
    print(f"\nFound {len(articles)} relevant articles from verified investigative outlets")
    
    os.makedirs(os.path.join(BASE_DIR, "scripts", "data"), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, "src", "data"), exist_ok=True)

    # 1. Save to scripts/data/ground_truth_news.json
    scripts_out = os.path.join(BASE_DIR, "scripts", "data", "ground_truth_news.json")
    with open(scripts_out, 'w', encoding='utf-8') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

    # 2. Save to src/data/ground-truth-news.json for frontend UI
    frontend_out = os.path.join(BASE_DIR, "src", "data", "ground-truth-news.json")
    with open(frontend_out, 'w', encoding='utf-8') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

    print(f"Saved to {scripts_out} & {frontend_out}")

    print("\nRecent Sample Articles:")
    for a in articles[:6]:
        safe_title = a['title'][:70].encode('ascii', errors='replace').decode('ascii')
        print(f"  [{a['source']}] {safe_title}")
    print("=" * 60)


if __name__ == "__main__":
    main()
