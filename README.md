# Exchange Lab

A small educational currency arbitrage detector. The UI uses vanilla HTML, CSS, and JavaScript; a C++ HTTP server supplies a deterministic sample rate book and analysis JSON API.

## Requirements

- C++20 compiler (Clang or GCC)
- macOS or Linux (the lightweight server uses POSIX sockets)

## Run

From the project directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra src/server.cpp -o exchange-server
./exchange-server 8080
```

Open <http://localhost:8080>. The Overview, Exchange rates, and Analysis links are served by the C++ process. Stop it with Ctrl+C.

## API

- `GET /api/rates` returns the sample conversion pairs.
- `POST /api/analyze` accepts `{"amount":1000,"feePercent":0.1}` and returns unique profitable cycles and their net amounts.

## Detection and assumptions

Each directed rate `r` is weighted as `-log(r × (1 − fee))`. Bellman–Ford starts all currency distances at zero, so it can detect negative cycles anywhere in the rate network. The server enumerates simple cycles to report every unique profitable loop, normalizes rotations so the same loop is counted once, and uses a small tolerance around break-even. The fee percentage applies independently on each conversion. The deterministic example includes profitable loops at the default 0.10% fee and can produce a no-opportunity state when the fee is raised.

The sample rates are illustrative and are not live quotes. The service is intended for a local mini project, not production use.
# Currency-Exchange-Arbitrage-Detection
