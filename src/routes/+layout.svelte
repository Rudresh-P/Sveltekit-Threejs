
<script>
    import "../style.css"
    import Nav from "$lib/nav.svelte"
    import Canvas from "$lib/canvas.svelte"

</script>

<Nav />

<slot></slot>

<div class="canvas">
    <Canvas />
</div>

<style>
    .canvas{
        width: 100vw;
        height: 100vh;
        max-width: 100%;
        max-height: 100%;

        position: fixed;
        top: 0;
        left: 0;
        z-index: -1;
    }
</style>

