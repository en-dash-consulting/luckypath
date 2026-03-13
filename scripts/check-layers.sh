#!/usr/bin/env bash
#
# Enforce the architectural layering DAG:
#   engine → hooks → components → routes
#
# Forbidden import directions (reverse edges):
#   - engine/ must NOT import from hooks/, components/, or routes/
#   - hooks/ must NOT import from components/ or routes/
#   - components/ must NOT import from routes/
#
# Run: npm run check-layers

set -euo pipefail

ERRORS=0

check_no_import() {
  local dir="$1"
  local forbidden_pattern="$2"
  local label="$3"

  while IFS= read -r file; do
    if grep -qE "$forbidden_pattern" "$file" 2>/dev/null; then
      echo "ERROR: $file imports from $label (violates layer boundary)"
      ERRORS=$((ERRORS + 1))
    fi
  done < <(find "app/$dir" -name '*.ts' -o -name '*.tsx' 2>/dev/null)
}

# engine must not import from hooks, components, or routes
check_no_import "engine" "from ['\"]~/hooks|from ['\"]~/components|from ['\"]~/routes" "hooks/components/routes"

# hooks must not import from components or routes
check_no_import "hooks" "from ['\"]~/components|from ['\"]~/routes" "components/routes"

# components must not import from routes
check_no_import "components" "from ['\"]~/routes" "routes"

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "Found $ERRORS layer violation(s). Fix the imports above."
  exit 1
else
  echo "Layer boundaries OK (engine → hooks → components → routes)"
fi
