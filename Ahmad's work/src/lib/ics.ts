export type ParsedICSEvent = {
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
};

function unfoldLines(raw: string): string[] {
  const rawLines = raw.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of rawLines) {
    if (line.startsWith(" ") || line.startsWith("\t")) {
      if (out.length > 0) {
        out[out.length - 1] += line.slice(1);
      }
    } else {
      out.push(line);
    }
  }
  return out;
}

function unescape(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function parseICalDate(value: string): Date | null {
  const v = value.trim();

  const utcMatch = v.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/
  );
  if (utcMatch) {
    const [, y, m, d, h, min, s] = utcMatch;
    return new Date(
      Date.UTC(+y, +m - 1, +d, +h, +min, +s)
    );
  }

  const localMatch = v.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/
  );
  if (localMatch) {
    const [, y, m, d, h, min, s] = localMatch;
    return new Date(+y, +m - 1, +d, +h, +min, +s);
  }

  const dateMatch = v.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateMatch) {
    const [, y, m, d] = dateMatch;
    return new Date(+y, +m - 1, +d, 9, 0, 0);
  }

  return null;
}

function splitProperty(line: string): { name: string; value: string } | null {
  const colon = line.indexOf(":");
  if (colon === -1) return null;
  const head = line.slice(0, colon);
  const value = line.slice(colon + 1);
  const semi = head.indexOf(";");
  const name = (semi === -1 ? head : head.slice(0, semi)).toUpperCase();
  return { name, value };
}

export function parseICS(raw: string): ParsedICSEvent[] {
  const lines = unfoldLines(raw);
  const events: ParsedICSEvent[] = [];

  let inEvent = false;
  let current: Partial<ParsedICSEvent> = {};

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      inEvent = false;
      if (current.summary && current.start && current.end) {
        events.push(current as ParsedICSEvent);
      }
      current = {};
      continue;
    }
    if (!inEvent) continue;

    const prop = splitProperty(line);
    if (!prop) continue;
    const { name, value } = prop;

    switch (name) {
      case "SUMMARY":
        current.summary = unescape(value);
        break;
      case "DESCRIPTION":
        current.description = unescape(value);
        break;
      case "LOCATION":
        current.location = unescape(value);
        break;
      case "DTSTART": {
        const d = parseICalDate(value);
        if (d) current.start = d;
        break;
      }
      case "DTEND": {
        const d = parseICalDate(value);
        if (d) current.end = d;
        break;
      }
    }
  }

  return events;
}
