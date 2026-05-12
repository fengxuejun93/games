const suits = ['♠', '♥', '♣', '♦'];
const values = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];

const CARD_VALUES = {
    '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15, '小王': 16, '大王': 17
};

class Card {
    constructor(value, suit = null) {
        this.value = value;
        this.suit = suit;
        this.isJoker = value === '小王' || value === '大王';
        this.id = `${value}${suit || ''}`;
    }

    get numericValue() {
        return CARD_VALUES[this.value];
    }

    toString() {
        return this.isJoker ? this.value : `${this.value}${this.suit}`;
    }
}

class Game {
    constructor() {
        this.players = {
            player: { cards: [], name: '玩家', score: 0, isLandlord: false, doubled: false },
            ai1: { cards: [], name: '农民1', score: 0, isLandlord: false, doubled: false },
            ai2: { cards: [], name: '农民2', score: 0, isLandlord: false, doubled: false }
        };
        this.landlordCards = [];
        this.currentPlayer = 'player';
        this.lastPlayedCards = [];
        this.lastPlayer = null;
        this.passCount = 0;
        this.gamePhase = 'start';
        this.landlordCandidate = null;
        this.landlordBidRound = 0;
        this.doubleCount = 0;
        this.baseScore = 1;
        this.selectedCardIndices = [];
        this.isProcessing = false;
        this.isAutoPlay = false;
        
        this.initDOM();
        this.bindEvents();
        this.startGame();
    }

    initDOM() {
        this.elements = {
            playerHand: document.getElementById('playerHand'),
            playerCards: document.getElementById('playerCards'),
            ai1CardBacks: document.getElementById('ai1CardBacks'),
            ai1Cards: document.getElementById('ai1Cards'),
            ai2CardBacks: document.getElementById('ai2CardBacks'),
            ai2Cards: document.getElementById('ai2Cards'),
            landlordCards: document.getElementById('landlordCards'),
            landlordBadge: document.getElementById('landlordBadge'),
            lastPlayedCards: document.getElementById('lastPlayedCards'),
            lastPlayer: document.getElementById('lastPlayer'),
            gameStatus: document.getElementById('gameStatus'),
            btnDouble: document.getElementById('btnDouble'),
            btnPass: document.getElementById('btnPass'),
            btnPlay: document.getElementById('btnPlay'),
            btnRobLandlord: document.getElementById('btnRobLandlord'),
            btnNotRob: document.getElementById('btnNotRob'),
            btnRestart: document.getElementById('btnRestart'),
            btnAutoPlay: null,
            modalOverlay: document.getElementById('modalOverlay'),
            modalTitle: document.getElementById('modalTitle'),
            modalMessage: document.getElementById('modalMessage'),
            modalScores: document.getElementById('modalScores'),
            landlordModal: document.getElementById('landlordModal'),
            landlordStatus: document.getElementById('landlordStatus'),
            playerScore: document.getElementById('playerScore'),
            ai1Score: document.getElementById('ai1Score'),
            ai2Score: document.getElementById('ai2Score')
        };
    }

    bindEvents() {
        this.elements.btnPlay.addEventListener('click', () => this.playCards());
        this.elements.btnPass.addEventListener('click', () => this.pass());
        this.elements.btnDouble.addEventListener('click', () => this.double());
        this.elements.btnRobLandlord.addEventListener('click', () => this.robLandlord(true));
        this.elements.btnNotRob.addEventListener('click', () => this.robLandlord(false));
        this.elements.btnRestart.addEventListener('click', () => this.restartGame());
    }

