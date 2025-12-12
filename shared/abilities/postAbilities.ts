import type {User} from "#auth-utils";
import type {Post} from "#shared/types/db";

export function postAbilities() {
    const createPosts = defineAbility((user: User) => {
        return !!(user && user.id)
    })
    const updatePosts = defineAbility((user: User, post: Post) => {
        return !!(user && user.id) && user.id === post.authorId
    })
    const deletePosts = defineAbility((user: User, post: Post) => {
        return !!(user && user.id) && user.id === post.authorId
    })

    return {
        createPosts,
        updatePosts,
        deletePosts
    }
}