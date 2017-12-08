/* global variable */
var character, platform, clouds, walls, enemies, bushes, bushes_group, health, coins, stuff, danger, bg, bg1, bgEnd, explosion, shoots, bullets, hits, hits2, flag;
const speed = 5;
const GRAVITY = 0.5;
const JUMP_SPEED = speed * 2.35;
const NUM_CLOUDS = 4;
const NUM_BUSHES = 8;
const NUM_BUSHES_A = 2;
const NUM_WALLS = 3;
//const NUM_ENEMIES = 2;
//const NUM_HEALTH = 1;
const NUM_COINS = 5;
const NUM_DANGER = 3;
const NUM_FRAMES = 8
const enemySpeedMin = speed / 2,
    enemySpeedMax = speed;
const cloudSpeedMin = speed / 8,
    cloudSpeedMax = speed / 3;

/* 0=intro, 1=instruction, 2=game, 3=ending*/
var menus = [
    {
        titles: [
			"my first game by &"
		],
        buttons: [
            {
                text: "Play Game",
                state: 2
			},
            {
                text: "Instructions",
                state: 1
			}
		]
	},
    {
        titles: [
			"instructions",
			"press SPACE to jump",
			"D to move",
			"Flag is the end of the level"
		],
        buttons: [
            {
                text: "Play Game",
                state: 2
			}
		]
	},
    {
        titles: [
			"you beat level 1"
		],
        buttons: [
            {
                text: "Start Level 2",
                state: 2
			}
		]
	},
    {
        titles: [
			"you died"
		],
        buttons: [
            {
                text: "Try again",
                state: 2
			}
		]
	}
];
var gameState = 0;
var currentLevel = 0;
var levelData = {
    0: {
        coins: 7,
        walls: 4,
        enemies: 3,
        health: 2,
        speedMin: speed / 5,
        speedMax: speed
    },
    1: {
        coins: 9,
        walls: 3,
        enemies: 5,
        health: 1,
        speedMin: speed / 4,
        speedMax: speed * 1.5
    },
    2: {
       coins: 6,
        enemies: 9,
        health: 0,
        speedMin: speed / 2,
        speedMax: speed * 2
    }
};
/*graphics*/

/*audio*/
var bg_music;
var jump_sfx = []
const jump_files = [
  "sfx/character/jump1.wav",
  "sfx/character/jump2.wav",
  "sfx/character/jump3.wav"
];
var explosion_sfx = []
const explosion_files = [
  "sfx/explosion.wav",
  "sfx/explosion1.wav"
];
var enter_sfx = []
const enter_files = [
  "sfx/enter1.wav",
  "sfx/enter2.wav"
];
var shoot_sfx = []
const shoot_files = [
  "sfx/shoot2.wav"
];
var hit_sfx = []
const hit_files = [
  "sfx/character/hit0.wav",
  "sfx/character/hit1.wav",
  "sfx/character/hit2.wav"
];
var coin_sfx = []
const coin_files = [
  "sfx/coin1.wav"
];
var pickUpLife_sfx = []
const pickUpLife_files = [
  "sfx/pickUpLife.wav",
];

function preload() {
    img = loadImage("images/coin1.png");
    boxUI = loadImage("images/box2.png");
    soundIconOn = loadImage("images/speaker.png");
    soundIconOff = loadImage("images/mute.png");
    title = loadImage("images/title.png");
    bg_music = loadSound("sound/bg_music2.wav");

    for (let i = 0; i < jump_files.length; i++) {
        const jump_sound = loadSound(jump_files[i]);
        jump_sfx.push(jump_sound);
    }
    for (let i = 0; i < enter_files.length; i++) {
        const enter_sound = loadSound(enter_files[i]);
        enter_sfx.push(enter_sound);
    }
    for (let i = 0; i < hit_files.length; i++) {
        const hit_sound = loadSound(hit_files[i]);
        hit_sfx.push(hit_sound);
    }
    for (let i = 0; i < shoot_files.length; i++) {
        const shoot_sound = loadSound(shoot_files[i]);
        shoot_sfx.push(shoot_sound);
    }
    for (let i = 0; i < explosion_files.length; i++) {
        const explosion_sound = loadSound(explosion_files[i]);
        explosion_sfx.push(explosion_sound);
    }
    for (let i = 0; i < coin_files.length; i++) {
        const coin_sound = loadSound(coin_files[i]);
        coin_sfx.push(coin_sound);
    }
    for (let i = 0; i < pickUpLife_files.length; i++) {
        const pickUpLife_sound = loadSound(pickUpLife_files[i]);
        pickUpLife_sfx.push(pickUpLife_sound);
    }
}

