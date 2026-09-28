import json
import time

import requests
import serial

SERIAL_PORT = "COM15"
BAUD_RATE = 9600
API_URL = "http://127.0.0.1:3000/api/sensors"


def main():
    print(f"Opening {SERIAL_PORT}...")
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    time.sleep(2)

    print("Mega → PRAGYA bridge running")
    print(f"POSTing telemetry to {API_URL}")
    print("Press Ctrl+C to stop.\n")

    while True:
        try:
            line = ser.readline().decode("utf-8", errors="ignore").strip()

            if not line:
                continue

            # Only process JSON telemetry lines.
            if not line.startswith("{"):
                continue

            try:
                payload = json.loads(line)
            except json.JSONDecodeError:
                print("Skipping invalid JSON:", line)
                continue

            response = requests.post(
                API_URL,
                json=payload,
                timeout=3,
            )

            if response.ok:
                print("✓ Mega → Website:", payload)
            else:
                print(
                    f"✗ API error {response.status_code}: "
                    f"{response.text[:200]}"
                )

        except serial.SerialException as exc:
            print("Serial error:", exc)
            break

        except requests.RequestException as exc:
            print("Website/API error:", exc)

        except KeyboardInterrupt:
            print("\nBridge stopped.")
            break

    ser.close()


if __name__ == "__main__":
    main()