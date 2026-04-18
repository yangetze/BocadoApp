import { normalizeString } from './stringUtils';

describe('normalizeString', () => {
  it('should convert strings to lowercase', () => {
    expect(normalizeString('HELLO')).toBe('hello');
    expect(normalizeString('World')).toBe('world');
  });

  it('should remove accents and diacritics', () => {
    expect(normalizeString('áéíóú')).toBe('aeiou');
    expect(normalizeString('ÁÉÍÓÚ')).toBe('aeiou');
    expect(normalizeString('ñÑ')).toBe('nn');
    expect(normalizeString('çÇ')).toBe('cc');
    expect(normalizeString('üÜ')).toBe('uu');
  });

  it('should handle mixed case and accents', () => {
    expect(normalizeString('Campaña de Sensibilización')).toBe('campana de sensibilizacion');
    expect(normalizeString('MÜNCHEN')).toBe('munchen');
  });

  it('should return an empty string for falsy inputs', () => {
    expect(normalizeString(null)).toBe('');
    expect(normalizeString(undefined)).toBe('');
    expect(normalizeString('')).toBe('');
    expect(normalizeString(false)).toBe('');
  });

  it('should preserve numbers and special characters that are not diacritics', () => {
    expect(normalizeString('Price: $10.50!')).toBe('price: $10.50!');
    expect(normalizeString('User_Name-123')).toBe('user_name-123');
  });

  it('should handle strings that are already normalized', () => {
    expect(normalizeString('hello world')).toBe('hello world');
    expect(normalizeString('123')).toBe('123');
  });
});
