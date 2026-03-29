#!/usr/bin/env node

import nunjucks from 'nunjucks'
import fs from 'node:fs/promises'
import path from 'node:path'
import JSON5 from 'json5'
import { glob } from 'glob'

const njk = nunjucks.configure({
  autoescape: false,
  trimBlocks: true,
  lstripBlocks: true,
})

const OUT = `output-${new Date().toISOString()}`

try {
  const template = await fs.readFile(
    path.join(process.cwd(), 'cover.njk'),
    'utf8'
  )
  await fs.mkdir(OUT, { recursive: true })

  const resources = JSON5.parse(
    await fs.readFile(
      path.join(process.cwd(), 'resources.json5'),
    )
  )
  await Promise.all(
    resources.map(async (resource) => {
      const files = await glob(resource)
      await Promise.all(files.map(async (file) => {
        console.debug(`Copying: ${file}`)
        const content = await fs.copyFile(
          file,
          path.join(OUT, path.basename(file))
        )
      }))
    })
  )

  const files = await glob('*.webp')
  await Promise.all(
    files.map(async (filename, idx) => {
      const outputPath = path.join(
        OUT, `№${idx + 1}.cover.svg`
      )
      console.log(`Rendering: ${outputPath}`)
      const result = njk.renderString(template, { filename })
      await fs.writeFile(outputPath, result)
      console.log(`Generated: ${outputPath}`)
    })
  )

  console.log('Done Generating.')
} catch (error) {
  console.error('Error processing template:', error)
  process.exit(1);
}
