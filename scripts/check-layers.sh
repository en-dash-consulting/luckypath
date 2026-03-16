#!/usr/bin/env bash
#
# Enforce the architectural layering DAG:
#   geometry → engine → services → hooks → components → routes
#
# Forbidden import directions (reverse edges):
#   - geometry/ must NOT import from any upper layer
#   - engine/   must NOT import from services/, hooks/, components/, or routes/
#   - services/ must NOT import from hooks/, components/, or routes/
#   - hooks/    must NOT import from components/ or routes/
#   - components/ must NOT import from routes/
#   - routes/   must NOT import from engine/ or services/ (must go through hooks)
#
# This script is the quick-check counterpart to zone-boundaries.test.ts.
# Both enforce the same 6-layer DAG — if you change one, update the other.
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

# geometry must not import from any upper layer
check_no_import "geometry" "from ['\"]~/engine|from ['\"]~/services|from ['\"]~/hooks|from ['\"]~/components|from ['\"]~/routes" "engine/services/hooks/components/routes"

# engine must not import from services, hooks, components, or routes
check_no_import "engine" "from ['\"]~/services|from ['\"]~/hooks|from ['\"]~/components|from ['\"]~/routes" "services/hooks/components/routes"

# services must not import from hooks, components, or routes
check_no_import "services" "from ['\"]~/hooks|from ['\"]~/components|from ['\"]~/routes" "hooks/components/routes"

# hooks must not import from components or routes
check_no_import "hooks" "from ['\"]~/components|from ['\"]~/routes" "components/routes"

# components must not import from routes or services
check_no_import "components" "from ['\"]~/routes|from ['\"]~/services" "routes/services"

# routes must not import from engine or services (must go through hooks)
check_no_import "routes" "from ['\"]~/engine|from ['\"]~/services" "engine/services (must go through hooks)"

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "Found $ERRORS layer violation(s). Fix the imports above."
  exit 1
else
  echo "Layer boundaries OK (geometry → engine → services → hooks → components → routes)"
fi
