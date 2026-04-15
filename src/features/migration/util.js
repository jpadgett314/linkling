
function* range(start, end, step = 1) {
  if (end === undefined) {
    [start, end] = [0, start];
  }
  for (let i = start; step > 0 ? i < end : i > end; i += step) {
    yield i;
  }
}

function randomId() {
  const maxval = 10000000000;
  return Math.round(Math.random() * maxval);
}

function randomColor() {
  const chars = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += chars[Math.floor(Math.random() * 16)];
  }
  return color;
}

function safeFileName(str) {
  return str
    .replace(/[^a-z0-9\.\-_]/gi, '-')
    .replace(/\-{2,}/g, '-')
    .toLowerCase()
}

export { range, randomId, randomColor, safeFileName };