function setup() {
    bg_music.loop();
    bg = loadImage("images/bg1_1.png");
    bg1 = loadImage("images/bg2_5.png");
    bgIntro = loadImage("images/start.png");
    bgEnd = loadImage("images/gameOver2.png");

    createCanvas(800, 460);
    stuff = new Group();
    hits = new Group();
    hits2 = new Group();
    walls = new Group();
    enemies = new Group();
    health = new Group();
    bullets = new Group();
    coins = new Group();


    character = createSprite(0, 200, 32, 32);
    const idle_anim = loadAnimation("img/Putin_idle.png");
    const run_anim = loadAnimation("img/Putin_run1.png", "img/Putin_run4.png");
    character.addAnimation("idle", idle_anim);
    character.addAnimation("run", run_anim);
    character.setCollider("rectangle", 0, 0, 40, 155);
    const jump_img = loadAnimation("images/Putin_run4.png");
    character.addAnimation("jump", jump_img);
    character.isJumping = false;
    character.lives = 3;
    character.coinsCount = 0;
    stuff.add(character)
    //    character.debug = true;

    /*platform setup*/
    platform = createSprite(width / 2 - 60, height - 20);
    const platform1 = loadImage("images/platform1.png");
    platform.addImage("platform", platform1);
    stuff.add(platform)

    /*flag*/

    flag = createSprite(width * 3, height / 2, width / 3, height / 2);
    const flag_anim = loadAnimation("images/flag1.png", "images/flag3.png");
    const flag_anim2 = loadAnimation("images/flag1_1.png", "images/flag3_3.png");
    flag.addAnimation("flag", flag_anim);
    flag.addAnimation("flag2", flag_anim2);

    /*obstacles: walls,...*/

    for (let i = 0; i < NUM_WALLS; i++) {
        // console.log(32, (i + 3) * width / NUM_WALLS)
        const wall = createSprite(
            random(i * width / NUM_WALLS, (i + 1) * width / NUM_WALLS),
            height * 7 / 9 + 10,

        );
        const imageArray = ["images/wall1_1.png", "images/wall1_2.png", "images/wall1_3.png"];
        const imageIndex = floor(random(0, imageArray.length));
        const wall1 = loadImage(imageArray[imageIndex]);
        wall.addImage("walls", wall1);
        walls.add(wall);
    }
    bushes_group = new Group();
    for (let i = 0; i < NUM_BUSHES; i++) {
        // console.log(32, (i + 1) * width / NUM_BUSHES)
        const bushes = createSprite(
            random(i * width / NUM_BUSHES, (i + 1) * width / NUM_BUSHES),
            height * 7 / 9 + 10,

        );
        const imageArray = ["images/tree1_1.png", "images/tree2_2.png", "images/obs3_3.png"];
        const imageIndex = floor(random(0, imageArray.length));
        const bushes1 = loadImage(imageArray[imageIndex]);
        bushes.addImage("bushes", bushes1);
        bushes_group.add(bushes);
        //bushes.life = 140;
    }

    /*danger boxes*/
    danger = new Group();
    for (let i = 0; i < NUM_DANGER; i++) {
        const danger_box = createSprite(
            random(0, width),
            height - 65
        );
        const imageArray = ["images/boxC.png", "images/boxD.png"];
        const imageIndex = floor(random(0, imageArray.length));
        const dangerImage = loadAnimation(imageArray[imageIndex]);

        // danger_box.addAnimation("explosion", explosion_anim);
        danger_box.addAnimation("idle", dangerImage);
        danger_box.changeAnimation("idle");
        danger_box.hitCharacter = false;
        //        danger_box.debug = true;
        danger.add(danger_box);
        danger.life = 8;

        //explosion_anim.looping = false
    }

    /*clouds*/
    clouds = new Group();
    for (let i = 0; i < NUM_CLOUDS; i++) {
        const cloud = createSprite(
            random(width, width * 2),
            random(20, height / 3),
            random(100, 37),
            random(56, 20)
        );
        const cloud1 = loadImage("images/cloud3.png");
        cloud.addImage(cloud1);
        cloud.velocity.x = -random(cloudSpeedMin, cloudSpeedMax);
        cloud.scale = random(0.2, 2);
        clouds.add(cloud);
    }
    buildLevel();
    for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        menu.sprites = new Group();
        for (let j = 0; j < menu.buttons.length; j++) {
            const b = menu.buttons[j];
            const button = createSprite(440, 120 + j * 120);
            button.addAnimation("idle", "images/but1.png");
            button.addAnimation("hover", "images/but2.png");
            button.addAnimation("click", "images/but3_1.png", "images/but3_4.png");
            button.clicked = false;
            button.mouseActive = true;
            button.text = b.text;
            button.state = b.state;
            menu.sprites.add(button);
        }
    }
}

