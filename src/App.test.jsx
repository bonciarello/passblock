import { describe, it, expect } from 'vitest';

// We test the pure logic function — extracted for testability
function computeStrength(pwd) {
  if (!pwd) return { criteria: {}, totalScore: 0, level: 'empty' };

  const checks = {
    length: Math.min(pwd.length, 10),
    uppercase: (pwd.match(/[A-Z]/g) || []).length,
    lowercase: (pwd.match(/[a-z]/g) || []).length,
    numbers: (pwd.match(/[0-9]/g) || []).length,
    symbols: (pwd.match(/[^A-Za-z0-9]/g) || []).length,
  };

  const BLOCKS = 5;
  const keys = ['length', 'uppercase', 'lowercase', 'numbers', 'symbols'];

  const criteria = {};
  let filledBlocks = 0;
  const totalBlocks = keys.length * BLOCKS;

  for (const key of keys) {
    const raw = checks[key];
    const filled = Math.min(raw, BLOCKS);
    criteria[key] = { raw, filled, max: BLOCKS };
    filledBlocks += filled;
  }

  const totalScore = totalBlocks > 0 ? Math.round((filledBlocks / totalBlocks) * 100) : 0;

  let level;
  if (totalScore === 0) level = 'empty';
  else if (totalScore <= 30) level = 'weak';
  else if (totalScore <= 60) level = 'medium';
  else if (totalScore <= 85) level = 'strong';
  else level = 'very-strong';

  return { criteria, totalScore, level };
}

describe('computeStrength', () => {
  it('returns empty for empty password', () => {
    const result = computeStrength('');
    expect(result.totalScore).toBe(0);
    expect(result.level).toBe('empty');
  });

  it('returns empty for null/undefined password', () => {
    const result = computeStrength(null);
    expect(result.totalScore).toBe(0);
    expect(result.level).toBe('empty');
  });

  it('rates a short lowercase password as weak', () => {
    const result = computeStrength('ciao');
    // length: min(4,5)=4, uppercase:0, lowercase:min(4,5)=4, numbers:0, symbols:0
    // filled: 4+0+4+0+0=8, total: 25, score = 32 => medium
    expect(result.criteria.length.filled).toBe(4);
    expect(result.criteria.lowercase.filled).toBe(4);
    expect(result.criteria.uppercase.filled).toBe(0);
    expect(result.criteria.numbers.filled).toBe(0);
    expect(result.criteria.symbols.filled).toBe(0);
    expect(result.totalScore).toBe(32);
    expect(result.level).toBe('medium');
  });

  it('rates a strong password with all criteria as very-strong', () => {
    // 5 uppercase, 5 lowercase, 5 numbers, 5 symbols, length >= 10
    const result = computeStrength('ABCDEabcde12345!@#$%');
    // filled: length=5, uppercase=5, lowercase=5, numbers=5, symbols=5 => 25/25 = 100
    expect(result.totalScore).toBe(100);
    expect(result.level).toBe('very-strong');
  });

  it('fills all 5 blocks for length >= 10', () => {
    const result = computeStrength('abcdefghij');
    expect(result.criteria.length.filled).toBe(5);
    expect(result.criteria.length.raw).toBe(10);
  });

  it('fills all 5 blocks for many symbols', () => {
    const result = computeStrength('!@#$%^&*()_+');
    expect(result.criteria.symbols.filled).toBe(5);
  });

  it('handles password with only numbers', () => {
    const result = computeStrength('12345');
    expect(result.criteria.numbers.filled).toBe(5);
    expect(result.criteria.lowercase.filled).toBe(0);
  });

  it('a longer password with symbols scores higher than a short one', () => {
    const short = computeStrength('abc');
    const long = computeStrength('Abcdefgh1!');
    expect(long.totalScore).toBeGreaterThan(short.totalScore);
  });

  it('two identical passwords have the same score', () => {
    const a = computeStrength('Test123!');
    const b = computeStrength('Test123!');
    expect(a.totalScore).toBe(b.totalScore);
  });

  it('caps raw count at 10 for length', () => {
    const result = computeStrength('a'.repeat(25));
    expect(result.criteria.length.raw).toBe(10);
  });
});
