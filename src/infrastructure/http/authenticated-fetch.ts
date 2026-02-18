type GetToken = () => Promise<string | null>;

export function createAuthenticatedFetch(getToken: GetToken): typeof globalThis.fetch {
  return async (input, init?) => {
    const token = await getToken();

    const headers = new Headers(init?.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(input, { ...init, headers });
  };
}
