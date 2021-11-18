'use strict';

class Entity {
    constructor(game, html, speed, x, y) {
        if (x < 0)   { x = 0;   }
        if (x > 100) { x = 100; }
        if (y < 0)   { y = 0;   }
        if (y > 100) { y = 100; }
        this._x         = x ?? 0;
        this._y         = y ?? game?.bazeY ?? 0;
        this._speed     = speed || 25;
        this._html      = html;
        this._game      = game;
        this.isCooldown = false;
        game.main.html.append(this.html);
    }

    get html()       { return this._html;       }
    get x()          { return this._x;          }
    get y()          { return this._y;          }
    get speed()      { return this._speed;      }
    get game()       { return this._game;       }


    set speed(value) {
        if (value < 5) { value = 5 }
        this._speed = value;
    }

    set x(value) {
        if (this.isCooldown) { return; }
        this.isCooldown = true;

        let old = this._x;
        if (value < 0)  { value = 0; }
        if (value > 90 ) { value = 90; }
        if (value == old) { return; }
        this._x = value;
        let time = Math.abs((this._x - old)/this.speed);
        this.html.style = `
        transform: translateX(${this.x}vw) 
        translateY(calc(${100-this.y}vh - 100%));
        transition: transform ${time}s linear;
        `;
        setTimeout(() => this.isCooldown = false, time*1000);
    }

    set y(value) {
        if (this.isCooldown) { return; }
        this.isCooldown = true;
        let old = this._y;
        if (value < 0)    { value = 0;   }
        if (value > 100)  { value = 100; }
        if (value == old) { return;      }
        this.checkCollider(value);
        let time = Math.abs( 2 * (this._y - old) / 1000 )**0.5;        
        this.html.style = 
        `
        transform: translateX(${this.x}vw) 
        translateY(calc(${100-this.y}vh - 100%));
        transition: transform ${time}s linear;
        `;
        setTimeout(() => this.isCooldown = false, time*1000);
    }

    start(x) {
        let y = this.game.bazeY;
        this._x = x;
        this._y = y;
        this.html.style = `
        transform: translateX(${x}vw) 
        translateY(calc(${100-this.y}vh - 100%));
        `;
    }

    enableDragnDrop(rules) {
        if (/iPhone|iPad|Android/i.test(navigator.userAgent)) {
            this.enableMobileDragnDrop(rules);

            return;
        }

        this.html.ondragstart = () => false;
        this.html.onmousedown = (e) => {
            if (this.isCooldown) { return; }
            this.isCooldown = true;

            let timer = new Date();

            let shiftX = e.clientX - e.target.getBoundingClientRect().left;
            let shiftY = e.clientY - e.target.getBoundingClientRect().top;
            
            document.onmousemove = (e) => {
                let height = document.body.clientHeight;
                let width  = document.body.clientWidth;
    
                let x = (e.clientX - shiftX) / width * 100;
                let y = (e.clientY - shiftY) / height * 100;

                if (x < 0) { x = 0; }
                if (y < 0) { y = 0; }

                if (x > 90)  { x = 90;  }
                if (y > 100) { y = 100; }

                let old = this.x;
                this._x = x;
                this._y = 100 - y;

                if (this.x < old) {     //меняем направление
                    this.html.children[0].style.transform = 'scaleX(-1)';
                    if (this.curtain) {
                        this.curtain.style.transform = 'scaleX(-1)'
                    }
                }
                else if (this.x > old) { 
                    this.html.children[0].style.transform = '';
                    if (this.curtain) {
                        this.curtain.style.transform = ''
                    }
                 }

                this.html.style = `
                transform: translateX(${this.x}vw)
                translateY(calc(${100-this.y}vh));
                transition: transform 0s linear;`;
            }

            document.onmouseup = (e) => {
                this.isCooldown = false;
                document.onmousemove = null;
                document.onmouseup = null;

                if (rules?.isCollider) {
                    this.y = this._y - 10;
                    return;
                }

                this.y = 0;
            };
        };
    }

