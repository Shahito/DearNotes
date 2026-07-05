const log = (...args) => console.log(new Date().toISOString(), ...args);

function parseBody(rawBody) {
  return JSON.parse(rawBody.toString());
}

async function logUserLeft(data) {
  log('User left:', data);
}

async function logMemoryReveal(data) {
  log('Memory revealed:', data);
}

module.exports = { parseBody, logUserLeft, logMemoryReveal };