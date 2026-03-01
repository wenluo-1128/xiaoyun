function sanitizeHtml(html) {
  let sanitized = html
    .replace(/on\w+\s*=\s*["']?[^"'>]+/gi, '');
  return sanitized;
}

module.exports = { sanitizeHtml };
