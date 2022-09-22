<script>
    import { fade } from 'svelte/transition';
    export let data
    // console.log(data);
</script>

<div class="content" transition:fade>
    <ul>
        {#each data.users as user}
            <li><a data-sveltekit-prefetch href={`/blog/${user.id}`}>{user.name} - {user.email}</a></li>
        {/each}
    </ul>
</div>

