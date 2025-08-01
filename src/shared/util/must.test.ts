import {describe, it, expect} from 'vitest';
import {must} from './must.js';

describe('must', () => {
  it('throws for undefined', () => {
    expect(() => must(undefined)).toThrowError();
  });

  it('returns value', () => {
    const result: string = must('value');
    expect(result).toBe('value');
  });
});
