const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const mouse = {
    x: 10,
    y: 10,
}

const colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66']
let gravity = 1
let friction = 0.59
// Event Listeners
addEventListener('mousemove', event => {
    mouse.x = event.clientX
    mouse.y = event.clientY
})
//随机数
function radomFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
//随机小球颜色
function radomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)]
}

//判断碰撞距离
function getDistance(x1, y1, x2, y2) {
    let xDistance = x2 - x1
    let yDistance = y2 - y1
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
}

function resolveCollision(particle, otherParticle) {
    // 速度
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y
    // 距离
    const xDist = otherParticle.x - particle.x
    const yDist = otherParticle.y - particle.y

    // Prevent accidental overlap of particles
    // 防止粒子意外重叠
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        // Grab angle between the two colliding particles
        // 两个碰撞粒子之间的夹角
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x)

        // Store mass in var for better readability in collision equation
        // 将质量存储在var中以提高碰撞方程的可读性
        const m1 = particle.mass
        const m2 = otherParticle.mass

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle)
        const u2 = rotate(otherParticle.velocity, angle)

        // Velocity after 1d collision equation
        const v1 = {
            x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
            y: u1.y,
        }
        const v2 = {
            x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
            y: u2.y,
        }

        // Final velocity after rotating axis back to original location
        // 旋转轴回到原始位置后的最终速度
        const vFinal1 = rotate(v1, -angle)
        const vFinal2 = rotate(v2, -angle)

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x
        particle.velocity.y = vFinal1.y

        otherParticle.velocity.x = vFinal2.x
        otherParticle.velocity.y = vFinal2.y
    }
}

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
    }

    return rotatedVelocities
}
addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight

    init()
})

// Objects
class Particle {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.velocity = {
            x: radomFromRange(-2, 4),
            y: radomFromRange(-2, 4),
        }
        this.radius = radius
        this.color = color
        this.mass = 1

        this.draw = () => {
            c.beginPath()
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
            c.fillStyle = this.color
            c.fill()
            c.stroke()
            c.closePath()
        }

        this.update = particles => {
            this.draw()
            for (let i = 0; i < particles.length; i++) {
                if (this === particles[i]) {
                    continue
                }
                if (getDistance(this.x, this.y, particles[i].x, particles[i].y) - this.radius * 2 < 0) {
                    resolveCollision(this, particles[i])
                }
            }
            // if (this.y + this.radius + this.velocity.y > innerHeight) {
            //     this.velocity.y = -this.velocity.y * friction
            // } else {
            //     this.velocity.y += gravity
            // }
            if (this.x + this.radius > innerWidth || this.x - this.radius < 0) {
                this.velocity.x = -this.velocity.x
            }
            if (this.y + this.radius > innerHeight || this.y - this.radius < 0) {
                this.velocity.y = -this.velocity.y
            }
            this.x += this.velocity.x
            this.y += this.velocity.y
        }
    }
}

// Implementation
let particles = []

function init() {
    particles = []
    for (let i = 0; i < 250; i++) {
        // let radius = 10
        let radius = radomFromRange(11, 20)
        let x = radomFromRange(radius, canvas.width - radius)
        let y = radomFromRange(radius, canvas.height - radius)
        let color = colors[Math.floor(Math.random() * colors.length)]
        if (i != 0) {
            for (let j = 0; j < particles.length; j++) {
                if (getDistance(x, y, particles[j].x, particles[j].y) - (radius + particles[j].radius) < 0) {
                    x = radomFromRange(radius, canvas.width - radius)
                    y = radomFromRange(radius, canvas.height - radius)
                    //设置新的坐标后，重新遍历查询
                    j = -1
                }
            }
        }
        particles.push(new Particle(x, y, radius, color))
    }
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach(item => item.update(particles))
}

init()
animate()
