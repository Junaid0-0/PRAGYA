"""Optional Arduino Mega serial bridge for the PRAGYA edge server.

Arduino should send one JSON object per line, for example:
{"npk":{"n":35,"p":21,"k":48},"moisture":42,"temperature":31.4,"humidity":74,"ph":6.5}
"""
import argparse
import json
from urllib.request import Request, urlopen

import serial


def main() -> None:
    parser = argparse.ArgumentParser(description="Forward Arduino JSON telemetry to PRAGYA")
    parser.add_argument("port", help="Example: /dev/ttyACM0")
    parser.add_argument("--baud", type=int, default=9600)
    parser.add_argument("--server", default="http://127.0.0.1:3000/api/sensors")
    parser.add_argument("--token", default="", help="KISAN_API_TOKEN value when the edge server requires bearer auth")
    args = parser.parse_args()
    headers = {"Content-Type": "application/json"}
    if args.token:
        headers["Authorization"] = f"Bearer {args.token}"
    with serial.Serial(args.port, args.baud, timeout=1) as device:
        print(f"Listening on {args.port} at {args.baud} baud")
        while True:
            line = device.readline().decode("utf-8", errors="ignore").strip()
            if not line:
                continue
            try:
                payload = json.loads(line)
                body = json.dumps(payload).encode()
                request = Request(args.server, data=body, headers=headers, method="POST")
                with urlopen(request, timeout=3) as response:
                    print(response.status, line)
            except (json.JSONDecodeError, OSError) as error:
                print(f"Skipped input: {error}")


if __name__ == "__main__":
    main()
