'use client';

import React from 'react';

/** Parse inline markdown: **bold**, *italic*, `code` */
export const renderInlineMarkdown = (text: string, keyPrefix: string = '') => {
  // Combined regex: **bold**, *italic*, `code`
  const inlineRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = inlineRegex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={`${keyPrefix}-b-${match.index}`} className="text-gold-light font-bold">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={`${keyPrefix}-i-${match.index}`} className="italic text-text-primary/85">
          {match[3]}
        </em>
      );
    } else if (match[4]) {
      // `code`
      parts.push(
        <code key={`${keyPrefix}-c-${match.index}`} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gold-light text-xs font-mono">
          {match[4]}
        </code>
      );
    }

    lastIndex = inlineRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};

/** Detect and parse a markdown table block */
const tryParseTable = (lines: string[], startIdx: number): { element: React.ReactElement; consumed: number } | null => {
  // A table needs at least 3 lines: header, separator, row
  if (startIdx + 2 >= lines.length) return null;

  const headerLine = lines[startIdx].trim();
  const separatorLine = lines[startIdx + 1].trim();

  // Check if this looks like a table header + separator
  if (!headerLine.includes('|') || !separatorLine.match(/^\|?[\s\-:|]+\|/)) return null;

  const parseRow = (line: string) => {
    return line.split('|').map(cell => cell.trim()).filter((cell, idx, arr) => {
      // Remove empty leading/trailing cells from | ... |
      if (idx === 0 && cell === '') return false;
      if (idx === arr.length - 1 && cell === '') return false;
      return true;
    });
  };

  const headers = parseRow(headerLine);
  if (headers.length === 0) return null;

  // Parse alignment from separator
  const sepCells = parseRow(separatorLine);
  const alignments = sepCells.map(cell => {
    if (cell.startsWith(':') && cell.endsWith(':')) return 'center' as const;
    if (cell.endsWith(':')) return 'right' as const;
    return 'left' as const;
  });

  // Parse body rows
  const bodyRows: string[][] = [];
  let rowIdx = startIdx + 2;
  while (rowIdx < lines.length && lines[rowIdx].trim().includes('|') && lines[rowIdx].trim() !== '') {
    bodyRows.push(parseRow(lines[rowIdx].trim()));
    rowIdx++;
  }

  if (bodyRows.length === 0) return null;

  const element = (
    <div key={`table-${startIdx}`} className="overflow-x-auto my-3 rounded-xl border border-gold-primary/15">
      <table className="w-full text-xs md:text-sm font-lora border-collapse">
        <thead>
          <tr className="bg-gold-primary/8 border-b border-gold-primary/20">
            {headers.map((header, hIdx) => (
              <th
                key={hIdx}
                className="px-3 py-2.5 text-gold-light font-bold text-left tracking-wide"
                style={{ textAlign: alignments[hIdx] || 'left' }}
              >
                {renderInlineMarkdown(header, `th-${startIdx}-${hIdx}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className="border-b border-white/5 hover:bg-white/3 transition-colors">
              {headers.map((_, cIdx) => (
                <td
                  key={cIdx}
                  className="px-3 py-2 text-text-primary"
                  style={{ textAlign: alignments[cIdx] || 'left' }}
                >
                  {renderInlineMarkdown(row[cIdx] || '', `td-${startIdx}-${rIdx}-${cIdx}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return { element, consumed: rowIdx - startIdx };
};

/** Main markdown parser */
export const renderParsedMarkdown = (text: string) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactElement[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // ─── Horizontal Rule ───
    if (trimmed.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      elements.push(
        <hr key={`hr-${i}`} className="border-0 h-px bg-gradient-to-r from-transparent via-gold-primary/25 to-transparent my-4" />
      );
      i++;
      continue;
    }

    // ─── Table ───
    const tableResult = tryParseTable(lines, i);
    if (tableResult) {
      elements.push(tableResult.element);
      i += tableResult.consumed;
      continue;
    }

    // ─── Heading ### ───
    if (trimmed.startsWith('###')) {
      const cleanTitle = trimmed.replace(/^###\s*/, '');
      elements.push(
        <h4 key={`h3-${i}`} className="font-cinzel text-base text-gold-light font-bold mt-4 mb-2 tracking-wide">
          {renderInlineMarkdown(cleanTitle, `h3-${i}`)}
        </h4>
      );
      i++;
      continue;
    }

    // ─── Standalone Bold Title (e.g. **Title**) ───
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 80 && !trimmed.slice(2, -2).includes('**')) {
      const cleanTitle = trimmed.slice(2, -2);
      elements.push(
        <h4 key={`bt-${i}`} className="font-sans font-extrabold text-sm text-gold-light uppercase tracking-widest mt-4 mb-1.5">
          {cleanTitle}
        </h4>
      );
      i++;
      continue;
    }

    // ─── Unordered List ───
    if (trimmed.match(/^[-*]\s+/)) {
      const listItems: { content: string; indent: number }[] = [];
      while (i < lines.length && lines[i].trim().match(/^[-*]\s+/)) {
        const indent = lines[i].search(/\S/);
        const content = lines[i].trim().replace(/^[-*]\s+/, '');
        listItems.push({ content, indent });
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1.5 pl-1">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-2 text-sm text-text-primary font-lora leading-relaxed" style={{ paddingLeft: `${Math.min(item.indent, 4) * 8}px` }}>
              <span className="text-gold-primary/60 mt-1.5 text-[6px] flex-shrink-0">●</span>
              <span>{renderInlineMarkdown(item.content, `li-${i}-${lIdx}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ─── Ordered List ───
    if (trimmed.match(/^\d+\.\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1.5 pl-1">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-2.5 text-sm text-text-primary font-lora leading-relaxed">
              <span className="text-gold-light/70 font-bold text-xs mt-0.5 flex-shrink-0 w-5 text-right">{lIdx + 1}.</span>
              <span>{renderInlineMarkdown(item, `ol-${i}-${lIdx}`)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // ─── Empty line ───
    if (trimmed === '') {
      i++;
      continue;
    }

    // ─── Regular paragraph ───
    elements.push(
      <p key={`p-${i}`} className="text-text-primary text-sm leading-relaxed mb-3 font-lora">
        {renderInlineMarkdown(trimmed, `p-${i}`)}
      </p>
    );
    i++;
  }

  return elements;
};

interface MarkdownProps {
  content: string;
  className?: string;
}

export default function Markdown({ content, className = '' }: MarkdownProps) {
  return <div className={className}>{renderParsedMarkdown(content)}</div>;
}
