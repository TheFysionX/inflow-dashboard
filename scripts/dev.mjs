import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const viteBin = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js')
const preferredPorts = [
  3000,
  3001,
  3002,
  ...Array.from({ length: 18 }, (_, index) => 3003 + index),
  5173,
  5174,
  ...Array.from({ length: 16 }, (_, index) => 5175 + index),
]

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer()

    server.once('error', () => {
      resolve(false)
    })

    server.once('listening', () => {
      server.close(() => resolve(true))
    })

    server.listen(port, '0.0.0.0')
  })
}

async function pickPort() {
  for (const port of preferredPorts) {
    // Try a small list of stable ports so the URL is predictable.
    if (await isPortFree(port)) {
      return port
    }
  }

  throw new Error('No free local development port was available.')
}

async function main() {
  const port = await pickPort()
  const args = [viteBin, '--host', '0.0.0.0', '--port', String(port), '--clearScreen', 'false']

  if (port !== 3000) {
    console.log(`Port 3000 is busy, starting Vite on http://localhost:${port} instead.`)
  }

  const child = spawn(process.execPath, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  })

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }

    process.exit(code ?? 0)
  })

  child.on('error', (error) => {
    console.error('Unable to start the Vite dev server.')
    console.error(error)
    process.exit(1)
  })
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
