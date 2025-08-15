import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    
    try {
      // Only try to parse JSON if content-type indicates JSON
      if (contentType && contentType.includes("application/json")) {
        const clonedRes = res.clone();
        const json = await clonedRes.json();
        throw new Error(json.message || `HTTP ${res.status}`);
      } else {
        // For non-JSON responses, get text directly
        const text = await res.text();
        if (text.includes('<!DOCTYPE')) {
          throw new Error(`Authentication required - please log in again`);
        }
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
    } catch (jsonError) {
      // If anything fails, fall back to basic error
      const text = await res.text();
      if (text.includes('<!DOCTYPE')) {
        throw new Error(`Server returned HTML page - authentication may be required`);
      }
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    // Check if response is JSON before parsing
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    } else {
      // If not JSON, get text and check if it's HTML
      const text = await res.text();
      if (text.includes('<!DOCTYPE')) {
        throw new Error('Server returned HTML instead of JSON - authentication may be required');
      }
      throw new Error(`Expected JSON response but received: ${contentType || 'unknown content type'}`);
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