    createDeck() {
        const deck = [];
        suits.forEach(suit => {
            values.forEach(value => {
                deck.push(new Card(value, suit));
            });
        });
        deck.push(new Card('小王'));
        deck.push(new Card('大王'));
        return this.shuffle(deck);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    dealCards() {
        const deck = this.createDeck();
        this.players.player.cards = deck.slice(0, 17);
        this.players.ai1.cards = deck.slice(17, 34);
        this.players.ai2.cards = deck.slice(34, 51);
        this.landlordCards = deck.slice(51, 54);
        
        this.players.player.cards.sort((a, b) => a.numericValue - b.numericValue);
        this.players.ai1.cards.sort((a, b) => a.numericValue - b.numericValue);
        this.players.ai2.cards.sort((a, b) => a.numericValue - b.numericValue);
    }

    startGame() {
        this.gamePhase = 'deal';
        this.dealCards();
        this.updateScores();
        this.renderPlayerCards();
        this.renderAICardBacks();
        this.hideLandlordCards();
        this.clearLastPlayed();
        this.gamePhase = 'landlord';
        this.startLandlordBidding();
    }

    startLandlordBidding() {
        this.landlordCandidate = null;
        this.landlordBidRound = 0;
        this.elements.landlordModal.style.display = 'flex';
        this.elements.landlordStatus.textContent = '轮到你抢地主';
        this.elements.btnRobLandlord.disabled = false;
        this.elements.btnNotRob.disabled = false;
        this.currentPlayer = 'player';
        this.updateStatus('🎯 轮到你抢地主');
        this.updateButtons();
    }

    updateButtons() {
        const isPlayerTurn = this.currentPlayer === 'player' && this.gamePhase === 'playing';
        const hasLastPlay = this.lastPlayedCards.length > 0;
        
        this.elements.btnPlay.disabled = !isPlayerTurn || this.isProcessing || this.isAutoPlay;
        this.elements.btnPass.disabled = !isPlayerTurn || !hasLastPlay || this.isProcessing || this.isAutoPlay;
        
        if (this.gamePhase === 'double' && this.currentPlayer === 'player') {
            this.elements.btnDouble.style.display = 'inline-block';
            this.elements.btnDouble.disabled = false;
        } else {
            this.elements.btnDouble.style.display = 'none';
            this.elements.btnDouble.disabled = true;
        }
        
        if (this.elements.btnAutoPlay) {
            this.elements.btnAutoPlay.textContent = this.isAutoPlay ? '取消托管' : '托管';
        }
    }

    createAutoPlayButton() {
        if (this.elements.btnAutoPlay) return;
        
        const btnAuto = document.createElement('button');
        btnAuto.className = 'btn btn-default';
        btnAuto.id = 'btnAutoPlay';
        btnAuto.textContent = '托管';
        btnAuto.addEventListener('click', () => this.toggleAutoPlay());
        this.elements.actionButtons.appendChild(btnAuto);
        this.elements.btnAutoPlay = btnAuto;
    }

    toggleAutoPlay() {
        this.isAutoPlay = !this.isAutoPlay;
        this.updateButtons();
        this.updateStatus(this.isAutoPlay ? '🤖 已开启托管' : '🎯 已取消托管');
        
        if (this.isAutoPlay && this.currentPlayer === 'player' && this.gamePhase === 'playing') {
            setTimeout(() => this.autoPlayForPlayer(), 500);
        }
    }

    autoPlayForPlayer() {
        if (!this.isAutoPlay || this.currentPlayer !== 'player' || this.gamePhase !== 'playing') return;
        
        const cards = this.players.player.cards;
        let cardsToPlay = [];
        
        if (this.lastPlayedCards.length === 0) {
            cardsToPlay = this.aiChooseFirstPlay(cards);
        } else {
            cardsToPlay = this.aiChooseToBeat(cards);
        }
        
        if (cardsToPlay.length > 0) {
            this.playCardsForPlayer('player', cardsToPlay);
        } else {
            this.pass();
        }
    }

    robLandlord(wantRob) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        this.elements.btnRobLandlord.disabled = true;
        this.elements.btnNotRob.disabled = true;
        
        if (wantRob) {
            this.landlordCandidate = this.currentPlayer;
            this.updateStatus(`${this.players[this.currentPlayer].name} 抢地主！`);
        }
        
        setTimeout(() => {
            this.isProcessing = false;
            this.nextLandlordBidder();
        }, 800);
    }

