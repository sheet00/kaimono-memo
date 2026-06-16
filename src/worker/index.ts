export interface Env {
  ASSETS: Fetcher
}

const DEV_ORIGIN = 'http://localhost:5173'

const corsHeaders = {
  'Access-Control-Allow-Origin': DEV_ORIGIN,
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/') && request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      })
    }

    if (url.pathname === '/api/health') {
      return Response.json(
        {
          ok: true,
        },
        {
          headers: corsHeaders,
        },
      )
    }

    return env.ASSETS.fetch(request)
  },
}
