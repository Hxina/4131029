import gsap from 'gsap'

export function spawnStardust(x, y) {
    const particleCount = 10 + Math.random() * 10
    const container = document.body

    for (let i = 0; i < particleCount; i++) {
        const el = document.createElement('div')
        el.classList.add('stardust-particle')
        container.appendChild(el)

        const angle = Math.random() * Math.PI * 2
        const velocity = 20 + Math.random() * 50
        const tx = Math.cos(angle) * velocity
        const ty = Math.sin(angle) * velocity

        gsap.set(el, { x: x, y: y, opacity: 1, scale: Math.random() * 0.5 + 0.5 })
        gsap.to(el, {
            x: x + tx,
            y: y + ty,
            opacity: 0,
            scale: 0,
            duration: 0.5 + Math.random() * 0.5,
            ease: 'power2.out',
            onComplete: () => {
                el.remove()
            }
        })
    }
}