class MahjongGame {
    constructor() {
        this.cards = [];
        this.players = [];
        this.currentPlayer = 0;
        this.lastCard = null;
        this.lastPlayer = -1;
        this.gamePhase = 'playing';
        this.round = 1;
        this.scores = [0, 0, 0, 0];
        this.waitingForAction = false;
        this.selectedCard = null;
        this.isAnimating = false;
        
        this.initGame();
        this.bindEvents();
    }

    initGame() {
        this.createDeck();
        this.shuffleDeck();
        this.createPlayers();
        this.dealInitialCards();
        this.updateUI();
    }

    createDeck() {
        const suits = ['wan', 'tiao', 'tong'];
        const winds = ['dong', 'nan', 'xi', 'bei'];
        const dragons = ['zhong', 'fa', 'bai'];
        
        this.cards = [];
        
        for (let suit of suits) {
            for (let i = 1; i <= 9; i++) {
                for (let j = 0; j < 4; j++) {
                    this.cards.push({ suit, value: i, id: `${suit}${i}_${j}` });
                }
            }
        }
        
        for (let wind of winds) {
            for (let j = 0; j < 4; j++) {
                this.cards.push({ suit: 'feng', value: wind, id: `${wind}_${j}` });
            }
        }
        
        for (let dragon of dragons) {
            for (let j = 0; j < 4; j++) {
                this.cards.push({ suit: 'dragon', value: dragon, id: `${dragon}_${j}` });
            }
        }
    }

    shuffleDeck() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    createPlayers() {
        this.players = [
            { id: 0, name: '西家', hand: [], revealed: [], isAI: true, hasHu: false },
            { id: 1, name: '北家', hand: [], revealed: [], isAI: true, hasHu: false },
            { id: 2, name: '东家', hand: [], revealed: [], isAI: true, hasHu: false },
            { id: 3, name: '你', hand: [], revealed: [], isAI: false, hasHu: false }
        ];
    }

    dealInitialCards() {
        for (let round = 0; round < 4; round++) {
            for (let player of this.players) {
                for (let i = 0; i < 3; i++) {
                    const card = this.cards.pop();
                    if (card) player.hand.push(card);
                }
            }
        }
        
        for (let player of this.players) {
            const card = this.cards.pop();
            if (card) player.hand.push(card);
        }
        
        for (let player of this.players) {
            player.hand.sort((a, b) => this.compareCards(a, b));
        }
    }

    compareCards(a, b) {
        const suitOrder = { wan: 0, tiao: 1, tong: 2, feng: 3, dragon: 4 };
        const windOrder = { dong: 1, nan: 2, xi: 3, bei: 4 };
        const dragonOrder = { zhong: 1, fa: 2, bai: 3 };
        
        if (suitOrder[a.suit] !== suitOrder[b.suit]) {
            return suitOrder[a.suit] - suitOrder[b.suit];
        }
        
        if (a.suit === 'feng') {
            return windOrder[a.value] - windOrder[b.value];
        }
        
        if (a.suit === 'dragon') {
            return dragonOrder[a.value] - dragonOrder[b.value];
        }
        
        return a.value - b.value;
    }

    getCardDisplay(card) {
        const displayMap = {
            wan: ['一', '二', '三', '四', '五', '六', '七', '八', '九'],
            tiao: ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'],
            tong: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
            feng: { dong: '东', nan: '南', xi: '西', bei: '北' },
            dragon: { zhong: '中', fa: '发', bai: '白' }
        };
        
        if (card.suit === 'feng') {
            return displayMap.feng[card.value];
        }
        if (card.suit === 'dragon') {
            return displayMap.dragon[card.value];
        }
        return displayMap[card.suit][card.value - 1];
    }

    getCardClass(card) {
        const classMap = {
            wan: 'character',
            tiao: 'bamboo',
            tong: 'dot',
            feng: 'wind',
            dragon: 'dragon'
        };
        return classMap[card.suit] || '';
    }

