const fileInput = document.querySelector("#fileInput");
const dropZone = document.querySelector("#dropZone");
const preview = document.querySelector("#preview");
const fileName = document.querySelector("#fileName");
const fileStats = document.querySelector("#fileStats");

fileInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) readMarkdownFile(file);
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, () => {
    dropZone.classList.remove("is-dragging");
  });
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  const [file] = event.dataTransfer.files;
  if (file) readMarkdownFile(file);
});

dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

function readMarkdownFile(file) {
  const validExtension = /\.(md|markdown|txt)$/i.test(file.name);
  if (!validExtension) {
    showError("Elige un archivo .md, .markdown o .txt.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result || "");
    fileName.textContent = file.name;
    fileStats.textContent = `${formatBytes(file.size)} - ${countWords(text)} palabras`;
    preview.innerHTML = parseMarkdown(text);
  };
  reader.onerror = () => showError("No se pudo leer el archivo.");
  reader.readAsText(file);
}

function showError(message) {
  fileName.textContent = "No se cargo el archivo";
  fileStats.textContent = message;
  preview.innerHTML = `<p class="error">${escapeHtml(message)}</p>`;
}

function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let listType = null;
  let inCode = false;
  let codeLines = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${parseInline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  const flushBlocks = () => {
    flushParagraph();
    closeList();
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        flushBlocks();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushBlocks();
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushBlocks();
      const level = heading[1].length;
      html.push(`<h${level}>${parseInline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      flushBlocks();
      const quoteLines = [trimmed.replace(/^>\s?/, "")];
      while (lines[index + 1] && /^>\s?/.test(lines[index + 1].trim())) {
        index += 1;
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
      }
      html.push(`<blockquote>${parseMarkdown(quoteLines.join("\n"))}</blockquote>`);
      continue;
    }

    if (isTableStart(lines, index)) {
      flushBlocks();
      const tableLines = [lines[index], lines[index + 1]];
      index += 2;
      while (lines[index] && lines[index].includes("|")) {
        tableLines.push(lines[index]);
        index += 1;
      }
      index -= 1;
      html.push(parseTable(tableLines));
      continue;
    }

    const unordered = /^[-*+]\s+(.+)$/.exec(trimmed);
    const ordered = /^\d+\.\s+(.+)$/.exec(trimmed);
    if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? "ul" : "ol";
      if (listType !== nextType) {
        closeList();
        html.push(`<${nextType}>`);
        listType = nextType;
      }
      html.push(`<li>${parseInline((unordered || ordered)[1])}</li>`);
      continue;
    }

    closeList();
    paragraph.push(trimmed);
  }

  if (inCode) {
    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }
  flushBlocks();

  return html.join("\n") || "<p>El archivo esta vacio.</p>";
}

function isTableStart(lines, index) {
  const header = lines[index] || "";
  const divider = lines[index + 1] || "";
  return header.includes("|") && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(divider);
}

function parseTable(lines) {
  const rows = lines.map((line) => trimTableEdges(line).split("|").map((cell) => cell.trim()));
  const header = rows[0];
  const body = rows.slice(2);
  const headHtml = header.map((cell) => `<th>${parseInline(cell)}</th>`).join("");
  const bodyHtml = body
    .map((row) => `<tr>${row.map((cell) => `<td>${parseInline(cell)}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
}

function trimTableEdges(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "");
}

function parseInline(text) {
  let result = escapeHtml(text);

  result = result.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_match, alt, src) => {
    return `<img src="${sanitizeUrl(src)}" alt="${escapeAttribute(alt)}">`;
  });
  result = result.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_match, label, href) => {
    return `<a href="${sanitizeUrl(href)}" target="_blank" rel="noreferrer">${label}</a>`;
  });
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  result = result.replace(/~~([^~]+)~~/g, "<s>$1</s>");

  return result;
}

function sanitizeUrl(url) {
  const value = String(url).trim();
  if (/^(https?:|mailto:|data:image\/|\.{0,2}\/|#)/i.test(value)) {
    return escapeAttribute(value);
  }
  return "#";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function countWords(text) {
  return (text.trim().match(/\S+/g) || []).length;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
