#!/bin/bash
# sync-upstream.sh — Pull latest from paperclipai/paperclip
# Run monthly or when paperclipai releases
# DO NOT overwrite ui-panorama/ — that is our work.

set -e

echo "Syncing from paperclipai/paperclip..."

git remote add upstream https://github.com/paperclipai/paperclip.git \
  2>/dev/null || echo "upstream already added"

git fetch upstream

# Merge server/ and packages/ only — never touch ui-panorama/
git checkout upstream/master -- server/
git checkout upstream/master -- packages/
git checkout upstream/master -- cli/

echo ""
echo "✅ Upstream synced."
echo "   Review changes carefully before committing."
echo "   DO NOT overwrite ui-panorama/ — that is our work."
echo ""
git status