    nextLandlordBidder() {
        this.landlordBidRound++;
        
        if (this.landlordBidRound >= 3) {
            this.endLandlordBidding();
            return;
        }
        
        const order = ['player', 'ai1', 'ai2'];
        const currentIndex = order.indexOf(this.currentPlayer);
        this.currentPlayer = order[(currentIndex + 1) % 3];
        
        if (this.currentPlayer === 'player') {
            this.elements.landlordStatus.textContent = '轮到你抢地主';
            this.elements.btnRobLandlord.disabled = false;
            this.elements.btnNotRob.disabled = false;
            this.updateStatus('🎯 轮到你抢地主');
        } else {
            this.elements.landlordStatus.textContent = `${this.players[this.currentPlayer].name} 思考中...`;
            setTimeout(() => this.aiRobLandlord(), 1200);
        }
    }

    aiRobLandlord() {
        const ai = this.players[this.currentPlayer];
        const hasGoodCards = this.hasGoodCards(ai.cards);
        const shouldRob = hasGoodCards || (this.landlordCandidate && Math.random() > 0.6);
        
        if (shouldRob) {
            this.landlordCandidate = this.currentPlayer;
            this.updateStatus(`${ai.name} 抢地主！`);
        }
        
        setTimeout(() => this.nextLandlordBidder(), 400);
    }

    hasGoodCards(cards) {
        let jokers = 0;
        let twos = 0;
        let bombs = 0;
        cards.forEach(card => {
            if (card.value === '大王' || card.value === '小王') jokers++;
            if (card.value === '2') twos++;
        });
        
        const valueCounts = {};
        cards.forEach(card => {
            const v = card.numericValue;
            valueCounts[v] = (valueCounts[v] || 0) + 1;
            if (valueCounts[v] === 4) bombs++;
        });
        
        return jokers >= 1 || twos >= 2 || bombs >= 1;
    }

    endLandlordBidding() {
        this.elements.landlordModal.style.display = 'none';
        
        if (!this.landlordCandidate) {
            this.landlordCandidate = 'player';
        }
        
        this.players[this.landlordCandidate].isLandlord = true;
        this.players[this.landlordCandidate].cards = [...this.players[this.landlordCandidate].cards, ...this.landlordCards];
        this.players[this.landlordCandidate].cards.sort((a, b) => a.numericValue - b.numericValue);
        
        this.showLandlordCards();
        
        this.gamePhase = 'double';
        this.doubleCount = 0;
        this.startDoubling();
    }

    showLandlordCards() {
        this.elements.landlordCards.innerHTML = '';
        this.landlordCards.forEach(card => {
            const cardEl = this.createCardElement(card);
            this.elements.landlordCards.appendChild(cardEl);
        });
        this.elements.landlordBadge.textContent = `${this.players[this.landlordCandidate].name} 是地主`;
        this.elements.landlordBadge.style.display = 'block';
        
        if (this.landlordCandidate === 'player') {
            this.renderPlayerCards();
        }
    }

