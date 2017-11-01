/* global variable */
var character, platform, clouds, walls, enemies, bushes, bushes_group, health, coins, stuff, danger, bg, bg1, bgEnd, explosion, shoots, bullets, hits, hits2, hitSc;
const speed = 5;
const GRAVITY = 0.5;
const JUMP_SPEED = speed * 2;
const NUM_CLOUDS = 4;
const NUM_BUSHES = 8;
const NUM_BUSHES_A = 2;
const NUM_WALLS = 3;
const NUM_ENEMIES = 2;
const NUM_HEALTH = 1;
const NUM_COINS = 5;
const NUM_DANGER = 3;
const NUM_FRAMES = 8
 
/* 0=intro, 1=instruction, 2=game, 3=ending*/
var gameState = 0;
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
//    const hit_anim = loadAnimation("images/hit1.png", "images/hit4.png");
//    const hitSc = createSprite(width/2,height/2);
//    hitSc.addAnimation("hitSc", hit_anim);
//    console.log(hitSc.position.x);
//    hitSc.life = 30;
//    hits.add(hitSc);
    hits2 = new Group();

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

    /*obstacles: walls,...*/
    walls = new Group();
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
        cloud.velocity.x = -random(0.5, 0.8);
        cloud.scale = random(0.2, 2);
        clouds.add(cloud);
    }

    /*enemies*/
    enemies = new Group();
    for (let i = 0; i < NUM_ENEMIES; i++) {
        //const sz = random(30, 50);
        const enemy = createSprite(
            random(width * 2, width * 4),
            random(height -115, height - 135)   
        );
        const torpedo_anim = loadAnimation("images/torpedo1.png", "images/torpedo3.png");
        enemy.addAnimation("enem", torpedo_anim);
        enemy.velocity.x = -random(1, 5);
        enemies.add(enemy);
    }

    /*health*/
    health = new Group();
    for (let i = 0; i < NUM_HEALTH; i++) {
        const life = createSprite(
            random(0, width),
            random(height / 2, height - 140),
        );
        const health_anim = loadAnimation("images/life1.png", "images/life6.png");
        life.addAnimation("health", health_anim);
        life.animation.frameDelay = 8;
        health.add(life);
    }
    /*coins*/
    coins = new Group();
    for (let i = 0; i < NUM_COINS; i++) {
        const coin = createSprite(
            random(0, width),
            random(height / 2, height-70)
        );
        const coins_anim = loadAnimation("images/coin1.png", "images/coin6.png");
        coin.addAnimation("coins", coins_anim);
        coin.animation.frameDelay = 10;
        coins.add(coin);
    }
    
    bullets = Group();
}

function draw() {

    if (gameState == 0) {
        intro();
    } else if (gameState == 1) {
        intructions();
    } else if (gameState == 2) {
        game();
    } else if (gameState == 3) {
        end();
    }
}

function intro() {
    camera.off();
    background(bg);
    background(bgIntro);
    image(title, height/2, width/2-240);
    fill(255);
    textSize(24);
    textAlign(CENTER);
    textFont("Helvetica");
    fill(237, 198, 133);
    text("PRESS ENTER TO PLAY", width / 2+10, height / 2 + 35);
    textSize(20);
    text("by Alyona Perminova", 230, 430);
    if (keyWentDown("ENTER")) {
        gameState = 1;
        enter_sfx[floor(random(0, enter_sfx.length))].play();
    }
}

function intructions() {
    camera.off();
    background(bg);
    background(bgIntro);
    fill(255);
    textSize(19);
    textAlign(CENTER);
    textFont("Helvetica");
    text("ARROW RIGHT TO MOVE", width / 2+10, height / 2-70);
    text("X TO JUMP", width / 2+10, height / 2 -40);
    text("Z TO SHOOT", width / 2+10, height / 2 -10);
    fill(237, 198, 133);
    textSize(24);
    text("PRESS ENTER TO PLAY", width / 2+10, height / 2 + 35);
    textSize(20);
    text("by Alyona Perminova", 230, 430);
    if (keyWentDown("ENTER")) {
        gameState = 2;
        enter_sfx[floor(random(0, enter_sfx.length))].play();
    }
}

