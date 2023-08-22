import { formatFileSize } from './Storage';
import { expect, test } from 'vitest';

test('Works for 0', () => {
  expect(formatFileSize(0)).toEqual('');
});

test('Works for values less than a Kilobyte', () => {
  expect(formatFileSize(512)).toEqual('512 B');
});

test('Works for Megabyte', () => {
  expect(formatFileSize(1024 * 1024)).toEqual('1.00 MB');
});

test('Works for 1.5 Megabytes', () => {
  expect(formatFileSize((1024 + 512) * 1024)).toEqual('1.50 MB');
});

test('Works for 1.5 Gigabytes', () => {
  expect(formatFileSize((1024 + 512) * Math.pow(1024, 2))).toEqual('1.50 GB');
});
