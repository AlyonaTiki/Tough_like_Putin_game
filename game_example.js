/* global variable */
var character;
var skyBackground;
var platform;
var spaceship;
var clouds, walls, enemies, health, stuff;
const NUM_BUSHES = 8,
	NUM_CLOUDS = 2;
/*	NUM_WALLS = 4,
	NUM_ENEMIES = 3,
	NUM_HEALTH = 1;*/
const SPEED = 5;
const JUMP_SPEED = SPEED * 2;
const GRAVITY = 0.5;
const enemySpeedMin = SPEED/5, enemySpeedMax = SPEED;
const cloudSpeedMin = SPEED/2, cloudSpeedMax = SPEED;

/* ui */
// var button;
/* menu
0 intro screen
1 instructions
2 player dies
3 next level
*/
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
			"press z to jump",
			"arrow keys to move",
			"spaceship is the end of the level"
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

/* gamestates
0 intro screen
1 instructions
2 game
3 dies
4 next level
*/

var gameState = 0;
var currentLevel = 0;
var levelData = {
	0: {
		walls: 4,
		enemies: 3,
		health: 2,
		speedMin: SPEED/5,
		speedMax: SPEED
	},
	1: {
		walls: 3,
		enemies: 5,
		health: 1,
		speedMin: SPEED/4,
		speedMax: SPEED * 1.5
	},
	2: {
		walls: 2,
		enemies: 9,
		health:0,
		speedMin: SPEED/2,
		speedMax: SPEED * 2
	}
};

/* graphics */
const cloud_files = [
	"assets/cloud/cloud0.png", 
	"assets/cloud/cloud1.png", 
	"assets/cloud/cloud2.png", 
	"assets/cloud/cloud3.png"
];

/* audio */
var jump_sfx = [];
const jump_files = [
	"assets/sfx/character/jump0.wav", "assets/sfx/character/jump1.wav", "assets/sfx/character/jump2.wav", "assets/sfx/character/jump3.wav"
];

var hit_sfx = [];
const hit_files = [
	"assets/sfx/character/hit0.wav", "assets/sfx/character/hit1.wav", "assets/sfx/character/hit2.wav"
];

function preload() {
	for (let i = 0; i < jump_files.length; i++) {
		const jump_sound = loadSound(jump_files[i]);
		jump_sfx.push(jump_sound);
	}
	
	for (let i = 0; i < hit_files.length; i++) {
		const hit_sound = loadSound(hit_files[i]);
		hit_sfx.push(hit_sound);
	}
}

function setup() {
	// use windowWidth
	var defaultMargin = 16;
	var gameWidth = 640;
	var gameHeight = 360;
	var w = min(800, windowWidth) - defaultMargin;
	var h = w * (gameHeight/gameWidth);
	createCanvas(w, h);

	stuff = new Group();
	walls = new Group();
	clouds = new Group();
	enemies = new Group();
	health = new Group();

	/* character setup */
	character = createSprite(0, 20, 16, 16);
	character.setCollider("rectangle", -4, 0, 16, 32);
	const idle_anim = loadAnimation("assets/idle/idle_00.png", "assets/idle/idle_09.png");
	const run_anim = loadAnimation("assets/run/run_0.png", "assets/run/run_5.png");
	character.addAnimation("idle", idle_anim);
	character.addAnimation("run", run_anim);
	character.debug = true;
	character.isJumping = true;
	character.lives = 3;
	character.minX = 0;
	stuff.add(character);
	
	const sky_img = loadImage("assets/seamless_bkg.png");
	skyBackground = createSprite(0, height/2, width, height);
	skyBackground.addImage("sky", sky_img);
	skyBackground.debug = true;

	/* platform setup */
	platform = createSprite(0, height - 10, width * 2, 20);
	stuff.add(platform);
	//platform.debug = true;
	
	spaceship = createSprite(width*3, height/2, width/3, height/2);
	stuff.add(spaceship);

	for (let i = 0; i < NUM_BUSHES; i++) {
		createSprite(
			random(0, width),
			random(height - 20, height),
			random(10, 60),
			random(50, 100)
		);
	}
	
	for (let i = 0; i < NUM_CLOUDS; i++) {
		const cloud = createSprite(
			random(width, width * 2),
			random(0, height / 2),
			random(50, 100),
			random(20, 40)
		);
		const cloud_img = loadImage(cloud_files[floor(random(0, cloud_files.length))]);
		cloud.addImage(cloud_img);
		cloud.velocity.x = -random(cloudSpeedMin, cloudSpeedMax);
		clouds.add(cloud);
	}
	
	buildLevel();
	
	for (let i = 0; i < menus.length; i++) {
		const menu = menus[i];
		menu.sprites = new Group();
		for (let j = 0; j < menu.buttons.length; j++) {
			const b = menu.buttons[j];
			const button = createSprite(440, 120 + j * 120);
			button.addAnimation("idle", "assets/ui/button/button_0.png");
			button.addAnimation("hover", "assets/ui/button/button_1.png", "assets/ui/button/button_2.png");
			button.addAnimation("click", "assets/ui/button/button_3.png", "assets/ui/button/button_4.png");
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
			i * width*2/level.walls,
			random(height * 7 / 8, height/2),
			200,
			40
		);
		wall.debug = true;
		walls.add(wall);
	}
	
	for (let i = 0; i < level.enemies; i++) {
		const sz = random(30, 50);
		const enemy = createSprite(
			random(width * 2, width * 4),
			random(height * 3 / 4, height * 7 / 8),
			sz,
			sz
		);
		enemy.velocity.x = -random(level.speedMin, level.speedMax);
		enemies.add(enemy);
	}
	
	for (let i = 0; i < level.health; i++) {
		const life = createSprite(
			random(0, width),
			random(height / 2, height),
			30,
			20
		);
		health.add(life);
	}
	
}

