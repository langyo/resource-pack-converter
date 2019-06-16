import { File, Logger } from '../utils'
import { PathAdapter, PathAdapterParams } from './path-adapter'
import { WarnAdapter, WarnAdapterParams } from './warn-adapter'

/**
 * All avaliable adapter classes.
 */
export const ADAPTERS: any[] = [PathAdapter, WarnAdapter]

/**
 * Represents an adapter. Adapters carry out operations for single file in the resource pack, 
 * e.g. renaming, scaling image, changing text content, etc.
 */
export default interface Adapter {
    constructor: Function

    /**
     * Adapts.
     */
    execute(input: File, logger: Logger): File
}

/**
 * An initialization of adapter.
 */
export interface AdapterInitialization {
    /**
     * The identity of adapter.
     */
    id: string,
    /**
     * Stores all parameters used to initialize the adapter.
     */
    params: PathAdapterParams | WarnAdapterParams
}