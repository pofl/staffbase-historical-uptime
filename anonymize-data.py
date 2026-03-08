#!/usr/bin/env python3
# Extract anonymous response bodies from data.har -> data.json
# New file has no headers, cookies, etc

import re
import json
from glob import glob
from urllib.parse import urlparse

INPUT_GLOB = "input/*.har"
DATA_PATH = "historical-data.json"
PATH_FILTER_EXP = re.compile("^/uptime.*$")


def main():
    out = list()

    for fpath in glob(INPUT_GLOB):
        print(f"Reading {fpath}")
        with open(fpath, "r") as fin:
            har_data = json.load(fin)

            for request in har_data["log"]["entries"]:
                url = request["request"]["url"]
                url_obj = urlparse(url)

                if not PATH_FILTER_EXP.match(url_obj.path):
                    print(f"\tIgnoring request to {url}")
                    continue

                resp = request["response"]

                if resp["status"] == 304:
                    print(f"\tIgnoring cached response for {url}")
                    continue

                print(f"\tIncluding request to {url}")
                resp = json.loads(resp["content"]["text"])
                out.append(resp)

    with open(DATA_PATH, "w") as fout:
        json.dump(out, fout)
        print(f"Data saved to {DATA_PATH}")


if __name__ == "__main__":
    main()