    enableMobileDragnDrop(rules) {
        this.html.ondragstart = () => false;
        
        this.html.ontouchstart = (e) => {
            if (this.isCooldown) { return; }
            this.isCooldown = true;

            let timer = new Date();

            let shiftX = e.touches[0].clientX - e.touches[0].target.getBoundingClientRect().left;
            let shiftY = e.touches[0].clientY - e.touches[0].target.getBoundingClientRect().top;
        
            document.ontouchmove = (e) => {
                let height = document.body.clientHeight;
                let width  = document.body.clientWidth;
    
                let x = (e.touches[0].clientX - shiftX) / width * 100;
                let y = (e.touches[0].clientY - shiftY) / height * 100;
                
                if (x < 0) { x = 0; }
                if (y < 0) { y = 0; }

                if (x > 90)  { x = 90;  }
                if (y > 100) { y = 100; }

                let old = this.x;
                this._x = x;
                this._y = 100 - y;

                if (this.x < old) {     //меняем направление
                    this.html.children[0].style.transform = 'scaleX(-1)';
                    if (this.curtain) {
                        this.curtain.style.transform = 'scaleX(-1)'
                    }
                }
                else if (this.x > old) { 
                    this.html.children[0].style.transform = '';
                    if (this.curtain) {
                        this.curtain.style.transform = ''
                    }
                 }

                this.html.style = `
                transform: translateX(${this.x}vw)
                translateY(calc(${100-this.y}vh));
                transition: transform 0s linear;`;
            }

            document.ontouchend = (e) => {
                this.isCooldown = false;
                document.ontouchmove = null;
                document.ontouchend = null;

                if (rules?.isCollider) {
                    this.y = this._y - 10;
                    return;
                }

                this.y = 0;
            };
        };
    }

    checkCollider(value) {
        let old = this._y;
        if (old == value) { return; }
        let elem = this.game.getCollider(this);

        if (this.y != this.game.bazeY) {
            this._y = this.game.bazeY;
        }


        if (elem) {
            let height  = document.querySelector('.main__wall').clientHeight;
            let elemTop = (elem.top + elem.height*elem.areaCount) / height * 100;
            let elemBottom = 100 - elemTop;
            if (value > elemBottom) {
                this._y = elemBottom;                
            }
            else if (value < elemBottom) {
                this._y = this.game.bazeY;
            }
            else { return; }
        }
        else { return; }
        this._y = Math.round(this._y * 10) / 10;
    }
}


class Cat extends Entity {
    constructor({name, color, game, speed}) {
        let cat = document.createElement('div');
        cat.className = 'cat';
        cat.insertAdjacentHTML('beforeend', `
            <img src="">
            <div class="cat__name"></div>
            <div class="cat__curtain"><img src=""></div>
        `);

        super(game, cat, speed ?? 25, 0, 0);
        
        this._name       = name;
        this._color      = color;
        this._hp         = 100;
        this._hunger     = 100;
        this._happiness  = 100;
        this._src        = `./materials/cat-assets/${this.color}/`;
        this._animation  = `${this.src}cat_idle_blink_8.gif`;
        this._animName   = 'cat_idle_blink_8';
        this.emaciation  = { active: 20, sleep: 720, };
        this.hurtTimer   = false;
        this.healTimer   = false;
        this.timer       = new Date();
        this._isCooldown = false;
        this._curtain    = document.querySelector('.cat__curtain > img');
    }

    get name()       { return this._name;       }
    get color()      { return this._color;      }
    get hp()         { return this._hp;         }
    get hunger()     { return this._hunger;     }
    get happiness()  { return this._happiness;  }
    get src()        { return this._src;        }
    get animation()  { return this._animation;  }
    get x()          { return this._x;          }
    get y()          { return this._y;          }
    get isCooldown() { return this._isCooldown; }
    get curtain()    { return this._curtain;    }

    set isCooldown(bool) {
        this._isCooldown = bool;
        this.timer = new Date();
    }

    set animation(value) {
        if (value == this._animName) { return; }

        this._animation = this._src + value + '.gif';
        this._animName  = value;
        this.html.children[0].src = this.animation;
    }

