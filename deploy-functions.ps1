# Deploy all edge functions to Supabase
# Usage: .\deploy-functions.ps1

$ErrorActionPreference = "Stop"

$PROJECT_REF = "dyfzxamsobywypoyocwz"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Deploying Edge Functions to Supabase" -ForegroundColor Cyan
Write-Host "Project: $PROJECT_REF" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
} catch {
    Write-Host "Error: Supabase CLI is not installed." -ForegroundColor Red
    Write-Host "Install it with: npm install -g supabase"
    exit 1
}

# Check if already linked
if (-not (Test-Path "supabase\.temp\project-ref")) {
    Write-Host "Linking to Supabase project..."
    supabase link --project-ref $PROJECT_REF
} else {
    $linkedRef = Get-Content "supabase\.temp\project-ref"
    Write-Host "Already linked to project: $linkedRef"
}

Write-Host ""
Write-Host "Deploying functions..." -ForegroundColor Yellow
Write-Host ""

# List of all functions to deploy
$FUNCTIONS = @(
    "fetch-all-gaming-content",
    "fetch-game-deals",
    "fetch-gaming-news",
    "fetch-igdb-games",
    "fetch-igdb-releases",
    "fetch-rawg-releases",
    "fetch-steam-content",
    "fetch-twitch-videos",
    "generate-ai-content",
    "query-igdb",
    "seed-demo-releases",
    "sync-game-releases",
    "sync-igdb-games",
    "sync-igdb-releases",
    "sync-platform-news",
    "sync-youtube-news",
    "update-game-images"
)

$DEPLOYED = 0
$FAILED = 0
$index = 0

# Deploy each function
foreach ($func in $FUNCTIONS) {
    $index++
    Write-Host "[$index/$($FUNCTIONS.Count)] Deploying $func..." -ForegroundColor Yellow

    try {
        supabase functions deploy $func --no-verify-jwt
        Write-Host "✓ Successfully deployed $func" -ForegroundColor Green
        $DEPLOYED++
    } catch {
        Write-Host "✗ Failed to deploy $func" -ForegroundColor Red
        $FAILED++
    }
    Write-Host ""
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Successfully deployed: $DEPLOYED" -ForegroundColor Green
Write-Host "Failed: $FAILED" -ForegroundColor $(if ($FAILED -eq 0) { "Green" } else { "Red" })
Write-Host "Total: $($FUNCTIONS.Count)"
Write-Host ""

if ($FAILED -eq 0) {
    Write-Host "🎉 All functions deployed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some functions failed to deploy. Check the output above." -ForegroundColor Yellow
    exit 1
}
