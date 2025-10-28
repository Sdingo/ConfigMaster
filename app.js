// ConfigMaster Pro - Main Application Logic
// ERP Configuration & Testing Tool

// ============= GLOBAL STATE =============
let appState = {
    chartOfAccounts: [],
    customers: [],
    vendors: [],
    items: [],
    validationIssues: [],
    currentTab: 'accounts',
    templates: {
        retail: null,
        manufacturing: null,
        services: null
    }
};

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ ConfigMaster Pro Initialized');
    loadFromLocalStorage();
    updateStatistics();
    initializeAccountsTab();
    initializeCustomersTab();
    initializeItemsTab();
    initializeTemplatesTab();
    loadPredefinedTemplates();
});

// ============= TAB SWITCHING =============
function switchTab(tabName) {
    const tabs = ['accounts', 'customers', 'items', 'templates'];
    tabs.forEach(tab => {
        const button = document.getElementById(`tab${capitalize(tab)}`);
        const content = document.getElementById(`content${capitalize(tab)}`);
        
        if (tab === tabName) {
            button.classList.remove('tab-inactive');
            button.classList.add('tab-active');
            content.classList.remove('hidden');
        } else {
            button.classList.remove('tab-active');
            button.classList.add('tab-inactive');
            content.classList.add('hidden');
        }
    });
    
    appState.currentTab = tabName;
}

// ============= UTILITY FUNCTIONS =============
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateId() {
    return 'ID' + Date.now() + Math.random().toString(36).substr(2, 9);
}

function updateStatistics() {
    document.getElementById('statAccounts').textContent = appState.chartOfAccounts.length;
    document.getElementById('statCustomers').textContent = appState.customers.length + appState.vendors.length;
    document.getElementById('statItems').textContent = appState.items.length;
    document.getElementById('statIssues').textContent = appState.validationIssues.length;
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('configmaster_data', JSON.stringify(appState));
        document.getElementById('lastSaved').textContent = new Date().toLocaleTimeString();
        showNotification('Data saved successfully', 'success');
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
        showNotification('Error saving data', 'error');
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('configmaster_data');
        if (saved) {
            const loaded = JSON.parse(saved);
            appState.chartOfAccounts = loaded.chartOfAccounts || [];
            appState.customers = loaded.customers || [];
            appState.vendors = loaded.vendors || [];
            appState.items = loaded.items || [];
            appState.validationIssues = loaded.validationIssues || [];
            document.getElementById('lastSaved').textContent = 'Loaded from storage';
        }
    } catch (error) {
        console.error('❌ Error loading from localStorage:', error);
    }
}

