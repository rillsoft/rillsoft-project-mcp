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

Dieses Repository enthält **nur Dokumentation und Client-Konfiguration**. Der
Server ist Teil der Desktop-Anwendung Rillsoft Project 10; es gibt kein Paket
zum Installieren und keinen gehosteten Endpunkt.

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
   (`Authorization: Bearer <KEY>`). Das Format folgt der MCP-Spezifikation;
   die Feldnamen können je Client abweichen – die Dokumentation Ihres Clients
   ist maßgeblich. Geprüft haben wir die Verbindung mit Claude und Codex.
   **Kontrolle:** Der Client listet die Werkzeuge des Servers auf – im
   Nur-Lesen-Modus nur die lesenden. `/mcp` gilt exakt, `/mcp/` ist ein 404.
3. **Die erste Frage stellen**, zum Beispiel: *Fasse den aktuellen
   Projektstatus zusammen: Termine, Fortschritt, offene Konflikte, in fünf
   Absätzen.* Mitgelieferte Branchenbeispiele mit synthetischen Daten
   erlauben den Test ohne eigene Projekte.

Jeder ändernde Aufruf ist in Rillsoft Project ein normaler
Bearbeitungsschritt – Sie nehmen ihn mit Strg+Z zurück wie jeden eigenen.

Schritt für Schritt mit Kontrollen: [Erste Schritte](https://rillsoft.ai/de/erste-schritte/).

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

Der vollständige Werkzeugkatalog wird aus `tools/list` des ausgelieferten
Builds erzeugt und hier sowie auf der Entwicklerseite veröffentlicht.

## Links

- MCP-Server: https://rillsoft.ai/de/mcp/
- Erste Schritte: https://rillsoft.ai/de/erste-schritte/
- Entwickler: https://rillsoft.ai/de/entwickler/
- Prompt-Bibliothek: https://rillsoft.ai/de/prompts/
- Produkt: https://www.rillsoft.de/mcp-server/

## Anbieter

Rillsoft GmbH, Leonberg – Software für Terminplanung, Ressourcenplanung und
Multiprojektmanagement. Rillsoft Project ist proprietäre Software; dieses
Repository enthält nur die MCP-Dokumentation.

## Lizenz

Die Dokumentation in diesem Repository steht unter
[CC BY 4.0](LICENSE). Rillsoft Project selbst einschließlich seines
MCP-Servers ist proprietäre Software der Rillsoft GmbH und fällt nicht unter
diese Lizenz.