    set x(value) {
        if (this.isCooldown) { return; }
        
        if (this.y != this.game.bazeY) { this.y = this.game.bazeY; return; }

        let old = this._x;

        if (value < 0)  { value = 0; }
        if (value > 90) { value = 90; }

        if (value == old) { return; }
        
        this.isCooldown = true;

        this._x = value;

        if (this.x < old) {     //меняем направление
            this.html.children[0].style.transform = 'scaleX(-1)';
            this.curtain.style.transform = 'scaleX(-1)';
        }
        else {
            this.html.children[0].style.transform = '';
            this.curtain.style.transform = '';
        }

        let time = Math.abs((this._x - old)/this.speed);

        this.html.style = 
        `
        transform: translateX(${this.x}vw) 
        translateY(calc(${100-this.y}vh - 100%));
        transition: transform ${time}s linear;
        `;

        this.animation = 'cat_run_12';

        setTimeout(() => {
            this.isCooldown = false;
            this.animation = 'cat_idle_blink_8';

            this.happiness += 1;
            this.hunger -= 1;

            this.checkStats();
            this.updateStats();
        }, time*1000);
    }

    set y(value) {
        if (this.isCooldown) { return; }
        

        let old = this._y;

        if (value < 0)    { value = 0;  }
        if (value > 90)   { value = 90; }

        this.checkCollider(value);

        if (this._y == old) { return;     }

        this.isCooldown = true;

        let time = Math.abs( 2 * (this._y - old) / 1000 )**0.5;

        this.html.style = `
        transform: translateX(${this.x}vw) 
        translateY(calc(${100-this.y}vh - 100%));
        transition: transform ${time}s linear`;

        if (this._y > old) {
            this.animation = 'cat_jump_12';
            setTimeout(() => this.animation = 'cat_fall_12', time*1000 < 250 ? time*1000 : 250);
            setTimeout(() => this.animation = 'cat_idle_blink_8', time*1000);
        }
        else {
            this.animation = 'cat_fall_12';
            setTimeout(() => this.animation = 'cat_land_12', time*1000 < 250 ? time*1000 : 250);
            setTimeout(() => this.animation = 'cat_idle_blink_8', time*1000);
        }


        setTimeout(() => {
            this.isCooldown = false;
        }, time*1000);
    }

    set curtain(animation) {
        if (!animation) { 
            this.html.children[0].style.opacity = 1;
            this._curtain.src = '';
            return;
        }

        this.html.children[0].style.opacity = 0;
        this._curtain.src = `${this.src}${animation}.gif`;
    }

    set hp(value) {
        if (value <= 0) {
            value = 0;

            if (this.hp != 0) { 
                this.die();
                this.isCooldown = true;
                this.happiness = 0;
                this.hunger = 0;
            }
        }

        else if (value < this._hp) {
            this.curtain = 'cat_hurt_12';
            setTimeout(() => this.curtain = '', 250);
        }

        if (value > this._hp) {
            if (this._hp == 0) {
                this.isCooldown = false;
                this.jump(5);
            }

            this.html.classList.add('cat_green');
            setTimeout(() => this.html.classList.remove('cat_green'), 200);
        }
        
        if (this._hp == 0 && value > 0) {
            
        }

        if (value > 100) { value = 100; }

        this._hp = value;
        this.checkStats();
        this.updateStats();
    }
    set hunger(value) {
        if (value < 0  ) { value = 0;   }
        if (value > 100) { value = 100; }
        this._hunger = value;
        
        this.checkStats();
        this.updateStats();
    }
    set happiness(value) {
        if (value < 0  ) { value = 0;   }
        if (value > 100) { value = 100; }
        this._happiness = value;

        this.checkStats();
        this.updateStats();
    }

    set color(color) {
        this._color = color;
        this._src = `./materials/cat-assets/${this.color}/`;
        this.animation = this._animName;
    }


    start(animation = this.animation, x = this.x) {
        let y = this.game.bazeY;

        this.animation = animation;
        this.reloadAnimation();
        this._x = x;
        this._y = y;

        this.html.style = `
        transform: translateX(${x}vw) 
        translateY(calc(${100-y}vh - 100%));
        `;

        this.updateStats();

        this.html.children[1].textContent = this.name;

        setInterval(() => {
            this.hunger -= 1;
        }, this.emaciation.active * 1000);

        setInterval(() => {
            this.happiness -= 1;
        }, this.emaciation.active * 500);

        setInterval(() => {
            if (new Date().getTime() - this.timer.getTime() > 5000) {
                cat.sit();
            }
        }, 5000);

        this.game.main.html.onclick = (e) => {
            let width = this.game.main.html.clientWidth;
            let x = e.clientX / width * 100;
            cat.x = x;
        }

        window.addEventListener('resize', () => this.y = game.bazeY);
    }

