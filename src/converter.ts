import * as path from 'path'
import * as fs from 'fs-extra'
import { File, Logger, getRelativePath } from './utils'
import { Conversion } from './conversions/conversion'
import Adapter, { ADAPTERS } from './adapters/adapter'

/**
 * The options for converter.
 */
export interface ConverterOptions {
    /**
     * Redirects output files to the directory.
     */
    outDir: string,
    /**
     * Specifies the *conversion* to use.
     */
    conversion: Conversion
}

/**
 * Converts the input resource pack folder.
 * @param src The path of input resource pack folder.
 * @param options The options.
 */
export function convert(src: string, options: ConverterOptions): Logger {
    const inDir = path.resolve(src)
    const outDir = path.resolve(options.outDir)
    const logger = new Logger()
    const conversion = options.conversion

    logger.info('Resouce Pack Converter made by @SPGoding <SPGoding@outlook.com>.')
    logger.info('Starting conversion...')
    logger.prvc(`{inDir}  = '${inDir}'`, `{outDir} = '${outDir}'`)

    try {
        logger.info('Initializing adapters...').indent()
        const adapters: Adapter[] = conversion.adapters.map(adapterInit => {
            for (const adapter of ADAPTERS) {
                if (adapter.name === adapterInit.id) {
                    logger.info(`Initialized adapter '${adapter.name}${JSON.stringify(adapterInit.params)}'.`)
                    return new adapter(adapterInit.params)
                }
            }
        })
        logger.info(`Initialized ${adapters.length} adapter(s).`).indent(-1)

        convertRecursively(inDir, inDir, { outDir, adapters, logger })
    } catch (ex) {
        logger.error(ex)
    } finally {
        logger.info('Finished conversion.')
        return logger
    }
}

function convertRecursively(root: string, inDir: string, options: { outDir: string, adapters: Adapter[], logger: Logger }) {
    const { outDir, logger } = options
    try {
        const directories = fs.readdirSync(inDir)

        directories.forEach(v => {
            const absInPath = path.join(inDir, v)
            const relPath = getRelativePath(root, absInPath)

            if ((fs.statSync(absInPath)).isDirectory()) {
                logger.info(`Handling directory '{inDir}/${relPath}'...`).indent()
                convertRecursively(root, absInPath, options)
                logger.indent(-1)
            } else {
                logger.info(`Handling file '{inDir}/${relPath}'...`).indent()
                const content = fs.readFileSync(absInPath)
                const file = { content, path: relPath }
                convertSingleFile(file, options)
                logger.indent(-1)
            }
        })
    } catch (ex) {
        logger.error(ex)
    }
}

function convertSingleFile(file: File, options: { outDir: string, adapters: Adapter[], logger: Logger }) {
    const { outDir, adapters, logger } = options
    try {
        for (const adapter of adapters) {
            file = adapter.execute(file, logger)
        }

        const filePath = path.join(outDir, path.dirname(file.path))
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, { recursive: true })
        }
        fs.writeFileSync(path.join(outDir, file.path), file.content)

        logger.info(`Created file '{outDir}/${file.path}'.`)
    } catch (ex) {
        logger.error(ex)
    }
}

export default convert