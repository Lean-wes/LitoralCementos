// Sistema de gestión para Ferretería Litoral
// Almacenamiento local de datos
class DataManager {
    constructor() {
        this.categories = this.loadData('categories', [
            { id: 1, name: 'Herramientas', description: 'Herramientas manuales y eléctricas' },
            { id: 2, name: 'Construcción', description: 'Materiales de construcción' },
            { id: 3, name: 'Plomería', description: 'Productos de plomería' },
            { id: 4, name: 'Eléctrico', description: 'Materiales eléctricos' },
            { id: 5, name: 'Pintura', description: 'Pinturas y accesorios' }
        ]);
        this.products = this.loadData('products', []);
        this.sales = this.loadData('sales', []);
        this.expenses = this.loadData('expenses', []);
        this.currentId = {
            product: this.loadData('currentProductId', 1),
            sale: this.loadData('currentSaleId', 1),
            expense: this.loadData('currentExpenseId', 1)
        };
    }

    loadData(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return defaultValue;
        }
    }

    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
        }
    }

    // Métodos para categorías
    getCategories() {
        return this.categories;
    }

    // Métodos para productos
    getProducts() {
        return this.products.map(product => ({
            ...product,
            category: this.categories.find(cat => cat.id === product.categoryId)
        }));
    }

    addProduct(productData) {
        const product = {
            id: this.currentId.product++,
            ...productData,
            createdAt: new Date().toISOString()
        };
        this.products.push(product);
        this.saveData('products', this.products);
        this.saveData('currentProductId', this.currentId.product);
        return product;
    }

    updateProduct(id, updates) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updates };
            this.saveData('products', this.products);
            return this.products[index];
        }
        return null;
    }

    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveData('products', this.products);
    }

    getLowStockProducts() {
        return this.getProducts().filter(product => 
            product.stock <= (product.minStock || 5)
        );
    }

    // Métodos para ventas
    getSales() {
        return this.sales.map(sale => ({
            ...sale,
            items: sale.items.map(item => ({
                ...item,
                product: this.products.find(p => p.id === item.productId)
            }))
        }));
    }

    addSale(saleData, items) {
        const sale = {
            id: this.currentId.sale++,
            ...saleData,
            date: new Date().toISOString(),
            items: items.map(item => ({
                id: Math.random().toString(36).substr(2, 9),
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.quantity * item.unitPrice
            }))
        };

        // Actualizar stock de productos
        items.forEach(item => {
            const product = this.products.find(p => p.id === item.productId);
            if (product) {
                product.stock -= item.quantity;
            }
        });

        this.sales.push(sale);
        this.saveData('sales', this.sales);
        this.saveData('products', this.products);
        this.saveData('currentSaleId', this.currentId.sale);
        return sale;
    }

    // Métodos para gastos
    getExpenses() {
        return this.expenses;
    }

    addExpense(expenseData) {
        const expense = {
            id: this.currentId.expense++,
            ...expenseData,
            date: new Date().toISOString()
        };
        this.expenses.push(expense);
        this.saveData('expenses', this.expenses);
        this.saveData('currentExpenseId', this.currentId.expense);
        return expense;
    }

    updateExpense(id, updates) {
        const index = this.expenses.findIndex(e => e.id === id);
        if (index !== -1) {
            this.expenses[index] = { ...this.expenses[index], ...updates };
            this.saveData('expenses', this.expenses);
            return this.expenses[index];
        }
        return null;
    }

    deleteExpense(id) {
        this.expenses = this.expenses.filter(e => e.id !== id);
        this.saveData('expenses', this.expenses);
    }

    // Métodos para reportes
    getDashboardMetrics() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlySales = this.sales
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
            })
            .reduce((total, sale) => total + parseFloat(sale.total), 0);

        const monthlyExpenses = this.expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((total, expense) => total + parseFloat(expense.amount), 0);

        return {
            monthlySales,
            totalProducts: this.products.length,
            monthlyExpenses,
            netProfit: monthlySales - monthlyExpenses,
            lowStockCount: this.getLowStockProducts().length
        };
    }

    getSalesData(months = 6) {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        const salesData = [];
        const currentDate = new Date();
        
        for (let i = months - 1; i >= 0; i--) {
            const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthSales = this.sales
                .filter(sale => {
                    const saleDate = new Date(sale.date);
                    return saleDate.getMonth() === month.getMonth() && 
                           saleDate.getFullYear() === month.getFullYear();
                })
                .reduce((total, sale) => total + parseFloat(sale.total), 0);
            
            salesData.push({
                month: monthNames[month.getMonth()],
                sales: monthSales
            });
        }
        
        return salesData;
    }

    getCategorySalesData() {
        const categoryTotals = {};
        let totalSales = 0;

        this.sales.forEach(sale => {
            sale.items.forEach(item => {
                const product = this.products.find(p => p.id === item.productId);
                if (product) {
                    const category = this.categories.find(c => c.id === product.categoryId);
                    if (category) {
                        categoryTotals[category.name] = (categoryTotals[category.name] || 0) + item.subtotal;
                        totalSales += item.subtotal;
                    }
                }
            });
        });

        return Object.entries(categoryTotals).map(([category, sales]) => ({
            category,
            percentage: totalSales > 0 ? Math.round((sales / totalSales) * 100) : 0
        }));
    }
}

