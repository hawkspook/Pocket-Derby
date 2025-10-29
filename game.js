class Horse {
    constructor(id, name, color, odds) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.odds = odds;
        this.position = 0;
        this.speed = 0;
        this.lane = id;
        this.finished = false;
        this.finishTime = 0;
    }

    update() {
        if (!this.finished) {
            this.speed = Math.random() * 3 + 1 + (Math.random() * 0.5);
            this.position += this.speed;
        }
    }

    reset() {
        this.position = 0;
        this.speed = 0;
        this.finished = false;
        this.finishTime = 0;
    }
}

class HorseRacingGame {
    constructor() {
        this.canvas = document.getElementById('race-track');
        this.ctx = this.canvas.getContext('2d');
        this.money = 1000;
        this.selectedHorse = null;
        this.betAmount = 50;
        this.racing = false;
        this.raceFinished = false;
        this.finishOrder = [];
        this.raceNumber = 1;
        
        this.horses = [
            new Horse(0, "THUNDER", "#8B4513", 3.5),
            new Horse(1, "LIGHTNING", "#FFD700", 2.8),
            new Horse(2, "STORM", "#4169E1", 4.2),
            new Horse(3, "BLAZE", "#DC143C", 3.0),
            new Horse(4, "SHADOW", "#2F4F4F", 5.0),
            new Horse(5, "COMET", "#FF8C00", 3.8)
        ];

        this.trackLength = 800;
        this.initCanvas();
        this.setupEventListeners();
        this.renderHorsesList();
        this.updateMoneyDisplay();
        this.draw();
    }

    initCanvas() {
        const container = document.getElementById('game-screen');
        this.canvas.width = Math.min(800, window.innerWidth - 40);
        this.canvas.height = 400;
    }

    setupEventListeners() {
        document.getElementById('start-race-btn').addEventListener('click', () => this.startRace());
        document.getElementById('next-race-btn').addEventListener('click', () => this.nextRace());
        document.getElementById('bet-amount').addEventListener('input', (e) => {
            this.betAmount = parseInt(e.target.value) || 50;
        });

        window.addEventListener('resize', () => {
            this.initCanvas();
            this.draw();
        });
    }

    renderHorsesList() {
        const horsesList = document.getElementById('horses-list');
        horsesList.innerHTML = '';

        this.horses.forEach(horse => {
            const horseCard = document.createElement('div');
            horseCard.className = 'horse-card';
            horseCard.innerHTML = `
                <div class="horse-number">#${horse.id + 1}</div>
                <div class="horse-info">
                    <div class="horse-name">${horse.name}</div>
                    <div class="horse-odds">Odds: ${horse.odds}:1</div>
                </div>
                <div class="horse-color" style="background-color: ${horse.color}"></div>
            `;
            
            horseCard.addEventListener('click', () => this.selectHorse(horse, horseCard));
            horsesList.appendChild(horseCard);
        });
    }

    selectHorse(horse, cardElement) {
        if (this.racing) return;

        document.querySelectorAll('.horse-card').forEach(card => {
            card.classList.remove('selected');
        });

        cardElement.classList.add('selected');
        this.selectedHorse = horse;
    }

    startRace() {
        if (!this.selectedHorse) {
            alert('Please select a horse first!');
            return;
        }

        if (this.betAmount > this.money) {
            alert('Not enough money for this bet!');
            return;
        }

        if (this.betAmount < 10) {
            alert('Minimum bet is $10!');
            return;
        }

        this.money -= this.betAmount;
        this.updateMoneyDisplay();

        document.getElementById('betting-panel').classList.add('hidden');
        document.getElementById('instructions').classList.add('hidden');
        
        this.racing = true;
        this.raceFinished = false;
        this.finishOrder = [];
        
        this.horses.forEach(horse => horse.reset());
        
        this.runRace();
    }

    runRace() {
        if (!this.racing) return;

        let allFinished = true;

        this.horses.forEach(horse => {
            if (!horse.finished) {
                horse.update();
                
                if (horse.position >= this.trackLength) {
                    horse.finished = true;
                    horse.finishTime = Date.now();
                    this.finishOrder.push(horse);
                } else {
                    allFinished = false;
                }
            }
        });

        this.draw();

        if (allFinished) {
            this.endRace();
        } else {
            requestAnimationFrame(() => this.runRace());
        }
    }