    reloadAnimation() {
        this.html.children[0].src = this.animation;
    }

    sit() {
        if (!this.isCooldown) { cat.animation = 'cat_sit_8'; }
    }

    startHurt() {
        if (this.hp == 0 || (this.hunger > 0 && this.happiness > 0)) { 
            this.stopHurt();
            return;
        }

        if (this.hurtTimer) { return; }

        this.hurtTimer = setInterval(() => {
            this.hp        -= 1;
            this.happiness -= 1;
        }, 1000);
    }
    stopHurt() {
        this.hurtTimer = clearInterval(this.hurtTimer);
    }

    startHeal() {
        if (this.hunger < 50 || this.happiness == 0 || this.hp == 100) { 
            this.stopHeal();
            return;
        }

        if (this.healTimer) { return; }

        this.healTimer = setInterval(() => {
            this.hp        += 1;
            this.hunger    -= 1;
        }, 1000);
    }
    stopHeal() {
        this.healTimer = clearInterval(this.healTimer);
    }

    checkStats() {
        if (this.hunger == 0 || this.happiness == 0) {
            this.startHurt();
            this.stopHeal();
            return;
        }
        this.stopHurt();
        
        if (this.hp == 0 && this.hunger > 0 && this.happiness > 0) {
            this.hp += 10; 
        }

        if (this.hunger > 50 && this.happiness > 0) {
            this.startHeal();
            this.stopHurt();
            return;
        }
        this.stopHeal();
    }

    updateStats() {
        let stats = this.game.header.stats;
        
        stats.hp.value.textContent = this.hp;
        if      (this.hp >= 75) { stats.hp.value.style = 'color: var(--green);'  }
        else if (this.hp >= 30) { stats.hp.value.style = 'color: var(--yellow);' }
        else                    { stats.hp.value.style = 'color: var(--red);'    }

        stats.happiness.value.textContent = this.happiness;
        let face = stats.happiness.logo.children[0];
        if      (this.happiness >= 70) { face.src = './materials/happy-face.png'  }
        else if (this.happiness >= 35) { face.src = './materials/normal-face.png' }
        else                           { face.src = './materials/sad-face.png'    }

        stats.hunger.value.textContent = this.hunger;
    }

    jump(height) {
        let old = this.y;
        if (this.isCooldown || height <= 0) { return; }

        this._y += height;

        this.html.style = `
        transform: translateX(${this.x}vw) 
        translateY(calc(${100-this.y}vh - 100%));
        transition: transform 0.1s linear`;

        setTimeout(() => {
            this._y -= height;
            this.html.style = `
            transform: translateX(${this.x}vw) 
            translateY(calc(${100-this.y}vh - 100%));
            transition: transform 0.1s linear`;
        }, 100);
        
        this.animation = 'cat_jump_12';
        setTimeout(() => this.animation = 'cat_fall_12', 100);
        setTimeout(() => this.animation = 'cat_idle_blink_8', 100);

        this.isCooldown = true;
        setTimeout(() => {
            this.isCooldown = false;
        }, 100);
    }

    attack() {
        if (this.isCooldown) { return; }

        this.isCooldown = true;
        this.animation = 'cat_attack_12';
        this.html.style.width = '28vh';
        setTimeout(() => {
            this.animation = 'cat_idle_blink_8';
            this.isCooldown = false;
            this.html.style.width = '';
        }, 250);
    }

    eat(foodObj) {
        this.attack();
        this.happiness += foodObj.happinessCount;
        this.hunger    += foodObj.hungerCount;
    }

    play(toyObj) {
        let timer = setInterval(() => {
            this.attack();
        }, 250);

        setTimeout(() => {
            timer = clearInterval(timer);
            this.happiness += toyObj.happinessCount;
        }, 500);
    }

    enableDragnDrop(rules) {
        this.html.addEventListener('mousedown', () => {
            if (!this.isCooldown) {
                this.animation = 'cat_idle_blink_8';
            }

            if (cat.hp == 0) { cat.hp = 10 }
        });

        super.enableDragnDrop(rules);
    }

    die() {
        this.animation  = 'cat_die_12';
        setTimeout(() => this.animation = 'cat_dead', 250);
    }
}

