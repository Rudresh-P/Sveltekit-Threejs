export const load = async ({fetch, params}) => {
    const id = params.slug
    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${params.slug}`);
    const user = await res.json()

    return {user}
}