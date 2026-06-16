import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Env = {
  Bindings: {
    ASSETS: Fetcher
  }
}

const DEV_ORIGIN = 'http://localhost:5173'
const app = new Hono<Env>()

app.use('/api/*', cors({ origin: DEV_ORIGIN }))

app.get('/api/health', (c) =>
  c.json({
    ok: true,
  }),
)

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
