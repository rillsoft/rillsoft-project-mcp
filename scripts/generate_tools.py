"""Generate the tool catalogue from tools/list of a running Rillsoft Project.

Usage:
    python scripts/generate_tools.py                  # query 127.0.0.1:3928, write all files
    python scripts/generate_tools.py --port 8123
    python scripts/generate_tools.py --from-json      # rebuild from tools-list.json

The script sends no API key, like the launcher; clear the key in Rillsoft
Project while generating. It only calls initialize and tools/list and closes
the session with DELETE; it changes nothing in the open project.

Writes:
    tools-list.json       raw tools/list result with serverInfo and capture date,
                          without the output schemas, one tool per line
    tools-output-schemas.json
                          the output schema of every tool by name, one per line;
                          launcher.js merges both files back into tools/list.
                          Split so that no file of the Claude plugin exceeds
                          256 KiB (directory review limit)
    tools-catalogue.json  the same, grouped into sections without schemas --
                          source of the catalogue on rillsoft.ai (data/mcp_tools.json)
    TOOLS.md              readable catalogue; never edit by hand
"""

import argparse
import datetime
import json
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
JSON_FILE = ROOT / "tools-list.json"
SCHEMA_FILE = ROOT / "tools-output-schemas.json"
CATALOGUE_FILE = ROOT / "tools-catalogue.json"
MD_FILE = ROOT / "TOOLS.md"
PROTOCOL = "2025-06-18"

