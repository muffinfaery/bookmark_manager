import { describe, it, expect } from 'vitest';
import { isValidUrl, extractDomain, getFaviconUrl, normalizeUrl } from '../url';

describe('url utilities', () => {
  describe('isValidUrl', () => {
    it('returns true for valid http URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('http://example.com/path')).toBe(true);
      expect(isValidUrl('http://example.com:8080')).toBe(true);
    });

    it('returns true for valid https URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://subdomain.example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
    });

    it('returns false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('file:///path/to/file')).toBe(false);
    });

    it('returns false for javascript URLs', () => {
      expect(isValidUrl('javascript:void(0)')).toBe(false);
    });

    it('returns false for data URLs', () => {
      expect(isValidUrl('data:text/html,<h1>Hello</h1>')).toBe(false);
    });
  });

  describe('extractDomain', () => {
    it('extracts domain from valid URLs', () => {
      expect(extractDomain('https://example.com')).toBe('example.com');
      expect(extractDomain('https://www.example.com')).toBe('www.example.com');
      expect(extractDomain('https://sub.domain.example.com/path')).toBe('sub.domain.example.com');
    });

    it('returns null for invalid URLs', () => {
      expect(extractDomain('not-a-url')).toBe(null);
      expect(extractDomain('')).toBe(null);
    });

    it('handles URLs with ports', () => {
      expect(extractDomain('http://localhost:3000')).toBe('localhost');
      expect(extractDomain('https://example.com:8080/path')).toBe('example.com');
    });
  });

  describe('getFaviconUrl', () => {
    it('returns Google favicon URL for valid URLs', () => {
      const result = getFaviconUrl('https://github.com');
      expect(result).toBe('https://www.google.com/s2/favicons?domain=github.com&sz=32');
    });

    it('uses custom size parameter', () => {
      const result = getFaviconUrl('https://github.com', 64);
      expect(result).toBe('https://www.google.com/s2/favicons?domain=github.com&sz=64');
    });

    it('returns null for invalid URLs', () => {
      expect(getFaviconUrl('not-a-url')).toBe(null);
      expect(getFaviconUrl('')).toBe(null);
    });
  });

  describe('normalizeUrl', () => {
    it('adds https:// prefix to URLs without protocol', () => {
      expect(normalizeUrl('example.com')).toBe('https://example.com');
      expect(normalizeUrl('www.example.com')).toBe('https://www.example.com');
    });

    it('preserves URLs that already have http://', () => {
      expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('preserves URLs that already have https://', () => {
      expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('handles empty strings', () => {
      expect(normalizeUrl('')).toBe('');
      expect(normalizeUrl('   ')).toBe('');
    });

    it('trims whitespace', () => {
      expect(normalizeUrl('  example.com  ')).toBe('https://example.com');
    });
  });
});