function showNotification(message, type = 'success') {
    const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-error' : 'alert-warning';
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${alertClass} p-4 rounded-lg shadow-lg z-50 animate-fade-in`;
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'exclamation-triangle'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ============= CHART OF ACCOUNTS MODULE =============
function initializeAccountsTab() {
    const content = document.getElementById('contentAccounts');
    content.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Chart of Accounts Configuration</h2>
            <p class="text-gray-600">Configure your general ledger accounts structure</p>
        </div>
        
        <!-- Add Account Form -->
        <div class="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Add New Account</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                    <input type="text" id="accountNumber" placeholder="e.g., 1000" class="input-field w-full px-4 py-2 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Account Name *</label>
                    <input type="text" id="accountName" placeholder="e.g., Cash" class="input-field w-full px-4 py-2 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Account Type *</label>
                    <select id="accountType" class="input-field w-full px-4 py-2 rounded-lg">
                        <option value="">Select type...</option>
                        <option value="Asset">Asset</option>
                        <option value="Liability">Liability</option>
                        <option value="Equity">Equity</option>
                        <option value="Revenue">Revenue</option>
                        <option value="Expense">Expense</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select id="accountCategory" class="input-field w-full px-4 py-2 rounded-lg">
                        <option value="">Select category...</option>
                        <option value="Current Assets">Current Assets</option>
                        <option value="Equity">Equity</option>
                        <option value="Fixed Assets">Fixed Assets</option>
                        <option value="Current Liabilities">Current Liabilities</option>
                        <option value="Long-term Liabilities">Long-term Liabilities</option>
                        <option value="Operating Revenue">Operating Revenue</option>
                        <option value="Operating Expenses">Operating Expenses</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select id="accountCurrency" class="input-field w-full px-4 py-2 rounded-lg">
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="SZL">SZL</option>
                    </select>
                </div>
                <div class="flex items-end">
                    <button onclick="addAccount()" class="btn-primary w-full px-6 py-2 rounded-lg font-semibold">
                        <i class="fas fa-plus mr-2"></i> Add Account
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Accounts List -->
        <div>
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Configured Accounts (<span id="accountCount">0</span>)</h3>
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="w-full">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Account No.</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Currency</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="accountsTableBody">
                        <tr>
                            <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                                No accounts configured yet. Add your first account above.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    renderAccountsTable();
}

function addAccount() {
    const accountNumber = document.getElementById('accountNumber').value.trim();
    const accountName = document.getElementById('accountName').value.trim();
    const accountType = document.getElementById('accountType').value;
    const accountCategory = document.getElementById('accountCategory').value;
    const accountCurrency = document.getElementById('accountCurrency').value;
    
    // Validation
    if (!accountNumber || !accountName || !accountType) {
        showNotification('Please fill in all required fields (Account Number, Name, Type)', 'error');
        return;
    }
    
    // Check for duplicate account number
    const duplicate = appState.chartOfAccounts.find(acc => acc.number === accountNumber);
    if (duplicate) {
        showNotification('Account number already exists', 'error');
        return;
    }
    
    // Add account
    const newAccount = {
        id: generateId(),
        number: accountNumber,
        name: accountName,
        type: accountType,
        category: accountCategory || 'Unassigned',
        currency: accountCurrency,
        status: 'Active',
        createdAt: new Date().toISOString()
    };
    
    appState.chartOfAccounts.push(newAccount);
    
    // Clear form
    document.getElementById('accountNumber').value = '';
    document.getElementById('accountName').value = '';
    document.getElementById('accountType').value = '';
    document.getElementById('accountCategory').value = '';
    
    // Update UI
    renderAccountsTable();
    updateStatistics();
    saveToLocalStorage();
    
    showNotification('Account added successfully', 'success');
}

function renderAccountsTable() {
    const tbody = document.getElementById('accountsTableBody');
    const countElement = document.getElementById('accountCount');
    
    if (appState.chartOfAccounts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    No accounts configured yet. Add your first account above.
                </td>
            </tr>
        `;
        if (countElement) countElement.textContent = '0';
        return;
    }
    
    if (countElement) countElement.textContent = appState.chartOfAccounts.length;
    
    tbody.innerHTML = appState.chartOfAccounts.map(account => `
        <tr class="table-row border-b">
            <td class="px-4 py-3 font-mono text-sm">${account.number}</td>
            <td class="px-4 py-3">${account.name}</td>
            <td class="px-4 py-3">
                <span class="badge badge-success">${account.type}</span>
            </td>
            <td class="px-4 py-3 text-sm">${account.category}</td>
            <td class="px-4 py-3 text-sm">${account.currency}</td>
            <td class="px-4 py-3">
                <span class="badge badge-success">${account.status}</span>
            </td>
            <td class="px-4 py-3 text-center">
                <button onclick="deleteAccount('${account.id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function deleteAccount(id) {
    if (confirm('Are you sure you want to delete this account?')) {
        appState.chartOfAccounts = appState.chartOfAccounts.filter(acc => acc.id !== id);
        renderAccountsTable();
        updateStatistics();
        saveToLocalStorage();
        showNotification('Account deleted', 'success');
    }
}

// ============= CUSTOMERS/VENDORS MODULE =============
function initializeCustomersTab() {
    const content = document.getElementById('contentCustomers');
    content.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Customer & Vendor Setup</h2>
            <p class="text-gray-600">Manage business partners configuration</p>
        </div>
        
        <!-- Type Selector -->
        <div class="flex gap-4 mb-6">
            <button onclick="setPartnerType('customer')" id="btnCustomer" class="flex-1 py-3 px-6 rounded-lg font-semibold btn-primary">
                <i class="fas fa-user-tie mr-2"></i> Customers
            </button>
            <button onclick="setPartnerType('vendor')" id="btnVendor" class="flex-1 py-3 px-6 rounded-lg font-semibold bg-gray-200 text-gray-700">
                <i class="fas fa-truck mr-2"></i> Vendors
            </button>
        </div>
        
        <!-- Add Partner Form -->
        <div class="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Add New <span id="partnerTypeLabel">Customer</span></h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Partner ID *</label>
                    <input type="text" id="partnerId" placeholder="e.g., CUST001" class="input-field w-full px-4 py-2 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input type="text" id="partnerName" placeholder="e.g., Acme Corp" class="input-field w-full px-4 py-2 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                    <input type="text" id="partnerContact" placeholder="e.g., John Doe" class="input-field w-full px-4 py-2 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" id="partnerEmail" placeholder="e.g., contact@acme.com" class="input-field w-full px-4 py-2 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input type="tel" id="partnerPhone" placeholder="e.g., +1234567890" class="input-field w-full px-4 py-2 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                    <select id="partnerPaymentTerms" class="input-field w-full px-4 py-2 rounded-lg">
                        <option value="Net 30">Net 30</option>
                        <option value="Net 60">Net 60</option>
                        <option value="Due on Receipt">Due on Receipt</option>
                        <option value="COD">Cash on Delivery</option>
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input type="text" id="partnerAddress" placeholder="Full address" class="input-field w-full px-4 py-2 rounded-lg">
                </div>
                <div class="flex items-end">
                    <button onclick="addPartner()" class="btn-primary w-full px-6 py-2 rounded-lg font-semibold">
                        <i class="fas fa-plus mr-2"></i> Add <span id="partnerBtnLabel">Customer</span>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Partners List -->
        <div>
            <h3 class="text-lg font-semibold text-gray-700 mb-4"><span id="partnerListLabel">Customers</span> (<span id="partnerCount">0</span>)</h3>
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="w-full">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment Terms</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="partnersTableBody">
                        <tr>
                            <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                                No partners configured yet.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    appState.currentPartnerType = 'customer';
    renderPartnersTable();
}

function setPartnerType(type) {
    appState.currentPartnerType = type;
    
    const btnCustomer = document.getElementById('btnCustomer');
    const btnVendor = document.getElementById('btnVendor');
    
    if (type === 'customer') {
        btnCustomer.className = 'flex-1 py-3 px-6 rounded-lg font-semibold btn-primary';
        btnVendor.className = 'flex-1 py-3 px-6 rounded-lg font-semibold bg-gray-200 text-gray-700';
        document.getElementById('partnerTypeLabel').textContent = 'Customer';
        document.getElementById('partnerBtnLabel').textContent = 'Customer';
        document.getElementById('partnerListLabel').textContent = 'Customers';
    } else {
        btnVendor.className = 'flex-1 py-3 px-6 rounded-lg font-semibold btn-primary';
        btnCustomer.className = 'flex-1 py-3 px-6 rounded-lg font-semibold bg-gray-200 text-gray-700';
        document.getElementById('partnerTypeLabel').textContent = 'Vendor';
        document.getElementById('partnerBtnLabel').textContent = 'Vendor';
        document.getElementById('partnerListLabel').textContent = 'Vendors';
    }
    
    renderPartnersTable();
}

function addPartner() {
    const partnerId = document.getElementById('partnerId').value.trim();
    const partnerName = document.getElementById('partnerName').value.trim();
    const partnerContact = document.getElementById('partnerContact').value.trim();
    const partnerEmail = document.getElementById('partnerEmail').value.trim();
    const partnerPhone = document.getElementById('partnerPhone').value.trim();
    const partnerPaymentTerms = document.getElementById('partnerPaymentTerms').value;
    const partnerAddress = document.getElementById('partnerAddress').value.trim();
    
    if (!partnerId || !partnerName) {
        showNotification('Please fill in Partner ID and Name', 'error');
        return;
    }
    
    const targetArray = appState.currentPartnerType === 'customer' ? appState.customers : appState.vendors;
    const duplicate = targetArray.find(p => p.partnerId === partnerId);
    
    if (duplicate) {
        showNotification('Partner ID already exists', 'error');
        return;
    }
    
    const newPartner = {
        id: generateId(),
        partnerId,
        name: partnerName,
        contact: partnerContact,
        email: partnerEmail,
        phone: partnerPhone,
        paymentTerms: partnerPaymentTerms,
        address: partnerAddress,
        status: 'Active',
        type: appState.currentPartnerType,
        createdAt: new Date().toISOString()
    };
    
    targetArray.push(newPartner);
    
    // Clear form
    document.getElementById('partnerId').value = '';
    document.getElementById('partnerName').value = '';
    document.getElementById('partnerContact').value = '';
    document.getElementById('partnerEmail').value = '';
    document.getElementById('partnerPhone').value = '';
    document.getElementById('partnerAddress').value = '';
    
    renderPartnersTable();
    updateStatistics();
    saveToLocalStorage();
    
    showNotification(`${appState.currentPartnerType === 'customer' ? 'Customer' : 'Vendor'} added successfully`, 'success');
}

function renderPartnersTable() {
    const tbody = document.getElementById('partnersTableBody');
    const countElement = document.getElementById('partnerCount');
    
    const targetArray = appState.currentPartnerType === 'customer' ? appState.customers : appState.vendors;
    
    if (targetArray.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    No ${appState.currentPartnerType}s configured yet.
                </td>
            </tr>
        `;
        if (countElement) countElement.textContent = '0';
        return;
    }
    
    if (countElement) countElement.textContent = targetArray.length;
    
    tbody.innerHTML = targetArray.map(partner => `
        <tr class="table-row border-b">
            <td class="px-4 py-3 font-mono text-sm">${partner.partnerId}</td>
            <td class="px-4 py-3 font-semibold">${partner.name}</td>
            <td class="px-4 py-3 text-sm">${partner.contact || '-'}</td>
            <td class="px-4 py-3 text-sm">${partner.email || '-'}</td>
            <td class="px-4 py-3 text-sm">${partner.paymentTerms}</td>
            <td class="px-4 py-3">
                <span class="badge badge-success">${partner.status}</span>
            </td>
            <td class="px-4 py-3 text-center">
                <button onclick="deletePartner('${partner.id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function deletePartner(id) {
    if (confirm('Are you sure you want to delete this partner?')) {
        if (appState.currentPartnerType === 'customer') {
            appState.customers = appState.customers.filter(p => p.id !== id);
        } else {
            appState.vendors = appState.vendors.filter(p => p.id !== id);
        }
        renderPartnersTable();
        updateStatistics();
        saveToLocalStorage();
        showNotification('Partner deleted', 'success');
    }
}

// ============= ITEMS MODULE =============
function initializeItemsTab() {
    const content = document.getElementById('contentItems');
    content.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Item Master Data</h2>
            <p class="text-gray-600">Configure product and service items</p>
        </div>
        
        <!-- Add Item Form -->
        <div class="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Add New Item</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Item No. *</label>
                    <input type="text" id="itemNo" placeholder="e.g., ITEM001" class="input-field w-full px-4 py-2 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <input type="text" id="itemDescription" placeholder="e.g., Laptop Computer" class="input-field w-full px-4 py-2 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    <select id="itemType" class="input-field w-full px-4 py-2 rounded-lg">
                        <option value="">Select type...</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Service">Service</option>
                        <option value="Non-Inventory">Non-Inventory</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select id="itemCategory" class="input-field w-full px-4 py-2 rounded-lg">
                        <option value="">Select category...</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Consumables">Consumables</option>
                        <option value="Services">Services</option>
                        <option value="Raw Materials">Raw Materials</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
                    <input type="number" id="itemPrice" placeholder="0.00" step="0.01" class="input-field w-full px-4 py-2 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Unit of Measure</label>
                    <select id="itemUOM" class="input-field w-full px-4 py-2 rounded-lg">
                        <option value="PCS">PCS (Pieces)</option>
                        <option value="BOX">BOX</option>
                        <option value="KG">KG (Kilogram)</option>
                        <option value="L">L (Liter)</option>
                        <option value="HR">HR (Hour)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Reorder Point</label>
                    <input type="number" id="itemReorderPoint" placeholder="10" class="input-field w-full px-4 py-2 rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                    <input type="number" id="itemStock" placeholder="0" class="input-field w-full px-4 py-2 rounded-lg">
                </div>
                <div class="flex items-end">
                    <button onclick="addItem()" class="btn-primary w-full px-6 py-2 rounded-lg font-semibold">
                        <i class="fas fa-plus mr-2"></i> Add Item
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Items List -->
        <div>
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Configured Items (<span id="itemCount">0</span>)</h3>
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <table class="w-full">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item No.</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                            <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                            <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Stock</th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="itemsTableBody">
                        <tr>
                            <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                                No items configured yet. Add your first item above.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    renderItemsTable();
}

function addItem() {
    const itemNo = document.getElementById('itemNo').value.trim();
    const itemDescription = document.getElementById('itemDescription').value.trim();
    const itemType = document.getElementById('itemType').value;
    const itemCategory = document.getElementById('itemCategory').value;
    const itemPrice = parseFloat(document.getElementById('itemPrice').value) || 0;
    const itemUOM = document.getElementById('itemUOM').value;
    const itemReorderPoint = parseInt(document.getElementById('itemReorderPoint').value) || 0;
    const itemStock = parseInt(document.getElementById('itemStock').value) || 0;
    
    if (!itemNo || !itemDescription || !itemType) {
        showNotification('Please fill in all required fields (Item No., Description, Type)', 'error');
        return;
    }
    
    const duplicate = appState.items.find(item => item.itemNo === itemNo);
    if (duplicate) {
        showNotification('Item number already exists', 'error');
        return;
    }
    
    const newItem = {
        id: generateId(),
        itemNo,
        description: itemDescription,
        type: itemType,
        category: itemCategory || 'Uncategorized',
        unitPrice: itemPrice,
        uom: itemUOM,
        reorderPoint: itemReorderPoint,
        stock: itemStock,
        status: itemStock <= itemReorderPoint ? 'Low Stock' : 'Active',
        createdAt: new Date().toISOString()
    };
    
    appState.items.push(newItem);
    
    // Clear form
    document.getElementById('itemNo').value = '';
    document.getElementById('itemDescription').value = '';
    document.getElementById('itemType').value = '';
    document.getElementById('itemCategory').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemReorderPoint').value = '';
    document.getElementById('itemStock').value = '';
    
    renderItemsTable();
    updateStatistics();
    saveToLocalStorage();
    
    showNotification('Item added successfully', 'success');
}

function renderItemsTable() {
    const tbody = document.getElementById('itemsTableBody');
    const countElement = document.getElementById('itemCount');
    
    if (appState.items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                    No items configured yet. Add your first item above.
                </td>
            </tr>
        `;
        if (countElement) countElement.textContent = '0';
        return;
    }
    
    if (countElement) countElement.textContent = appState.items.length;
    
    tbody.innerHTML = appState.items.map(item => `
        <tr class="table-row border-b">
            <td class="px-4 py-3 font-mono text-sm">${item.itemNo}</td>
            <td class="px-4 py-3">${item.description}</td>
            <td class="px-4 py-3">
                <span class="badge badge-success">${item.type}</span>
            </td>
            <td class="px-4 py-3 text-sm">${item.category}</td>
            <td class="px-4 py-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
            <td class="px-4 py-3 text-right font-mono">${item.stock} ${item.uom}</td>
            <td class="px-4 py-3">
                <span class="badge ${item.status === 'Low Stock' ? 'badge-warning' : 'badge-success'}">${item.status}</span>
            </td>
            <td class="px-4 py-3 text-center">
                <button onclick="deleteItem('${item.id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        appState.items = appState.items.filter(item => item.id !== id);
        renderItemsTable();
        updateStatistics();
        saveToLocalStorage();
        showNotification('Item deleted', 'success');
    }
}

// ============= TEMPLATES MODULE =============
function loadPredefinedTemplates() {
    appState.templates.retail = {
        name: 'Retail Business',
        description: 'Pre-configured setup for retail operations',
        accounts: [
            { number: '1000', name: 'Cash', type: 'Asset', category: 'Current Assets', currency: 'SZL' },
            { number: '1100', name: 'Accounts Receivable', type: 'Asset', category: 'Current Assets', currency: 'SZL' },
            { number: '1200', name: 'Inventory', type: 'Asset', category: 'Current Assets', currency: 'SZL' },
            { number: '1500', name: 'Equipment', type: 'Asset', category: 'Fixed Assets', currency: 'SZL' },
            { number: '2000', name: 'Accounts Payable', type: 'Liability', category: 'Current Liabilities', currency: 'SZL' },
            { number: '3000', name: 'Owner Equity', type: 'Equity', category: 'Equity', currency: 'SZL' },
            { number: '4000', name: 'Sales Revenue', type: 'Revenue', category: 'Operating Revenue', currency: 'SZL' },
            { number: '5000', name: 'Cost of Goods Sold', type: 'Expense', category: 'Operating Expenses', currency: 'SZL' },
            { number: '6000', name: 'Rent Expense', type: 'Expense', category: 'Operating Expenses', currency: 'SZL' },
            { number: '6100', name: 'Utilities Expense', type: 'Expense', category: 'Operating Expenses', currency: 'SZL' }
        ],
        customers: [
            { partnerId: 'CUST001', name: 'ABC Retailers', contact: 'John Smith', email: 'sdingokunene@gmail.com', paymentTerms: 'Net 30' },
            { partnerId: 'CUST002', name: 'XYZ Store', contact: 'Sarah Jones', email: 'Phiwokuuhle@xyz.com', paymentTerms: 'Net 30' }
        ],
        items: [
            { itemNo: 'PROD001', description: 'Widget A', type: 'Inventory', category: 'Electronics', unitPrice: 25.00, uom: 'PCS', reorderPoint: 10, stock: 50 },
            { itemNo: 'PROD002', description: 'Widget B', type: 'Inventory', category: 'Electronics', unitPrice: 45.00, uom: 'PCS', reorderPoint: 5, stock: 30 }
        ]
    };
    
    appState.templates.manufacturing = {
        name: 'Manufacturing Business',
        description: 'Pre-configured setup for manufacturing operations',
        accounts: [
            { number: '1000', name: 'Cash', type: 'Asset', category: 'Current Assets', currency: 'SZL' },
            { number: '1200', name: 'Raw Materials', type: 'Asset', category: 'Current Assets', currency: 'SZL' },
            { number: '1210', name: 'Work in Progress', type: 'Asset', category: 'Current Assets', currency: 'SZL' },
            { number: '1220', name: 'Finished Goods', type: 'Asset', category: 'Current Assets', currency: 'SZL' },
            { number: '1500', name: 'Machinery', type: 'Asset', category: 'Fixed Assets', currency: 'SZL' },
            { number: '2000', name: 'Accounts Payable', type: 'Liability', category: 'Current Liabilities', currency: 'SZL' },
            { number: '3000', name: 'Owner Equity', type: 'Equity', category: 'Equity', currency: 'SZL' },
            { number: '4000', name: 'Sales Revenue', type: 'Revenue', category: 'Operating Revenue', currency: 'SZL' },
            { number: '5000', name: 'Direct Labor', type: 'Expense', category: 'Operating Expenses', currency: 'SZL' },
            { number: '5100', name: 'Manufacturing Overhead', type: 'Expense', category: 'Operating Expenses', currency: 'SZL' }
        ],
        customers: [
            { partnerId: 'CUST001', name: 'Industrial Supply Co', contact: 'Mike Chen', email: 'mike@industrial.com', paymentTerms: 'Net 60' }
        ],
        vendors: [
            { partnerId: 'VEND001', name: 'Raw Materials Supplier', contact: 'Lisa Wang', email: 'lisa@supplier.com', paymentTerms: 'Net 30' }
        ],
        items: [
            { itemNo: 'RM001', description: 'Steel Sheet', type: 'Inventory', category: 'Raw Materials', unitPrice: 150.00, uom: 'KG', reorderPoint: 100, stock: 500 },
            { itemNo: 'FG001', description: 'Finished Product A', type: 'Inventory', category: 'Finished Goods', unitPrice: 500.00, uom: 'PCS', reorderPoint: 10, stock: 25 }
        ]
    };
    
    appState.templates.services = {
        name: 'Service Business',
        description: 'Pre-configured setup for service-based operations',
        accounts: [
            { number: '1000', name: 'Cash', type: 'Asset', category: 'Current Assets', currency: 'SZL' },
            { number: '1100', name: 'Accounts Receivable', type: 'Asset', category: 'Current Assets', currency: 'SZL' },
            { number: '1500', name: 'Office Equipment', type: 'Asset', category: 'Fixed Assets', currency: 'SZL' },
            { number: '2000', name: 'Accounts Payable', type: 'Liability', category: 'Current Liabilities', currency: 'SZL' },
            { number: '3000', name: 'Owner Equity', type: 'Equity', category: 'Equity', currency: 'SZL' },
            { number: '4000', name: 'Service Revenue', type: 'Revenue', category: 'Operating Revenue', currency: 'SZL' },
            { number: '5000', name: 'Consulting Fees', type: 'Expense', category: 'Operating Expenses', currency: 'SZL' },
            { number: '6000', name: 'Office Rent', type: 'Expense', category: 'Operating Expenses', currency: 'SZL' }
        ],
        customers: [
            { partnerId: 'CUST001', name: 'Tech Startup Inc', contact: 'Emily Davis', email: 'emily@techstartup.com', paymentTerms: 'Net 30' },
            { partnerId: 'CUST002', name: 'Global Consulting', contact: 'David Brown', email: 'david@global.com', paymentTerms: 'Due on Receipt' }
        ],
        items: [
            { itemNo: 'SRV001', description: 'Consulting Hour', type: 'Service', category: 'Services', unitPrice: 150.00, uom: 'HR', reorderPoint: 0, stock: 0 },
            { itemNo: 'SRV002', description: 'Training Session', type: 'Service', category: 'Services', unitPrice: 500.00, uom: 'HR', reorderPoint: 0, stock: 0 }
        ]
    };
}

function initializeTemplatesTab() {
    const content = document.getElementById('contentTemplates');
    content.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Configuration Templates</h2>
            <p class="text-gray-600">Quick start with pre-built templates or save your own</p>
        </div>
        
        <!-- Template Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <!-- Retail Template -->
            <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div class="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <i class="fas fa-store text-blue-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Retail Business</h3>
                <p class="text-gray-600 text-sm mb-4">Complete setup for retail operations including inventory management</p>
                <div class="text-sm text-gray-500 mb-4">
                    <div><i class="fas fa-check text-green-600 mr-2"></i> 10 Chart of Accounts</div>
                    <div><i class="fas fa-check text-green-600 mr-2"></i> 2 Sample Customers</div>
                    <div><i class="fas fa-check text-green-600 mr-2"></i> 2 Sample Items</div>
                </div>
                <button onclick="applyTemplate('retail')" class="w-full btn-primary px-4 py-2 rounded-lg font-semibold">
                    <i class="fas fa-download mr-2"></i> Apply Template
                </button>
            </div>
            
            <!-- Manufacturing Template -->
            <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div class="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <i class="fas fa-industry text-purple-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Manufacturing</h3>
                <p class="text-gray-600 text-sm mb-4">Setup for manufacturing with production tracking and materials</p>
                <div class="text-sm text-gray-500 mb-4">
                    <div><i class="fas fa-check text-green-600 mr-2"></i> 10 Chart of Accounts</div>
                    <div><i class="fas fa-check text-green-600 mr-2"></i> 1 Customer, 1 Vendor</div>
                    <div><i class="fas fa-check text-green-600 mr-2"></i> 2 Sample Items</div>
                </div>
                <button onclick="applyTemplate('manufacturing')" class="w-full btn-primary px-4 py-2 rounded-lg font-semibold">
                    <i class="fas fa-download mr-2"></i> Apply Template
                </button>
            </div>
            
            <!-- Services Template -->
            <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div class="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <i class="fas fa-hands-helping text-green-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Service Business</h3>
                <p class="text-gray-600 text-sm mb-4">Setup for service-based businesses with time tracking</p>
                <div class="text-sm text-gray-500 mb-4">
                    <div><i class="fas fa-check text-green-600 mr-2"></i> 8 Chart of Accounts</div>
                    <div><i class="fas fa-check text-green-600 mr-2"></i> 2 Sample Customers</div>
                    <div><i class="fas fa-check text-green-600 mr-2"></i> 2 Service Items</div>
                </div>
                <button onclick="applyTemplate('services')" class="w-full btn-primary px-4 py-2 rounded-lg font-semibold">
                    <i class="fas fa-download mr-2"></i> Apply Template
                </button>
            </div>
        </div>
        
        <!-- Custom Template Actions -->
        <div class="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-6 text-white">
            <h3 class="text-xl font-bold mb-2">Save Current Configuration</h3>
            <p class="mb-4 opacity-90">Save your current setup as a custom template for future use</p>
            <div class="flex gap-4">
                <button onclick="saveCustomTemplate()" class="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">
                    <i class="fas fa-save mr-2"></i> Save as Template
                </button>
                <button onclick="clearAllData()" class="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700">
                    <i class="fas fa-trash mr-2"></i> Clear All Data
                </button>
            </div>
        </div>
    `;
}

