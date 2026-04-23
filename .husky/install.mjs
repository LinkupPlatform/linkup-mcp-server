if (process.env.NODE_ENV === 'production' || process.env.CI) {
  process.exit(0);
}

try {
  const husky = (await import('husky')).default;

  husky();
} catch {
  process.exit(0);
}