function buildLevel() {
    var level = levelData[currentLevel];
    for (let i = 0; i < level.walls; i++) {
        const wall = createSprite(
            i * width * 2 / level.walls,
            random(height * 7 / 8, height / 2),
            200,
            40
        );
        //wall.debug = true;
        walls.add(wall);
    }

    for (let i = 0; i < level.enemies; i++) {
        const enemy = createSprite(
            random(width * 2, width * 4),
            random(height - 115, height - 135),
        );
        const torpedo_anim = loadAnimation("images/torpedo1.png", "images/torpedo3.png");
        enemy.addAnimation("enem", torpedo_anim);
        enemy.velocity.x = -random(level.speedMin, level.speedMax);
        enemies.add(enemy);
    }

    for (let i = 0; i < level.health; i++) {
        const life = createSprite(
            random(0, width),
            random(height / 2, height - 140),
        );
        const health_anim = loadAnimation("images/life1.png", "images/life6.png");
        life.addAnimation("health", health_anim);
        life.animation.frameDelay = 8;
        health.add(life);
    }

    for (let i = 0; i < level.coins; i++) {
        const coin = createSprite(
            random(0, width),
            random(height / 2, height - 70),
        );
        const coins_anim = loadAnimation("images/coin1.png", "images/coin6.png");
        coin.addAnimation("coins", coins_anim);
        coin.animation.frameDelay = 10;
        coins.add(coin);
    }

}

function draw() {

    if (gameState == 0) {
        menu(0);
    } else if (gameState == 1) {
        menu(1);
    } else if (gameState == 2) {
        game();
    } else if (gameState == 4) {
        pause();
    } else if (gameState == 3) {
        menu(3);
    } else if (gameState == 5) {
        menu(2);
    }
}

//function intro() {
//    camera.off();
//    background(bg);
//    background(bgIntro);
//    image(title, height / 2, width / 2 - 240);
//    fill(255);
//    textSize(24);
//    textAlign(CENTER);
//    textFont("Helvetica");
//    fill(237, 198, 133);
//    text("PRESS ENTER TO PLAY", width / 2 + 10, height / 2 + 35);
//    textSize(20);
//    text("by Alyona Perminova", 230, 430);
//    if (keyWentDown("ENTER")) {
//        gameState = 1;
//        enter_sfx[floor(random(0, enter_sfx.length))].play();
//    }
//}
//
//function intructions() {
//    camera.off();
//    background(bg);
//    background(bgIntro);
//    fill(255);
//    textSize(19);
//    textAlign(CENTER);
//    textFont("Helvetica");
//    text("ARROW RIGHT TO MOVE", width / 2 + 10, height / 2 - 80);
//    text("X TO JUMP", width / 2 + 10, height / 2 - 50);
//    text("Z TO SHOOT", width / 2 + 10, height / 2 - 20);
//    text("SPACE TO PAUSE", width / 2 + 10, height / 2 + 10);
//    fill(237, 198, 133);
//    textSize(24);
//    text("PRESS ENTER TO PLAY", width / 2 + 10, height / 2 + 45);
//    textSize(20);
//    text("by Alyona Perminova", 230, 430);
//    if (keyWentDown("ENTER")) {
//        gameState = 2;
//        enter_sfx[floor(random(0, enter_sfx.length))].play();
//    }
//
//
//}
//
function pause() {
    camera.off();
    background(bg);
    background(bgIntro);
    textAlign(CENTER);
    textFont("Helvetica");
    fill(237, 198, 133);
    textSize(33);
    text("PAUSE", width / 2 + 10, height / 2 + 5);
    textSize(20);
    text("by Alyona Perminova", 230, 430);
    if (keyWentDown("SPACE")) {
        gameState = 2;
        enter_sfx[floor(random(0, enter_sfx.length))].play();
    }
}
//
//function end() {
//    camera.off();
//    background(bgEnd);
//    fill(255);
//    textSize(24);
//    textAlign(CENTER);
//    textFont("Helvetica");
//    fill(237, 198, 133);
//    text("PRESS ENTER TO TRY AGAIN", width / 2 + 10, height / 2 + 25);
//    textSize(19);
//    text("ACHIEVEMENTS:", 180, 355);
//    fill(255);
//    textSize(20);
//    text("= " + character.coinsCount, 180, 400);
//    image(img, 105, 374);
//    if (character.coinsCount < 6) {
//        text("GOOD JOB!", 270, 400);
//    } else if (character.coinsCount > 6 && character.coinsCount < 15) {
//        text("GREAT JOB!", 270, 400);
//    } else {
//        text("EXCELLENT!", 270, 400);
//    }
//
//
//
//    if (keyWentDown("ENTER")) {
//        gameState = 1;
//        reset();
//        buildLevel(4, 3, 2);
//        enter_sfx[floor(random(0, enter_sfx.length))].play();
//    }
//}
//
//function nextLevel() {
//    camera.off();
//    background(100);
//    fill(255);
//    textSize(24);
//    textAlign(CENTER);
//    text("you beat level " + currentLevel, width / 2, height / 2);
//    text("press enter to begin " + (currentLevel + 1), width / 2, height / 2 + 48);
//    if (keyWentDown("ENTER")) {
//        gameState = 2;
//        reset();
//        buildLevel(3, 10, 1);
//    }
//}

