import type {H3Event} from 'h3'
import { OffsetPagination } from '#shared/types/fetch'

export function useServerOffsetPagination(event: H3Event, defaults?: Partial<OffsetPagination>): OffsetPagination | undefined {
    const query = getQuery<OffsetPagination>(event)
    if (!query && !defaults) return;
    return {
        limit: query?.limit ?? defaults?.limit,
        offset: query?.offset ?? defaults?.offset
    } satisfies OffsetPagination
}