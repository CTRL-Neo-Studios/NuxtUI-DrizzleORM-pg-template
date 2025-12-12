import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '~~/server/db/schema'

export function useServerDb() {
    const $rc = useRuntimeConfig()
    return drizzle($rc.dbUrl, { schema })
}