    updateUI() {
        document.getElementById('deck-count').textContent = this.cards.length;
        document.getElementById('round').textContent = this.round;
        document.getElementById('score').textContent = this.scores[3];
        
        for (let i = 0; i < 4; i++) {
            this.renderPlayer(i);
        }
        
        this.renderLastCard();
        this.updateActionButtons();
    }

    renderPlayer(playerIndex) {
        const player = this.players[playerIndex];
        const cardContainer = document.getElementById(`player${playerIndex}-cards`);
        const statusContainer = document.getElementById(`player${playerIndex}-status`);
        
        cardContainer.innerHTML = '';
        
        if (player.hasHu) {
            statusContainer.textContent = '已胡牌';
            return;
        }
        
        statusContainer.textContent = '';
        
        if (player.isAI) {
            for (let i = 0; i < player.hand.length; i++) {
                const cardElement = document.createElement('div');
                cardElement.className = 'mahjong-card dark';
                cardContainer.appendChild(cardElement);
            }
        } else {
            for (let card of player.hand) {
                const cardElement = document.createElement('div');
                cardElement.className = `mahjong-card ${this.getCardClass(card)}`;
                cardElement.textContent = this.getCardDisplay(card);
                cardElement.dataset.cardId = card.id;
                cardContainer.appendChild(cardElement);
            }
        }
        
        for (let revealed of player.revealed) {
            const cardElement = document.createElement('div');
            cardElement.className = `mahjong-card ${this.getCardClass(revealed)} revealed`;
            cardElement.textContent = this.getCardDisplay(revealed);
            cardContainer.appendChild(cardElement);
        }
    }

    renderLastCard() {
        const lastCardContainer = document.getElementById('last-card');
        lastCardContainer.innerHTML = '';
        
        if (this.lastCard) {
            const cardElement = document.createElement('div');
            cardElement.className = `mahjong-card ${this.getCardClass(this.lastCard)}`;
            cardElement.textContent = this.getCardDisplay(this.lastCard);
            lastCardContainer.appendChild(cardElement);
        }
    }

    selectCard(card) {
        if (this.gamePhase !== 'playing') return;
        if (this.players[3].hasHu) return;
        if (this.currentPlayer !== 3) return;
        if (this.waitingForAction) return;
        if (this.isAnimating) return;
        
        const cardElements = document.querySelectorAll('#player3-cards .mahjong-card');
        cardElements.forEach(el => el.classList.remove('selected'));
        
        for (let el of cardElements) {
            if (el.dataset.cardId === card.id) {
                el.classList.add('selected');
                this.selectedCard = card;
                break;
            }
        }
    }

    updateActionButtons() {
        const canChow = this.canChow();
        const canPeng = this.canPeng();
        const canGang = this.canGang();
        const canHu = this.canHu();
        
        document.getElementById('btn-chow').disabled = !canChow;
        document.getElementById('btn-peng').disabled = !canPeng;
        document.getElementById('btn-gang').disabled = !canGang;
        document.getElementById('btn-hu').disabled = !canHu;
        
        this.waitingForAction = (canChow || canPeng || canGang || canHu);
        if (this.waitingForAction) {
            this.setMessage('请选择操作：吃/碰/杠/胡/过');
        } else {
            this.setMessage('轮到你出牌，请选择一张牌');
        }
    }

    canChow() {
        if (!this.lastCard || this.lastPlayer === 3) return false;
        if (this.players[3].hasHu) return false;
        
        const card = this.lastCard;
        if (card.suit !== 'wan' && card.suit !== 'tiao' && card.suit !== 'tong') return false;
        
        const handValues = this.players[3].hand.map(c => c.value);
        const target = card.value;
        
        return (handValues.includes(target - 1) && handValues.includes(target - 2)) ||
               (handValues.includes(target - 1) && handValues.includes(target + 1)) ||
               (handValues.includes(target + 1) && handValues.includes(target + 2));
    }

