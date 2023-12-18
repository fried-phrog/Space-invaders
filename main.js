
// VARS
    // canvas
    let tileSize = 32; // velikost stvari na canvasu
    let rows = 16; // višina canvasa
    let columns = 16; // širina canvasa

    let canvas;
    let context;

    // ship
    let ship = {
        x: (tileSize * columns / 2) - tileSize,
        y: (tileSize * rows) - tileSize * 2,
        width: tileSize * 2,
        height: tileSize,
        image: new Image(),

        shipVel: 3, // ship speed

        // move / shoot keys
        rightPressed: false,
        leftPressed: false,
        shootPressed: false
    }

    // move / shoot keys - storage
    let key_MoveLeft = "KeyA";
    let key_MoveRight = "KeyD";
    let key_Shoot = "Space";

    // aliens
    let alienArray = [];
    let alienColumns = 3;
    let alienRows = 2;
    let alienCount = 0;

    let alienVel = 1;

    class alienClass {
        image = new Image();
        x = 5;
        y = tileSize;
        width = tileSize * 2;
        height = tileSize;
        alive = true;
    }

    let alienAnimCounter = 0;

    // bullets
    let bulletArray = [];
    let bulletVel = -10; // bullet speed

    class bulletClass {
        x = ship.x + ship.width * 15 / 32;
        y = ship.y;
        width = tileSize / 8;
        height = tileSize / 2;
        used = false;
    }

    // meta
    let score = 0;
    let gameOver = false;
    let endReached = false;
    let difficulty = 1;

    // sounds / music
    let music = new Audio('Sounds/music.mp3');
    let shootSound = new Audio('Sounds/shoot.wav');
    let killSound = new Audio('Sounds/laser.mp3');
    

// ko se okno nalozi dobimo canvas itd
window.onload = function() {
    canvas = document.getElementById("game");
    canvas.width = tileSize * columns;
    canvas.height = tileSize * rows;

    context = canvas.getContext("2d"); // za risanje na canvas

    // prvic narise ship
    ship.image.src = "Images/ship.png";
    ship.image.onload = function() {
        context.drawImage(ship.image, ship.x, ship.y, ship.width, ship.height);
    }
    
    CreateAliens();

    requestAnimationFrame(Update);

    document.addEventListener("keydown", Keydown);
    document.addEventListener("keyup", Keyup);

    LoadStorageValues();
}