    hideLandlordCards() {
        this.elements.landlordCards.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const cardBack = document.createElement('div');
            cardBack.className = 'card card-back';
            this.elements.landlordCards.appendChild(cardBack);
        }
        this.elements.landlordBadge.style.display = 'none';
    }

    startDoubling() {
        this.updateStatus('💎 是否加倍？');
        this.updateButtons();
        
        if (this.currentPlayer !== 'player') {
            setTimeout(() => this.aiDouble(), 800);
        }
    }

    double() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        this.players[this.currentPlayer].doubled = true;
        this.baseScore *= 2;
        this.elements.btnDouble.disabled = true;
        this.updateStatus(`${this.players[this.currentPlayer].name} 加倍！分数 x${this.baseScore}`);
        
        setTimeout(() => {
            this.isProcessing = false;
            this.nextDoubler();
        }, 600);
    }

    nextDoubler() {
        this.doubleCount++;
        
        if (this.doubleCount >= 3) {
            this.startPlaying();
            return;
        }
        
        const order = ['player', 'ai1', 'ai2'];
        const currentIndex = order.indexOf(this.currentPlayer);
        this.currentPlayer = order[(currentIndex + 1) % 3];
        
        this.updateButtons();
        
        if (this.currentPlayer !== 'player') {
            setTimeout(() => this.aiDouble(), 800);
        } else {
            this.updateStatus('💎 是否加倍？');
        }
    }

    aiDouble() {
        const ai = this.players[this.currentPlayer];
        const hasGoodCards = this.hasGoodCards(ai.cards);
        const shouldDouble = hasGoodCards && Math.random() > 0.5;
        
        if (shouldDouble) {
            ai.doubled = true;
            this.baseScore *= 2;
            this.updateStatus(`${ai.name} 加倍！分数 x${this.baseScore}`);
        }
        
        setTimeout(() => this.nextDoubler(), 400);
    }

    startPlaying() {
        this.gamePhase = 'playing';
        this.passCount = 0;
        this.lastPlayedCards = [];
        this.lastPlayer = null;
        this.currentPlayer = this.landlordCandidate;
        this.selectedCardIndices = [];
        this.isAutoPlay = false;
        
        this.createAutoPlayButton();
        this.updateStatus(`${this.players[this.currentPlayer].name} 的回合`);
        this.updateButtons();
        
        if (this.currentPlayer !== 'player') {
            setTimeout(() => this.aiPlay(), 800);
        }
    }

    renderPlayerCards() {
        this.elements.playerHand.innerHTML = '';
        this.elements.playerCards.textContent = this.players.player.cards.length;
        
        const cardWidth = 58;
        const cardGap = 8;
        const totalWidth = this.players.player.cards.length * (cardWidth + cardGap) - cardGap;
        const maxWidth = Math.min(window.innerWidth - 60, 900);
        
        if (totalWidth > maxWidth) {
            const availableSpace = maxWidth - cardWidth;
            const cardCount = this.players.player.cards.length;
            const actualGap = availableSpace / (cardCount - 1);
            const overlap = (cardWidth + cardGap) - (cardWidth + actualGap);
            
            this.players.player.cards.forEach((card, index) => {
                const cardEl = this.createCardElement(card);
                cardEl.addEventListener('click', () => this.toggleCardSelection(index));
                cardEl.dataset.cardIndex = index;
                cardEl.style.position = 'absolute';
                cardEl.style.left = `${index * (cardWidth - overlap)}px`;
                this.elements.playerHand.appendChild(cardEl);
            });
            
            this.elements.playerHand.style.position = 'relative';
            this.elements.playerHand.style.width = `${maxWidth}px`;
        } else {
            this.players.player.cards.forEach((card, index) => {
                const cardEl = this.createCardElement(card);
                cardEl.addEventListener('click', () => this.toggleCardSelection(index));
                cardEl.dataset.cardIndex = index;
                this.elements.playerHand.appendChild(cardEl);
            });
            
            this.elements.playerHand.style.position = 'static';
            this.elements.playerHand.style.width = 'auto';
        }
    }

    toggleCardSelection(index) {
        if (this.currentPlayer !== 'player' || this.gamePhase !== 'playing' || this.isProcessing || this.isAutoPlay) return;
        
        const cardEl = this.elements.playerHand.children[index];
        if (cardEl.classList.contains('selected')) {
            cardEl.classList.remove('selected');
            const idx = this.selectedCardIndices.indexOf(index);
            if (idx > -1) this.selectedCardIndices.splice(idx, 1);
        } else {
            cardEl.classList.add('selected');
            this.selectedCardIndices.push(index);
        }
    }

    clearSelectedCards() {
        this.selectedCardIndices = [];
        const selectedCards = this.elements.playerHand.querySelectorAll('.selected');
        selectedCards.forEach(card => card.classList.remove('selected'));
    }

    createCardElement(card) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        
        if (card.isJoker) {
            cardEl.classList.add('joker');
            cardEl.classList.add(card.value === '小王' ? 'red-joker' : 'black-joker');
        } else {
            cardEl.classList.add(card.suit === '♥' || card.suit === '♦' ? 'red' : 'black');
        }
        
        const valueEl = document.createElement('div');
        valueEl.className = 'card-value';
        valueEl.textContent = card.value;
        
        const suitEl = document.createElement('div');
        suitEl.className = 'card-suit';
        suitEl.textContent = card.suit || '';
        
        cardEl.appendChild(valueEl);
        cardEl.appendChild(suitEl);
        
        return cardEl;
    }

    renderAICardBacks() {
        this.elements.ai1CardBacks.innerHTML = '';
        this.elements.ai2CardBacks.innerHTML = '';
        
        for (let i = 0; i < this.players.ai1.cards.length; i++) {
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            this.elements.ai1CardBacks.appendChild(cardBack);
        }
        
        for (let i = 0; i < this.players.ai2.cards.length; i++) {
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            this.elements.ai2CardBacks.appendChild(cardBack);
        }
        
        this.elements.ai1Cards.textContent = this.players.ai1.cards.length;
        this.elements.ai2Cards.textContent = this.players.ai2.cards.length;
    }

    playCards() {
        if (this.isProcessing) return;
        if (this.currentPlayer !== 'player' || this.gamePhase !== 'playing') return;
        if (this.selectedCardIndices.length === 0) {
            this.updateStatus('请先选择要出的牌');
            return;
        }
        
        this.isProcessing = true;
        
        const cardsToPlay = this.selectedCardIndices
            .map(i => this.players.player.cards[i])
            .sort((a, b) => a.numericValue - b.numericValue);
        
        if (!this.isValidPlay(cardsToPlay)) {
            this.updateStatus('无效的牌型！');
            this.isProcessing = false;
            return;
        }
        
        if (this.lastPlayedCards.length > 0 && !this.canBeat(this.lastPlayedCards, cardsToPlay)) {
            this.updateStatus('无法压过上家的牌！');
            this.isProcessing = false;
            return;
        }
        
        this.playCardsForPlayer('player', cardsToPlay);
    }

    playCardsForPlayer(playerId, cards) {
        const cardIds = cards.map(c => c.id);
        
        if (playerId === 'player') {
            this.players.player.cards = this.players.player.cards.filter(c => !cardIds.includes(c.id));
            this.clearSelectedCards();
            this.renderPlayerCards();
        } else {
            this.players[playerId].cards = this.players[playerId].cards.filter(c => !cardIds.includes(c.id));
            this.renderAICardBacks();
        }
        
        this.lastPlayedCards = cards;
        this.lastPlayer = playerId;
        this.passCount = 0;
        
        this.renderLastPlayed(cards);
        const cardType = this.getCardType(cards);
        this.updateStatus(`${this.players[playerId].name} 出了 ${cardType.type}`);
        
        if (this.players[playerId].cards.length === 0) {
            setTimeout(() => this.endGame(playerId), 500);
            this.isProcessing = false;
            return;
        }
        
        setTimeout(() => {
            this.isProcessing = false;
            this.nextPlayer();
        }, 400);
    }

    pass() {
        if (this.isProcessing) return;
        if (this.currentPlayer !== 'player' || this.gamePhase !== 'playing') return;
        if (this.lastPlayedCards.length === 0) {
            this.updateStatus('不能不出牌！');
            return;
        }
        
        this.isProcessing = true;
        this.clearSelectedCards();
        
        this.passCount++;
        this.lastPlayer = 'pass';
        this.updateStatus(`${this.players.player.name} 不出`);
        
        if (this.passCount >= 3 && this.lastPlayedCards.length > 0) {
            this.lastPlayedCards = [];
            this.lastPlayer = null;
            this.passCount = 0;
            this.clearLastPlayed();
            this.updateStatus('新一轮出牌，轮到出牌者先手');
        }
        
        setTimeout(() => {
            this.isProcessing = false;
            this.nextPlayer();
        }, 300);
    }

    nextPlayer() {
        const order = ['player', 'ai1', 'ai2'];
        let currentIndex = order.indexOf(this.currentPlayer);
        
        for (let i = 0; i < 3; i++) {
            currentIndex = (currentIndex + 1) % 3;
            if (this.players[order[currentIndex]].cards.length > 0) {
                break;
            }
        }
        
        this.currentPlayer = order[currentIndex];
        this.updateButtons();
        
        if (this.currentPlayer === 'player') {
            this.updateStatus('🎯 轮到你出牌');
            if (this.isAutoPlay) {
                setTimeout(() => this.autoPlayForPlayer(), 600);
            }
        } else {
            this.updateStatus(`${this.players[this.currentPlayer].name} 的回合...`);
            setTimeout(() => this.aiPlay(), 800);
        }
    }

    aiPlay() {
        const ai = this.players[this.currentPlayer];
        let cardsToPlay = [];
        
        if (this.lastPlayedCards.length === 0) {
            cardsToPlay = this.aiChooseFirstPlay(ai.cards);
        } else {
            cardsToPlay = this.aiChooseToBeat(ai.cards);
        }
        
        if (cardsToPlay.length > 0) {
            this.playCardsForPlayer(this.currentPlayer, cardsToPlay);
        } else {
            this.passCount++;
            this.lastPlayer = 'pass';
            this.updateStatus(`${ai.name} 不出`);
            
            if (this.passCount >= 3 && this.lastPlayedCards.length > 0) {
                this.lastPlayedCards = [];
                this.lastPlayer = null;
                this.passCount = 0;
                this.clearLastPlayed();
                this.updateStatus('新一轮出牌，轮到出牌者先手');
            }
            
            setTimeout(() => this.nextPlayer(), 300);
        }
    }

    aiChooseFirstPlay(cards) {
        const combinations = this.getAllValidCombinations(cards);
        if (combinations.length === 0) return [];
        
        const weights = combinations.map(combo => {
            const type = this.getCardType(combo);
            let weight = combo.reduce((sum, c) => sum + c.numericValue, 0);
            if (type.type === '炸弹') weight += 100;
            if (type.type === '王炸') weight += 200;
            if (combo.length <= 2) weight += 50;
            return weight;
        });
        
        const maxWeight = Math.max(...weights);
        const bestCombos = combinations.filter((_, i) => weights[i] === maxWeight);
        
        return bestCombos[Math.floor(Math.random() * bestCombos.length)];
    }

    aiChooseToBeat(cards) {
        const lastType = this.getCardType(this.lastPlayedCards);
        const combinations = this.getAllValidCombinations(cards);
        
        let beatable = combinations.filter(combo => {
            const comboType = this.getCardType(combo);
            if (comboType.type === '王炸') return true;
            if (comboType.type === '炸弹' && lastType.type !== '王炸') return true;
            return comboType.type === lastType.type && 
                   comboType.mainValue > lastType.mainValue &&
                   combo.length === this.lastPlayedCards.length;
        });
        
        if (beatable.length === 0) return [];
        
        const weights = beatable.map(combo => combo.reduce((sum, c) => sum + c.numericValue, 0));
        const minWeight = Math.min(...weights);
        const bestCombos = beatable.filter((_, i) => weights[i] === minWeight);
        
        return bestCombos[Math.floor(Math.random() * bestCombos.length)];
    }

    getAllValidCombinations(cards) {
        const combinations = [];
        
        for (let i = 1; i <= cards.length; i++) {
            const subsets = this.getSubsets(cards, i);
            subsets.forEach(subset => {
                if (this.isValidPlay(subset)) {
                    combinations.push(subset);
                }
            });
        }
        
        return combinations;
    }

    getSubsets(arr, size) {
        if (size === 1) return arr.map(x => [x]);
        const result = [];
        for (let i = 0; i <= arr.length - size; i++) {
            const head = arr[i];
            const tailSubsets = this.getSubsets(arr.slice(i + 1), size - 1);
            tailSubsets.forEach(tail => result.push([head, ...tail]));
        }
        return result;
    }

    isValidPlay(cards) {
        if (cards.length === 0) return false;
        return this.getCardType(cards).valid;
    }

    getCardType(cards) {
        const sorted = [...cards].sort((a, b) => a.numericValue - b.numericValue);
        const values = sorted.map(c => c.numericValue);
        const uniqueValues = [...new Set(values)];
        const counts = uniqueValues.map(v => values.filter(x => x === v).length);
        const valueCountMap = {};
        uniqueValues.forEach(v => {
            valueCountMap[v] = values.filter(x => x === v).length;
        });
        
        if (cards.length === 1) {
            return { valid: true, type: '单张', mainValue: values[0], length: 1 };
        }
        
        if (cards.length === 2) {
            if (values[0] === values[1]) {
                return { valid: true, type: '对子', mainValue: values[0], length: 2 };
            }
            if (values[0] === 16 && values[1] === 17) {
                return { valid: true, type: '王炸', mainValue: 100, length: 2 };
            }
        }
        
        if (cards.length === 3) {
            if (values[0] === values[1] && values[1] === values[2]) {
                return { valid: true, type: '三条', mainValue: values[0], length: 3 };
            }
        }
        
        if (cards.length === 4) {
            if (values[0] === values[1] && values[1] === values[2] && values[2] === values[3]) {
                return { valid: true, type: '炸弹', mainValue: values[0] + 50, length: 4 };
            }
            if (counts.every(c => c === 2) && uniqueValues.length === 2) {
                const isSequence = uniqueValues.every((v, i) => i === 0 || v === uniqueValues[i - 1] + 1);
                if (isSequence && uniqueValues.every(v => v <= 14)) {
                    return { valid: true, type: '连对', mainValue: uniqueValues[uniqueValues.length - 1], length: 4 };
                }
            }
            if (counts.some(c => c === 3) && counts.some(c => c === 1)) {
                const tripletValue = uniqueValues.find(v => valueCountMap[v] === 3);
                return { valid: true, type: '三带一', mainValue: tripletValue, length: 4 };
            }
        }
        
        if (cards.length === 5) {
            if (counts.some(c => c === 3) && counts.filter(c => c === 2).length === 1) {
                const tripletValue = uniqueValues.find(v => valueCountMap[v] === 3);
                return { valid: true, type: '三带二', mainValue: tripletValue, length: 5 };
            }
            
            const isStraight = values.every((v, i) => i === 0 || v === values[i - 1] + 1);
            if (isStraight && values.every(v => v <= 14)) {
                return { valid: true, type: '顺子', mainValue: values[values.length - 1], length: 5 };
            }
        }
        
        if (cards.length >= 5) {
            const isStraight = values.every((v, i) => i === 0 || v === values[i - 1] + 1);
            if (isStraight && values.every(v => v <= 14)) {
                return { valid: true, type: '顺子', mainValue: values[values.length - 1], length: cards.length };
            }
        }
        
        if (cards.length >= 6 && cards.length % 2 === 0) {
            const pairCount = cards.length / 2;
            if (counts.every(c => c === 2) && uniqueValues.length === pairCount) {
                const isSequence = uniqueValues.every((v, i) => i === 0 || v === uniqueValues[i - 1] + 1);
                if (isSequence && uniqueValues.every(v => v <= 14)) {
                    return { valid: true, type: '连对', mainValue: uniqueValues[uniqueValues.length - 1], length: cards.length };
                }
            }
        }
        
        if (cards.length >= 6 && cards.length % 3 === 0) {
            const tripletCount = cards.length / 3;
            if (counts.every(c => c === 3) && uniqueValues.length === tripletCount) {
                const isSequence = uniqueValues.every((v, i) => i === 0 || v === uniqueValues[i - 1] + 1);
                if (isSequence && uniqueValues.every(v => v <= 14)) {
                    return { valid: true, type: '飞机', mainValue: uniqueValues[uniqueValues.length - 1], length: cards.length };
                }
            }
        }
        
        if (cards.length >= 8 && cards.length % 4 === 0) {
            const quadCount = cards.length / 4;
            if (counts.every(c => c === 4) && uniqueValues.length === quadCount) {
                const isSequence = uniqueValues.every((v, i) => i === 0 || v === uniqueValues[i - 1] + 1);
                if (isSequence && uniqueValues.every(v => v <= 14)) {
                    return { valid: true, type: '四带二', mainValue: uniqueValues[uniqueValues.length - 1] + 30, length: cards.length };
                }
            }
        }
        
        if (cards.length >= 6) {
            const tripletGroups = [];
            let tempGroup = [];
            uniqueValues.forEach((v, i) => {
                const count = valueCountMap[v];
                if (count >= 3) {
                    if (i === 0 || v === uniqueValues[i - 1] + 1) {
                        tempGroup.push(v);
                    } else {
                        if (tempGroup.length >= 2) tripletGroups.push([...tempGroup]);
                        tempGroup = [v];
                    }
                }
            });
            if (tempGroup.length >= 2) tripletGroups.push(tempGroup);
            
            for (const group of tripletGroups) {
                const neededCards = group.length * 3;
                const remainingCards = cards.length - neededCards;
                if (remainingCards >= 0 && remainingCards <= group.length * 2) {
                    const tripletSum = group.reduce((a, b) => a + b, 0);
                    return { valid: true, type: '飞机带翅膀', mainValue: tripletSum, length: cards.length };
                }
            }
        }
        
        return { valid: false, type: '无效', mainValue: 0, length: cards.length };
    }

    canBeat(lastCards, newCards) {
        const lastType = this.getCardType(lastCards);
        const newType = this.getCardType(newCards);
        
        if (!lastType.valid || !newType.valid) return false;
        
        if (newType.type === '王炸') return true;
        if (lastType.type === '王炸') return false;
        
        if (newType.type === '炸弹') {
            if (lastType.type !== '炸弹') return true;
            return newType.mainValue > lastType.mainValue;
        }
        
        if (lastType.type === '炸弹') return false;
        
        if (lastCards.length !== newCards.length) return false;
        
        if (lastType.type !== newType.type) return false;
        
        return newType.mainValue > lastType.mainValue;
    }

    renderLastPlayed(cards) {
        this.elements.lastPlayedCards.innerHTML = '';
        cards.forEach(card => {
            const cardEl = this.createCardElement(card);
            this.elements.lastPlayedCards.appendChild(cardEl);
        });
        this.elements.lastPlayer.textContent = this.lastPlayer === 'pass' ? '不出' : 
            (this.lastPlayer ? this.players[this.lastPlayer].name : '-');
    }

    clearLastPlayed() {
        this.elements.lastPlayedCards.innerHTML = '';
        this.elements.lastPlayer.textContent = '-';
    }

    updateStatus(message) {
        this.elements.gameStatus.textContent = message;
    }

    updateScores() {
        this.elements.playerScore.textContent = this.players.player.score;
        this.elements.ai1Score.textContent = this.players.ai1.score;
        this.elements.ai2Score.textContent = this.players.ai2.score;
    }

    endGame(winnerId) {
        this.gamePhase = 'ended';
        const winner = this.players[winnerId];
        const isLandlordWin = winner.isLandlord;
        const multiplier = this.baseScore * (isLandlordWin ? 1 : 2);
        
        if (isLandlordWin) {
            winner.score += multiplier * 2;
            this.players.ai1.score -= multiplier;
            this.players.ai2.score -= multiplier;
        } else {
            this.players.player.score += winnerId === 'player' ? multiplier : 0;
            this.players.ai1.score += winnerId === 'ai1' ? multiplier : 0;
            this.players.ai2.score += winnerId === 'ai2' ? multiplier : 0;
            this.players[this.landlordCandidate].score -= multiplier * 2;
        }
        
        this.updateScores();
        
        this.elements.modalTitle.textContent = '🎉 游戏结束 🎉';
        this.elements.modalMessage.textContent = `${winner.name} 获胜！${isLandlordWin ? '地主胜利' : '农民胜利'}，分数 x${multiplier}`;
        this.elements.modalScores.innerHTML = `
            <div><span>玩家</span><span>${this.players.player.score}</span></div>
            <div><span>农民1</span><span>${this.players.ai1.score}</span></div>
            <div><span>农民2</span><span>${this.players.ai2.score}</span></div>
        `;
        this.elements.modalOverlay.style.display = 'flex';
    }

    restartGame() {
        this.elements.modalOverlay.style.display = 'none';
        
        Object.keys(this.players).forEach(key => {
            this.players[key].cards = [];
            this.players[key].isLandlord = false;
            this.players[key].doubled = false;
        });
        
        this.landlordCards = [];
        this.currentPlayer = 'player';
        this.lastPlayedCards = [];
        this.lastPlayer = null;
        this.passCount = 0;
        this.gamePhase = 'start';
        this.landlordCandidate = null;
        this.landlordBidRound = 0;
        this.doubleCount = 0;
        this.baseScore = 1;
        this.selectedCardIndices = [];
        this.isProcessing = false;
        this.isAutoPlay = false;
        
        this.startGame();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});