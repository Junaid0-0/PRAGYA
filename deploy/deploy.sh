#!/usr/bin/env bash
# Installs PRAGYA as a boot-time systemd service on a Raspberry Pi
# (or any Linux machine).
#
#   sudo ./deploy/deploy.sh
#
# The script creates the virtualenv, installs dependencies, runs the test
# suite, creates .env from the template if missing, and registers the
# kisan-mitra service so the dashboard starts automatically on boot.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVICE_NAME="kisan-mitra"
UNIT="/etc/systemd/system/${SERVICE_NAME}.service"
RUN_USER="${SUDO_USER:-$(id -un)}"

if [[ "${EUID}" -ne 0 ]]; then
    echo "This script needs root to install the systemd unit." >&2
    echo "Re-run it with:  sudo ./deploy/deploy.sh" >&2
    exit 1
fi

echo "==> Step 1/5: virtualenv + dependencies (${ROOT})"
if [[ ! -x "${ROOT}/.venv/bin/python" ]]; then
    python3 -m venv "${ROOT}/.venv"
fi
"${ROOT}/.venv/bin/pip" install --quiet --upgrade pip
"${ROOT}/.venv/bin/pip" install --quiet -r "${ROOT}/requirements.txt"

echo "==> Step 2/5: verify the app with the test suite"
(cd "${ROOT}" && "${ROOT}/.venv/bin/python" -m unittest discover -s tests -q)

echo "==> Step 3/5: create .env from template if missing"
if [[ ! -f "${ROOT}/.env" ]]; then
    SECRET="$("${ROOT}/.venv/bin/python" -c 'import secrets; print(secrets.token_hex(32))')"
    sed "s/replace-with-a-random-secret/${SECRET}/" "${ROOT}/.env.example" > "${ROOT}/.env"
    echo "    created ${ROOT}/.env - edit OPENWEATHER_API_KEY / KISAN_API_TOKEN as needed"
fi

echo "==> Step 4/5: install systemd unit (${UNIT})"
sed -e "s|__DIR__|${ROOT}|g" -e "s|__USER__|${RUN_USER}|g" \
    "${ROOT}/deploy/kisan-mitra.service.template" > "${UNIT}"
systemctl daemon-reload
systemctl enable --quiet "${SERVICE_NAME}"
systemctl restart "${SERVICE_NAME}"

echo "==> Step 5/5: installed. Status:"
systemctl --no-pager --lines=15 status "${SERVICE_NAME}" || true
echo
echo "Dashboard:  http://$(hostname -I | awk '{print $1}'):3000"
echo "Logs:       journalctl -u ${SERVICE_NAME} -f"
echo "Restart:    sudo systemctl restart ${SERVICE_NAME}"