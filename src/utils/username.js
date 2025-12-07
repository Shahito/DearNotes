function sanitizeDisplayName(display) {
  if (typeof display !== "string") return null;

  let u = display
    .normalize("NFKD")              // décompose accents si existant
    .replace(/[\u0300-\u036f]/g,"") // retire accents combinants
    .replace(/[^\x00-\x7F]/g, "")   // ⚠ retire tout non-ASCII (clé du problème)
    .replace(/[^a-zA-Z0-9_]/g,"");     // whitelist finale
    
  return u;
}

module.exports = { sanitizeDisplayName };
