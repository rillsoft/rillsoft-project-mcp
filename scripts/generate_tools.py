"""Generate the tool catalogue from tools/list of a running Rillsoft Project.

Usage:
    python scripts/generate_tools.py                  # query 127.0.0.1:3928, write both files
    python scripts/generate_tools.py --port 8123
    python scripts/generate_tools.py --from-json      # rebuild TOOLS.md from tools-list.json

An API key, if one is set in Rillsoft Project, is read from the environment
variable RILLSOFT_MCP_KEY. The script only calls initialize and tools/list and
closes the session with DELETE; it changes nothing in the open project.

Writes:
    tools-list.json  raw tools/list result with serverInfo and capture date
    TOOLS.md         readable catalogue; never edit by hand
"""

import argparse
import datetime
import json
import os
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
JSON_FILE = ROOT / "tools-list.json"
MD_FILE = ROOT / "TOOLS.md"
PROTOCOL = "2025-06-18"

# Section per object, taken from the second part of the tool name.
SECTIONS = [
    ("Projects and files", ["project"]),
    ("Structure: subprojects, elements and outline", ["subproject", "element", "fixed", "outline"]),
    ("Tasks, assignments and progress", ["task"]),
    ("Resources and resource pool", ["resource", "machine"]),
    ("Calendars", ["calendar"]),
    ("Baselines and variance", ["baseline", "variance"]),
    ("Analysis", ["analysis"]),
    ("Portfolios", ["portfolio"]),
    ("RIS documents and folders", ["document", "folder"]),
    ("View, window and session", ["view", "timescale", "row", "property", "window", "history", "session"]),
]

RIS_NOTE = (
    "Tools with `_ris_` in their name work on projects, portfolios, resource pools, "
    "documents and folders stored in a Rillsoft Integration Server (RIS) – run by your "
    "company or provided as Rillsoft Cloud. The MCP server itself always runs locally "
    "inside Rillsoft Project on `127.0.0.1`; it uses the RIS connection configured in "
    "Rillsoft Project. There is no Rillsoft cloud MCP endpoint."
)


def query(port):
    url = f"http://127.0.0.1:{port}/mcp"
    headers = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream"}
    if os.environ.get("RILLSOFT_MCP_KEY"):
        headers["Authorization"] = "Bearer " + os.environ["RILLSOFT_MCP_KEY"]

    def call(body, sid=None, method="POST"):
        h = dict(headers)
        if sid:
            h.update({"Mcp-Session-Id": sid, "MCP-Protocol-Version": PROTOCOL})
        data = json.dumps(body).encode() if body else None
        req = urllib.request.Request(url, data=data, headers=h, method=method)
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read().decode("utf-8")
            if raw.lstrip().startswith("event:") or "\ndata:" in raw:
                raw = "\n".join(l[5:].strip() for l in raw.splitlines() if l.startswith("data:"))
            return r.headers.get("Mcp-Session-Id"), (json.loads(raw) if raw.strip() else None)

    sid, init = call({"jsonrpc": "2.0", "id": 0, "method": "initialize",
                      "params": {"protocolVersion": PROTOCOL, "capabilities": {},
                                 "clientInfo": {"name": "generate_tools", "version": "1.0"}}})
    try:
        call({"jsonrpc": "2.0", "method": "notifications/initialized"}, sid)
        tools, cursor = [], None
        while True:
            params = {"cursor": cursor} if cursor else {}
            _, res = call({"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": params}, sid)
            tools += res["result"]["tools"]
            cursor = res["result"].get("nextCursor")
            if not cursor:
                break
    finally:
        call(None, sid, "DELETE")
    return {
        "capturedAt": datetime.date.today().isoformat(),
        "serverInfo": init["result"]["serverInfo"],
        "protocolVersion": init["result"]["protocolVersion"],
        "tools": tools,
    }


def access(tool):
    a = tool.get("annotations") or {}
    if a.get("readOnlyHint"):
        return "read-only"
    return "write, destructive" if a.get("destructiveHint") else "write"


def params(tool):
    schema = tool.get("inputSchema") or {}
    required = set(schema.get("required") or [])
    names = list((schema.get("properties") or {}).keys())
    names.sort(key=lambda n: (n not in required, n))
    return ", ".join(f"`{n}`" + ("\\*" if n in required else "") for n in names) or "–"


def render(data):
    tools = sorted(data["tools"], key=lambda t: t["name"])
    version = data["serverInfo"]["version"]
    count = {k: sum(access(t) == k for t in tools) for k in ("read-only", "write", "write, destructive")}
    out = [
        "# Tool catalogue",
        "",
        f"Generated from `tools/list` of Rillsoft Project **{version}** on "
        f"{data['capturedAt']} (MCP protocol `{data['protocolVersion']}`) by "
        "`scripts/generate_tools.py`. Do not edit by hand – the running program is "
        "the contract; what `tools/list` of your installation returns applies.",
        "",
        f"{len(tools)} tools: {count['read-only']} read-only, "
        f"{count['write'] + count['write, destructive']} writing "
        f"(of which {count['write, destructive']} marked destructive). "
        "Names, titles, descriptions and parameters are English in every language build. "
        "Undo, read-only mode, errors and sessions: "
        "[Developers: the MCP server contract](https://rillsoft.ai/en/developers/). "
        "Output schemas are part of `tools/list` ([`tools-list.json`](tools-list.json)) "
        "and not repeated here.",
        "",
        "**Access** follows the tool annotations: *read-only* (`readOnlyHint`), "
        "*write*, *write, destructive* (`destructiveHint`). "
        "**Parameters** marked \\* are required.",
        "",
        "## Rillsoft Integration Server (RIS)",
        "",
        RIS_NOTE,
        "",
        "## Contents",
        "",
    ]
    grouped, seen = [], set()
    for title, keys in SECTIONS:
        items = [t for t in tools if t["name"].split("_")[1] in keys]
        seen.update(t["name"] for t in items)
        grouped.append((title, items))
    rest = [t for t in tools if t["name"] not in seen]
    if rest:
        grouped.append(("Other", rest))
    grouped = [(title, items) for title, items in grouped if items]

    for title, items in grouped:
        anchor = "".join(c for c in title.lower().replace(" ", "-") if c.isalnum() or c == "-")
        out.append(f"- [{title}](#{anchor}) ({len(items)})")
    for title, items in grouped:
        out += ["", f"## {title}", "", "| Tool | Title | Access |", "|---|---|---|"]
        out += [f"| [`{t['name']}`](#{t['name']}) | {t.get('title', '')} | {access(t)} |" for t in items]
        for t in items:
            out += ["", f"### {t['name']}", "",
                    f"**{t.get('title', '')}** · {access(t)} · Parameters: {params(t)}", "",
                    t.get("description", "").strip()]
    return "\n".join(out) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--port", type=int, default=3928)
    ap.add_argument("--from-json", action="store_true", help="rebuild TOOLS.md from tools-list.json")
    args = ap.parse_args()
    if args.from_json:
        data = json.loads(JSON_FILE.read_text(encoding="utf-8"))
    else:
        data = query(args.port)
        JSON_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    MD_FILE.write_text(render(data), encoding="utf-8", newline="\n")
    print(f"{data['serverInfo']['version']}: {len(data['tools'])} tools -> {MD_FILE.name}")


if __name__ == "__main__":
    main()
