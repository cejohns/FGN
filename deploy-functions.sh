#!/bin/bash

# Deploy all edge functions to Supabase
# Usage: ./deploy-functions.sh

set -e

PROJECT_REF="dyfzxamsobywypoyocwz"

echo "========================================="
echo "Deploying Edge Functions to Supabase"
echo "Project: $PROJECT_REF"
echo "========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed."
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Check if already linked
if [ ! -f "supabase/.temp/project-ref" ]; then
    echo "Linking to Supabase project..."
    supabase link --project-ref $PROJECT_REF
else
    echo "Already linked to project: $(cat supabase/.temp/project-ref)"
fi

echo ""
echo "Deploying functions..."
echo ""

# List of all functions to deploy
FUNCTIONS=(
    "fetch-all-gaming-content"
    "fetch-game-deals"
    "fetch-gaming-news"
    "fetch-igdb-games"
    "fetch-igdb-releases"
    "fetch-rawg-releases"
    "fetch-steam-content"
    "fetch-twitch-videos"
    "generate-ai-content"
    "query-igdb"
    "seed-demo-releases"
    "sync-game-releases"
    "sync-igdb-games"
    "sync-igdb-releases"
    "sync-platform-news"
    "sync-youtube-news"
    "update-game-images"
)

DEPLOYED=0
FAILED=0

# Deploy each function
for func in "${FUNCTIONS[@]}"; do
    echo "[$((DEPLOYED + FAILED + 1))/${#FUNCTIONS[@]}] Deploying $func..."

    if supabase functions deploy "$func" --no-verify-jwt; then
        echo "✓ Successfully deployed $func"
        ((DEPLOYED++))
    else
        echo "✗ Failed to deploy $func"
        ((FAILED++))
    fi
    echo ""
done

echo "========================================="
echo "Deployment Summary"
echo "========================================="
echo "Successfully deployed: $DEPLOYED"
echo "Failed: $FAILED"
echo "Total: ${#FUNCTIONS[@]}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All functions deployed successfully!"
    exit 0
else
    echo "⚠️  Some functions failed to deploy. Check the output above."
    exit 1
fi
