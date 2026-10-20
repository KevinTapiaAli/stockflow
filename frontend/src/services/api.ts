export class ApiError extends Error {
  constructor(message: string, public status: number, public requestId?: string) { super(message); }
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('No se pudo conectar. Revise la conexión y el estado de los servicios.', 0);
  }
  if (!response.ok) {
    const body: { message?: string | string[]; requestId?: string } = await response.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(' · ') : body.message;
    throw new ApiError(message ?? `No se pudo completar la solicitud (${response.status}).`, response.status, body.requestId);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });
export function query(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value !== undefined && value !== '') params.set(key, String(value));
  return `?${params.toString()}`;
}
