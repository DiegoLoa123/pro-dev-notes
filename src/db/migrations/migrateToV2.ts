// src/db/migrations/migrateToV2.ts

export function plainTextToHtml(text: string): string {
  if (!text) {
    return '<p></p>';
  }

  const escaped = text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => {
      const content = paragraph.replaceAll('\n', '<br>');

      return `<p>${content}</p>`;
    })
    .join('');
}