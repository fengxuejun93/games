let purchaseList = [];
let filteredList = [];
let isFiltered = false;

const STORAGE_KEY = 'purchase_records';

function loadRecords() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        purchaseList = JSON.parse(stored);
    } else {
        purchaseList = [];
    }
    renderList();
    updateTotalAmount();
}

function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(purchaseList));
}

function updateTotalAmount() {
    const list = isFiltered ? filteredList : purchaseList;
    const total = list.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
    }, 0);
    document.getElementById('totalAmount').textContent = total.toFixed(2);
}

function formatDateTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function renderList() {
    const listContainer = document.getElementById('purchaseList');
    const list = isFiltered ? filteredList : purchaseList;
    
    if (list.length === 0) {
        const message = isFiltered ? '当前筛选条件下暂无采购记录' : '暂无采购记录，点击上方添加';
        listContainer.innerHTML = `
            <div class="empty-state">
                <p>${message}</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = list.map(item => {
        const meta = [];
        if (item.specification) meta.push(`规格：${escapeHtml(item.specification)}`);
        if (item.supplier) meta.push(`供应商：${escapeHtml(item.supplier)}`);
        meta.push(`采购日期：${item.purchaseDate}`);
        meta.push(`创建：${formatDateTime(item.createTime)}`);
        meta.push(`更新：${formatDateTime(item.updateTime)}`);
        
        return `
            <div class="purchase-card" data-id="${item.id}">
                <div class="card-content">
                    <h3 class="card-title">${escapeHtml(item.itemName)}</h3>
                    <div class="card-meta">
                        ${meta.map(m => `<span>${m}</span>`).join('')}
                    </div>
                    ${item.remark ? `<p style="font-size: 13px; color: #636e72; margin-top: 8px;">备注：${escapeHtml(item.remark)}</p>` : ''}
                </div>
                <div class="card-price">
                    <div class="price-value">¥${(item.quantity * item.unitPrice).toFixed(2)}</div>
                    <div class="price-unit">${item.quantity} × ¥${item.unitPrice.toFixed(2)}</div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-info btn-sm" onclick="editRecord('${item.id}')">编辑</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRecord('${item.id}')">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

function addRecord(e) {
    e.preventDefault();
    
    const itemName = document.getElementById('itemName').value.trim();
    const specification = document.getElementById('specification').value.trim();
    const quantity = parseFloat(document.getElementById('quantity').value);
    const unitPrice = parseFloat(document.getElementById('unitPrice').value);
    const supplier = document.getElementById('supplier').value.trim();
    const purchaseDate = document.getElementById('purchaseDate').value;
    const remark = document.getElementById('remark').value.trim();

    if (!itemName || !quantity || !unitPrice || !purchaseDate) {
        alert('请填写必填字段（物品名称、数量、单价、采购日期）');
        return;
    }

    const now = new Date();
    const newRecord = {
        id: Date.now().toString(),
        itemName,
        specification,
        quantity,
        unitPrice,
        supplier,
        purchaseDate,
        remark,
        createTime: now.toISOString(),
        updateTime: now.toISOString()
    };

    purchaseList.push(newRecord);
    saveRecords();
    renderList();
    updateTotalAmount();

    document.getElementById('purchaseForm').reset();
}

function deleteRecord(id) {
    if (!confirm('确定要删除这条采购记录吗？')) {
        return;
    }

    purchaseList = purchaseList.filter(item => item.id !== id);
    if (isFiltered) {
        filteredList = filteredList.filter(item => item.id !== id);
    }
    saveRecords();
    renderList();
    updateTotalAmount();
}

function editRecord(id) {
    const record = purchaseList.find(item => item.id === id);
    if (!record) return;

    document.getElementById('editId').value = record.id;
    document.getElementById('editItemName').value = record.itemName;
    document.getElementById('editSpecification').value = record.specification;
    document.getElementById('editQuantity').value = record.quantity;
    document.getElementById('editUnitPrice').value = record.unitPrice;
    document.getElementById('editSupplier').value = record.supplier;
    document.getElementById('editPurchaseDate').value = record.purchaseDate;
    document.getElementById('editRemark').value = record.remark;
    document.getElementById('editCreateTime').value = record.createTime;
    document.getElementById('editUpdateTime').value = record.updateTime;

    document.getElementById('editModal').style.display = 'block';
}

function updateRecord(e) {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const itemName = document.getElementById('editItemName').value.trim();
    const specification = document.getElementById('editSpecification').value.trim();
    const quantity = parseFloat(document.getElementById('editQuantity').value);
    const unitPrice = parseFloat(document.getElementById('editUnitPrice').value);
    const supplier = document.getElementById('editSupplier').value.trim();
    const purchaseDate = document.getElementById('editPurchaseDate').value;
    const remark = document.getElementById('editRemark').value.trim();
    const createTime = document.getElementById('editCreateTime').value;

    if (!itemName || !quantity || !unitPrice || !purchaseDate) {
        alert('请填写必填字段（物品名称、数量、单价、采购日期）');
        return;
    }

    const index = purchaseList.findIndex(item => item.id === id);
    if (index !== -1) {
        const updatedRecord = {
            id,
            itemName,
            specification,
            quantity,
            unitPrice,
            supplier,
            purchaseDate,
            remark,
            createTime,
            updateTime: new Date().toISOString()
        };
        
        purchaseList[index] = updatedRecord;
        
        if (isFiltered) {
            const filteredIndex = filteredList.findIndex(item => item.id === id);
            if (filteredIndex !== -1) {
                filteredList[filteredIndex] = updatedRecord;
            }
        }

        saveRecords();
        renderList();
        updateTotalAmount();
    }

    closeModal();
}

function applyFilter() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate && !endDate) {
        alert('请选择开始日期或结束日期');
        return;
    }

    filteredList = purchaseList.filter(item => {
        const purchaseDate = item.purchaseDate;
        
        if (startDate && purchaseDate < startDate) {
            return false;
        }
        if (endDate && purchaseDate > endDate) {
            return false;
        }
        return true;
    });

    isFiltered = true;
    renderList();
    updateTotalAmount();
}

function resetFilter() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    isFiltered = false;
    filteredList = [];
    renderList();
    updateTotalAmount();
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editForm').reset();
}

document.getElementById('purchaseForm').addEventListener('submit', addRecord);
document.getElementById('editForm').addEventListener('submit', updateRecord);
document.querySelector('.modal-close').addEventListener('click', closeModal);

window.addEventListener('click', function(e) {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        closeModal();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('purchaseDate').value = today;
    loadRecords();
});