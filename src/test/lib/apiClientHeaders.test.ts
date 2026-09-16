import { describe, expect, it } from 'vitest';
import { createRequestHeaders } from '../../lib/apiClient';

describe('createRequestHeaders', () => {
  it('does not advertise JSON when a request has no body', () => {
    expect(createRequestHeaders('token', false)).toEqual({
      Authorization: 'Bearer token',
    });
  });

  it('adds JSON content type only when a JSON body exists', () => {
    expect(createRequestHeaders('token', true)).toEqual({
      Authorization: 'Bearer token',
      'Content-Type': 'application/json',
    });
  });
});
