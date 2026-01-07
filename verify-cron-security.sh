#!/bin/bash

# Verification script for CRON_SECRET security implementation
# Tests that all write-capable edge functions properly validate X-Cron-Secret

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SUPABASE_URL="${SUPABASE_URL:-}"
CRON_SECRET="${CRON_SECRET:-}"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Functions to test
FUNCTIONS=(
  "sync-game-releases"
  "sync-platform-news"
  "sync-youtube-news"
  "generate-ai-content"
  "update-game-images"
  "seed-demo-releases"
  "fetch-igdb-releases"
  "fetch-rawg-releases"
  "fetch-game-deals"
  "fetch-igdb-games"
  "fetch-gaming-news"
  "fetch-steam-content"
  "fetch-twitch-videos"
  "fetch-all-gaming-content"
)

# Helper functions
print_header() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

test_function() {
  local func_name=$1
  local description=$2
  local expected_status=$3
  local headers=$4

  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  print_info "Testing: $description"

  response=$(curl -s -w "\n%{http_code}" -X POST \
    "${SUPABASE_URL}/functions/v1/${func_name}" \
    -H "Content-Type: application/json" \
    $headers \
    -d '{}' 2>&1)

  status_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  if [ "$status_code" = "$expected_status" ]; then
    print_success "$func_name returned $status_code (expected $expected_status)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
  else
    print_error "$func_name returned $status_code (expected $expected_status)"
    print_error "Response body: $body"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
}

# Main script
main() {
  print_header "CRON_SECRET Security Verification"

  # Check prerequisites
  if [ -z "$SUPABASE_URL" ]; then
    print_error "SUPABASE_URL environment variable not set"
    echo "Usage: SUPABASE_URL=https://your-project.supabase.co CRON_SECRET=your-secret ./verify-cron-security.sh"
    exit 1
  fi

  if [ -z "$CRON_SECRET" ]; then
    print_warning "CRON_SECRET not provided. Will only test failure cases."
    echo "To test success cases, run: SUPABASE_URL=... CRON_SECRET=your-secret ./verify-cron-security.sh"
  fi

  print_info "Testing against: $SUPABASE_URL"
  print_info "Functions to test: ${#FUNCTIONS[@]}"

  # Test 1: No authentication (should fail with 403)
  print_header "Test 1: Calls without authentication (should return 403)"

  for func in "${FUNCTIONS[@]}"; do
    test_function "$func" \
      "$func without auth" \
      "403" \
      ""
  done

  # Test 2: Invalid secret (should fail with 401)
  print_header "Test 2: Calls with invalid secret (should return 401)"

  for func in "${FUNCTIONS[@]}"; do
    test_function "$func" \
      "$func with invalid secret" \
      "401" \
      '-H "X-Cron-Secret: invalid-secret-12345"'
  done

  # Test 3: Valid secret (should succeed with 200 or expected status)
  if [ -n "$CRON_SECRET" ]; then
    print_header "Test 3: Calls with valid secret (should succeed)"

    for func in "${FUNCTIONS[@]}"; do
      # Note: Some functions may return 400 if required API keys aren't configured
      # We consider any non-401/403 as success for this test
      print_info "Testing: $func with valid secret"

      response=$(curl -s -w "\n%{http_code}" -X POST \
        "${SUPABASE_URL}/functions/v1/${func}" \
        -H "Content-Type: application/json" \
        -H "X-Cron-Secret: ${CRON_SECRET}" \
        -d '{}' 2>&1)

      status_code=$(echo "$response" | tail -n 1)
      body=$(echo "$response" | head -n -1)

      TOTAL_TESTS=$((TOTAL_TESTS + 1))

      if [ "$status_code" != "401" ] && [ "$status_code" != "403" ]; then
        print_success "$func accepted valid secret (returned $status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
      else
        print_error "$func rejected valid secret (returned $status_code)"
        print_error "Response: $body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
      fi
    done
  else
    print_warning "Skipping valid secret tests (CRON_SECRET not provided)"
  fi

  # Test 4: Check no VITE_ exposure
  print_header "Test 4: Verify CRON_SECRET not exposed to client"

  if [ -f "dist/index.html" ] && [ -f "dist/assets/index-*.js" ]; then
    print_info "Checking built files for CRON_SECRET exposure..."

    if grep -r "CRON_SECRET" dist/ 2>/dev/null; then
      print_error "CRON_SECRET found in build output! This is a security vulnerability!"
      FAILED_TESTS=$((FAILED_TESTS + 1))
    else
      print_success "CRON_SECRET not found in build output"
      PASSED_TESTS=$((PASSED_TESTS + 1))
    fi

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
  else
    print_warning "Build directory not found, skipping client exposure check"
    print_info "Run 'npm run build' first to test client exposure"
  fi

  # Summary
  print_header "Test Results Summary"

  echo "Total tests: $TOTAL_TESTS"
  echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
  echo -e "${RED}Failed: $FAILED_TESTS${NC}"

  if [ $FAILED_TESTS -eq 0 ]; then
    print_success "All tests passed! CRON_SECRET security is properly configured."
    exit 0
  else
    print_error "$FAILED_TESTS test(s) failed. Please review the output above."
    exit 1
  fi
}

# Run main function
main
