#!/usr/bin/env node

import nunjucks from 'nunjucks'
import fs from 'node:fs/promises'
import path from 'node:path'
import JSON5 from 'json5'
import { glob } from 'glob'

// Hack
const imagePattern = (
  "https://bafybeiamuxc74bki5rdht3sufi7xugyc5om27qbecaf3nyjht2lmlhxxju.ipfs.w3s.link/%E2%84%96{{ count }}.cover.inlined.svg"
)

const njk = nunjucks.configure({
  autoescape: false,
  trimBlocks: true,
  lstripBlocks: true,
})

const OUT = `output-${new Date().toISOString()}`
const pattern = {
  image: /(<image\b[^>]*?\s)((?:xlink:)?href)\s*=\s*(?:"([^"]+)"|'([^']+)')/gi,
  css: /<html:link rel="stylesheet" href="(.+)"\/>/gi,
}

try {
  const cover = await fs.readFile(
    path.join(process.cwd(), 'cover.html.njk'),
    'utf8'
  )
  const manifest = await fs.readFile(
    path.join(process.cwd(), '№1.manifest.json.njk'),
    'utf8'
  )
  await fs.mkdir(OUT, { recursive: true })

  const resources = JSON5.parse(
    await fs.readFile(
      path.join(process.cwd(), 'resources.json5'),
      'utf8',
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

  await fs.symlink('../images/', `${OUT}/images`)

  const files = await glob('images/*.webp')
  const outs = await Promise.all(
    files.map(async (filename, idx) => {
      const outputPath = path.join(
        OUT, `№${idx + 1}.cover.svg`
      )
      console.log(`Rendering: ${outputPath}`)
      const result = njk.renderString(cover, { filename })
      await fs.writeFile(outputPath, result)
      await inlineResources(outputPath)
      console.log(`Generated: ${outputPath}`)
      return outputPath
    })
  )

  await Promise.all(
    outs.map(async (_filename, idx) => {
      const outputPath = path.join(
        OUT, `№${idx + 1}.manifest.json`
      )
      console.log(`Rendering: ${outputPath}`)
      const filename = njk.renderString(imagePattern, { count: idx + 1 }) // Más hack
      const result = njk.renderString(manifest, { filename })
      await fs.writeFile(outputPath, result)
      console.log(`Generated: ${outputPath}`)
    })
  )

  console.log('Done Generating.')
} catch (error) {
  console.error('Error processing template:', error)
  process.exit(1);
}

export async function inlineResources(toDo) {
  console.debug(`Inlining Images In: ${toDo}`)
  const svgDir = path.dirname(toDo)

  const base = (await fs.readFile(toDo)).toString()

  let matches = [...base.matchAll(pattern.image)]
  const replacements = await Promise.all(
    matches.map(async ([full, prefix, attr, dq, sq]) => {
      const uri = dq ?? sq

      if (uri.startsWith('data:') || /^(https?:)?\/\//i.test(uri)) {
        return { full, replacement: full } // no-op
      }

      const absolutePath = path.join(svgDir, decodeURIComponent(uri))
      const ext = path.extname(uri)
      const mime = mimeForExtension(ext)
      console.debug({ Reading: absolutePath })
      const bytes = await fs.readFile(absolutePath)
      const isSVG = (ext === '.svg')
      const encoded = isSVG ? percentEncode(bytes) : bytes.toString('base64')
      const encoding = isSVG ? '' : ';base64'
      const quote = dq !== undefined ? '"' : "'"
      return {
        full,
        replacement: `${prefix}${attr}=${quote}data:${mime}${encoding},${encoded}${quote}`
      }
    })
  )
  matches = [...base.matchAll(pattern.css)]
  replacements.push(...await Promise.all(
    matches.map(async ([full, href]) => {
      console.debug({ 'Inling Style': href })
      return {
        full,
        replacement: `<style type="text/css"><![CDATA[${await fs.readFile(path.join(svgDir, decodeURIComponent(href)))}]]></style>`,
      }
    })
  ))

  console.debug({ Processed: toDo })

  let svg = base
  for(const { full, replacement } of replacements) {
    svg = svg.replaceAll(full, replacement)
  }

  const parts = toDo.split('.')
  const done = parts.slice(0, -1).concat(['inlined', parts.at(-1)]).join('.')
  await fs.writeFile(done, svg)
  console.debug(`Wrote encoded images to ${done}.`)
}

function percentEncode(bytes) {
  const unreserved = /[A-Za-z0-9\-._~]/
  const out = []
  for(const byte of bytes) {
    const ch = String.fromCharCode(byte);
    if(unreserved.test(ch)) {
      out.push(ch)
    } else {
      out.push('%' + byte.toString(16).toUpperCase().padStart(2, '0'))
    }
  }
  return out.join('')
}

function mimeForExtension(ext) {
  const map = {
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.webp': 'image/webp',
    '.svg':  'image/svg+xml',
    '.avif': 'image/avif',
  }
  return map[ext.toLowerCase()] ?? 'application/octet-stream'
}