# Section per object, taken from the second part of the tool name. The id is
# stable; rillsoft.ai translates the title through the i18n key tools_section_<id>.
SECTIONS = [
    ("projects", "Projects and files", ["project"]),
    ("structure", "Structure: subprojects, elements and outline", ["subproject", "element", "fixed", "outline"]),
    ("tasks", "Tasks, assignments and progress", ["task"]),
    ("resources", "Resources and resource pool", ["resource", "machine"]),
    ("calendars", "Calendars", ["calendar"]),
    ("baselines", "Baselines and variance", ["baseline", "variance"]),
    ("analysis", "Analysis", ["analysis"]),
    ("portfolios", "Portfolios", ["portfolio"]),
    ("ris-documents", "RIS documents and folders", ["document", "folder"]),
    ("view", "View, window and session", ["view", "timescale", "row", "property", "window", "history", "session"]),
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
    return [{"name": n, "required": n in required} for n in names]


def catalogue(data):
    tools = sorted(data["tools"], key=lambda t: t["name"])
    sections, seen = [], set()
    for sid, title, keys in SECTIONS:
        items = [t for t in tools if t["name"].split("_")[1] in keys]
        seen.update(t["name"] for t in items)
        sections.append((sid, title, items))
    sections.append(("other", "Other", [t for t in tools if t["name"] not in seen]))
    kinds = [access(t) for t in tools]
    return {
        "version": data["serverInfo"]["version"],
        "capturedAt": data["capturedAt"],
        "protocolVersion": data["protocolVersion"],
        "count": {
            "total": len(tools),
            "readOnly": kinds.count("read-only"),
            "write": len(tools) - kinds.count("read-only"),
            "destructive": kinds.count("write, destructive"),
        },
        "sections": [
            {"id": sid, "title": title, "tools": [
                {"name": t["name"], "title": t.get("title", ""), "access": access(t),
                 "params": params(t), "description": t.get("description", "").strip()}
                for t in items]}
            for sid, title, items in sections if items
        ],
    }


def render(cat):
    count = cat["count"]
    out = [
        "# Tool catalogue",
        "",
        f"Generated from `tools/list` of Rillsoft Project **{cat['version']}** on "
        f"{cat['capturedAt']} (MCP protocol `{cat['protocolVersion']}`) by "
        "`scripts/generate_tools.py`. Do not edit by hand – the running program is "
        "the contract; what `tools/list` of your installation returns applies.",
        "",
        f"{count['total']} tools: {count['readOnly']} read-only, {count['write']} writing "
        f"(of which {count['destructive']} marked destructive). "
        "Names, titles, descriptions and parameters are English in every language build. "
        "Undo, read-only mode, errors and sessions: "
        "[Developers: the MCP server contract](https://rillsoft.ai/en/developers/). "
        "Output schemas are part of `tools/list` and not repeated here; the repository "
        "keeps them in [`tools-output-schemas.json`](tools-output-schemas.json) next to "
        "[`tools-list.json`](tools-list.json).",
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
    for s in cat["sections"]:
        anchor = "".join(c for c in s["title"].lower().replace(" ", "-") if c.isalnum() or c == "-")
        out.append(f"- [{s['title']}](#{anchor}) ({len(s['tools'])})")
    for s in cat["sections"]:
        out += ["", f"## {s['title']}", "", "| Tool | Title | Access |", "|---|---|---|"]
        out += [f"| [`{t['name']}`](#{t['name']}) | {t['title']} | {t['access']} |" for t in s["tools"]]
        for t in s["tools"]:
            plist = ", ".join(f"`{p['name']}`" + ("\\*" if p["required"] else "") for p in t["params"]) or "–"
            out += ["", f"### {t['name']}", "",
                    f"**{t['title']}** · {t['access']} · Parameters: {plist}", "",
                    t["description"]]
    return "\n".join(out) + "\n"


def write(path, text):
    path.write_text(text, encoding="utf-8", newline="\n")


FILE_LIMIT = 256 * 1024  # bytes per file in the Claude plugin directory


def compact(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def merge_tools(listed, schemas):
    """tools-list.json plus tools-output-schemas.json -> the tools/list result.

    Same rule as toolsList() in launcher.js: the output schema is added by name and
    the keys of each tool are put in sorted order, the order the program uses.
    """
    data = dict(listed)
    tools = []
    for tool in listed["tools"]:
        tool = dict(tool)
        if tool["name"] in schemas:
            tool["outputSchema"] = schemas[tool["name"]]
        tools.append({k: tool[k] for k in sorted(tool)})
    data["tools"] = tools
    return data


def load_tools():
    listed = json.loads(JSON_FILE.read_text(encoding="utf-8-sig"))
    schemas = {}
    if SCHEMA_FILE.exists():
        schemas = json.loads(SCHEMA_FILE.read_text(encoding="utf-8-sig"))["outputSchemas"]
    return merge_tools(listed, schemas)


def save_tools(data):
    """Write tools-list.json and tools-output-schemas.json; refuse a split that loses data."""
    head = {k: v for k, v in data.items() if k != "tools"}
    tools, schemas = [], {}
    for tool in data["tools"]:
        tool = dict(tool)
        if "outputSchema" in tool:
            schemas[tool["name"]] = tool.pop("outputSchema")
        tools.append(tool)
    if merge_tools({**head, "tools": tools}, schemas) != data or any(
            list(t) != sorted(t) for t in data["tools"]):
        raise SystemExit("tools/list does not survive the split (key order changed?); not written")
    lines = [compact(head)[:-1] + ',"tools":[']
    lines += [compact(t) + ("," if i < len(tools) - 1 else "") for i, t in enumerate(tools)]
    lines += ["]}"]
    list_text = "\n".join(lines) + "\n"
    items = list(schemas.items())
    lines = ['{"note":"outputSchema of every tool in tools-list.json, by name; '
             'launcher.js merges both files into tools/list","outputSchemas":{']
    lines += [compact(k) + ":" + compact(v) + ("," if i < len(items) - 1 else "")
              for i, (k, v) in enumerate(items)]
    lines += ["}}"]
    schema_text = "\n".join(lines) + "\n"
    for path, text in ((JSON_FILE, list_text), (SCHEMA_FILE, schema_text)):
        size = len(text.encode("utf-8"))
        if size >= FILE_LIMIT:
            raise SystemExit(f"{path.name}: {size} bytes, limit {FILE_LIMIT}; not written")
        write(path, text)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--port", type=int, default=3928)
    ap.add_argument("--from-json", action="store_true", help="rebuild from tools-list.json")
    args = ap.parse_args()
    if args.from_json:
        data = load_tools()
    else:
        data = query(args.port)
    save_tools(data)
    cat = catalogue(data)
    write(CATALOGUE_FILE, json.dumps(cat, ensure_ascii=False, indent=2) + "\n")
    write(MD_FILE, render(cat))
    print(f"{cat['version']}: {cat['count']['total']} tools -> {MD_FILE.name}, {CATALOGUE_FILE.name}")


if __name__ == "__main__":
    main()
