const gameData = {
    items: [
        { id: 1, name: '会说话的鹦鹉', icon: '🦜', desc: '能模仿各种声音', unlockLevel: 1, price: 0, coinPrice: 0, lovePrice: 0 },
        { id: 2, name: '月光宝盒', icon: '📦', desc: '据说能穿越时空', unlockLevel: 1, price: 0, coinPrice: 0, lovePrice: 0 },
        { id: 3, name: '魔法水晶球', icon: '🔮', desc: '能看到未来', unlockLevel: 1, price: 0, coinPrice: 0, lovePrice: 0 },
        { id: 4, name: '隐形斗篷', icon: '🧥', desc: '穿上就能隐身', unlockLevel: 2, price: 100, coinPrice: 100, lovePrice: 0 },
        { id: 5, name: '时光沙漏', icon: '⏳', desc: '可以暂停时间', unlockLevel: 2, price: 150, coinPrice: 150, lovePrice: 0 },
        { id: 6, name: '许愿星', icon: '⭐', desc: '听说很灵验', unlockLevel: 2, price: 200, coinPrice: 200, lovePrice: 0 },
        { id: 7, name: '记忆面包', icon: '🍞', desc: '吃了能记住一切', unlockLevel: 3, price: 250, coinPrice: 250, lovePrice: 0 },
        { id: 8, name: '后悔药', icon: '💊', desc: '能挽回错误', unlockLevel: 3, price: 300, coinPrice: 300, lovePrice: 0 },
        { id: 9, name: '隐身药水', icon: '🧪', desc: '喝了就消失', unlockLevel: 3, price: 350, coinPrice: 350, lovePrice: 0 },
        { id: 10, name: '任意门', icon: '🚪', desc: '想去哪就去哪', unlockLevel: 4, price: 500, coinPrice: 500, lovePrice: 0 },
        { id: 11, name: '翻译魔芋', icon: '🫘', desc: '能听懂动物说话', unlockLevel: 4, price: 400, coinPrice: 400, lovePrice: 0 },
        { id: 12, name: '复活草', icon: '🌿', desc: '起死回生的神奇草药', unlockLevel: 5, price: 600, coinPrice: 600, lovePrice: 0 },
        { id: 13, name: '幸运四叶草', icon: '🍀', desc: '带来好运', unlockLevel: 5, price: 0, coinPrice: 0, lovePrice: 5 },
        { id: 14, name: '彩虹糖', icon: '🍬', desc: '让人心情愉悦', unlockLevel: 6, price: 0, coinPrice: 0, lovePrice: 8 },
        { id: 15, name: '幸福铃铛', icon: '🔔', desc: '听到的人都会幸福', unlockLevel: 6, price: 0, coinPrice: 0, lovePrice: 12 },
    ],
    customers: [
        { id: 1, name: '健忘的老人', avatar: '👴', request: '我忘记了重要的事情，能帮我找回记忆吗？', hint: '和记忆有关的食物', answer: 7, coinReward: 50, loveReward: 1, exp: 20 },
        { id: 2, name: '迟到的上班族', avatar: '👔', request: '来不及了！我需要快速到达公司！', hint: '可以穿越空间的门', answer: 10, coinReward: 80, loveReward: 2, exp: 30 },
        { id: 3, name: '探险家小明', avatar: '🧑‍🚀', request: '我想去探索未知的世界，但又怕危险...', hint: '可以隐藏自己的装备', answer: 4, coinReward: 60, loveReward: 1, exp: 25 },
        { id: 4, name: '魔法师学徒', avatar: '🧙', request: '师父让我找一件能看到未来的道具...', hint: '圆圆的、会发光', answer: 3, coinReward: 70, loveReward: 2, exp: 28 },
        { id: 5, name: '时间管理大师', avatar: '🕐', request: '时间不够用了，能让时间慢下来吗？', hint: '和时间有关的道具', answer: 5, coinReward: 90, loveReward: 3, exp: 35 },
        { id: 6, name: '失恋的女孩', avatar: '👧', request: '我不想记得那些伤心的回忆...', hint: '白色的小药片', answer: 8, coinReward: 65, loveReward: 2, exp: 26 },
        { id: 7, name: '动物爱好者', avatar: '🐱', request: '我好想听懂我家猫咪在说什么！', hint: '一种神奇的植物', answer: 11, coinReward: 75, loveReward: 2, exp: 32 },
        { id: 8, name: '考古学家', avatar: '🧑‍🏛️', request: '我想回到过去看看历史真相！', hint: '神秘的盒子', answer: 2, coinReward: 85, loveReward: 3, exp: 34 },
        { id: 9, name: '害羞的男孩', avatar: '👦', request: '我太害羞了，想偷偷观察别人...', hint: '透明的药水', answer: 9, coinReward: 60, loveReward: 1, exp: 25 },
        { id: 10, name: '许愿少女', avatar: '👩', request: '我有一个愿望想要实现...', hint: '天上的星星', answer: 6, coinReward: 70, loveReward: 2, exp: 28 },
        { id: 11, name: '动物园管理员', avatar: '🧑‍🌾', request: '鹦鹉太吵了，能让它安静吗？', hint: '另一只鸟', answer: 1, coinReward: 40, loveReward: 1, exp: 15 },
        { id: 12, name: '医生', avatar: '👨‍⚕️', request: '我需要一种能救治绝症的药草', hint: '绿色的神奇植物', answer: 12, coinReward: 100, loveReward: 3, exp: 40 },
    ],
    themes: [
        { id: 1, name: '温馨小店', headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', shopBg: 'linear-gradient(180deg, #fff5e6 0%, #ffe4c4 100%)', customerBg: 'linear-gradient(180deg, #e0f7fa 0%, #b2ebf2 100%)', floorBg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', shelfBg: 'linear-gradient(180deg, #87ceeb 0%, #5f9ea0 100%)', unlocked: true, price: 0 },
        { id: 2, name: '森林小屋', headerBg: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)', shopBg: 'linear-gradient(180deg, #e8f5e9 0%, #c8e6c9 100%)', customerBg: 'linear-gradient(180deg, #f3e5f5 0%, #e1bee7 100%)', floorBg: 'linear-gradient(135deg, #dcedc8 0%, #a8e6cf 100%)', shelfBg: 'linear-gradient(180deg, #81c784 0%, #4caf50 100%)', unlocked: false, price: 300 },
        { id: 3, name: '海洋世界', headerBg: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)', shopBg: 'linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%)', customerBg: 'linear-gradient(180deg, #e0f7fa 0%, #80deea 100%)', floorBg: 'linear-gradient(135deg, #b3e5fc 0%, #81d4fa 100%)', shelfBg: 'linear-gradient(180deg, #4fc3f7 0%, #0288d1 100%)', unlocked: false, price: 500 },
        { id: 4, name: '糖果乐园', headerBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', shopBg: 'linear-gradient(180deg, #fce4ec 0%, #f8bbd9 100%)', customerBg: 'linear-gradient(180deg, #fff3e0 0%, #ffe0b2 100%)', floorBg: 'linear-gradient(135deg, #fde9e9 0%, #f8bbd9 100%)', shelfBg: 'linear-gradient(180deg, #f48fb1 0%, #ec407a 100%)', unlocked: false, price: 800 },
        { id: 5, name: '星空幻想', headerBg: 'linear-gradient(135deg, #434343 0%, #000000 100%)', shopBg: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)', customerBg: 'linear-gradient(180deg, #0f3460 0%, #533483 100%)', floorBg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', shelfBg: 'linear-gradient(180deg, #7c4dff 0%, #651fff 100%)', unlocked: false, price: 1200 },
        { id: 6, name: '古风雅韵', headerBg: 'linear-gradient(135deg, #8b4513 0%, #d2691e 100%)', shopBg: 'linear-gradient(180deg, #faf0e6 0%, #deb887 100%)', customerBg: 'linear-gradient(180deg, #fffacd 0%, #faebd7 100%)', floorBg: 'linear-gradient(135deg, #deb887 0%, #d2691e 100%)', shelfBg: 'linear-gradient(180deg, #cd853f 0%, #8b4513 100%)', unlocked: false, price: 1500 },
    ],
    storeLevels: [
        { level: 1, name: '迷你小店', maxShelves: 6, bonusCoin: 0, bonusExp: 0 },
        { level: 2, name: '温馨杂货铺', maxShelves: 8, bonusCoin: 10, bonusExp: 5 },
        { level: 3, name: '创意工坊', maxShelves: 10, bonusCoin: 20, bonusExp: 10 },
        { level: 4, name: '梦想商店', maxShelves: 12, bonusCoin: 30, bonusExp: 15 },
        { level: 5, name: '豪华商场', maxShelves: 15, bonusCoin: 50, bonusExp: 20 },
        { level: 6, name: '超级百货', maxShelves: 18, bonusCoin: 80, bonusExp: 30 },
        { level: 7, name: '环球连锁', maxShelves: 20, bonusCoin: 120, bonusExp: 40 },
    ]
};

const game = new Vue({
    el: '.game-container',
    data: {
        level: 1,
        coins: 100,
        love: 0,
        exp: 0,
        nextExp: 100,
        day: 1,
        servedToday: 0,
        dailyTarget: 5,
        selectedItem: null,
        currentCustomer: null,
        inventory: [],
        shopItems: [],
        showModal: false,
        modalTitle: '',
        confirmText: '确定',
        rewardShow: false,
        rewardIcon: '',
        rewardText: '',
        showShop: false,
        showInventory: false,
        showLevelUp: false,
        showDecoration: false,
        showLoveShop: false,
        toastShow: false,
        toastText: '',
        currentShelf: [],
        currentTheme: null,
        ownedThemes: [],
        storeLevel: null,
    },
    computed: {
        progressPercent() {
            return Math.min(100, (this.exp / this.nextExp) * 100);
        },
        maxShelves() {
            return this.storeLevel ? this.storeLevel.maxShelves : 6;
        },
        decorationItems() {
            return gameData.themes.map(theme => ({
                ...theme,
                owned: this.ownedThemes.includes(theme.id),
                canBuy: this.coins >= theme.price
            }));
        },
        loveShopItems() {
            return gameData.items.filter(item => item.lovePrice > 0);
        }
    },
    mounted() {
        this.initGame();
        this.spawnCustomer();
    },
    methods: {
        initGame() {
            this.currentTheme = gameData.themes[0];
            this.ownedThemes = [1];
            this.storeLevel = gameData.storeLevels[0];
            
            this.inventory = gameData.items
                .filter(item => item.unlockLevel <= this.level && item.coinPrice === 0 && item.lovePrice === 0)
                .map(item => ({ ...item, count: 1 }));
            
            this.shopItems = gameData.items
                .filter(item => item.unlockLevel <= this.level && item.coinPrice > 0);
            
            this.updateShelf();
            this.updateThemeStyle();
        },
        
        updateThemeStyle() {
            if (this.currentTheme) {
                document.documentElement.style.setProperty('--header-bg', this.currentTheme.headerBg);
                document.documentElement.style.setProperty('--shop-bg', this.currentTheme.shopBg);
                document.documentElement.style.setProperty('--customer-bg', this.currentTheme.customerBg);
                document.documentElement.style.setProperty('--floor-bg', this.currentTheme.floorBg);
                document.documentElement.style.setProperty('--shelf-bg', this.currentTheme.shelfBg);
            }
        },
        
        updateShelf() {
            this.currentShelf = this.inventory.map(item => ({
                ...item,
                locked: false
            }));
            
            const lockedSlots = this.maxShelves - this.currentShelf.length;
            for (let i = 0; i < lockedSlots; i++) {
                this.currentShelf.push({ locked: true });
            }
        },
        
        spawnCustomer() {
            const availableCustomers = gameData.customers.filter(c => {
                const answerItem = gameData.items.find(item => item.id === c.answer);
                return answerItem && answerItem.unlockLevel <= this.level;
            });
            
            if (availableCustomers.length === 0) {
                this.showToast('已解锁所有顾客！');
                return;
            }
            
            const randomIndex = Math.floor(Math.random() * availableCustomers.length);
            this.currentCustomer = { ...availableCustomers[randomIndex], locked: false };
            this.selectedItem = null;
        },
        
        selectItem(index) {
            const item = this.currentShelf[index];
            if (item && !item.locked) {
                this.selectedItem = index;
            }
        },
        
        sellItem() {
            if (this.selectedItem === null) {
                this.showToast('请先选择一个商品！');
                return;
            }
            
            const selectedItemData = this.currentShelf[this.selectedItem];
            
            if (selectedItemData.id === this.currentCustomer.answer) {
                const bonusCoin = this.storeLevel ? this.storeLevel.bonusCoin : 0;
                const bonusExp = this.storeLevel ? this.storeLevel.bonusExp : 0;
                
                const totalCoins = this.currentCustomer.coinReward + bonusCoin;
                const totalExp = this.currentCustomer.exp + bonusExp;
                
                this.coins += totalCoins;
                this.love += this.currentCustomer.loveReward;
                this.exp += totalExp;
                this.servedToday++;
                
                const itemIndex = this.inventory.findIndex(item => item.id === selectedItemData.id);
                if (itemIndex !== -1) {
                    this.inventory[itemIndex].count--;
                    if (this.inventory[itemIndex].count <= 0) {
                        this.inventory.splice(itemIndex, 1);
                    }
                }
                
                this.updateShelf();
                
                let rewardMsg = `答对了！获得 ${totalCoins} 金币`;
                if (this.currentCustomer.loveReward > 0) {
                    rewardMsg += `、${this.currentCustomer.loveReward} 爱心`;
                }
                rewardMsg += `和 ${totalExp} 经验！`;
                
                if (bonusCoin > 0 || bonusExp > 0) {
                    rewardMsg += `\n店铺加成: +${bonusCoin}金币 +${bonusExp}经验`;
                }
                
                this.showReward('🎉', rewardMsg);
                
                this.checkLevelUp();
                this.checkDailyTarget();
                this.spawnCustomer();
            } else {
                this.showToast('这不是顾客想要的商品！');
            }
        },
        
        skipCustomer() {
            this.spawnCustomer();
            this.showToast('顾客离开了...');
        },
        
        checkLevelUp() {
            while (this.exp >= this.nextExp) {
                this.exp -= this.nextExp;
                this.level++;
                this.nextExp = Math.floor(this.nextExp * 1.5);
                
                const newItems = gameData.items.filter(item => 
                    item.unlockLevel === this.level && item.coinPrice === 0 && item.lovePrice === 0
                );
                
                newItems.forEach(item => {
                    const existingItem = this.inventory.find(i => i.id === item.id);
                    if (!existingItem) {
                        this.inventory.push({ ...item, count: 1 });
                    }
                });
                
                const newStoreLevel = gameData.storeLevels.find(sl => sl.level === this.level);
                if (newStoreLevel) {
                    this.storeLevel = newStoreLevel;
                    this.showToast(`🏠 店铺升级为「${this.storeLevel.name}」！货架数: ${this.maxShelves}`);
                }
                
                this.shopItems = gameData.items.filter(item => 
                    item.unlockLevel <= this.level && item.coinPrice > 0
                );
                
                this.updateShelf();
                this.showLevelUpModal();
            }
        },
        
        checkDailyTarget() {
            if (this.servedToday >= this.dailyTarget) {
                this.day++;
                this.servedToday = 0;
                this.dailyTarget = Math.floor(5 + this.day * 0.5);
                this.coins += 100;
                this.showToast(`🎉 新的一天开始！获得 100 金币奖励！`);
            }
        },
        
        buyItem(index) {
            const item = this.shopItems[index];
            if (this.coins >= item.coinPrice) {
                this.coins -= item.coinPrice;
                
                const existingItem = this.inventory.find(i => i.id === item.id);
                if (existingItem) {
                    existingItem.count++;
                } else {
                    this.inventory.push({ ...item, count: 1 });
                }
                
                this.updateShelf();
                this.showToast(`购买成功！获得 ${item.name}！`);
            }
        },
        
        buyLoveItem(index) {
            const item = this.loveShopItems[index];
            if (this.love >= item.lovePrice) {
                this.love -= item.lovePrice;
                
                const existingItem = this.inventory.find(i => i.id === item.id);
                if (existingItem) {
                    existingItem.count++;
                } else {
                    this.inventory.push({ ...item, count: 1 });
                }
                
                this.updateShelf();
                this.showToast(`💕 兑换成功！获得 ${item.name}！`);
            }
        },
        
        buyTheme(index) {
            const theme = this.decorationItems[index];
            if (!theme.owned && this.coins >= theme.price) {
                this.coins -= theme.price;
                this.ownedThemes.push(theme.id);
                theme.owned = true;
                this.showToast(`🎨 购买成功！获得「${theme.name}」主题！`);
            }
        },
        
        selectTheme(index) {
            const theme = this.decorationItems[index];
            if (theme.owned) {
                this.currentTheme = gameData.themes.find(t => t.id === theme.id);
                this.updateThemeStyle();
                this.showToast(`🎨 已切换到「${theme.name}」主题！`);
            }
        },
        
        openShop() {
            this.modalTitle = '🛒 商店';
            this.confirmText = '关闭';
            this.showShop = true;
            this.showModal = true;
        },
        
        openLoveShop() {
            this.modalTitle = '💕 爱心商店';
            this.confirmText = '关闭';
            this.showLoveShop = true;
            this.showModal = true;
        },
        
        openInventory() {
            this.modalTitle = '📦 仓库';
            this.confirmText = '关闭';
            this.showInventory = true;
            this.showModal = true;
        },
        
        openDecoration() {
            this.modalTitle = '🎨 装修商店';
            this.confirmText = '关闭';
            this.showDecoration = true;
            this.showModal = true;
        },
        
        showReward(icon, text) {
            this.rewardIcon = icon;
            this.rewardText = text;
            this.rewardShow = true;
            this.modalTitle = '🎊 交易成功';
            this.confirmText = '继续';
            this.showModal = true;
        },
        
        showLevelUpModal() {
            this.showLevelUp = true;
            this.modalTitle = '🎁 升级啦！';
            this.confirmText = '太棒了';
            this.showModal = true;
        },
        
        closeModal() {
            this.showModal = false;
            this.rewardShow = false;
            this.showShop = false;
            this.showLoveShop = false;
            this.showInventory = false;
            this.showDecoration = false;
            this.showLevelUp = false;
        },
        
        confirmModal() {
            this.closeModal();
        },
        
        showToast(text) {
            this.toastText = text;
            this.toastShow = true;
            setTimeout(() => {
                this.toastShow = false;
            }, 2000);
        }
    }
});