function Update() {
    requestAnimationFrame(Update);

    let check = document.getElementsByTagName("span");
    for (let i in check){
        if (check[i].className == "play hidden"){
            gameOver = true;
        } else if(check[i].className == "play" && !endReached){
            gameOver = false;
        }
    }

    if (gameOver) {
        music.volume = document.getElementById("musicVolume").value / 10;
        music.play();
        document.getElementById("musicVolumeText").innerHTML = "Music volume: " + music.volume * 100 + "%";
        
        shootSound.volume = document.getElementById("sfxVolume").value / 10;
        killSound.volume = document.getElementById("sfxVolume").value / 10;
        document.getElementById("sfxVolumeText").innerHTML = "SFX volume: " + killSound.volume * 100 + "%";

        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    music.volume = document.getElementById("musicVolume").value / 10;
    music.play();

    // ship update
    context.drawImage(ship.image, ship.x, ship.y, ship.width, ship.height);
    ShipMovement();

    // aliens update
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVel;

            if (alienAnimCounter < 50) {
                alien.image.src = 'Images/alien.png';
            } else if (alienAnimCounter > 50 && alienAnimCounter < 100) {
                alien.image.src = 'Images/alien2.png'
            } else if (alienAnimCounter == 100) {
                alienAnimCounter = 0;
            }
            

            // ce se vesolcki dotaknejo robov
            if (alien.x + alien.width >= canvas.width || alien.x <= 0) {
                // premakni vesolcke dol
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += tileSize;
                }

                alienVel *= -1;
                alien.x += alienVel * 2;                
            }


            context.drawImage(alien.image, alien.x, alien.y, alien.width, alien.height);

            // ce vesolcki pridejo na isti y kot ship, je konc igre
            if (alien.y + alien.height >= ship.y) {
                gameOver = true;
                endReached = true;

                DisplayEndScren();

                /*
                if (localStorage.getItem("hiscores")) {
                    let hiscore_temp = localStorage.getItem("hiscores");
        
                    if (hiscore_temp.length < 10) {
                        hiscore_temp.push(score);
                    } else {
                        hiscore_temp.pop();
                        hiscore_temp.push(score);
                    }
        
                    hiscore_temp.sort();
                    hiscore_temp.reverse();
                    localStorage.setItem("hiscores", hiscore_temp);
                } else {
                    let hiscore_temp = Array(score);
                    console.log(hiscore_temp);
                    localStorage.setItem("hiscores", hiscore_temp);
                }
                string array*/
            }
        }
    }

    // bullets & ubijanje vesolckov
        for (let i = 0; i < bulletArray.length; i++) {
            let bullet = bulletArray[i];
            bullet.y += bulletVel;

            // narisemo bullete
            context.fillStyle = "white";
            context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

            // bullet collision z vesolcki
            for (let j = 0; j < alienArray.length; j++) {
                let alien = alienArray[j];

                if (!bullet.used && alien.alive && DetectCollision(bullet, alien)) {
                    killSound.volume = document.getElementById("sfxVolume").value / 10;
                    killSound.play();
                    bullet.used = true;
                    alien.alive = false;
                    alienCount -= 1;

                    score += 10;
                }
            }
        }

        // cisti bullet array
        while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
            bulletArray.shift(); // zbrise prvi bullet
        }

    // naslednji level
    if (alienCount === 0) {
        // povečamo število vesolckov za naslednji level
        alienColumns = Math.min(alienColumns + 1, (columns / 2) - 2); // najvec 6 stolpcov
        alienRows = Math.min(alienRows + 1, rows - 4) // najvec 12 vrstic

        alienArray = [];
        bulletArray = [];

        CreateAliens();
    }

    // score
    context.fillStyle = "white";
    context.font = "16px minecraftia";
    context.textAlign = "left";
    context.fillText("SCORE: " + score, 5, 20);

    alienAnimCounter += 1;
}


// ship movement
    function ShipMovement() {
        if (gameOver) {
            return;
        }

        if (ship.leftPressed && (ship.x - ship.shipVel >= 0)) {
            ship.x -= ship.shipVel; // move left

        } else if (ship.rightPressed && (ship.x + ship.shipVel + ship.width <= canvas.width)) {
            ship.x += ship.shipVel; // move right
        }
    }

    function Keydown(ev) {
        if (ev.code === key_MoveLeft) {
            ship.leftPressed = true;
        }
        
        if (ev.code === key_MoveRight) {
            ship.rightPressed = true;
        }
    }

    function Keyup(ev) {
        if (ev.code === key_MoveLeft) {
            ship.leftPressed = false;
        }
        
        if (ev.code === key_MoveRight) {
            ship.rightPressed = false;
        }

        if (ev.code === key_Shoot) {
            Shoot();
        }
    }

// ship shoot
    function Shoot() {
        if (gameOver) {
            return;
        }

        if (bulletArray.length <= 1) {
            bulletArray.push(new bulletClass()); // I NEED MORE BOULETTZ!!!
        }
        shootSound.play();
    }

// create aliens
    function CreateAliens() {
        for (let i = 0; i < alienColumns; i++) {
            for (let j = 0; j < alienRows; j++) {
                let alien = new alienClass();

                alien.x = alien.x + (i * alien.width);
                alien.y = alien.y + (j * alien.height) + (j * 5);

                alien.image.src = "Images/alien.png";
                alienArray.push(alien);
            }
        }

        alienCount = alienArray.length;
    }


// preverja trke med dvema dobljenima objektoma
function DetectCollision(a, b) {
    return a.x < b.x + b.width && // zgornji levi kot od a se ne dotakne zgornjega desnega kota b
           a.x + a.width > b.x && // zgodnji desni kot a gre mimo zgornjega levega kota od b
           a.y < b.y + b.height && // zgornji levi kot se ne dotakne levega spodnjega kota b
           a.y + a.height > b.y; // spodnji levi kot a gre mimo zgornjega levega kota b
}