class Enemy extends Entity {
    constructor(game, cat, html, speed, x, y) {
        if (x < 5)  { x = 5  }
        if (x > 80) { x = 80 }

        super(game, html, speed, x, y);

        this.cat = cat;
        this.interval = null;
    }

    start(x = this.x, y = this.y) {
        this._x = x;
        this._y = y;

        this.html.style = `
        transform: translateX(${x}vw) 
        translateY(-${y}vh);
        `;

        let goToEnemy = () => {
            if (!cat.isCooldown) {
                if   (cat.y == game.bazeY) { cat.x = this.x;     }
                else                       { cat.y = game.bazeY; }
            }
        }

        this.interval = setInterval(goToEnemy, 300);
        
        this.y = game.bazeY;
    }

    destroy() {
        this.interval = clearInterval(this.interval);
        this.html.remove();
    }
}

class Food extends Enemy {
    constructor(foodName, game, cat, speed, x, y) {
        let html = document.createElement('div');
        html.className = 'food';
        html.insertAdjacentHTML('beforeend', `
        <img src="./materials/${foodName}.png" alt="foodName" draggable="false">
        `);

        super(game, cat, html, speed, x, y);

        this.foodObj = game.food[foodName];
    }

    start(x = this.x, y = this.y) {
        if (game.isDropped) { return; }

        super.start(x, y);

        game.isDropped = true;

        this.interval = clearInterval(this.interval);

        let goToEnemy = () => {
            if (!cat.isCooldown) {
                if (cat.x == this.x && cat.y == this.y && !this.isCooldown) { 
                    cat.eat(this.foodObj); 
                    this.destroy();
                    game.isDropped = false;
                    return; 
                }

                if   (cat.y == game.bazeY) { cat.x = this.x;     }
                else                       { cat.y = game.bazeY; }
            }
        }

        this.interval = setInterval(goToEnemy, 300);
    }
}

class Toy extends Enemy {
    constructor(toyName, game, cat, speed, x, y) {
        let toyObj = game.toys[toyName];
        
        let html = document.createElement('div');
        html.className = 'toy';
        html.insertAdjacentHTML('beforeend', `
        <img src="${toyObj.src}" alt="toyName" draggable="false">
        `);

        super(game, cat, html, speed, x, y);

        this.toyObj = toyObj;
    }

    set x(value) {
        if (this.isCooldown) { return; }
        this.isCooldown = true;

        if (this.y != this.game.bazeY) { this.y = this.game.bazeY; return; }

        let old = this._x;

        if (value < 0)    { value = 0;  }
        if (value > 90 )  { value = 90; }
        if (value == old) { return;     }

        
        this._x = value;

        let time = Math.abs((this._x - old)/this.speed);

        if (this.toyObj.type == 'roll') {
            this.html.children[0].classList.remove('rollback');
            this.html.children[0].classList.remove('roll');
        }

        if (this.x < old) {     //меняем направление
            this.html.children[0].style.transform = 'scaleX(-1)';
            if (this.toyObj.type == 'roll') {
                this.html.children[0].style.transform = '';
                this.html.children[0].classList.add('rollback');
            }
        }
        else {
            this.html.children[0].style.transform = '';
            if (this.toyObj.type == 'roll') {
                this.html.children[0].classList.add('roll');
            }
        }

        this.html.style = `
        transform: translateX(${this.x}vw) 
        translateY(calc(${100-this.y}vh - 100%));
        transition: transform ${time}s linear;
        `;

        setTimeout(() => {
            this.isCooldown = false;
        }, time*1000);

        if (this.toyObj.type == 'roll') {
            setTimeout(() => {
                this.html.children[0].classList.remove('rollback');
                this.html.children[0].classList.remove('roll');
            }, 600);
        }
    }

    get x() { return this._x; }

