#!/bin/bash

echo "Setting Vercel environment variables..."
echo "Reading from .env.local..."

if [ ! -f .env.local ]; then
  echo "ERROR: .env.local not found"
  exit 1
fi

# Read each line from .env.local
while IFS= read -r line || [ -n "$line" ]; do
  # Skip comments and empty lines
  [[ "$line" =~ ^#.*$ ]] && continue
  [[ -z "$line" ]] && continue

  # Split on first = only
  varname="${line%%=*}"
  varvalue="${line#*=}"

  # Skip if no value
  [ -z "$varvalue" ] && continue
  [ "$varvalue" = "PASTE_HERE" ] && continue
  [ "$varvalue" = "your_key_here" ] && continue

  echo "Setting: $varname"

  # Set for all environments (production, preview, development)
  echo "$varvalue" | vercel env add "$varname" production --force 2>/dev/null
  echo "$varvalue" | vercel env add "$varname" preview --force 2>/dev/null

done < .env.local

# Override NEXTAUTH_URL for production
echo "Setting production NEXTAUTH_URL and NEXT_PUBLIC_APP_URL..."
echo "https://verdict.vercel.app" | vercel env add NEXTAUTH_URL production --force 2>/dev/null
echo "https://verdict.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production --force 2>/dev/null

echo "Done setting environment variables."