    canPeng() {
        if (!this.lastCard || this.lastPlayer === 3) return false;
        if (this.players[3].hasHu) return false;
        
        const count = this.players[3].hand.filter(c => this.isSameCard(c, this.lastCard)).length;
        return count >= 2;
    }

    canGang() {
        if (!this.lastCard || this.lastPlayer === 3) return false;
        if (this.players[3].hasHu) return false;
        
        const count = this.players[3].hand.filter(c => this.isSameCard(c, this.lastCard)).length;
        return count >= 3;
    }

    canHu() {
        if (!this.lastCard) return false;
        if (this.players[3].hasHu) return false;
        
        const testHand = [...this.players[3].hand, this.lastCard];
        return this.isValidHu(testHand);
    }

    isSameCard(a, b) {
        return a.suit === b.suit && a.value === b.value;
    }

    isValidHu(hand) {
        if (hand.length % 3 !== 2) return false;
        const sortedHand = [...hand].sort((a, b) => this.compareCards(a, b));
        return this.checkHuPattern(sortedHand);
    }

    checkHuPattern(hand) {
        if (hand.length === 2) {
            return this.isSameCard(hand[0], hand[1]);
        }
        
        for (let i = 0; i < hand.length; i++) {
            if (i < hand.length - 2 && this.canFormSequence(hand[i], hand[i + 1], hand[i + 2])) {
                const newHand = hand.slice(0, i).concat(hand.slice(i + 3));
                if (this.checkHuPattern(newHand)) return true;
            }
            
            if (i < hand.length - 2 && this.isSameCard(hand[i], hand[i + 1]) && this.isSameCard(hand[i], hand[i + 2])) {
                const newHand = hand.slice(0, i).concat(hand.slice(i + 3));
                if (this.checkHuPattern(newHand)) return true;
            }
        }
        
        return false;
    }

    canFormSequence(a, b, c) {
        if (a.suit !== b.suit || b.suit !== c.suit) return false;
        if (a.suit === 'feng' || a.suit === 'dragon') return false;
        return a.value + 1 === b.value && b.value + 1 === c.value;
    }

    playCard(card) {
        if (this.isAnimating) return false;
        
        const player = this.players[this.currentPlayer];
        const cardIndex = player.hand.findIndex(c => c.id === card.id);
        
        if (cardIndex === -1) return false;
        
        player.hand.splice(cardIndex, 1);
        this.lastCard = card;
        this.lastPlayer = this.currentPlayer;
        
        this.setMessage(`${player.name}打出了 ${this.getCardDisplay(card)}`);
        this.updateUI();
        
        setTimeout(() => this.checkAllPlayersActions(), 100);
        
        return true;
    }

    checkAllPlayersActions() {
        let hasAction = false;
        
        for (let i = 0; i < 4; i++) {
            if (i === this.lastPlayer) continue;
            if (this.players[i].hasHu) continue;
            
            if (this.canHuForPlayer(i)) {
                hasAction = true;
                break;
            }
        }
        
        if (!hasAction) {
            for (let i = 0; i < 4; i++) {
                if (i === this.lastPlayer) continue;
                if (this.players[i].hasHu) continue;
                
                if (this.canPengForPlayer(i) || this.canGangForPlayer(i)) {
                    hasAction = true;
                    break;
                }
            }
        }
        
        if (!hasAction) {
            this.nextPlayer();
        }
    }

    canHuForPlayer(playerIndex) {
        const player = this.players[playerIndex];
        const testHand = [...player.hand, this.lastCard];
        return this.isValidHu(testHand);
    }

    canPengForPlayer(playerIndex) {
        const player = this.players[playerIndex];
        const count = player.hand.filter(c => this.isSameCard(c, this.lastCard)).length;
        return count >= 2;
    }

    canGangForPlayer(playerIndex) {
        const player = this.players[playerIndex];
        const count = player.hand.filter(c => this.isSameCard(c, this.lastCard)).length;
        return count >= 3;
    }

