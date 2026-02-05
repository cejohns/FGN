#!/bin/bash

# Verify edge functions deployment
# Usage: ./verify-deployment.sh

set -e

PROJECT_REF="dyfzxamsobywypoyocwz"
SUPABASE_URL="https://$PROJECT_REF.supabase.co"

echo "========================================="
echo "Verifying Edge Functions Deployment"
echo "Project: $PROJECT_REF"
echo "========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed."
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo "Fetching list of deployed functions..."
echo ""

# List all functions
supabase functions list

echo ""
echo "========================================="
echo "Deployment verification complete!"
echo ""
echo "To test individual functions:"
echo "  supabase functions serve <function-name>"
echo ""
echo "To view function logs:"
echo "  supabase functions logs <function-name>"
echo ""
echo "Dashboard:"
echo "  https://supabase.com/dashboard/project/$PROJECT_REF/functions"
echo "========================================="
