import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ERROR_CODES, getUserMessage } from '@/lib/errors';
import { useToast } from '../useToast';

beforeEach(() => {
  vi.useFakeTimers();
  useToast().clear();
});

afterEach(() => {
  useToast().clear();
  vi.useRealTimers();
});

describe('useToast', () => {
  it('show sets current', () => {
    const toast = useToast();
    toast.show('hi');
    expect(toast.current.value).toBe('hi');
  });

  it('hides after 2000 ms by default', () => {
    const toast = useToast();
    toast.show('hi');
    vi.advanceTimersByTime(1999);
    expect(toast.current.value).toBe('hi');
    vi.advanceTimersByTime(1);
    expect(toast.current.value).toBeNull();
  });

  it('respects a custom duration', () => {
    const toast = useToast();
    toast.show('hi', 500);
    vi.advanceTimersByTime(500);
    expect(toast.current.value).toBeNull();
  });

  it('shows the second message after the first', () => {
    const toast = useToast();
    toast.show('one');
    toast.show('two');
    expect(toast.current.value).toBe('one');
    vi.advanceTimersByTime(2000);
    expect(toast.current.value).toBe('two');
  });

  it('skips a message equal to the one being shown', () => {
    const toast = useToast();
    toast.show('same');
    toast.show('same');
    vi.advanceTimersByTime(2000);
    expect(toast.current.value).toBeNull();
  });

  it('skips a message equal to the last queued one', () => {
    const toast = useToast();
    toast.show('one');
    toast.show('two');
    toast.show('two');
    vi.advanceTimersByTime(2000);
    expect(toast.current.value).toBe('two');
    vi.advanceTimersByTime(2000);
    expect(toast.current.value).toBeNull();
  });

  it('showError shows the user message for 3500 ms', () => {
    const toast = useToast();
    toast.showError(ERROR_CODES.STORAGE_UNAVAILABLE);
    expect(toast.current.value).toBe(getUserMessage(ERROR_CODES.STORAGE_UNAVAILABLE));
    vi.advanceTimersByTime(3499);
    expect(toast.current.value).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(toast.current.value).toBeNull();
  });

  it('shares state between calls', () => {
    useToast().show('shared');
    expect(useToast().current.value).toBe('shared');
  });

  it('clear empties queue and current', () => {
    const toast = useToast();
    toast.show('one');
    toast.show('two');
    toast.clear();
    expect(toast.current.value).toBeNull();
    vi.advanceTimersByTime(5000);
    expect(toast.current.value).toBeNull();
  });
});
