import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { demoDataset } from '../src/data/demoData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const targetPath = path.join(projectRoot, 'public', 'demo-data.json')

await fs.writeFile(targetPath, JSON.stringify(demoDataset))
console.log(`Wrote ${targetPath}`)