function end() {
    camera.off();
    background(bgEnd);
    fill(255);
    textSize(24);
    textAlign(CENTER);
    textFont("Helvetica");
    fill(237, 198, 133);
    text("PRESS ENTER TO TRY AGAIN", width / 2+10, height / 2 + 25);
    textSize(19);
    text("ACHIEVEMENTS:", 180, 355);
    fill(255);
    textSize(20);
    text("= " + character.coinsCount, 180, 400);
    image(img, 105, 374);
    if (character.coinsCount<6){ 
    text("GOOD JOB!", 270,400);
}
else if (character.coinsCount>6 && character.coinsCount<15) {
    text("GREAT JOB!", 270, 400);
}
else {
    text("EXCELLENT!", 270, 400);
}
    
    
    
    if (keyWentDown("ENTER")) {
        gameState = 1;
        character.lives = 3;
        enter_sfx[floor(random(0, enter_sfx.length))].play();
    }
}
function game() {
    camera.off();
    background(bg);
    background(bg1);
    camera.on();

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
    if (keyDown(RIGHT_ARROW)) {
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

    if (keyWentDown("x")) {
        if (!character.isJumping) {
            character.changeAnimation("jump")
            character.velocity.y -= JUMP_SPEED;
            character.isJumping = true;
            /*connection sound to jump and array of jumping sounds*/
            jump_sfx[floor(random(0, jump_sfx.length))].play();
        }

        
    }
    if (keyWentDown("z")) { 
        var shoot = createSprite(character.position.x+60, character.position.y-5);
        const shoot1 = loadImage("images/shoot.png");
        shoot.addImage(shoot1);
        //shoot.debug = true;
        shoot.velocity.x = 20;
        shoot_sfx[floor(random(0, shoot_sfx.length))].play();
        bullets.add(shoot);

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
            danger_box.position.x += random(width, width*3);
            explosion_sfx[floor(random(0, explosion_sfx.length))].play(); 
            camera.off();
            const hit_anim = loadAnimation("images/hit1.png", "images/hit4.png");
            const hitSc = createSprite(width/2,height/2);
            hitSc.addAnimation("hitSc", hit_anim);
            console.log(hitSc.position.x);
            hitSc.life = 30;
            hits.add(hitSc);
            camera.on();
        } else {
            wrap(danger_box, random(width * 2, width * 6));
        }
    }

    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (character.overlap(enemy)) {
            character.lives--;
            //character + 255;
            //enemy.remove();
            enemy.position.x += random(width * 2, width * 6);
            camera.off();
            const hit_anim2 = loadAnimation("images/hit5.png", "images/hit8.png");
            const hitSc2 = createSprite(width/2,height/2);
            hitSc2.addAnimation("hitSc2", hit_anim2);
            hitSc2.life = 30;
            hits2.add(hitSc2)
            console.log(hitSc2.position.x);
            camera.on();
            enter_sfx[floor(random(0, enter_sfx.length))].play();
        }
        else {
            wrap(enemy, random(width * 2, width * 6));
        }
    
//    if (hitSc.frames > 0) {
//        hitSc.display();
//        hitSc.frame--;
//        
//    }
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
    
//    for (let i = 0; i < enemies.length; i++) {
//        const enemy = enemies[i];
//       if(bullets.overlap(enemy)) {
//            enemy.position.x += random(width * 2, width * 6);
//            }
//       else {
//            wrap(enemy, random(width * 2, width * 6));
//        }
//   }
            
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
        wrap(bushes, random(width * 2 -50, width * 4));
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
    drawSprites(hits);
    drawSprites(hits2);
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
}


function wrap(obj, reset) {
    if (character.position.x - obj.position.x - obj.width/2 >= 40) {
        obj.position.x += reset;
    }
}

function constantMovement() {
    if (keyDown(RIGHT_ARROW)) {
        character.position.x += speed;
        if (!character.isJumping) {
            character.changeAnimation("run");
        }

    } else {
        //character.changeAnimation("idle");
    }
    if (keyDown(LEFT_ARROW)) {
        character.position.x -= speed;
    }
    if (keyDown(DOWN_ARROW)) {
        character.position.y += speed;
    }
    if (keyDown(UP_ARROW)) {
        character.position.y -= speed;
    }
}

function slidingMovement() {
    if (keyWentDown(RIGHT_ARROW)) {
        character.velocity.x += 1;
    }
    if (keyWentDown(LEFT_ARROW)) {
        character.velocity.x -= 1;
    }
    if (keyWentDown(DOWN_ARROW)) {
        character.velocity.y += 1;
    }
    if (keyWentDown(UP_ARROW)) {
        character.velocity.y -= 1;
    }
}