// META
    // spreminja menuje
    function ChangeMenu(menu){
        let menus = Array.from(document.getElementsByTagName("span"));

        menus.forEach (element => {
            if (!(element.className.match(menu.className))){
                element.classList.add("hidden");
            } else {
                element.classList.remove("hidden");
            }
        });
    }

    function ChangeKey(button) {

        if (button.className == "difficulty") {
            if (button.id == "diffEasy") {
                alienVel = 1;
                difficulty = 1;
                button.innerHTML = ">EASY<";
                document.getElementById("diffHard").innerHTML = "HARD";

            } else if (button.id == "diffHard") {
                alienVel = 2;
                difficulty = 2;
                button.innerHTML = ">HARD<";
                document.getElementById("diffEasy").innerHTML = "EASY";

            }

        } else {
            button.innerHTML = "press new key";

            document.addEventListener("keyup", KeyupMenu = (ev) => {
                document.removeEventListener("keyup", KeyupMenu);
                    
                ev.preventDefault();
    
                if (button.id == "rightButton") {
                    key_MoveRight = ev.code;
                    button.innerHTML = ev.key.toUpperCase();
    
                } else if (button.id == "leftButton") {
                    key_MoveLeft = ev.code;
                    button.innerHTML = ev.key.toUpperCase();
    
                } else if (button.id == "shootButton") {
                    key_Shoot = ev.code;
                    button.innerHTML = ev.key.toUpperCase();
    
                } else if (button.id == "clear") {
                    localStorage.clear();
    
                }
    
                // da bo lepo ce das space
                if (ev.code == "Space") {
                    button.innerHTML = "SPACE";
                }
    
                document.removeEventListener("keyup", KeyupMenu);
            })
        }
    }

// display end scren
function DisplayEndScren() {
    if (gameOver) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        let text = "END GAME";
        context.fillStyle = "white";
        context.font = "minecraftia";
        context.textAlign = "center";
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        text = "Press R to restart";
        context.fillStyle = "white";
        context.font = "minecraftia";
        context.textAlign = "center";
        context.fillText(text, canvas.width /2,  canvas.height/2 + 50);


        document.addEventListener("keydown", Restart = (ev) => {
            if(ev.code === "KeyR"){
                /*if(highScore < score){
                    highScore = score;
                    sessionStorage.setItem("highScore", highScore);
                }*/
                location.reload();
            }
        });

        
    }
}
    
// storage
    function LoadStorageValues() {
        if (localStorage.getItem("keyRight")) {
            key_MoveRight = localStorage.getItem("keyRight");
            document.getElementById("rightButton").innerHTML = key_MoveRight.toUpperCase();
        }
        if (localStorage.getItem("keyLeft")) {
            key_MoveLeft = localStorage.getItem("keyLeft");
            document.getElementById("leftButton").innerHTML = key_MoveLeft.toUpperCase();
        }
        if (localStorage.getItem("keyShoot")) {
            key_Shoot = localStorage.getItem("keyShoot");
            document.getElementById("shootButton").innerHTML = key_Shoot.toUpperCase();
        }

        if (!localStorage.getItem("musicVolume")) {
            music.volume = 0.2;
        } else {
            music.volume = localStorage.getItem("musicVolume");
            document.getElementById("musicVolume").value = music.volume * 10;
            document.getElementById("musicVolumeText").innerHTML = "Music volume: " + music.volume * 100 + "%";
        }
        if (!localStorage.getItem("sfxVolume")) {
            shootSound.volume = 0.2
            killSound.volume = 0.2;
        } else {
            shootSound.volume = 0.2;
            killSound.volume = localStorage.getItem("sfxVolume");
            document.getElementById("sfxVolume").value = killSound.volume * 10;
            document.getElementById("sfxVolumeText").innerHTML = "SFX volume: " + killSound.volume * 100 + "%";
        }

        difficulty = localStorage.getItem("difficulty");
        switch (difficulty) {
            case "2":
                alienVel = 2;
                document.getElementById("diffHard").innerHTML = ">HARD<";
                break;
            default:
                document.getElementById("diffEasy").innerHTML = ">EASY<";
                alienVel = 1;
        }
    }

    window.onbeforeunload = function() {
        localStorage.setItem("musicVolume", music.volume);
        localStorage.setItem("sfxVolume", killSound.volume);
        localStorage.setItem("keyRight", key_MoveRight);
        localStorage.setItem("keyLeft", key_MoveLeft);
        localStorage.setItem("keyShoot", key_Shoot);
        localStorage.setItem("difficulty", difficulty);
    }