import { handle } from '@hono/node-server/vercel'
import { app } from '../src/index'

export const config = {
    runtime: 'edge'
}

export default handle(app)