    chow() {
        if (!this.canChow()) return;
        
        const player = this.players[3];
        const card = this.lastCard;
        const handValues = player.hand.map((c, i) => ({ ...c, index: i }));
        
        let combo = [];
        const target = card.value;
        
        const found1 = handValues.find(c => c.value === target - 1);
        const found2 = handValues.find(c => c.value === target - 2);
        if (found1 && found2) {
            combo = [found1, found2];
        } else {
            const foundA = handValues.find(c => c.value === target - 1);
            const foundB = handValues.find(c => c.value === target + 1);
            if (foundA && foundB) {
                combo = [foundA, foundB];
            } else {
                const foundX = handValues.find(c => c.value === target + 1);
                const foundY = handValues.find(c => c.value === target + 2);
                if (foundX && foundY) {
                    combo = [foundX, foundY];
                }
            }
        }
        
        if (combo.length === 2) {
            combo.sort((a, b) => a.index - b.index).reverse();
            for (let c of combo) {
                player.hand.splice(c.index, 1);
            }
            player.revealed.push(card);
            player.revealed.push(combo[0]);
            player.revealed.push(combo[1]);
            
            this.setMessage('你吃了！');
            this.lastCard = null;
            this.waitingForAction = false;
            this.updateUI();
            
            setTimeout(() => this.playerTurn(), 200);
        }
    }

    peng() {
        if (!this.canPeng()) return;
        
        const player = this.players[3];
        const card = this.lastCard;
        
        for (let i = 0; i < 2; i++) {
            const index = player.hand.findIndex(c => this.isSameCard(c, card));
            if (index !== -1) player.hand.splice(index, 1);
        }
        
        player.revealed.push(card);
        player.revealed.push({ ...card, id: card.id + '_peng1' });
        player.revealed.push({ ...card, id: card.id + '_peng2' });
        
        this.setMessage('你碰了！');
        this.lastCard = null;
        this.waitingForAction = false;
        this.updateUI();
        
        setTimeout(() => this.playerTurn(), 200);
    }

    gang() {
        if (!this.canGang()) return;
        
        const player = this.players[3];
        const card = this.lastCard;
        
        for (let i = 0; i < 3; i++) {
            const index = player.hand.findIndex(c => this.isSameCard(c, card));
            if (index !== -1) player.hand.splice(index, 1);
        }
        
        player.revealed.push(card);
        player.revealed.push({ ...card, id: card.id + '_gang1' });
        player.revealed.push({ ...card, id: card.id + '_gang2' });
        player.revealed.push({ ...card, id: card.id + '_gang3' });
        
        this.setMessage('你杠了！');
        this.lastCard = null;
        this.waitingForAction = false;
        
        if (this.cards.length > 0) {
            const drawCard = this.cards.pop();
            player.hand.push(drawCard);
            player.hand.sort((a, b) => this.compareCards(a, b));
            this.setMessage(`杠上开花！摸到了 ${this.getCardDisplay(drawCard)}`);
        }
        
        this.updateUI();
        
        setTimeout(() => this.playerTurn(), 200);
    }

    hu() {
        if (!this.canHu()) return;
        
        const player = this.players[3];
        player.hand.push(this.lastCard);
        
        this.calculateScore(player, true);
        player.hasHu = true;
        
        this.setMessage('🎉 你胡牌了！');
        this.lastCard = null;
        this.waitingForAction = false;
        
        this.updateUI();
        
        setTimeout(() => this.checkGameEnd(), 500);
    }

    pass() {
        if (this.waitingForAction) {
            this.waitingForAction = false;
            this.setMessage('你选择了过');
            setTimeout(() => this.nextPlayer(), 100);
        } else if (this.currentPlayer === 3 && this.selectedCard) {
            this.playCard(this.selectedCard);
            this.selectedCard = null;
            const cardElements = document.querySelectorAll('#player3-cards .mahjong-card');
            cardElements.forEach(el => el.classList.remove('selected'));
        }
    }

