#!/bin/sh
set -euo pipefail

API_BASE_URL_VALUE="${API_BASE_URL:-${VITE_API_BASE_URL:-/api}}"

TEMPLATE="/usr/share/nginx/html/runtime-config.js.tmpl"
TARGET="/usr/share/nginx/html/runtime-config.js"

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

exec nginx -g 'daemon off;'