function applyTemplate(templateName) {
    if (!confirm(`This will replace your current configuration with the ${templateName} template. Continue?`)) {
        return;
    }
    
    const template = appState.templates[templateName];
    if (!template) {
        showNotification('Template not found', 'error');
        return;
    }
    
    // Clear existing data
    appState.chartOfAccounts = [];
    appState.customers = [];
    appState.vendors = [];
    appState.items = [];
    
    // Apply template accounts
    template.accounts.forEach(acc => {
        appState.chartOfAccounts.push({
            id: generateId(),
            number: acc.number,
            name: acc.name,
            type: acc.type,
            category: acc.category,
            currency: acc.currency,
            status: 'Active',
            createdAt: new Date().toISOString()
        });
    });
    
    // Apply template customers
    if (template.customers) {
        template.customers.forEach(cust => {
            appState.customers.push({
                id: generateId(),
                partnerId: cust.partnerId,
                name: cust.name,
                contact: cust.contact,
                email: cust.email,
                phone: '',
                paymentTerms: cust.paymentTerms,
                address: '',
                status: 'Active',
                type: 'customer',
                createdAt: new Date().toISOString()
            });
        });
    }
    
    // Apply template vendors
    if (template.vendors) {
        template.vendors.forEach(vend => {
            appState.vendors.push({
                id: generateId(),
                partnerId: vend.partnerId,
                name: vend.name,
                contact: vend.contact,
                email: vend.email,
                phone: '',
                paymentTerms: vend.paymentTerms,
                address: '',
                status: 'Active',
                type: 'vendor',
                createdAt: new Date().toISOString()
            });
        });
    }
    
    // Apply template items
    template.items.forEach(item => {
        appState.items.push({
            id: generateId(),
            itemNo: item.itemNo,
            description: item.description,
            type: item.type,
            category: item.category,
            unitPrice: item.unitPrice,
            uom: item.uom,
            reorderPoint: item.reorderPoint,
            stock: item.stock,
            status: item.stock <= item.reorderPoint ? 'Low Stock' : 'Active',
            createdAt: new Date().toISOString()
        });
    });
    
    // Update all views
    renderAccountsTable();
    renderPartnersTable();
    renderItemsTable();
    updateStatistics();
    saveToLocalStorage();
    
    showNotification(`${template.name} template applied successfully!`, 'success');
}

