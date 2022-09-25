# vscode-exporter

Prometheus exporter for VSCode metrics using [prom-client](https://github.com/siimon/prom-client).

## Features

This extension exposes the following custom metrics on the `/metrics` endpoint:

```text
vscode_lines_total{project,folder,file,extension,language} gauge
vscode_lines_added{project,folder,file,extension,language} gauge
vscode_lines_removed{project,folder,file,extension,language} gauge
vscode_editing_seconds{project,folder,file,extension,language} counter
vscode_debugging_seconds{project,folder,file,extension,language} counter
vscode_compiling_seconds{project,folder,file,extension,language} counter
vscode_idle_seconds{project,folder,file,extension,language} counter
```

All the default metrics recommended by Prometheus [itself](https://prometheus.io/docs/instrumenting/writing_clientlibs/#standard-and-runtime-collectors) for Node.js are also exposed.

## Extension Settings

This extension contributes the following settings:

* `vscode-exporter.port`: Port to expose metrics on (default: 9910).
* `vscode-exporter.debug`: Enable debug logs (default: false).
* `vscode-exporter.untitled`: Show metrics for untitled files (default: false).
* `vscode-exporter.timeout`: Time in seconds to consider idle (default: 60).
* `vscode-exporter.min-interval`: Minimum time in seconds between metrics updates (ignored when writing to disk) (default: 15).

## Extension Commands

This extension contributes the following commands:

* `vscode-exporter.open`: Opens the metrics endpoint on your browser.

**All recommendations, issues and pull requests are welcome! Enjoy!**