// Sistema de notificaciones
class NotificationManager {
    constructor() {
        this.container = document.getElementById('toastContainer');
    }

    show(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #666;">&times;</button>
            </div>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    }
}

// Aplicación principal
class FerreteriApp {
    constructor() {
        this.dataManager = new DataManager();
        this.notifications = new NotificationManager();
        this.currentPage = 'dashboard';
        this.isAuthenticated = false;
        this.editingProductId = null;
        this.editingExpenseId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showLogin();
    }

    setupEventListeners() {
        // Login
        document.getElementById('loginBtn').addEventListener('click', () => this.login());
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });

        // Botones de modales
        document.getElementById('addProductBtn').addEventListener('click', () => this.openProductModal());
        document.getElementById('addSaleBtn').addEventListener('click', () => this.openSaleModal());
        document.getElementById('addExpenseBtn').addEventListener('click', () => this.openExpenseModal());

        // Formularios
        document.getElementById('productForm').addEventListener('submit', (e) => this.saveProduct(e));
        document.getElementById('saleForm').addEventListener('submit', (e) => this.saveSale(e));
        document.getElementById('expenseForm').addEventListener('submit', (e) => this.saveExpense(e));

        // Cerrar modales
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Búsqueda de productos
        document.getElementById('productSearch').addEventListener('input', (e) => this.filterProducts());
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterProducts());

        // Agregar item de venta
        document.getElementById('addSaleItem').addEventListener('click', () => this.addSaleItem());

        // Generar reporte
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateReport());

        // Cerrar modal al hacer click fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModals();
                }
            });
        });
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').classList.add('hidden');
    }

    login() {
        this.isAuthenticated = true;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').classList.remove('hidden');
        this.loadDashboard();
        this.notifications.show('Bienvenido al sistema de gestión', 'success');
    }

    logout() {
        this.isAuthenticated = false;
        this.showLogin();
        this.notifications.show('Sesión cerrada correctamente', 'success');
    }

    navigateTo(page) {
        // Actualizar navegación activa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Mostrar página
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(`${page}Page`).classList.add('active');

        // Actualizar título
        const titles = {
            dashboard: 'Dashboard',
            inventory: 'Inventario',
            sales: 'Ventas',
            expenses: 'Gastos',
            reports: 'Reportes'
        };
        document.getElementById('pageTitle').textContent = titles[page];

        this.currentPage = page;

        // Cargar datos específicos de la página
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'inventory':
                this.loadInventory();
                break;
            case 'sales':
                this.loadSales();
                break;
            case 'expenses':
                this.loadExpenses();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    loadDashboard() {
        const metrics = this.dataManager.getDashboardMetrics();
        
        document.getElementById('monthlySales').textContent = `$${metrics.monthlySales.toLocaleString()}`;
        document.getElementById('totalProducts').textContent = metrics.totalProducts;
        document.getElementById('monthlyExpenses').textContent = `$${metrics.monthlyExpenses.toLocaleString()}`;
        document.getElementById('netProfit').textContent = `$${metrics.netProfit.toLocaleString()}`;

        this.loadLowStockProducts();
        this.drawSalesChart();
    }

    loadLowStockProducts() {
        const lowStockProducts = this.dataManager.getLowStockProducts();
        const container = document.getElementById('lowStockList');
        
        if (lowStockProducts.length === 0) {
            container.innerHTML = '<div class="no-data">No hay productos con poco stock</div>';
            return;
        }

        container.innerHTML = lowStockProducts.map(product => `
            <div class="low-stock-item">
                <div>
                    <strong>${product.name}</strong><br>
                    <small>Stock: ${product.stock} (Mín: ${product.minStock || 5})</small>
                </div>
                <button class="btn btn-sm btn-primary" onclick="app.openProductModal(${product.id})">
                    Actualizar
                </button>
            </div>
        `).join('');
    }

    drawSalesChart() {
        const salesData = this.dataManager.getSalesData(6);
        const canvas = document.querySelector('#salesChart canvas');
        
        if (!canvas || !window.chartManager) {
            console.warn('Canvas o ChartManager no disponible');
            return;
        }

        // Convertir datos al formato esperado por ChartManager
        const chartData = salesData.map(data => ({
            label: data.month,
            value: data.sales
        }));

        // Usar el ChartManager para dibujar el gráfico
        window.chartManager.animateChart(canvas, 
            (canvas, data) => window.chartManager.drawBarChart(canvas, data),
            chartData, 
            {
                barColor: '#2563eb',
                showValues: true,
                duration: 800
            }
        );
    }

    loadInventory() {
        this.loadCategories();
        this.loadProducts();
    }

    loadCategories() {
        const categories = this.dataManager.getCategories();
        const categoryFilter = document.getElementById('categoryFilter');
        const productCategory = document.getElementById('productCategory');
        
        // Filtro de categorías
        categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
        categories.forEach(category => {
            categoryFilter.innerHTML += `<option value="${category.id}">${category.name}</option>`;
        });

        // Select de categorías en el modal
        productCategory.innerHTML = '<option value="">Seleccionar categoría</option>';
        categories.forEach(category => {
            productCategory.innerHTML += `<option value="${category.id}">${category.name}</option>`;
        });
    }

    loadProducts() {
        const products = this.dataManager.getProducts();
        const tbody = document.getElementById('productsTableBody');
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No hay productos registrados</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => {
            const stockClass = product.stock <= (product.minStock || 5) ? 'stock-low' : 
                             product.stock <= (product.minStock || 5) * 2 ? 'stock-medium' : 'stock-high';
            
            return `
                <tr>
                    <td>${product.sku}</td>
                    <td>${product.name}</td>
                    <td>${product.category ? product.category.name : 'Sin categoría'}</td>
                    <td>$${parseFloat(product.price).toLocaleString()}</td>
                    <td class="${stockClass}">${product.stock}</td>
                    <td>${product.brand || '-'}</td>
                    <td class="table-actions">
                        <button class="btn btn-sm btn-secondary" onclick="app.openProductModal(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    filterProducts() {
        const searchTerm = document.getElementById('productSearch').value.toLowerCase();
        const categoryId = document.getElementById('categoryFilter').value;
        
        let products = this.dataManager.getProducts();
        
        if (searchTerm) {
            products = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.sku.toLowerCase().includes(searchTerm) ||
                (product.brand && product.brand.toLowerCase().includes(searchTerm))
            );
        }
        
        if (categoryId) {
            products = products.filter(product => product.categoryId == categoryId);
        }
        
        const tbody = document.getElementById('productsTableBody');
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No se encontraron productos</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => {
            const stockClass = product.stock <= (product.minStock || 5) ? 'stock-low' : 
                             product.stock <= (product.minStock || 5) * 2 ? 'stock-medium' : 'stock-high';
            
            return `
                <tr>
                    <td>${product.sku}</td>
                    <td>${product.name}</td>
                    <td>${product.category ? product.category.name : 'Sin categoría'}</td>
                    <td>$${parseFloat(product.price).toLocaleString()}</td>
                    <td class="${stockClass}">${product.stock}</td>
                    <td>${product.brand || '-'}</td>
                    <td class="table-actions">
                        <button class="btn btn-sm btn-secondary" onclick="app.openProductModal(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openProductModal(productId = null) {
        this.editingProductId = productId;
        const modal = document.getElementById('productModal');
        const form = document.getElementById('productForm');
        const title = document.getElementById('productModalTitle');
        
        form.reset();
        
        if (productId) {
            title.textContent = 'Editar Producto';
            const product = this.dataManager.getProducts().find(p => p.id === productId);
            if (product) {
                document.getElementById('productSku').value = product.sku;
                document.getElementById('productName').value = product.name;
                document.getElementById('productDescription').value = product.description || '';
                document.getElementById('productCategory').value = product.categoryId;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productStock').value = product.stock;
                document.getElementById('productMinStock').value = product.minStock || 5;
                document.getElementById('productBrand').value = product.brand || '';
            }
        } else {
            title.textContent = 'Agregar Producto';
        }
        
        modal.classList.add('active');
    }

    saveProduct(e) {
        e.preventDefault();
        
        const formData = {
            sku: document.getElementById('productSku').value,
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            categoryId: parseInt(document.getElementById('productCategory').value),
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            minStock: parseInt(document.getElementById('productMinStock').value) || 5,
            brand: document.getElementById('productBrand').value
        };

        if (this.editingProductId) {
            this.dataManager.updateProduct(this.editingProductId, formData);
            this.notifications.show('Producto actualizado correctamente', 'success');
        } else {
            this.dataManager.addProduct(formData);
            this.notifications.show('Producto agregado correctamente', 'success');
        }

        this.closeModals();
        if (this.currentPage === 'inventory') {
            this.loadProducts();
        }
        if (this.currentPage === 'dashboard') {
            this.loadDashboard();
        }
    }

    deleteProduct(productId) {
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            this.dataManager.deleteProduct(productId);
            this.notifications.show('Producto eliminado correctamente', 'success');
            this.loadProducts();
            if (this.currentPage === 'dashboard') {
                this.loadDashboard();
            }
        }
    }

    loadSales() {
        const sales = this.dataManager.getSales();
        const tbody = document.getElementById('salesTableBody');
        
        if (sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No hay ventas registradas</td></tr>';
            return;
        }

        tbody.innerHTML = sales.map(sale => `
            <tr>
                <td>${sale.invoiceNumber}</td>
                <td>${sale.customerName || 'Cliente general'}</td>
                <td>${new Date(sale.date).toLocaleDateString()}</td>
                <td>$${parseFloat(sale.total).toLocaleString()}</td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-secondary" onclick="app.viewSaleDetails(${sale.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    openSaleModal() {
        const modal = document.getElementById('saleModal');
        const form = document.getElementById('saleForm');
        
        form.reset();
        
        // Generar número de factura automático
        const invoiceNumber = `FAC-${Date.now().toString().slice(-6)}`;
        document.getElementById('saleInvoice').value = invoiceNumber;
        
        // Limpiar items de venta
        const saleItems = document.getElementById('saleItems');
        saleItems.innerHTML = '';
        this.addSaleItem();
        
        this.updateSaleTotal();
        modal.classList.add('active');
    }

    addSaleItem() {
        const products = this.dataManager.getProducts().filter(p => p.stock > 0);
        const saleItems = document.getElementById('saleItems');
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'sale-item';
        itemDiv.innerHTML = `
            <select class="item-product" required onchange="app.updateItemPrice(this)">
                <option value="">Seleccionar producto</option>
                ${products.map(product => `
                    <option value="${product.id}" data-price="${product.price}">
                        ${product.name} (Stock: ${product.stock})
                    </option>
                `).join('')}
            </select>
            <input type="number" class="item-quantity" placeholder="Cantidad" min="1" required onchange="app.updateSaleTotal()">
            <span class="item-price">$0</span>
            <button type="button" class="btn-remove-item" onclick="app.removeSaleItem(this)">×</button>
        `;
        
        saleItems.appendChild(itemDiv);
    }

    removeSaleItem(button) {
        button.parentElement.remove();
        this.updateSaleTotal();
    }

    updateItemPrice(select) {
        const option = select.selectedOptions[0];
        const priceSpan = select.parentElement.querySelector('.item-price');
        const quantityInput = select.parentElement.querySelector('.item-quantity');
        
        if (option && option.dataset.price) {
            const price = parseFloat(option.dataset.price);
            const quantity = parseInt(quantityInput.value) || 1;
            priceSpan.textContent = `$${(price * quantity).toLocaleString()}`;
        } else {
            priceSpan.textContent = '$0';
        }
        
        this.updateSaleTotal();
    }

    updateSaleTotal() {
        const saleItems = document.querySelectorAll('.sale-item');
        let total = 0;
        
        saleItems.forEach(item => {
            const select = item.querySelector('.item-product');
            const quantity = parseInt(item.querySelector('.item-quantity').value) || 0;
            const option = select.selectedOptions[0];
            
            if (option && option.dataset.price && quantity > 0) {
                const price = parseFloat(option.dataset.price);
                const subtotal = price * quantity;
                total += subtotal;
                
                // Actualizar precio mostrado
                item.querySelector('.item-price').textContent = `$${subtotal.toLocaleString()}`;
            }
        });
        
        document.getElementById('saleTotal').textContent = total.toLocaleString();
    }

    saveSale(e) {
        e.preventDefault();
        
        const invoiceNumber = document.getElementById('saleInvoice').value;
        const customerName = document.getElementById('saleCustomer').value;
        const notes = document.getElementById('saleNotes').value;
        
        // Recopilar items
        const saleItems = document.querySelectorAll('.sale-item');
        const items = [];
        let total = 0;
        
        for (const item of saleItems) {
            const productId = parseInt(item.querySelector('.item-product').value);
            const quantity = parseInt(item.querySelector('.item-quantity').value);
            const option = item.querySelector('.item-product').selectedOptions[0];
            
            if (productId && quantity > 0 && option.dataset.price) {
                const unitPrice = parseFloat(option.dataset.price);
                const subtotal = unitPrice * quantity;
                
                items.push({
                    productId,
                    quantity,
                    unitPrice
                });
                
                total += subtotal;
            }
        }
        
        if (items.length === 0) {
            this.notifications.show('Debe agregar al menos un producto', 'error');
            return;
        }
        
        const saleData = {
            invoiceNumber,
            customerName,
            notes,
            total
        };
        
        this.dataManager.addSale(saleData, items);
        this.notifications.show('Venta registrada correctamente', 'success');
        
        this.closeModals();
        if (this.currentPage === 'sales') {
            this.loadSales();
        }
        if (this.currentPage === 'dashboard') {
            this.loadDashboard();
        }
    }

    loadExpenses() {
        const expenses = this.dataManager.getExpenses();
        const tbody = document.getElementById('expensesTableBody');
        
        if (expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No hay gastos registrados</td></tr>';
            return;
        }

        tbody.innerHTML = expenses.map(expense => `
            <tr>
                <td>${expense.description}</td>
                <td>${expense.category}</td>
                <td>$${parseFloat(expense.amount).toLocaleString()}</td>
                <td>${new Date(expense.date).toLocaleDateString()}</td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-secondary" onclick="app.openExpenseModal(${expense.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteExpense(${expense.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    openExpenseModal(expenseId = null) {
        this.editingExpenseId = expenseId;
        const modal = document.getElementById('expenseModal');
        const form = document.getElementById('expenseForm');
        const title = document.getElementById('expenseModalTitle');
        
        form.reset();
        
        if (expenseId) {
            title.textContent = 'Editar Gasto';
            const expense = this.dataManager.getExpenses().find(e => e.id === expenseId);
            if (expense) {
                document.getElementById('expenseDescription').value = expense.description;
                document.getElementById('expenseCategory').value = expense.category;
                document.getElementById('expenseAmount').value = expense.amount;
                document.getElementById('expenseReceipt').value = expense.receipt || '';
                document.getElementById('expenseNotes').value = expense.notes || '';
            }
        } else {
            title.textContent = 'Agregar Gasto';
        }
        
        modal.classList.add('active');
    }

    saveExpense(e) {
        e.preventDefault();
        
        const formData = {
            description: document.getElementById('expenseDescription').value,
            category: document.getElementById('expenseCategory').value,
            amount: parseFloat(document.getElementById('expenseAmount').value),
            receipt: document.getElementById('expenseReceipt').value,
            notes: document.getElementById('expenseNotes').value
        };

        if (this.editingExpenseId) {
            this.dataManager.updateExpense(this.editingExpenseId, formData);
            this.notifications.show('Gasto actualizado correctamente', 'success');
        } else {
            this.dataManager.addExpense(formData);
            this.notifications.show('Gasto registrado correctamente', 'success');
        }

        this.closeModals();
        if (this.currentPage === 'expenses') {
            this.loadExpenses();
        }
        if (this.currentPage === 'dashboard') {
            this.loadDashboard();
        }
    }

    deleteExpense(expenseId) {
        if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
            this.dataManager.deleteExpense(expenseId);
            this.notifications.show('Gasto eliminado correctamente', 'success');
            this.loadExpenses();
            if (this.currentPage === 'dashboard') {
                this.loadDashboard();
            }
        }
    }

    loadReports() {
        this.generateReport();
    }

    generateReport() {
        const period = document.getElementById('reportPeriod').value;
        const metrics = this.dataManager.getDashboardMetrics();
        
        // Actualizar resumen financiero
        document.getElementById('totalIncome').textContent = `$${metrics.monthlySales.toLocaleString()}`;
        document.getElementById('totalExpenses').textContent = `$${metrics.monthlyExpenses.toLocaleString()}`;
        document.getElementById('totalProfit').textContent = `$${metrics.netProfit.toLocaleString()}`;
        
        // Productos más vendidos
        this.loadTopProducts();
    }

    loadTopProducts() {
        const sales = this.dataManager.getSales();
        const productSales = {};
        
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (productSales[item.productId]) {
                    productSales[item.productId].quantity += item.quantity;
                    productSales[item.productId].total += item.subtotal;
                } else {
                    const product = this.dataManager.getProducts().find(p => p.id === item.productId);
                    if (product) {
                        productSales[item.productId] = {
                            name: product.name,
                            quantity: item.quantity,
                            total: item.subtotal
                        };
                    }
                }
            });
        });
        
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
        
        const container = document.getElementById('topProducts');
        
        if (topProducts.length === 0) {
            container.innerHTML = '<div class="no-data">No hay datos disponibles</div>';
            return;
        }
        
        container.innerHTML = topProducts.map((product, index) => `
            <div class="report-item">
                <span>${index + 1}. ${product.name}</span>
                <span>$${product.total.toLocaleString()} (${product.quantity} unidades)</span>
            </div>
        `).join('');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        this.editingProductId = null;
        this.editingExpenseId = null;
    }

    viewSaleDetails(saleId) {
        const sale = this.dataManager.getSales().find(s => s.id === saleId);
        if (!sale) return;
        
        let details = `Factura: ${sale.invoiceNumber}\n`;
        details += `Cliente: ${sale.customerName || 'Cliente general'}\n`;
        details += `Fecha: ${new Date(sale.date).toLocaleDateString()}\n\n`;
        details += `Productos:\n`;
        
        sale.items.forEach(item => {
            details += `- ${item.product.name}: ${item.quantity} x $${item.unitPrice} = $${item.subtotal}\n`;
        });
        
        details += `\nTotal: $${sale.total}`;
        
        if (sale.notes) {
            details += `\n\nNotas: ${sale.notes}`;
        }
        
        alert(details);
    }
}

// Inicializar la aplicación
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FerreteriApp();
});

// Funciones globales necesarias para los event handlers inline
window.app = null;
document.addEventListener('DOMContentLoaded', () => {
    window.app = app;
});