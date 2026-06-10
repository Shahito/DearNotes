const log = (...args) => console.log(new Date().toISOString(), ...args);

function parseBody(rawBody) {
  return JSON.parse(rawBody.toString());
}

async function logUserLeft(data) {
  log('User left:', data);
}

module.exports = { parseBody, logUserLeft };