function menu(index) {
    camera.off();
    background(51);
    fill(255);
    textSize(24);
    textFont("sans-serif");
    textAlign(LEFT);
    for (let i = 0; i < menus[index].titles.length; i++) {
        text(menus[index].titles[i], 40, 40 + i * 60, width / 3, height);
    }

    for (let i = 0; i < menus[index].sprites.length; i++) {
        const button = menus[index].sprites[i];
        button.display();
        textFont("Monaco");
        textAlign(CENTER);
        text(button.text, button.position.x, button.position.y);
        if (button.mouseIsPressed) {
            button.changeAnimation("click");
            button.clicked = true;
        } else if (button.mouseIsOver) {
            button.changeAnimation("hover");
            if (button.clicked) {
                gameState = button.state;
                if (index == 2 || index == 3) {
                    reset();
                    buildLevel();
                }
            }
        } else {
            button.changeAnimation("idle");
            button.clicked = false;
        }
    }

}

function reset() {
    character.lives = 3;
    character.velocity.y = 0;
    character.minX = 0;
    character.position.x = 0;
    character.position.y = 0;
    camera.position.x = width / 2;
    platform.position.x = 0;
    flag.position.x = width * 3;
    walls.clear();
    enemies.clear();
    health.clear();
}

function game() {
    camera.off();
    background(bg);
    background(bg1);
    camera.on();

    if (keyWentDown("p")) {
        gameState = 4;
    }

    for (let i = 0; i < clouds.length; i++) {
        const cloud = clouds[i];
        if (cloud.position.x + cloud.width / 2 < 0) {
            cloud.position.x = random(width, width * 2);
            cloud.position.y = random(0, height / 2);
        }
    }

    /* keyboard events */
    //constantMovement();
    //character.position.x += speed;
    if (keyDown("d")) {
        character.position.x += speed;
        character.changeAnimation("run");
    } else {
        character.changeAnimation("idle");
    }
    /*prevent character go through the wall and ground*/
    if (character.collide(platform) || character.collide(walls)) {
        character.velocity.y = 0;
        character.changeAnimation("idle");
        if (character.isJumping) {
            character.isJumping = false;
            hit_sfx[floor(random(0, hit_sfx.length))].play();
        }

    } else {
        character.velocity.y += GRAVITY;
    }

    if (keyWentDown("space")) {
        if (!character.isJumping) {
            character.changeAnimation("jump")
            character.velocity.y -= JUMP_SPEED;
            character.isJumping = true;
            /*connection sound to jump and array of jumping sounds*/
            jump_sfx[floor(random(0, jump_sfx.length))].play();
        }


    }
   

    
    for (let i = 0; i < danger.length; i++) {
        const danger_box = danger[i];
        if (character.overlap(danger_box)) {
            // danger_box.changeAnimation("explosion");
            character.lives--;
            danger_box.hitCharacter = true;
            const explosion_anim = loadAnimation("images/explosion0.png", "images/explosion7.png");
            const ex = createSprite(danger_box.position.x, danger_box.position.y);
            ex.addAnimation("ex", explosion_anim);
            ex.life = 40;
            danger_box.position.x += random(width, width * 3);
            explosion_sfx[floor(random(0, explosion_sfx.length))].play();
            camera.off();
            const hit_anim = loadAnimation("images/hit1.png", "images/hit4.png");
            const hitSc = createSprite(width / 2, height / 2);
            hitSc.addAnimation("hitSc", hit_anim);
            console.log(hitSc.position.x);
            hitSc.life = 30;
            hits.add(hitSc);


        } else {
            wrap(danger_box, random(width * 2, width * 6));
        }
    }

    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        enemies.velocity++;
        if (character.overlap(enemy)) {
            character.lives--;
            //character + 255;
            //enemy.remove();
            enemy.position.x += random(width * 2, width * 6);

            enter_sfx[floor(random(0, enter_sfx.length))].play();
        } else {
            wrap(enemy, random(width * 2, width * 6));
        }

        //        const hit_anim = loadAnimation("images/hit1.png", "images/hit4.png");
        //        const hitSc = createSprite(width / 2, height / 2);
        //        hitSc.addAnimation("hitSc", hit_anim);
        //        console.log(hitSc.position.x);
        //        hitSc.life = 100;
        //        hits.add(hitSc);

        for (let i = 0; i < bullets.length; i++) {
            const shoot = bullets[i];
            if (enemy.overlap(shoot)) {
                shoot.remove();
                enemy.position.x += random(width * 2, width * 6);
                enter_sfx[floor(random(0, enter_sfx.length))].play();
            }
            if (shoot.position.x > character.position.x + width) {
                shoot.remove();

            }
        }
    }


    for (let i = 0; i < health.length; i++) {
        const life = health[i];
        if (character.overlap(life)) {
            character.lives++;
            life.position.x += random(width * 2, width * 6);
            pickUpLife_sfx[floor(random(0, pickUpLife_sfx.length))].play();
        } else {
            wrap(life, random(width * 2, width * 6));
        }

    }
    for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];
        if (character.overlap(coins)) {
            character.coinsCount++;
            //coin.remove();
            coin.position.x += random(width * 2, width * 6);
            coin_sfx[floor(random(0, coin_sfx.length))].play();
        } else {
            wrap(coin, random(width * 2, width * 6));
        }
    }

    /*wrapping sprites*/
    //wrap(platform, width);
    if (character.position.x - platform.position.x >= 40) {
        platform.position.x += width;
    }
    for (var i = 0; i < walls.length; i++) {
        const wall = walls[i];
        wrap(wall, random(width * 2, width * 4));
    }
    for (var i = 0; i < bushes_group.length; i++) {
        const bushes = bushes_group[i];
        wrap(bushes, random(width * 2 - 50, width * 4));
    }

    /*camera follows character*/
    camera.position.x = character.position.x + width / 2 - 60 // add if want character to start at 0*/;

    drawSprites(bushes);
    drawSprites(walls);
    drawSprites(stuff);
    drawSprites(danger);
    drawSprites(enemies);
    drawSprites(health);
    drawSprites(bullets);

    /*ui*/
    camera.off();
    drawSprites(clouds);

    hits.draw();
    fill("white");
    textSize(18);
    image(boxUI, 7, 7);
    text("LIVES: " + character.lives, 73, 43);
    text("COINS: " + character.coinsCount, 76, 74);


    /* detect game ending */
    if (character.lives <= 0) {
        gameState = 3;

        character.velocity.y = 0;
    }

    /* detect next level*/
    if (character.overlap(flag)) {
        flag.changeAnimation("flag2");
        currentLevel++;
        setTimeout(function () {
            gameState = 5;
        }, 1200);
    }
}