    start(x = this.x, y = this.y) {
        if (game.isDropped) { return; }
        game.isDropped = true;

        super.start(x, y);

        this.interval = clearInterval(this.interval);
        this.behavior = clearInterval(this.behavior);

        let goToEnemy = () => {
            if (!cat.isCooldown) {
                if (cat.x == this.x && cat.y == this.y && !this.isCooldown) { 
                    cat.play(this.toyObj);
                    this.isCooldown = true;
                    setTimeout(() => {
                        game.isDropped = false;
                        this.destroy();
                        return; 
                    }, 1000);
                }

                if   (cat.y == game.bazeY) { cat.x = this.x;     }
                else                       { cat.y = game.bazeY; }
            }
        }

        this.interval = setInterval(goToEnemy, 200);
        let behavior = () => {
            this.html.classList.remove('roll');
            this.html.classList.remove('rollback');

            let sign = Math.random()*100;
            if (sign > this.x) {
                this.x += 15;
            }
            else { this.x -= 15; }
        }

        setTimeout(() => this.behavior = setInterval(behavior, 600), 400);
    }

    destroy() {
        super.destroy();
        this.behavior = clearInterval(this.behavior);
    }
}

class Game {
    constructor(bazeY) {
        Object.defineProperties(this, {
            _bazeY: {
                enumerable: true,
                writable: true,
                value: bazeY || 20,
            },

            isBazeYChanged : {
                enumerable: true,
                writable: true,
                value: false,
            },

            isDropped: {
                enumerable: true,
                writable: true,
                value: false,
            },

            header: {
                enumerable: true,
                value: {
                    html: document.querySelector('.header'),

                    stats: {
                        hp: {
                            logo : document.querySelector('#hp-logo' ),
                            value: document.querySelector('#hp-value'),

                            updateColor(hp) {
                                if (hp >= 75) { this.value.className = 'green';  return; }
                                if (hp >= 25) { this.value.className = 'yellow'; return; }
                                this.value.className = 'red';
                            }
                        },
                        hunger: {
                            logo : document.querySelector('#hunger-logo' ),
                            value: document.querySelector('#hunger-value'),
                        },
                        happiness: {
                            logo : document.querySelector('#happiness-logo' ),
                            value: document.querySelector('#happiness-value'),

                            updateLogo(lvl) {
                                if (lvl >= 75) { this.logo.children[0].src = './materials/happy-face.png';  return; }
                                if (lvl >= 40) { this.logo.children[0].src = './materials/normal-face.png'; return; }
                                this.logo.children[0].src = './materials/sad-face.png';
                            }
                        },
                    },

                    acts: {
                        eat:  {
                            html: document.querySelector('#eat'),
                            menu: document.querySelector('.header__eatMenu'),
                        },
                        play: {
                            html: document.querySelector('#play'),
                            menu: document.querySelector('.header__playMenu'),
                        },
                    },
                },
            },
            
            main: {
                enumerable: true,
                value: {
                    html: document.querySelector('.main'),

                    colliderObjects: {
                        bed: {
                            html: document.querySelector('.main__bed'),
                            areaCount: 0.45,
                        },
                    },
                },
            },

            food: {
                enumerable: true,
                writable: true,
                value: {
                    meat: {
                        src: './materials/meat.png',
                        hungerCount: 30,
                        happinessCount: 10,
                    },
                    
                    fish: {
                        src: './materials/fish.png',
                        hungerCount: 25,
                        happinessCount: 10,
                    },
    
                    soup: {
                        src: './materials/soup.png',
                        hungerCount: 20,
                        happinessCount: 5,
                    },
    
                    cake: {
                        src: './materials/cake.png',
                        hungerCount: 20,
                        happinessCount: 30,
                    },
                },
            },

            toys: {
                enumerable: true,
                wrutable: true,
                value: {
                    mouse: {
                        src: './materials/mouse.png',
                        happinessCount: 50,
                        type: 'run',
                    },

                    ball: {
                        src: './materials/ball.png',
                        happinessCount: 35,
                        type: 'roll',
                    },

                    thread: {
                        src: './materials/thread.png',
                        happinessCount: 40,
                        type: 'roll',
                    },

                    frog: {
                        src: './materials/frog.gif',
                        happinessCount: 45,
                        type: 'run',
                    }
                }
            },
        });

        this.checkHeight();
    }

    get bazeY() { return this._bazeY; }
    set bazeY(value) {
        if (value < 0)   { value = 0;   }
        if (value > 100) { value = 100; }
        
        this._bazeY = value;
    }

