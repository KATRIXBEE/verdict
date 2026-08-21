#!/bin/bash
echo "Setting up VERDICT data pipeline..."

# Install Python dependencies
pip install requests beautifulsoup4

echo "Setup complete."
echo ""
echo "To populate your database with all 543 MPs, run these in order:"
echo ""
echo "  1. python scripts/scrape_mps.py"
echo "     (takes ~25 mins, saves to scripts/data/mps_2024_raw.json)"
echo ""
echo "  2. python scripts/import_mps.py"
echo "     (imports JSON into your database)"
echo ""
echo "  3. Check your site — all MPs should now be visible"
