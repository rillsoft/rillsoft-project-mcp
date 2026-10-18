# MCP-Server von Rillsoft Project

[English](README.md)

Rillsoft AI ist der KI-Zugang zu Rillsoft Project, der Speziallösung für
Multiprojekt-Ressourcenplanung und Kapazitätsplanung im industriellen
Mittelstand: ein in Rillsoft Project 10 eingebauter MCP-Server auf dem
Terminrechenkern – nicht auf einer Aufgabenliste.

Der Server läuft im sichtbaren, laufenden Rillsoft Project unter Windows und
stellt das geöffnete Projekt einem KI-Assistenten oder einem Skript über das
Model Context Protocol bereit: Projektstruktur und Termine, Rollen, Personen,
Teams, Maschinen und Material, Kandidatensuche und Besetzungsassistenten,
Kapazitätsanalyse, Basispläne und Soll-Ist-Vergleich, Fortschritt und
Stichtag, Ressourcenpool, Rückgängig und Wiederherstellen.

Dieses Repository enthält **Dokumentation, Client-Konfiguration und den
npm-Launcher** (`launcher.js`, siehe [Installation per npx](#installation-per-npx-launcher)).
Der Server selbst ist Teil der Desktop-Anwendung Rillsoft Project 10; der
Launcher reicht nur an ihn durch, einen gehosteten Endpunkt gibt es nicht.

Vollständige Dokumentation: **https://rillsoft.ai/de/mcp/**

## Auf einen Blick

| | |
|---|---|
| Endpunkt | `http://127.0.0.1:3928/mcp` |
| Protokoll | MCP über Streamable HTTP, Stand `2025-06-18` |
| Reichweite | nur `127.0.0.1` – kein Cloud-Dienst, kein Versand an Rillsoft |
| Voraussetzung | Rillsoft Project 10 unter Windows |
| Zugriffsschutz | optionaler API-Key, Nur-Lesen-Modus, Browser-Origins werden abgelehnt |
| Der Preis dafür | ein MCP-Aufruf trägt keine Benutzeridentität und erreicht genau eine Rillsoft-Project-Instanz |

## Was es nicht ist

- Kein Task-, To-do- oder Kanban-Werkzeug und keine Plattform für Chat, Wiki
  oder Team-Kollaboration.
- Kein eigenständiges KI-Produkt und kein Chat-Plugin, sondern der KI-Zugang
  zu Rillsoft Project als Ganzem – Produkt, Editionen und Preise stehen auf
  [www.rillsoft.de](https://www.rillsoft.de/mcp-server/).
- Keine KI, die selbst plant: Termine, Auslastung und kritischen Pfad rechnet
  Rillsoft Project; die KI liest das Ergebnis.
- Kein Cloud-Dienst: Der Server ist nur auf `127.0.0.1` im geöffneten
  Rillsoft Project erreichbar. Rillsoft sendet nichts; was der KI-Client
  sendet, regelt dessen Datenschutz.
- Kein Team-Server: Es gibt keinen Fernzugriff.
- Kein Portfolio-Editor: Portfolios lassen sich öffnen und auswerten, aber
  nicht ändern.

## Einrichten

1. **Server aktivieren.** In Rillsoft Project **Einstellungen → MCP-Server**
   öffnen, den Aktiv-Schalter setzen und den **Nur-Lesen-Modus** für den
   Anfang eingeschaltet lassen. Alternativ für eine Sitzung
   `RillPrj.exe /mcp` (Port `3928`) oder `RillPrj.exe /mcp:8123` (anderer
   Port) starten.
   **Kontrolle:** Die Statuszeile zeigt „läuft auf Port 3928“.
2. **KI-Client verbinden** mit [`clients/generic.json`](clients/generic.json):

   ```json
   {
     "mcpServers": {
       "rillsoft-project": {
         "type": "http",
         "url": "http://127.0.0.1:3928/mcp"
       }
     }
   }
   ```

   Ist in den Einstellungen ein API-Key gesetzt, gilt
   [`clients/generic-api-key.json`](clients/generic-api-key.json)
   (`Authorization: Bearer <KEY>`). Fertige Einträge je Client:

   | Client | Datei | Wohin | Geprüft |
   |---|---|---|---|
   | Claude Code | [`claude-code.mcp.json`](clients/claude-code.mcp.json) | `.mcp.json` im Projektordner, oder `claude mcp add --transport http rillsoft-project http://127.0.0.1:3928/mcp` | 12.10.2026, 2.1.296 |
   | Claude Desktop | [`claude-desktop.json`](clients/claude-desktop.json) | `claude_desktop_config.json` (Einstellungen → Entwickler → Konfiguration bearbeiten); die Brücke `mcp-remote` braucht Node.js | 12.10.2026, 2.31226 |
   | Codex | [`codex.toml`](clients/codex.toml) | `~/.codex/config.toml`, oder `codex mcp add rillsoft-project --url http://127.0.0.1:3928/mcp` | 12.10.2026, CLI 0.162 |
   | VS Code | [`vscode.mcp.json`](clients/vscode.mcp.json) | `.vscode/mcp.json` | 12.10.2026, 1.117 |
   | Cursor | [`cursor.mcp.json`](clients/cursor.mcp.json) | `~/.cursor/mcp.json` | nach Herstellerdoku |

   Claude Code und VS Code brauchen Rillsoft Project 10 ab Build 10.0.625.
   Jeder andere Client, der MCP über Streamable HTTP spricht, nutzt die
   Adresse oben; die Feldnamen nennt seine Dokumentation.
   **Kontrolle:** Der Client listet die Werkzeuge des Servers auf – im
   Nur-Lesen-Modus nur die lesenden. `/mcp` gilt exakt, `/mcp/` ist ein 404.
3. **Die erste Frage stellen**, zum Beispiel: *Fasse den aktuellen
   Projektstatus zusammen: Termine, Fortschritt, offene Konflikte, in fünf
   Absätzen.* Mitgelieferte Branchenbeispiele mit synthetischen Daten
   erlauben den Test ohne eigene Projekte.

Jeder ändernde Aufruf ist in Rillsoft Project ein normaler
Bearbeitungsschritt – Sie nehmen ihn mit Strg+Z zurück wie jeden eigenen.

Schritt für Schritt mit Kontrollen: [Erste Schritte](https://rillsoft.ai/de/erste-schritte/).

## Installation per npx (Launcher)

Für Kataloge, Registries und Clients, die nur stdio-Server starten, gibt es
ein npm-Paket,
[`@rillsoft/rillsoft-project-mcp`](https://www.npmjs.com/package/@rillsoft/rillsoft-project-mcp),
gebaut aus diesem Repository. Es ist ein Launcher, nicht der Server:

- **Läuft Rillsoft Project 10**, reicht er jede Anfrage über stdio an den
  Endpunkt `http://127.0.0.1:3928/mcp` durch. Die Adresse ist fest; es gibt
  keine Umgebungsvariable für die Adresse und keinen API-Key. Ist in Rillsoft
  Project ein API-Key gesetzt, meldet der Launcher den `401` – dann die
  HTTP-Konfiguration oben verwenden. Nur zur Diagnose schreibt
  `RILLSOFT_MCP_LOG=<Datei>` die Anfragen und Antworten einer Sitzung in eine
  Logdatei.
- **Ohne Rillsoft Project** (nicht gestartet oder kein Windows) beantwortet er
  `initialize` und `tools/list` selbst aus `tools-list.json` – dieselben 118
  Werkzeuge wie das Programm – und jeden `tools/call` mit `isError: true` und
  einem Hinweis. So können Kataloge die Werkzeuge auch unter Linux anzeigen.

```json
{
  "mcpServers": {
    "rillsoft-project": {
      "command": "npx",
      "args": ["-y", "@rillsoft/rillsoft-project-mcp"]
    }
  }
}
```

Braucht Node.js ab Version 18; echte Ergebnisse nur unter Windows mit
laufendem Rillsoft Project 10. Kunden brauchen den Launcher nicht: Die
Konfigurationen oben verbinden direkt mit dem laufenden Programm.

## Wenn es hakt

| Symptom | Ursache und Abhilfe |
|---|---|
| `400` | Sitzung oder Protokollstand fehlt – `initialize` senden, danach `Mcp-Session-Id` und `MCP-Protocol-Version: 2025-06-18` mitschicken |
| `401` | Ein API-Key ist gesetzt; der Client braucht `Authorization: Bearer <KEY>` |
| `403` | Die Anfrage trägt einen `Origin`-Header, wie ihn Browser senden; einen MCP-Client statt einer Browserseite verwenden |
| kein Port nach einem Absturz | Der Dialog zur Autowiederherstellung wartet; ihn beantworten oder `RillPrj.exe /mcp` starten |
| Server lauscht nicht sofort | Er startet einige Sekunden nach dem Programmstart |

## Werkzeugkatalog und Vertrag

Werkzeugnamen tragen das Präfix `rillsoft_` und sind in jeder Sprachfassung
englisch; Argumente, Ergebnisfelder, Enumwerte und Fehlercodes sind stabil,
Meldungen folgen der Sprache des laufenden Rillsoft Project. Wie
`tools/list`, Schemas, Fehler, Rückgängig, Nur-Lesen-Modus und Sitzungen
funktionieren: [Entwickler: der Vertrag des MCP-Servers](https://rillsoft.ai/de/entwickler/).

Der vollständige Werkzeugkatalog – 118 Werkzeuge von Rillsoft Project
10.0.626.0 mit Titel, Zugriffsart, Parametern und Beschreibung – steht in
[TOOLS.md](TOOLS.md) (englisch, wie das Programm ihn liefert). Er wird von
`scripts/generate_tools.py` aus `tools/list` des laufenden Programms erzeugt
und nie von Hand gepflegt; das Rohergebnis samt Ausgabeschemas steht in
[tools-list.json](tools-list.json).

## Links

- MCP-Server: https://rillsoft.ai/de/mcp/
- Erste Schritte: https://rillsoft.ai/de/erste-schritte/
- Entwickler: https://rillsoft.ai/de/entwickler/
- Prompt-Bibliothek: https://rillsoft.ai/de/prompts/
- Produkt: https://www.rillsoft.de/mcp-server/
- Offizielle MCP-Registry: `ai.rillsoft/rillsoft-project` ([Eintrag](https://registry.modelcontextprotocol.io/v0/servers?search=ai.rillsoft/rillsoft-project))

## Anbieter

Rillsoft GmbH, Leonberg – Software für Terminplanung, Ressourcenplanung und
Multiprojektmanagement. Rillsoft Project ist proprietäre Software; dieses
Repository enthält die MCP-Dokumentation und den Launcher.

## Lizenz

Die Dokumentation und der Werkzeugkatalog in diesem Repository stehen unter
[CC BY 4.0](LICENSE), der Launcher-Code (`launcher.js`) unter der
[MIT-Lizenz](LICENSE-MIT). Rillsoft Project selbst einschließlich seines
MCP-Servers ist proprietäre Software der Rillsoft GmbH und fällt unter keine
der beiden Lizenzen.