    endRace() {
        this.racing = false;
        this.raceFinished = true;

        const winner = this.finishOrder[0];
        const playerWon = winner.id === this.selectedHorse.id;

        let resultMessage = '';
        let winnings = 0;

        if (playerWon) {
            winnings = Math.floor(this.betAmount * this.selectedHorse.odds);
            this.money += this.betAmount + winnings;
            resultMessage = `🎉 WINNER! 🎉<br>${winner.name} wins!<br>You won $${winnings}!`;
            document.getElementById('result-title').style.color = '#4CAF50';
        } else {
            resultMessage = `😞 BETTER LUCK NEXT TIME!<br>${winner.name} wins!<br>You lost $${this.betAmount}`;
            document.getElementById('result-title').style.color = '#f44336';
        }

        document.getElementById('result-message').innerHTML = resultMessage;

        const standingsHTML = this.finishOrder.map((horse, index) => `
            <div class="standing-row ${horse.id === this.selectedHorse.id ? 'player-horse' : ''}">
                <span class="position">${index + 1}.</span>
                <span class="horse-name">${horse.name}</span>
                <span class="horse-color-dot" style="background-color: ${horse.color}"></span>
            </div>
        `).join('');

        document.getElementById('final-standings').innerHTML = standingsHTML;
        document.getElementById('results-panel').classList.remove('hidden');
        
        this.updateMoneyDisplay();

        if (this.money < 10) {
            setTimeout(() => {
                alert('Game Over! You ran out of money. Starting fresh with $1000.');
                this.money = 1000;
                this.updateMoneyDisplay();
            }, 1000);
        }
    }

    nextRace() {
        this.raceNumber++;
        this.selectedHorse = null;
        document.getElementById('results-panel').classList.add('hidden');
        document.getElementById('betting-panel').classList.remove('hidden');
        document.getElementById('instructions').classList.remove('hidden');
        
        this.horses.forEach(horse => {
            horse.odds = Math.random() * 3 + 2;
            horse.odds = Math.round(horse.odds * 10) / 10;
        });
        
        this.renderHorsesList();
        this.draw();
    }

    updateMoneyDisplay() {
        document.getElementById('money').textContent = this.money;
    }

    draw() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.fillStyle = '#2d5016';
        ctx.fillRect(0, 0, width, height);

        const laneHeight = height / this.horses.length;

        for (let i = 0; i <= this.horses.length; i++) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, i * laneHeight);
            ctx.lineTo(width, i * laneHeight);
            ctx.stroke();
        }

        for (let i = 0; i < width; i += 40) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(width - 5, 0, 5, height);

        this.horses.forEach((horse, index) => {
            const y = index * laneHeight + laneHeight / 2;
            const x = (horse.position / this.trackLength) * (width - 60) + 20;

            this.drawHorse(ctx, x, y, horse.color, horse.finished);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px monospace';
            ctx.fillText(`#${horse.id + 1}`, 5, y + 5);
        });

        if (!this.racing && !this.raceFinished) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, width, height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('SELECT A HORSE AND PLACE YOUR BET!', width / 2, height / 2);
            ctx.textAlign = 'left';
        }
    }

    drawHorse(ctx, x, y, color, finished) {
        const scale = finished ? 1 : 1 + Math.sin(Date.now() / 100) * 0.1;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        ctx.fillStyle = color;
        ctx.fillRect(-15, -10, 30, 20);

        ctx.fillStyle = color;
        ctx.fillRect(-20, -8, 8, 6);

        ctx.fillStyle = '#000000';
        ctx.fillRect(-18, -6, 2, 2);

        ctx.fillStyle = color;
        ctx.fillRect(-10, 10, 4, 8);
        ctx.fillRect(-2, 10, 4, 8);
        ctx.fillRect(6, 10, 4, 8);
        ctx.fillRect(14, 10, 4, 8);

        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-20, -15, 6, 8);

        ctx.restore();
    }
}

let game;
window.addEventListener('load', () => {
    game = new HorseRacingGame();
});