    nextPlayer() {
        do {
            this.currentPlayer = (this.currentPlayer + 1) % 4;
        } while (this.players[this.currentPlayer].hasHu && !this.isGameOver());
        
        if (!this.isGameOver()) {
            if (this.players[this.currentPlayer].isAI) {
                setTimeout(() => this.aiTurn(), 200);
            } else {
                this.playerTurn();
            }
        }
    }

    playerTurn() {
        if (this.players[3].hasHu) return;
        
        this.setMessage('轮到你出牌，请选择一张牌');
        this.selectedCard = null;
        
        const cardElements = document.querySelectorAll('#player3-cards .mahjong-card');
        cardElements.forEach(el => {
            el.classList.remove('selected');
            el.addEventListener('click', () => {
                const cardId = el.dataset.cardId;
                const card = this.players[3].hand.find(c => c.id === cardId);
                if (card) this.selectCard(card);
            });
        });
        
        if (this.cards.length > 0) {
            const drawCard = this.cards.pop();
            this.players[3].hand.push(drawCard);
            this.players[3].hand.sort((a, b) => this.compareCards(a, b));
            this.setMessage(`你摸到了 ${this.getCardDisplay(drawCard)}`);
            this.updateUI();
        }
    }

    aiTurn() {
        const player = this.players[this.currentPlayer];
        if (player.hasHu) return;
        
        if (this.lastCard && !player.hasHu) {
            if (this.canHuForPlayer(this.currentPlayer)) {
                player.hand.push(this.lastCard);
                this.calculateScore(player, false);
                player.hasHu = true;
                this.setMessage(`${player.name}胡牌了！`);
                this.lastCard = null;
                this.updateUI();
                setTimeout(() => this.checkGameEnd(), 300);
                return;
            }
            
            if (Math.random() < 0.7 && this.canPengForPlayer(this.currentPlayer)) {
                const card = this.lastCard;
                for (let i = 0; i < 2; i++) {
                    const index = player.hand.findIndex(c => this.isSameCard(c, card));
                    if (index !== -1) player.hand.splice(index, 1);
                }
                player.revealed.push(card);
                player.revealed.push({ ...card, id: card.id + '_peng1' });
                player.revealed.push({ ...card, id: card.id + '_peng2' });
                this.setMessage(`${player.name}碰了！`);
                this.lastCard = null;
                this.updateUI();
                setTimeout(() => this.aiTurn(), 200);
                return;
            }
            
            if (Math.random() < 0.9 && this.canGangForPlayer(this.currentPlayer)) {
                const card = this.lastCard;
                for (let i = 0; i < 3; i++) {
                    const index = player.hand.findIndex(c => this.isSameCard(c, card));
                    if (index !== -1) player.hand.splice(index, 1);
                }
                player.revealed.push(card);
                player.revealed.push({ ...card, id: card.id + '_gang1' });
                player.revealed.push({ ...card, id: card.id + '_gang2' });
                player.revealed.push({ ...card, id: card.id + '_gang3' });
                this.setMessage(`${player.name}杠了！`);
                this.lastCard = null;
                
                if (this.cards.length > 0) {
                    const drawCard = this.cards.pop();
                    player.hand.push(drawCard);
                    player.hand.sort((a, b) => this.compareCards(a, b));
                }
                
                this.updateUI();
                setTimeout(() => this.aiTurn(), 200);
                return;
            }
        }
        
        if (this.cards.length > 0) {
            const drawCard = this.cards.pop();
            player.hand.push(drawCard);
            player.hand.sort((a, b) => this.compareCards(a, b));
        }
        
        const cardToPlay = this.aiSelectCard(player);
        if (cardToPlay) {
            const cardIndex = player.hand.findIndex(c => c.id === cardToPlay.id);
            player.hand.splice(cardIndex, 1);
            this.lastCard = cardToPlay;
            this.lastPlayer = this.currentPlayer;
            this.setMessage(`${player.name}打出了 ${this.getCardDisplay(cardToPlay)}`);
            
            this.updateUI();
            
            setTimeout(() => this.checkAllPlayersActions(), 100);
        }
    }