function mouseClicked() {
    shootBullet();
}

function wrap(obj, reset) {
    if (character.position.x - obj.position.x - obj.width / 2 >= 40) {
        obj.position.x += reset;
    }
}

function shootBullet() {
   
 
 var shoot = createSprite(character.position.x + 60, character.position.y - 5);
    const shoot1 = loadImage("images/shoot.png");
    shoot.addImage(shoot1);
    var dir = new p5.Vector(shoot.position.x + mouseX, mouseY);
    dir.sub(shoot.position);
    dir.normalize();
    dir.mult(10);
    shoot.velocity = dir;
    shoot_sfx[floor(random(0, shoot_sfx.length))].play();
        bullets.add(shoot);
}
    
function constantMovement() {
    if (keyDown("d")) {
        character.position.x += speed;
        if (!character.isJumping) {
            character.changeAnimation("run");
        }

    } else {
        //character.changeAnimation("idle");
    }
    if (keyDown("a")) {
        character.position.x -= speed;
    }
    if (keyDown("s")) {
        character.position.y += speed;
    }
    if (keyDown("w")) {
        character.position.y -= speed;
    }
}

function slidingMovement() {
    if (keyWentDown("d")) {
        character.velocity.x += 1;
    }
    if (keyWentDown("s")) {
        character.velocity.y += 1;
    }
    if (keyWentDown("w")) {
        character.velocity.y -= 1;
    }
}