function saveCustomTemplate() {
    if (appState.chartOfAccounts.length === 0 && appState.customers.length === 0 && appState.items.length === 0) {
        showNotification('No data to save. Configure some accounts, customers, or items first.', 'warning');
        return;
    }
    
    const templateData = {
        name: 'Custom Template',
        savedAt: new Date().toISOString(),
        accounts: appState.chartOfAccounts,
        customers: appState.customers,
        vendors: appState.vendors,
        items: appState.items
    };
    
    const dataStr = JSON.stringify(templateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `configmaster-template-${Date.now()}.json`;
    link.click();
    
    showNotification('Template exported successfully!', 'success');
}

function clearAllData() {
    if (!confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
        return;
    }
    
    if (!confirm('FINAL WARNING: This will delete all accounts, customers, vendors, and items. Continue?')) {
        return;
    }
    
    appState.chartOfAccounts = [];
    appState.customers = [];
    appState.vendors = [];
    appState.items = [];
    appState.validationIssues = [];
    
    localStorage.removeItem('configmaster_data');
    
    renderAccountsTable();
    renderPartnersTable();
    renderItemsTable();
    updateStatistics();
    
    showNotification('All data cleared', 'success');
}

// ============= VALIDATION ENGINE =============
function validateAll() {
    appState.validationIssues = [];
    
    // Validate Chart of Accounts
    validateChartOfAccounts();
    
    // Validate Customers/Vendors
    validatePartners();
    
    // Validate Items
    validateItems();
    
    // Display results
    displayValidationResults();
    
    updateStatistics();
}

function validateChartOfAccounts() {
    const accounts = appState.chartOfAccounts;
    
    // Check for duplicate account numbers
    const accountNumbers = accounts.map(acc => acc.number);
    const duplicates = accountNumbers.filter((item, index) => accountNumbers.indexOf(item) !== index);
    
    duplicates.forEach(dup => {
        appState.validationIssues.push({
            type: 'error',
            module: 'Chart of Accounts',
            message: `Duplicate account number: ${dup}`,
            severity: 'high'
        });
    });
    
    // Check for missing required fields
    accounts.forEach(acc => {
        if (!acc.type) {
            appState.validationIssues.push({
                type: 'error',
                module: 'Chart of Accounts',
                message: `Account ${acc.number} - ${acc.name} is missing account type`,
                severity: 'high'
            });
        }
    });
    
    // Check if basic accounts exist
    const hasAsset = accounts.some(acc => acc.type === 'Asset');
    const hasLiability = accounts.some(acc => acc.type === 'Liability');
    const hasEquity = accounts.some(acc => acc.type === 'Equity');
    const hasRevenue = accounts.some(acc => acc.type === 'Revenue');
    const hasExpense = accounts.some(acc => acc.type === 'Expense');
    
    if (!hasAsset) {
        appState.validationIssues.push({
            type: 'warning',
            module: 'Chart of Accounts',
            message: 'No Asset accounts configured. You should add at least one Asset account.',
            severity: 'medium'
        });
    }
    
    if (!hasRevenue) {
        appState.validationIssues.push({
            type: 'warning',
            module: 'Chart of Accounts',
            message: 'No Revenue accounts configured. Add revenue accounts for sales tracking.',
            severity: 'medium'
        });
    }
}

function validatePartners() {
    const allPartners = [...appState.customers, ...appState.vendors];
    
    // Check for duplicate partner IDs
    const partnerIds = allPartners.map(p => p.partnerId);
    const duplicates = partnerIds.filter((item, index) => partnerIds.indexOf(item) !== index);
    
    duplicates.forEach(dup => {
        appState.validationIssues.push({
            type: 'error',
            module: 'Customers/Vendors',
            message: `Duplicate partner ID: ${dup}`,
            severity: 'high'
        });
    });
    
    // Check for missing email on customers
    appState.customers.forEach(cust => {
        if (!cust.email) {
            appState.validationIssues.push({
                type: 'warning',
                module: 'Customers',
                message: `Customer ${cust.name} has no email address`,
                severity: 'low'
            });
        }
    });
}

function validateItems() {
    const items = appState.items;
    
    // Check for duplicate item numbers
    const itemNos = items.map(item => item.itemNo);
    const duplicates = itemNos.filter((item, index) => itemNos.indexOf(item) !== index);
    
    duplicates.forEach(dup => {
        appState.validationIssues.push({
            type: 'error',
            module: 'Items',
            message: `Duplicate item number: ${dup}`,
            severity: 'high'
        });
    });
    
    // Check for low stock items
    items.forEach(item => {
        if (item.type === 'Inventory' && item.stock <= item.reorderPoint) {
            appState.validationIssues.push({
                type: 'warning',
                module: 'Items',
                message: `Item ${item.itemNo} - ${item.description} is at or below reorder point (Stock: ${item.stock}, Reorder: ${item.reorderPoint})`,
                severity: 'medium'
            });
        }
    });
    
    // Check for items with no price
    items.forEach(item => {
        if (!item.unitPrice || item.unitPrice === 0) {
            appState.validationIssues.push({
                type: 'warning',
                module: 'Items',
                message: `Item ${item.itemNo} - ${item.description} has no unit price set`,
                severity: 'medium'
            });
        }
    });
}

function displayValidationResults() {
    const modalHTML = `
        <div class="modal active" id="validationModal" onclick="closeValidationModal(event)">
            <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden" onclick="event.stopPropagation()">
                <div class="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                    <h2 class="text-2xl font-bold flex items-center gap-2">
                        <i class="fas fa-check-circle"></i>
                        Validation Results
                    </h2>
                </div>
                
                <div class="p-6 overflow-y-auto max-h-[60vh]">
                    ${appState.validationIssues.length === 0 ? `
                        <div class="text-center py-12">
                            <i class="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
                            <h3 class="text-2xl font-bold text-gray-800 mb-2">Perfect Configuration!</h3>
                            <p class="text-gray-600">No validation issues found. Your ERP configuration is ready to use.</p>
                        </div>
                    ` : `
                        <div class="space-y-4">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <span class="text-red-600 font-semibold">
                                        ${appState.validationIssues.filter(i => i.type === 'error').length} Errors
                                    </span>
                                    <span class="mx-2">|</span>
                                    <span class="text-yellow-600 font-semibold">
                                        ${appState.validationIssues.filter(i => i.type === 'warning').length} Warnings
                                    </span>
                                </div>
                            </div>
                            
                            ${appState.validationIssues.map(issue => `
                                <div class="${issue.type === 'error' ? 'alert-error' : 'alert-warning'} p-4 rounded-lg">
                                    <div class="flex items-start gap-3">
                                        <i class="fas fa-${issue.type === 'error' ? 'times-circle' : 'exclamation-triangle'} text-lg mt-1"></i>
                                        <div class="flex-1">
                                            <div class="font-semibold mb-1">${issue.module}</div>
                                            <div class="text-sm">${issue.message}</div>
                                        </div>
                                        <span class="badge ${issue.severity === 'high' ? 'badge-error' : issue.severity === 'medium' ? 'badge-warning' : 'badge-success'}">
                                            ${issue.severity}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
                
                <div class="p-6 border-t flex justify-end gap-4">
                    <button onclick="closeValidationModal()" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">
                        Close
                    </button>
                    ${appState.validationIssues.length> 0 ? `
                        <button onclick="exportValidationReport()" class="px-6 py-2 btn-primary rounded-lg font-semibold">
                            <i class="fas fa-download mr-2"></i> Export Report
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('validationModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeValidationModal(event) {
    if (event && event.target.id !== 'validationModal') return;
    const modal = document.getElementById('validationModal');
    if (modal) modal.remove();
}

function exportValidationReport() {
    const report = {
        generatedAt: new Date().toISOString(),
        totalIssues: appState.validationIssues.length,
        errors: appState.validationIssues.filter(i => i.type === 'error').length,
        warnings: appState.validationIssues.filter(i => i.type === 'warning').length,
        issues: appState.validationIssues
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `validation-report-${Date.now()}.json`;
    link.click();
    
    showNotification('Validation report exported', 'success');
}

// ============= TEST DATA GENERATOR =============
function generateTestData() {
    if (appState.chartOfAccounts.length === 0 && appState.customers.length === 0 && appState.items.length === 0) {
        showNotification('Please configure at least some accounts, customers, or items first', 'warning');
        return;
    }
    
    let generatedCount = 0;
    
    // Generate test accounts if less than 5
    if (appState.chartOfAccounts.length < 5) {
        const testAccounts = [
            { number: '1010', name: 'Petty Cash', type: 'Asset', category: 'Current Assets', currency: 'SZL' },
            { number: '1300', name: 'Prepaid Expenses', type: 'Asset', category: 'Current Assets', currency: 'SZL' },
            { number: '2100', name: 'Sales Tax Payable', type: 'Liability', category: 'Current Liabilities', currency: 'SZL' },
            { number: '4100', name: 'Service Income', type: 'Revenue', category: 'Operating Revenue', currency: 'SZL' },
            { number: '6200', name: 'Marketing Expense', type: 'Expense', category: 'Operating Expenses', currency: 'SZL' }
        ];
        
        testAccounts.forEach(acc => {
            const exists = appState.chartOfAccounts.find(a => a.number === acc.number);
            if (!exists) {
                appState.chartOfAccounts.push({
                    id: generateId(),
                    number: acc.number,
                    name: acc.name,
                    type: acc.type,
                    category: acc.category,
                    currency: acc.currency,
                    status: 'Active',
                    createdAt: new Date().toISOString()
                });
                generatedCount++;
            }
        });
    }
    
    // Generate test customers if less than 3
    if (appState.customers.length < 3) {
        const testCustomers = [
            { partnerId: 'TEST001', name: 'Test Customer A', contact: 'Alice Johnson', email: 'alice@testcust.com', phone: '+1234567890', paymentTerms: 'Net 30' },
            { partnerId: 'TEST002', name: 'Test Customer B', contact: 'Bob Smith', email: 'bob@testcust.com', phone: '+1234567891', paymentTerms: 'Net 60' },
            { partnerId: 'TEST003', name: 'Test Customer C', contact: 'Carol White', email: 'carol@testcust.com', phone: '+1234567892', paymentTerms: 'Due on Receipt' }
        ];
        
        testCustomers.forEach(cust => {
            const exists = appState.customers.find(c => c.partnerId === cust.partnerId);
            if (!exists) {
                appState.customers.push({
                    id: generateId(),
                    partnerId: cust.partnerId,
                    name: cust.name,
                    contact: cust.contact,
                    email: cust.email,
                    phone: cust.phone,
                    paymentTerms: cust.paymentTerms,
                    address: '123 Test Street, Test City',
                    status: 'Active',
                    type: 'customer',
                    createdAt: new Date().toISOString()
                });
                generatedCount++;
            }
        });
    }
    
    // Generate test items if less than 3
    if (appState.items.length < 3) {
        const testItems = [
            { itemNo: 'TEST001', description: 'Test Product A', type: 'Inventory', category: 'Electronics', unitPrice: 99.99, uom: 'PCS', reorderPoint: 10, stock: 50 },
            { itemNo: 'TEST002', description: 'Test Product B', type: 'Inventory', category: 'Furniture', unitPrice: 299.99, uom: 'PCS', reorderPoint: 5, stock: 20 },
            { itemNo: 'TESTSRV01', description: 'Test Service', type: 'Service', category: 'Services', unitPrice: 150.00, uom: 'HR', reorderPoint: 0, stock: 0 }
        ];
        
        testItems.forEach(item => {
            const exists = appState.items.find(i => i.itemNo === item.itemNo);
            if (!exists) {
                appState.items.push({
                    id: generateId(),
                    itemNo: item.itemNo,
                    description: item.description,
                    type: item.type,
                    category: item.category,
                    unitPrice: item.unitPrice,
                    uom: item.uom,
                    reorderPoint: item.reorderPoint,
                    stock: item.stock,
                    status: item.stock <= item.reorderPoint ? 'Low Stock' : 'Active',
                    createdAt: new Date().toISOString()
                });
                generatedCount++;
            }
        });
    }
    
    if (generatedCount === 0) {
        showNotification('You already have sufficient test data', 'warning');
        return;
    }
    
    // Update all views
    renderAccountsTable();
    renderPartnersTable();
    renderItemsTable();
    updateStatistics();
    saveToLocalStorage();
    
    showNotification(`Generated ${generatedCount} test entries successfully!`, 'success');
}

// ============= EXPORT TO EXCEL =============
function exportToExcel() {
    if (appState.chartOfAccounts.length === 0 && appState.customers.length === 0 && appState.items.length === 0) {
        showNotification('No data to export. Add some configuration first.', 'warning');
        return;
    }
    
    try {
        const wb = XLSX.utils.book_new();
        
        // Chart of Accounts Sheet
        if (appState.chartOfAccounts.length > 0) {
            const accountsData = appState.chartOfAccounts.map(acc => ({
                'Account Number': acc.number,
                'Account Name': acc.name,
                'Type': acc.type,
                'Category': acc.category,
                'Currency': acc.currency,
                'Status': acc.status
            }));
            const ws1 = XLSX.utils.json_to_sheet(accountsData);
            XLSX.utils.book_append_sheet(wb, ws1, 'Chart of Accounts');
        }
        
        // Customers Sheet
        if (appState.customers.length > 0) {
            const customersData = appState.customers.map(cust => ({
                'Customer ID': cust.partnerId,
                'Name': cust.name,
                'Contact Person': cust.contact,
                'Email': cust.email,
                'Phone': cust.phone,
                'Payment Terms': cust.paymentTerms,
                'Address': cust.address,
                'Status': cust.status
            }));
            const ws2 = XLSX.utils.json_to_sheet(customersData);
            XLSX.utils.book_append_sheet(wb, ws2, 'Customers');
        }
        
        // Vendors Sheet
        if (appState.vendors.length > 0) {
            const vendorsData = appState.vendors.map(vend => ({
                'Vendor ID': vend.partnerId,
                'Name': vend.name,
                'Contact Person': vend.contact,
                'Email': vend.email,
                'Phone': vend.phone,
                'Payment Terms': vend.paymentTerms,
                'Address': vend.address,
                'Status': vend.status
            }));
            const ws3 = XLSX.utils.json_to_sheet(vendorsData);
            XLSX.utils.book_append_sheet(wb, ws3, 'Vendors');
        }
        
        // Items Sheet
        if (appState.items.length > 0) {
            const itemsData = appState.items.map(item => ({
                'Item Number': item.itemNo,
                'Description': item.description,
                'Type': item.type,
                'Category': item.category,
                'Unit Price': item.unitPrice,
                'UOM': item.uom,
                'Reorder Point': item.reorderPoint,
                'Stock': item.stock,
                'Status': item.status
            }));
            const ws4 = XLSX.utils.json_to_sheet(itemsData);
            XLSX.utils.book_append_sheet(wb, ws4, 'Items');
        }
        
        // Summary Sheet
        const summaryData = [
            { 'Configuration Summary': 'Total Accounts', 'Count': appState.chartOfAccounts.length },
            { 'Configuration Summary': 'Total Customers', 'Count': appState.customers.length },
            { 'Configuration Summary': 'Total Vendors', 'Count': appState.vendors.length },
            { 'Configuration Summary': 'Total Items', 'Count': appState.items.length },
            { 'Configuration Summary': 'Validation Issues', 'Count': appState.validationIssues.length },
            { 'Configuration Summary': 'Export Date', 'Count': new Date().toLocaleString() }
        ];
        const wsSummary = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
        
        // Generate filename
        const fileName = `ConfigMaster-Export-${new Date().toISOString().slice(0, 10)}.xlsx`;
        
        // Write file
        XLSX.writeFile(wb, fileName);
        
        showNotification('Configuration exported to Excel successfully!', 'success');
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        showNotification('Error exporting to Excel', 'error');
    }
}

// ============= EXPORT TO PDF =============
function exportToPDF() {
    if (appState.chartOfAccounts.length === 0 && appState.customers.length === 0 && appState.items.length === 0) {
        showNotification('No data to export. Add some configuration first.', 'warning');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let yPos = 20;
        
        // Title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('ERP Configuration Documentation', 20, yPos);
        
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos);
        
        yPos += 15;
        
        // Summary Section
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Configuration Summary', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Total Accounts: ${appState.chartOfAccounts.length}`, 30, yPos);
        yPos += 7;
        doc.text(`Total Customers: ${appState.customers.length}`, 30, yPos);
        yPos += 7;
        doc.text(`Total Vendors: ${appState.vendors.length}`, 30, yPos);
        yPos += 7;
        doc.text(`Total Items: ${appState.items.length}`, 30, yPos);
        yPos += 7;
        doc.text(`Validation Issues: ${appState.validationIssues.length}`, 30, yPos);
        
        yPos += 15;
        
        // Chart of Accounts Section
        if (appState.chartOfAccounts.length > 0) {
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Chart of Accounts', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            
            appState.chartOfAccounts.slice(0, 15).forEach(acc => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`${acc.number} - ${acc.name} (${acc.type})`, 30, yPos);
                yPos += 6;
            });
            
            if (appState.chartOfAccounts.length > 15) {
                doc.text(`... and ${appState.chartOfAccounts.length - 15} more accounts`, 30, yPos);
                yPos += 10;
            }
        }
        
        yPos += 10;
        
        // Customers Section
        if (appState.customers.length > 0) {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Customers', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            
            appState.customers.slice(0, 10).forEach(cust => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`${cust.partnerId} - ${cust.name} (${cust.email || 'No email'})`, 30, yPos);
                yPos += 6;
            });
            
            if (appState.customers.length > 10) {
                doc.text(`... and ${appState.customers.length - 10} more customers`, 30, yPos);
                yPos += 10;
            }
        }
        
        yPos += 10;
        
        // Items Section
        if (appState.items.length > 0) {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Items', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            
            appState.items.slice(0, 10).forEach(item => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`${item.itemNo} - ${item.description} ($${item.unitPrice.toFixed(2)})`, 30, yPos);
                yPos += 6;
            });
            
            if (appState.items.length > 10) {
                doc.text(`... and ${appState.items.length - 10} more items`, 30, yPos);
            }
        }
        
        // Footer on each page
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont(undefined, 'italic');
            doc.text(`ConfigMaster Pro - Page ${i} of ${pageCount}`, 20, 285);
        }
        
        // Generate filename
        const fileName = `ConfigMaster-Documentation-${new Date().toISOString().slice(0, 10)}.pdf`;
        
        // Save PDF
        doc.save(fileName);
        
        showNotification('Documentation exported to PDF successfully!', 'success');
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        showNotification('Error exporting to PDF. Make sure jsPDF is loaded.', 'error');
    }
}

// ============= APPLICATION READY =============
console.log('🚀 ConfigMaster Pro - Fully Loaded and Ready!');
console.log('📊 All modules initialized successfully');