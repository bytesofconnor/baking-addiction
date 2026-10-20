#!/usr/bin/env bash
set -euo pipefail

# Content guard: block banned content from entering the codebase
# Runs on every PR to main

EXIT_CODE=0

echo "🔍 Checking for banned content..."

# Check for Sally's Baking Addiction image hotlinks
echo ""
echo "Checking for Sally's Baking Addiction image hotlinks..."
RESULTS=$(git grep -n -E '(sallysbakingaddiction|sallysbakinaddiction)\.com.*\.(jpg|jpeg|png|gif|webp)' -- ':(exclude).github/' || true)
if [ -n "$RESULTS" ]; then
  echo "$RESULTS"
  echo "❌ FAIL: Found image hotlinks to Sally's Baking Addiction"
  echo "   Sally's images are copyrighted. Use local images or link to her site instead."
  EXIT_CODE=1
else
  echo "✅ PASS: No Sally's Baking Addiction image hotlinks found"
fi

# Check for copied Sally's branding text in code (excluding legitimate documentation)
echo ""
echo "Checking for copied Sally's Baking Addiction branding text..."
RESULTS=$(git grep -n -i "sally's baking addiction" -- '*.ts' '*.tsx' '*.js' '*.jsx' ':!AGENTS.md' ':!ops.md' ':!.github/' ':!convex/extractCard.ts' || true)
if [ -n "$RESULTS" ]; then
  echo "$RESULTS"
  echo "❌ FAIL: Found 'Sally's Baking Addiction' branding text in code"
  echo "   Credit Sally with source links, don't copy branding text."
  EXIT_CODE=1
else
  echo "✅ PASS: No Sally's branding text in code"
fi

# Check for production seed commands in workflows or scripts
echo ""
echo "Checking for production seed commands..."
RESULTS=$(git grep -n 'convex run seed:.*beloved-lapwing-642' -- '.github/' || true)
if [ -n "$RESULTS" ]; then
  echo "$RESULTS"
  echo "❌ FAIL: Found seed command targeting production (beloved-lapwing-642)"
  echo "   Never run dummy seed on production. Seeds are for local dev only."
  EXIT_CODE=1
else
  echo "✅ PASS: No production seed commands found"
fi

if [ $EXIT_CODE -eq 0 ]; then
  echo ""
  echo "✅ Content guard passed"
else
  echo ""
  echo "❌ Content guard failed"
  echo ""
  echo "See AGENTS.md for content rules."
fi

exit $EXIT_CODE
