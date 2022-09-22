<script>
    import { fade } from 'svelte/transition';
    import gsap from "gsap"
    function customAnim(node, { speed = 1 }) {

        let tl = gsap.timeline();

        let duration = 1000;

        tl.from(node, {
            rotate: 90,
            duration: duration/1000,
        })

		return {
			duration,
			tick: t => {

                console.log(t);
                tl.progress(t)

			}
		};
	}
</script>

<div class="content" transition:fade>
    <h2>
        contacts
    </h2>

    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus suscipit odit unde at temporibus alias perspiciatis rerum expedita aut eius. Facilis impedit voluptate eligendi recusandae corrupti quos facere assumenda temporibus!</p>



</div>