    start() {
        window.onload = () => {
            setTimeout(() => window.scrollTo(0, 0), 10);
        };
        document.body.style.height = window.innerHeight + 'px';

        window.addEventListener('resize', () => {
            window.scrollTo(0, 0)
            document.body.style.height = window.innerHeight + 'px';
            this.checkHeight();
        });

        this.header.html.style.visibility = 'visible';
        this.main.html.style.visibility   = 'visible';

        this.reloadMenu('food');
        this.reloadMenu('toy');

        let eat = this.header.acts.eat;
        let play = this.header.acts.play;

        eat.html.addEventListener('click', (e) => {
            e.preventDefault();

            if (!eat.menu.classList[1]) {
                eat.menu.classList.add('header__eatMenu_visible');

                if (play.menu.classList[1]) {
                    play.menu.classList.remove('header__playMenu_visible');
                }
            }

            else {
                eat.menu.classList.remove('header__eatMenu_visible');
            }
        });

        
        play.html.addEventListener('click', (e) => {
            e.preventDefault();

            if (!play.menu.classList[1]) {
                play.menu.classList.add('header__playMenu_visible');

                if (eat.menu.classList[1]) {
                    eat.menu.classList.remove('header__eatMenu_visible');
                }
            }

            else {
                play.menu.classList.remove('header__playMenu_visible');
            }
        });

    
        document.querySelector('.header__eatMenu-cancel').onclick = (e) => {
            e.preventDefault();
            if (eat.menu.classList[1]) { eat.menu.classList.remove('header__eatMenu_visible'); }
        }
        document.querySelector('.header__playMenu-cancel').onclick = (e) => {
            e.preventDefault();
            if (play.menu.classList[1]) { play.menu.classList.remove('header__playMenu_visible'); }
        }

        this.main.html.addEventListener('click', () => {
            if (eat.menu.classList[1])  { eat.menu.classList.remove('header__eatMenu_visible'); }
            if (play.menu.classList[1]) { play.menu.classList.remove('header__playMenu_visible'); }
        });
    }

    checkHeight() {
        let wall = document.querySelector('.main__wall');
        if (window.innerHeight != wall.clientHeight && !this.isBazeYChanged && window.innerHeight <= window.innerWidth) {
            this.bazeY += 10;
            this.isBazeYChanged = true;
        }
        else if (this.isBazeYChanged) {
            this.bazeY -= 10;
            this.isBazeYChanged = false;
        }
    }

