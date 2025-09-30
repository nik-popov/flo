#!/bin/sh
set -euo pipefail

API_BASE_URL_VALUE="${API_BASE_URL:-${VITE_API_BASE_URL:-/api}}"

ASSET_DIR="/app"
TEMPLATE="${ASSET_DIR}/runtime-config.js.tmpl"
TARGET="${ASSET_DIR}/runtime-config.js"

export API_BASE_URL="$API_BASE_URL_VALUE"

if [ -f "$TEMPLATE" ]; then
  envsubst '${API_BASE_URL}' < "$TEMPLATE" > "$TARGET"
else
  echo "[entrypoint] runtime config template not found at $TEMPLATE"
  cat <<EOF > "$TARGET"
(function(){
  window.__FLO_CONFIG = window.__FLO_CONFIG || {};
  window.__FLO_CONFIG.apiBaseUrl = "${API_BASE_URL_VALUE}";
})();
EOF
fi

PORT="${PORT:-8080}"

echo "[entrypoint] Serving static assets from ${ASSET_DIR} on port ${PORT}"

exec serve -s "${ASSET_DIR}" -l "${PORT}"