    aiSelectCard(player) {
        const hand = player.hand;
        
        for (let card of hand) {
            const testHand = hand.filter(c => c.id !== card.id);
            if (this.isValidHu(testHand)) {
                return card;
            }
        }
        
        const suitsCount = {};
        for (let card of hand) {
            suitsCount[card.suit] = (suitsCount[card.suit] || 0) + 1;
        }
        
        let minSuit = null;
        let minCount = Infinity;
        for (let suit in suitsCount) {
            if (suitsCount[suit] < minCount) {
                minCount = suitsCount[suit];
                minSuit = suit;
            }
        }
        
        const cardsToConsider = hand.filter(c => c.suit === minSuit);
        
        if (cardsToConsider.length > 0) {
            return cardsToConsider[Math.floor(Math.random() * cardsToConsider.length)];
        }
        
        return hand[Math.floor(Math.random() * hand.length)];
    }

    calculateScore(player, isHuman) {
        let score = 1;
        
        const hand = player.hand;
        const countMap = {};
        
        for (let card of hand) {
            const key = `${card.suit}-${card.value}`;
            countMap[key] = (countMap[key] || 0) + 1;
        }
        
        let tripletCount = 0;
        let quadCount = 0;
        
        for (let key in countMap) {
            if (countMap[key] === 3) tripletCount++;
            if (countMap[key] === 4) quadCount++;
        }
        
        score += tripletCount * 1;
        score += quadCount * 2;
        
        if (isHuman) {
            this.scores[3] += score;
        } else {
            this.scores[player.id] += score;
        }
    }

    isGameOver() {
        const activePlayers = this.players.filter(p => !p.hasHu);
        return activePlayers.length <= 1 || this.cards.length === 0;
    }

    checkGameEnd() {
        if (this.isGameOver()) {
            this.gamePhase = 'ended';
            this.showResult();
        } else {
            this.nextPlayer();
        }
    }

    showResult() {
        let resultText = '本局结束！\n\n得分情况：\n';
        for (let i = 0; i < 4; i++) {
            resultText += `${this.players[i].name}: ${this.scores[i]} 分`;
            if (this.players[i].hasHu) {
                resultText += ' (已胡牌)';
            }
            resultText += '\n';
        }
        
        const maxScore = Math.max(...this.scores);
        const winners = this.players.filter(p => this.scores[p.id] === maxScore);
        
        if (winners.length === 1) {
            resultText += `\n🎉 ${winners[0].name} 获胜！`;
        } else {
            resultText += '\n平局！';
        }
        
        this.showModal('游戏结束', resultText);
    }

    showModal(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').textContent = content;
        document.getElementById('modal-overlay').style.display = 'flex';
    }

    hideModal() {
        document.getElementById('modal-overlay').style.display = 'none';
    }

    setMessage(msg) {
        document.getElementById('game-message').textContent = msg;
    }

    restartGame() {
        this.cards = [];
        this.players = [];
        this.currentPlayer = 0;
        this.lastCard = null;
        this.lastPlayer = -1;
        this.gamePhase = 'playing';
        this.round++;
        this.waitingForAction = false;
        this.selectedCard = null;
        
        this.hideModal();
        this.initGame();
    }

    bindEvents() {
        document.getElementById('btn-chow').addEventListener('click', () => this.chow());
        document.getElementById('btn-peng').addEventListener('click', () => this.peng());
        document.getElementById('btn-gang').addEventListener('click', () => this.gang());
        document.getElementById('btn-hu').addEventListener('click', () => this.hu());
        document.getElementById('btn-pass').addEventListener('click', () => this.pass());
        document.getElementById('btn-restart').addEventListener('click', () => this.restartGame());
        document.getElementById('modal-btn').addEventListener('click', () => this.hideModal());
        
        document.getElementById('btn-music').addEventListener('click', () => {
            const audio = document.getElementById('bg-music');
            if (audio.paused) {
                audio.play().catch(() => {});
            } else {
                audio.pause();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MahjongGame();
});