    reloadMenu(type) {
        let actMenu, actList;
        if (type == 'food') { 
            actMenu = this.header.acts.eat;
            actList = this.food;
        }
        else if (type == 'toy') { 
            actMenu = this.header.acts.play; 
            actList = this.toys;
        }
        else {
            console.error('Error: Unknown type');
            return;
        }

        for (let name in actList) {
            /*actMenu.menu.insertAdjacentHTML('afterbegin', `
            <div class="header__eatMenu-food" data-name="${name}">
                <img src="${actList[name].src}" alt="${name}">
                <p>${name[0].toUpperCase() + name.slice(1)}</p>
            </div>
            `);*/

            if (type == 'food') {
                actMenu.menu.insertAdjacentHTML('afterbegin', `
                    <div class="header__eatMenu-food" data-name="${name}">
                        <img src="${actList[name].src}" alt="${name}">
                        <p>${name[0].toUpperCase() + name.slice(1)}</p>
                    </div>
                `);
            }
            else {
                actMenu.menu.insertAdjacentHTML('afterbegin', `
                    <div class="header__playMenu-toy" data-name="${name}">
                        <img src="${actList[name].src}" alt="${name}">
                        <p>${name[0].toUpperCase() + name.slice(1)}</p>
                    </div>
                `);
            }

            let elem = document.querySelector(`div[data-name="${name}"] img`);
            elem.ondragstart = () => false;

            if (/Win|Mac|Linux/i.test(navigator.userAgent) && !('ontouchend' in document)) {
                elem.onmousedown = (e) => {
                    if (this.isDropped || document.querySelector('.' + type)) { return; }
    
                    elem.style.opacity = 0;
                    setTimeout(() => elem.style.opacity = 1, 100);
    
                    actMenu.menu.classList.remove('header__eatMenu_visible');
                    actMenu.menu.classList.remove('header__playMenu_visible');
    
                    let shiftX = e.clientX - e.target.getBoundingClientRect().left;
                    let shiftY = e.clientY - e.target.getBoundingClientRect().top;

                    let x = ((e.clientX - shiftX) / document.body.clientWidth) * 100;
                    let y = ((e.clientY - shiftY) / document.body.clientHeight) * 100;
                    
                    let elemEnemy = this.dropEnemy(type, name, x, y);

                    elemEnemy._x = x;
                    elemEnemy._y = 100 - y;
                    elemEnemy.html.style = `
                    transform: translateX(${x}vw)
                    translateY(${y}vh);
                    `

                    elemEnemy.html.classList.add('priority');

                    elemEnemy.isCooldown = false;

                    let customEvent = new Event('mousedown');
                    [
                        customEvent.pageX, 
                        customEvent.pageY, 
                        customEvent.clientX, 
                        customEvent.clientY
                    ] = [
                        e.pageX, 
                        e.pageY, 
                        e.clientX, 
                        e.clientY
                    ];

                    elemEnemy.html.dispatchEvent(customEvent);

                    return;               
                }
            }

            else if (/iPhone|iPad|Android/i.test(navigator.userAgent)) {
                elem.ontouchstart = (e) => {
                    if (this.isDropped || document.querySelector('.' + type)) { return; }
                    elem.style.opacity = 0;
                    setTimeout(() => elem.style.opacity = 1, 100);
    
                    actMenu.menu.classList.remove('header__eatMenu_visible');
                    actMenu.menu.classList.remove('header__playMenu_visible');
    
                    let shiftX = e.touches[0].clientX - e.touches[0].target.getBoundingClientRect().left;
                    let shiftY = e.touches[0].clientY - e.touches[0].target.getBoundingClientRect().top;

                    let x = ((e.touches[0].clientX - shiftX) / document.body.clientWidth) * 100;
                    let y = ((e.touches[0].clientY - shiftY) / document.body.clientHeight) * 100;
                    
                    let elemEnemy = this.dropEnemy(type, name, x, y);

                    elemEnemy._x = x;
                    elemEnemy._y = 100 - y;
                    elemEnemy.html.style = `
                    transform: translateX(${x}vw)
                    translateY(${y}vh);
                    `

                    elemEnemy.html.classList.add('priority');

                    elemEnemy.isCooldown = false;
                    let customEvent = new Event('touchstart');
                    customEvent.touches = e.touches;

                    elemEnemy.html.dispatchEvent(customEvent);

                    return;               
                }
            }

            else { 
                elem.onclick = () => {
                    this.dropEnemy(type, name);
                    actMenu.menu.classList.remove('header__eatMenu_visible');
                    actMenu.menu.classList.remove('header__playMenu_visible');
                };
            }
        }
    }

    getCollider(cat) {
        for (let elem in this.main.colliderObjects) {
            elem = this.main.colliderObjects[elem];
            let coordinates = elem.html.getBoundingClientRect();
            let elemLeft    = coordinates.left  / this.main.html.clientWidth * 100;
            let elemRight   = coordinates.right / this.main.html.clientWidth * 100;

            cat             = cat.html.getBoundingClientRect();
            let catLeft     = cat.left  / this.main.html.clientWidth * 100;
            let catRight    = cat.right / this.main.html.clientWidth * 100;

            if (catLeft > elemLeft && catLeft < elemRight) {
                if (catRight > elemLeft && catRight < elemRight) {
                    coordinates.areaCount = elem.areaCount;
                    return coordinates;
                }
            }
        }

        return false;
    }

    dropEnemy(type, name, x, y) {
        if (!['food', 'toy'].includes(type)) {
            return false;
        }

        x = x ?? Math.random()*100;

        y = y ?? 80;

        if (!this.isDropped && !document.querySelector('.' + type)) {
            let enemy;

            if      (type == 'food') { enemy = new Food(name, game, cat, 25, x, y); }
            else if (type == 'toy')  { enemy = new Toy(name, game, cat, 25, x, y); }

            enemy.start();
            enemy.enableDragnDrop();

            enemy.html.children[0].ondragstart = null;
            

          

            return enemy;
        }
    }
}


let isGameStarted = false;
let game          = {};
let cat           = {};

if (isGameStarted) {
    
}

else {
    game = new Game(10);

    cat = new Cat({
        name: 'Kuzia',
        color: 'default',
        game: game,
    });
}

game.start();
cat.start('cat_idle_blink_8', 10);
cat.enableDragnDrop({isCollider: true});