const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024;
canvas.height = 570;

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: 'background.png'
})

const shop = new Sprite({
    position: {
        x: 650,
        y: 224
    },
    imageSrc: 'shop.png',
    scale: 2,
    framesMax: 6,
})

const player = new Fighter({
    position: { x: 0,
    y: 0},
    velocity: {
        x: 200,
        y: 0
    },
    imageSrc: 'samuraiMack/Idle.png',
    framesMax: 8,
    scale: 2,
    offset: {
        x: 215,
        y: 145
    },
    sprites: {
        idle: {
            imageSrc: 'samuraiMack/Idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: 'samuraiMack/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: 'samuraiMack/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: 'samuraiMack/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: 'samuraiMack/Attack1.png',
            framesMax: 6
        },
        takeHit: {
            imageSrc: 'samuraiMack/Take Hit.png',
            framesMax: 4
        },
        death: {
            imageSrc: 'samuraiMack/Death.png',
            framesMax: 6
        },
    },
    attackBox: {
        offset: {
            x: 100,
            y: 0
        },
        width: 50,
        height: 50,
    }
})

const enemy = new Fighter({
    position: { 
        x: 800,
        y: 50
    },
    velocity: {
        x: 0,
        y: 0
    },
    imageSrc: 'kenji/Idle.png',
    framesMax: 4,
    scale: 2,
    offset: {
        x: 215,
        y: 155
    },
    sprites: {
        idle: {
            imageSrc: 'kenji/Idle.png',
            framesMax: 4
        },
        run: {
            imageSrc: 'kenji/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: 'kenji/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: 'kenji/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: 'kenji/Attack1.png',
            framesMax: 4
        },
        takeHit: {
            imageSrc: 'kenji/Take hit.png',
            framesMax: 3
        },
        death: {
            imageSrc: 'kenji/Death.png',
            framesMax: 7
        },
    },
    attackBox: {
        offset: {
            x: -170,
            y: 10
        },
        width: 50,
        height: 50,
    }
})

const keys = {

    // Player Keys
    a : {
        pressed: false
    },
    d : {
        pressed: false
    },
    w : {
        pressed: false
    },

    // Enemy Keys
    ArrowRight : {
        pressed: false
    },
    ArrowLeft : {
        pressed: false
    },
    ArrowUp : {
        pressed: false
    }
}

decreaseTimer()

function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    shop.update()
    c.fillStyle = 'rgba(255, 255, 255, 0.2)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    enemy.update()

    player.velocity.x = 0

    // Player Movement
    if (keys.a.pressed && player.lastKey == 'a') {
        player.velocity.x = -5
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey == 'd') {
        player.velocity.x = 5
        player.switchSprite('run')
    } else {
        player.switchSprite('idle')
    }

    if (player.velocity.y < 0) {
        player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')
    }

    enemy.velocity.x = 0

    // Enemy Movement
    if (keys.ArrowLeft.pressed && enemy.lastKey == 'ArrowLeft') {
        enemy.velocity.x = -3
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey == 'ArrowRight') {
        enemy.velocity.x = 3
        enemy.switchSprite('run')
    } else {
        enemy.switchSprite('idle')
    }

    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall')
    }

    // player attacks && enemy gets hit
    if (
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) && player.isAttacking && player.frameCurrent === 4
    ) {
        enemy.takeHit()
        player.isAttacking = false
        document.querySelector('#enemyHealth').style.width = enemy.health + '%'
    }

    // if player misses 
    if (player.isAttacking && player.frameCurrent === 4) {
        player.isAttacking = false  
    }

    // enemy attacks && player gets hit
    if (
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
        }) && enemy.isAttacking && enemy.frameCurrent == 2
    ) {
        player.takeHit()
        enemy.isAttacking = false
        document.querySelector('#playerHealth').style.width = player.health + '%'
    }

    // if enemy misses 
    if (enemy.isAttacking && enemy.frameCurrent === 2) {
        enemy.isAttacking = false  
    }


    // end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({player, enemy, timerId})
    }
}

// Animate Function Call
animate()

// Event Listeners 
window.addEventListener('keydown', (event) => {

    if (!player.dead) {
        switch (event.key) {

            // Player KeyDown
            case 'd':
                keys.d.pressed = true
                player.lastKey = 'd'
                break
            case 'a':
                keys.a.pressed = true
                player.lastKey = 'a'
                break
            case 'w':
                player.velocity.y = -15
                break
            case 's':
                player.attack()
                break
        }
    }

   if (!enemy.dead) {
    switch (event.key) {
        // Enemy KeyDown
        case 'ArrowRight':
            keys.ArrowRight.pressed = true
            enemy.lastKey = 'ArrowRight'
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            enemy.lastKey = 'ArrowLeft'
            break
        case 'ArrowUp':
            enemy.velocity.y = -15
            break
        case 'ArrowDown': 
            enemy.attack()
            break
}
   }

    
    }
)

window.addEventListener('keyup', (event) => {
    switch (event.key) {

        // Player KeyUp
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 'w':
            keys.w.pressed = false
            break

        // Enemy KeyUp
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
        case 'ArrowUp':
            keys.ArrowUp.pressed = false
            break
    }
})