function draw() {
	if (gameState == 0) {
		menu(0); //intro();
	} else if (gameState == 1) {
		menu(1); //intructions();
	} else if (gameState == 2) {
		game();
	} else if (gameState == 3) {
		menu(3);  //dead();
	} else if (gameState == 4) {
		menu(2); // nextLevel();
	}
}

function menu(index) {
	camera.off();
	background(51);
	fill(255);
	textSize(24);
	textFont("sans-serif");
	textAlign(LEFT);
	for (let i = 0; i < menus[index].titles.length; i++) {
		text(menus[index].titles[i], 40, 40 + i * 60, width/3, height);
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
	camera.position.x = 0;
	platform.position.x = 0;
	skyBackground.position.x = 0;
	spaceship.position.x = width*3;
	walls.clear();
	enemies.clear();
	health.clear();
}

function game() {
	camera.off();
	background("white");
	//background(skyBackground);
	camera.on();
	skyBackground.display();
	wrap(skyBackground, width);

	for (let i = 0; i < clouds.length; i++) {
		const cloud = clouds[i];
		if (cloud.position.x + cloud.width / 2 < 0) {
			cloud.position.x = random(width, width * 2);
			cloud.position.y = random(0, height / 2);
		}
	}

	/* keyboard events */
	// constantMovement();
	/* true endless runner */
	// character.position.x += SPEED;
	/* player moves character only right */
	if (keyDown(RIGHT_ARROW)) {
		character.position.x += SPEED;
		character.changeAnimation("run");
	} else if(keyDown(LEFT_ARROW)) {
		if (character.minX < character.position.x - width/2) {
			character.minX = character.position.x - width/2;
		}
		if (character.position.x > character.minX) {
			character.position.x -= SPEED;
		}
	} else {
		character.changeAnimation("idle");
	}

	/* new collision for platform/ground and walls/platforms  */
	if (character.collide(platform)) {
		character.velocity.y = 0;
		if (character.isJumping) {
			character.isJumping = false;
			hit_sfx[floor(random(0, hit_sfx.length))].play();
		}

	} else {
		character.velocity.y += GRAVITY;
	}
	
	for (let i = 0; i < walls.length; i++) {
		const wall = walls[i];
		if (character.collide(wall)) {
			if (character.position.y + character.height/2 - 2 < wall.position.y - wall.height/2) {
				character.velocity.y = 0;
				if (character.isJumping) {
					character.isJumping = false;
					hit_sfx[floor(random(0, hit_sfx.length))].play();
				}
			}
		}
	}
	
	/* jump event */
	if (keyWentDown("x")) {
		if (!character.isJumping) {
			character.velocity.y -= JUMP_SPEED;
			character.isJumping = true;
			jump_sfx[floor(random(0, jump_sfx.length))].play();
		}
	}


	for (let i = 0; i < enemies.length; i++) {
		const enemy = enemies[i];
		if (character.overlap(enemy)) {
			character.lives--;
			// enemy.remove();
			enemy.position.x += random(width * 2, width * 6);
		} else {
			wrap(enemy, random(width * 2, width * 6));
		}
	}

	for (let i = 0; i < health.length; i++) {
		const life = health[i];
		if (character.overlap(life)) {
			character.lives++;
			// life.remove(); 
			life.position.x += random(width * 2, width * 6);
		} else {
			wrap(life, random(width * 2, width * 6));
		}
	}

	/* wrapping sprites */
	//wrap(platform, width);
	if (character.position.x - platform.position.x > width/2) {
		platform.position.x += width;
	}
	for (let i = 0; i < walls.length; i++) {
		const wall = walls[i];
		wrap(wall, random(width * 2, width * 4));
	}


	/* camera follows character */
	if (character.position.x > camera.position.x) {
		camera.position.x = character.position.x /*+ width/4*/;
	}
	

	drawSprites(stuff);
	drawSprites(walls);
	drawSprites(enemies);
	drawSprites(health);

	/* ui */
	camera.off();
	drawSprites(clouds);
	
	textAlign(LEFT);
	textSize(24);
	stroke("red");
	fill(0);
	rect(10, 0, 50, 20);
	fill(255);
	text("Lives: " + character.lives, 10, 20);

	/* detect game ending */
	if (character.lives <= 0) {
		gameState = 3;
	}
	
	/* detect next level */
	if (character.overlap(spaceship)) {
		currentLevel++;
		gameState = 4;
	}
}

function wrap(obj, reset) {
	if (character.position.x - obj.position.x - obj.width/2 >= width / 2) {
		obj.position.x += reset;
	}
}

function constantMovement() {
	if (keyDown(RIGHT_ARROW)) {
		character.position.x += SPEED;
	}
	if (keyDown(LEFT_ARROW)) {
		character.position.x -= SPEED;
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

        const hit_anim = loadAnimation("images/hit1.png", "images/hit4.png");
        const hitSc = createSprite(width / 2, height / 2);
        hitSc.addAnimation("hitSc", hit_anim);
//        console.log(hitSc.position.x);
        hitSc.life = 100;
        hits.add(hitSc);

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

