import type {H3Event} from 'h3'
import { CursorPagination } from '#shared/types/fetch'

export function useServerCursorPagination(event: H3Event, defaults?: Partial<CursorPagination>): CursorPagination | undefined {
    const query = getQuery<CursorPagination>(event)
    if (!query && !defaults) return;
    return {
        cursor: query?.cursor ?? defaults?.cursor,
        pageSize: query?.pageSize ?? defaults?.pageSize
    } satisfies CursorPagination
}