# github-uptime-graph
Generates graphs based on historical GitHub uptime data.

## Setup

### 1. Gathering Data
1. Navigate to the [GitHub's Uptime History](https://www.githubstatus.com/uptime)
2. Open the network inspector
3. Disable caching
4. Manually click through each option on each page of the network graph. This ended up being quicker than automating a one-time task.
    - Pay attention and hold back when you get rate limited! This took me 2 sessions.
5. Export all as HAR
6. Add HAR file(s) to `input/`

### 2. Anonymize Data
1. Review `anonymize-data.py` for malicious code (HAR files have cookies)
2. Install Python3. I ran this on 3.14. No pip packages are needed.
3. Run `anonymize-data.py`
4. Delete `input/*.har` for safety

## Running the Website
Requires NodeJS and NPM (or an alternative).

```sh
# TL;DR
cd webapp/
npm install
npm run dev
```

More details: See [webapp/README.md](webapp/README.md)
