// Expense & Budget Visualizer Application
// IIFE wrapper for encapsulation and namespace management
(function() {
    'use strict';
    
    // Utility functions
    const Utils = {
        generateId: () => 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        formatCurrency: (amount) => `$${amount.toFixed(2)}`,
        isStorageAvailable: () => {
            try {
                const test = '__storage_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        }
    };
    
    // Data Models
    class Transaction {
        constructor(itemName, amount, category) {
            // Validate inputs before creating transaction
            this.validateInputs(itemName, amount, category);
            
            // Generate unique ID and set properties
            this.id = Utils.generateId();
            this.itemName = itemName.trim();
            this.amount = parseFloat(amount);
            this.category = category;
            this.timestamp = new Date().toISOString();
        }
        
        validateInputs(itemName, amount, category, validCategories) {
            // Validate item name
            if (!itemName || typeof itemName !== 'string' || itemName.trim().length === 0) {
                throw new Error('Item name is required and must be a non-empty string');
            }
            
            if (itemName.trim().length > 100) {
                throw new Error('Item name must be 100 characters or less');
            }
            
            // Validate amount
            if (amount === null || amount === undefined || amount === '') {
                throw new Error('Amount is required');
            }
            
            const numericAmount = parseFloat(amount);
            if (isNaN(numericAmount) || numericAmount <= 0) {
                throw new Error('Amount must be a positive number');
            }
            
            if (numericAmount > 999999.99) {
                throw new Error('Amount must be less than $1,000,000');
            }
            
            // Validate category
            if (!category || (validCategories && !validCategories.includes(category))) {
                throw new Error('Invalid category selected');
            }
        }
        
        toJSON() {
            return {
                id: this.id,
                itemName: this.itemName,
                amount: this.amount,
                category: this.category,
                timestamp: this.timestamp
            };
        }
        
        static fromJSON(data) {
            // Validate that required properties exist
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data provided for transaction deserialization');
            }
            
            if (!data.itemName || !data.amount || !data.category) {
                throw new Error('Missing required transaction properties');
            }
            
            // Create transaction and restore original properties
            const transaction = new Transaction(data.itemName, data.amount, data.category);
            
            // Restore original ID and timestamp if provided
            if (data.id) {
                transaction.id = data.id;
            }
            if (data.timestamp) {
                transaction.timestamp = data.timestamp;
            }
            
            return transaction;
        }
    }
    
    class ApplicationState {
        constructor() {
            this.transactions = [];
            this.totalBalance = 0;
            this.customCategories = [];
            this.spendingLimit = 0;
            this.sortConfig = { field: 'date', order: 'desc' };
            this.categoryTotals = {};
            this.resetCategoryTotals();
        }

        getSortedTransactions() {
            const { field, order } = this.sortConfig;
            return [...this.transactions].sort((a, b) => {
                let comparison = 0;
                if (field === 'date') {
                    comparison = new Date(a.timestamp) - new Date(b.timestamp);
                } else if (field === 'amount') {
                    comparison = a.amount - b.amount;
                } else if (field === 'category') {
                    comparison = a.category.localeCompare(b.category);
                }
                return order === 'asc' ? comparison : -comparison;
            });
        }

        resetCategoryTotals() {
            this.categoryTotals = {
                Food: 0,
                Transport: 0,
                Fun: 0
            };
            this.customCategories.forEach(cat => {
                this.categoryTotals[cat] = 0;
            });
        }
        
        addTransaction(transaction) {
            // Validate transaction is a Transaction instance
            if (!(transaction instanceof Transaction)) {
                throw new Error('Invalid transaction object provided');
            }
            
            // Add transaction to array
            this.transactions.push(transaction);
            
            // Recalculate totals
            this.recalculateTotals();
            
            return transaction;
        }

        setSpendingLimit(limit) {
            this.spendingLimit = parseFloat(limit) || 0;
        }
        
        addCategory(category) {
            if (category && !this.getAllCategories().includes(category)) {
                this.customCategories.push(category);
                this.recalculateTotals();
                return true;
            }
            return false;
        }

        getAllCategories() {
            return ['Food', 'Transport', 'Fun', ...this.customCategories];
        }
        
        removeTransaction(id) {
            // Validate ID is provided
            if (!id) {
                throw new Error('Transaction ID is required for removal');
            }
            
            // Find transaction before removal for validation
            const transactionIndex = this.transactions.findIndex(t => t.id === id);
            if (transactionIndex === -1) {
                throw new Error('Transaction not found');
            }
            
            // Remove transaction
            const removedTransaction = this.transactions[transactionIndex];
            this.transactions = this.transactions.filter(t => t.id !== id);
            
            // Recalculate totals
            this.recalculateTotals();
            
            return removedTransaction;
        }
        
        recalculateTotals() {
            // Calculate total balance
            this.totalBalance = this.transactions.reduce((sum, t) => sum + t.amount, 0);
            
            // Reset category totals
            this.resetCategoryTotals();
            
            // Calculate category totals
            this.transactions.forEach(transaction => {
                if (!this.categoryTotals.hasOwnProperty(transaction.category)) {
                    this.categoryTotals[transaction.category] = 0;
                }
                this.categoryTotals[transaction.category] += transaction.amount;
            });
        }
        
        getTransactions() {
            // Return a copy to prevent external modification
            return [...this.transactions];
        }
        
        getTotalBalance() {
            return this.totalBalance;
        }
        
        getCategoryTotals() {
            // Return a copy to prevent external modification
            return { ...this.categoryTotals };
        }
        
        getTransactionById(id) {
            return this.transactions.find(t => t.id === id) || null;
        }
        
        getTransactionsByCategory(category) {
            return this.transactions.filter(t => t.category === category);
        }
        
        clear() {
            this.transactions = [];
            this.recalculateTotals();
        }
        
        // Get summary statistics
        getStatistics() {
            return {
                totalTransactions: this.transactions.length,
                totalBalance: this.totalBalance,
                categoryTotals: this.getCategoryTotals(),
                averageTransaction: this.transactions.length > 0 ? this.totalBalance / this.transactions.length : 0
            };
        }
    }
    
    // Component Classes (Placeholder structure for future implementation)
    class Validator {
        constructor() {
            this.errors = {};
        }
        
        /**
         * Validates complete transaction data
         * @param {Object} transactionData - Object containing itemName, amount, category
         * @returns {boolean} - True if all validation passes, false otherwise
         */
        validateTransaction(transactionData, validCategories) {
            // Clear previous errors
            this.clearErrors();
            
            // Validate each field
            const itemNameValid = this.validateItemName(transactionData.itemName);
            const amountValid = this.validateAmount(transactionData.amount);
            const categoryValid = this.validateCategory(transactionData.category, validCategories);
            
            // Return true only if all validations pass
            return itemNameValid && amountValid && categoryValid;
        }
        
        /**
         * Validates item name field
         * @param {string} itemName - The item name to validate
         * @returns {boolean} - True if valid, false otherwise
         */
        validateItemName(itemName) {
            // Check if item name is provided
            if (!itemName || typeof itemName !== 'string' || itemName.trim().length === 0) {
                this.errors.itemName = 'Item name is required';
                return false;
            }
            
            // Check length constraint
            if (itemName.trim().length > 100) {
                this.errors.itemName = 'Item name must be 100 characters or less';
                return false;
            }
            
            // Clear any existing error for this field
            delete this.errors.itemName;
            return true;
        }
        
        /**
         * Validates amount field
         * @param {string|number} amount - The amount to validate
         * @returns {boolean} - True if valid, false otherwise
         */
        validateAmount(amount) {
            // Check if amount is provided
            if (amount === null || amount === undefined || amount === '' || amount === 0) {
                this.errors.amount = 'Amount is required';
                return false;
            }
            
            // Convert to number and validate
            const numericAmount = parseFloat(amount);
            
            // Check if it's a valid number
            if (isNaN(numericAmount)) {
                this.errors.amount = 'Please enter a valid number';
                return false;
            }
            
            // Check if it's positive
            if (numericAmount <= 0) {
                this.errors.amount = 'Amount must be greater than 0';
                return false;
            }
            
            // Check decimal places (max 2)
            const decimalPlaces = (amount.toString().split('.')[1] || '').length;
            if (decimalPlaces > 2) {
                this.errors.amount = 'Amount can have at most 2 decimal places';
                return false;
            }
            
            // Check maximum value
            if (numericAmount > 999999.99) {
                this.errors.amount = 'Amount must be less than $1,000,000';
                return false;
            }
            
            // Clear any existing error for this field
            delete this.errors.amount;
            return true;
        }
        
        /**
         * Validates category field
         * @param {string} category - The category to validate
         * @returns {boolean} - True if valid, false otherwise
         */
        validateCategory(category, validCategories) {
            // Check if category is provided
            if (!category || typeof category !== 'string' || category.trim().length === 0) {
                this.errors.category = 'Please select a category';
                return false;
            }
            
            // Check if category is valid
            if (validCategories && !validCategories.includes(category)) {
                this.errors.category = 'Invalid category selected';
                return false;
            }
            
            // Clear any existing error for this field
            delete this.errors.category;
            return true;
        }
        
        /**
         * Gets all current error messages
         * @returns {Object} - Object containing field names as keys and error messages as values
         */
        getErrorMessages() {
            // Return a copy to prevent external modification
            return { ...this.errors };
        }
        
        /**
         * Clears all error messages
         */
        clearErrors() {
            this.errors = {};
        }
        
        /**
         * Checks if there are any validation errors
         * @returns {boolean} - True if there are errors, false otherwise
         */
        hasErrors() {
            return Object.keys(this.errors).length > 0;
        }
        
        /**
         * Gets error message for a specific field
         * @param {string} fieldName - The field name to get error for
         * @returns {string|null} - Error message or null if no error
         */
        getFieldError(fieldName) {
            return this.errors[fieldName] || null;
        }
        
        /**
         * Clears error for a specific field
         * @param {string} fieldName - The field name to clear error for
         */
        clearFieldError(fieldName) {
            delete this.errors[fieldName];
        }
        
        /**
         * Validates a single field by name
         * @param {string} fieldName - The field name (itemName, amount, category)
         * @param {any} value - The value to validate
         * @returns {boolean} - True if valid, false otherwise
         */
        validateField(fieldName, value) {
            switch (fieldName) {
                case 'itemName':
                    return this.validateItemName(value);
                case 'amount':
                    return this.validateAmount(value);
                case 'category':
                    return this.validateCategory(value);
                default:
                    return false;
            }
        }
    }
    
    class StorageManager {
        constructor() {
            this.storageKey = 'expense-tracker-transactions';
        }
        
        /**
         * Save transactions array to Local Storage
         * @param {Array} transactions - Array of transaction objects
         * @returns {boolean} - Success status
         */
        saveTransactions(transactions) {
            this.saveToStorage('expense-tracker-transactions', transactions);
        }

        saveCategories(categories) {
            this.saveToStorage('expense-tracker-categories', categories);
        }

        saveSpendingLimit(limit) {
            this.saveToStorage('expense-tracker-limit', limit);
        }

        saveTheme(theme) {
            this.saveToStorage('expense-tracker-theme', theme);
        }

        saveSortConfig(config) {
            this.saveToStorage('expense-tracker-sort', config);
        }

        saveToStorage(key, data) {
            try {
                if (!this.isStorageAvailable()) return false;
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (error) {
                return this.handleStorageError(error);
            }
        }
        
        loadTransactions() {
            const parsedData = this.loadFromStorage('expense-tracker-transactions');
            if (!parsedData) return [];
            return parsedData.map(transactionData => {
                try { return Transaction.fromJSON(transactionData); }
                catch (e) { return null; }
            }).filter(t => t !== null);
        }

        loadCategories() {
            return this.loadFromStorage('expense-tracker-categories') || [];
        }

        loadSpendingLimit() {
            return this.loadFromStorage('expense-tracker-limit') || 1000;
        }

        loadTheme() {
            return this.loadFromStorage('expense-tracker-theme') || 'light';
        }

        loadSortConfig() {
            return this.loadFromStorage('expense-tracker-sort') || { field: 'date', order: 'desc' };
        }

        loadFromStorage(key) {
            try {
                if (!this.isStorageAvailable()) return null;
                const storedData = localStorage.getItem(key);
                return storedData ? JSON.parse(storedData) : null;
            } catch (error) {
                this.handleStorageError(error);
                return null;
            }
        }
        
        /**
         * Check if Local Storage is available
         * @returns {boolean} - Storage availability status
         */
        isStorageAvailable() {
            return Utils.isStorageAvailable();
        }
        
        /**
         * Handle storage-related errors gracefully
         * @param {Error} error - The error that occurred
         * @returns {boolean} - Always returns false to indicate failure
         */
        handleStorageError(error) {
            console.warn('Storage operation failed:', error);
            
            if (error.name === 'QuotaExceededError') {
                console.warn('Storage quota exceeded. Consider clearing some data.');
                // Could emit an event or call a callback here for user notification
            } else if (error.name === 'SecurityError') {
                console.warn('Storage access denied due to security restrictions.');
            } else {
                console.warn('Unknown storage error occurred.');
            }
            
            return false;
        }
    }
    
    class InputFormComponent {
        constructor(stateManager, validator) {
            this.stateManager = stateManager;
            this.validator = validator;
            this.form = null;
            this.fields = {};
            this.errorElements = {};
        }
        
        /**
         * Initialize the form component and bind event listeners
         */
        render() {
            // Get form element from DOM
            this.form = document.getElementById('expense-form');
            if (!this.form) return;
            
            // Cache form field references
            this.fields = {
                itemName: document.getElementById('item-name'),
                amount: document.getElementById('amount'),
                category: document.getElementById('category')
            };
            
            // Cache error message elements
            this.errorElements = {
                itemName: document.getElementById('item-name-error'),
                amount: document.getElementById('amount-error'),
                category: document.getElementById('category-error')
            };

            // Custom category modal elements
            this.modal = document.getElementById('custom-category-modal');
            this.addCategoryBtn = document.getElementById('add-category-btn');
            this.saveCategoryBtn = document.getElementById('save-category');
            this.cancelCategoryBtn = document.getElementById('cancel-category');
            this.newCategoryInput = document.getElementById('new-category-name');
            
            // Bind event listeners
            this.bindEvents();
            this.updateCategoryOptions();
        }

        updateCategoryOptions() {
            const select = this.fields.category;
            const currentVal = select.value;
            const categories = this.stateManager.state.getAllCategories();
            
            select.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                select.appendChild(opt);
            });
            select.value = currentVal;
        }
        
        bindEvents() {
            if (!this.form) return;
            
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            // Custom category events
            if (this.addCategoryBtn) {
                this.addCategoryBtn.addEventListener('click', () => {
                    this.modal.style.display = 'flex';
                    this.newCategoryInput.focus();
                });
            }

            if (this.cancelCategoryBtn) {
                this.cancelCategoryBtn.addEventListener('click', () => {
                    this.modal.style.display = 'none';
                    this.newCategoryInput.value = '';
                });
            }

            if (this.saveCategoryBtn) {
                this.saveCategoryBtn.addEventListener('click', () => {
                    const name = this.newCategoryInput.value.trim();
                    if (name) {
                        this.stateManager.addCategory(name);
                        this.modal.style.display = 'none';
                        this.newCategoryInput.value = '';
                    }
                });
            }
            
            Object.keys(this.fields).forEach(fieldName => {
                const field = this.fields[fieldName];
                if (field) {
                    field.addEventListener('blur', () => this.validateField(fieldName));
                    field.addEventListener('input', () => this.clearFieldError(fieldName));
                }
            });
        }
        
        handleSubmit(event) {
            event.preventDefault();
            this.clearValidationErrors();
            
            const formData = this.getFormData();
            const isValid = this.validator.validateTransaction(formData, this.stateManager.state.getAllCategories());
            
            if (!isValid) {
                this.displayValidationErrors(this.validator.getErrorMessages());
                return;
            }
            
            try {
                const transaction = new Transaction(
                    formData.itemName,
                    formData.amount,
                    formData.category,
                    this.stateManager.state.getAllCategories()
                );
                this.stateManager.addTransaction(transaction);
                this.clearForm();
            } catch (error) {
                console.error('Error creating transaction:', error);
            }
        }

        handleStateChange(eventType, data) {
            if (eventType === 'categoryAdded' || eventType === 'dataLoaded') {
                this.updateCategoryOptions();
            }
        }
        
        /**
         * Get current form data as an object
         * @returns {Object} Form data object
         */
        getFormData() {
            return {
                itemName: this.fields.itemName ? this.fields.itemName.value.trim() : '',
                amount: this.fields.amount ? this.fields.amount.value : '',
                category: this.fields.category ? this.fields.category.value : ''
            };
        }
        
        /**
         * Clear all form fields and reset validation state
         */
        clearForm() {
            if (!this.form) return;
            
            // Reset form fields
            this.form.reset();
            
            // Clear validation errors
            this.clearValidationErrors();
            
            // Reset aria-invalid attributes
            Object.values(this.fields).forEach(field => {
                if (field) {
                    field.setAttribute('aria-invalid', 'false');
                }
            });
            
            // Focus on first field for better UX
            if (this.fields.itemName) {
                this.fields.itemName.focus();
            }
        }
        
        /**
         * Display validation errors in the form
         * @param {Object} errors - Object with field names as keys and error messages as values
         */
        displayValidationErrors(errors) {
            Object.keys(errors).forEach(fieldName => {
                const errorMessage = errors[fieldName];
                const errorElement = this.errorElements[fieldName];
                const field = this.fields[fieldName];
                
                if (errorElement && errorMessage) {
                    // Display error message
                    errorElement.textContent = errorMessage;
                    errorElement.style.display = 'block';
                    
                    // Set aria-invalid attribute for accessibility
                    if (field) {
                        field.setAttribute('aria-invalid', 'true');
                    }
                }
            });
        }
        
        /**
         * Clear all validation error messages
         */
        clearValidationErrors() {
            Object.keys(this.errorElements).forEach(fieldName => {
                this.clearFieldError(fieldName);
            });
        }
        
        /**
         * Clear validation error for a specific field
         * @param {string} fieldName - The field name to clear error for
         */
        clearFieldError(fieldName) {
            const errorElement = this.errorElements[fieldName];
            const field = this.fields[fieldName];
            
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
            
            if (field) {
                field.setAttribute('aria-invalid', 'false');
            }
        }
        
        /**
         * Validate a single field and display error if invalid
         * @param {string} fieldName - The field name to validate
         */
        validateField(fieldName) {
            const field = this.fields[fieldName];
            if (!field) return;
            
            const value = field.value;
            const isValid = this.validator.validateField(fieldName, value);
            
            if (!isValid) {
                const error = this.validator.getFieldError(fieldName);
                if (error) {
                    this.displayValidationErrors({ [fieldName]: error });
                }
            } else {
                this.clearFieldError(fieldName);
            }
        }
        
        /**
         * Enable or disable the submit button based on form state
         * @param {boolean} enabled - Whether to enable the button
         */
        setSubmitButtonState(enabled) {
            const submitButton = this.form ? this.form.querySelector('.submit-btn') : null;
            if (submitButton) {
                submitButton.disabled = !enabled;
            }
        }
        
        /**
         * Get the current form validation state
         * @returns {boolean} True if form is valid, false otherwise
         */
        isFormValid() {
            const formData = this.getFormData();
            return this.validator.validateTransaction(formData);
        }
    }
    
    class TransactionListComponent {
        constructor(stateManager) {
            this.stateManager = stateManager;
            this.container = null;
            this.emptyState = null;
            this.sortSelect = null;
            
            // Subscribe to state changes
            this.stateManager.subscribe(this, ['transactionAdded', 'transactionDeleted', 'dataLoaded', 'sortChanged']);
        }
        
        /**
         * Initialize the transaction list component and render initial state
         */
        render(transactions = []) {
            // Get container elements from DOM
            this.container = document.querySelector('.transaction-container');
            this.emptyState = document.querySelector('.empty-state');
            this.sortSelect = document.getElementById('sort-by');
            
            if (!this.container || !this.emptyState) return;
            
            if (this.sortSelect) {
                const { field, order } = this.stateManager.state.sortConfig;
                this.sortSelect.value = `${field}-${order}`;
                
                // Only bind once
                if (!this.sortSelect.dataset.bound) {
                    this.sortSelect.addEventListener('change', (e) => {
                        const [field, order] = e.target.value.split('-');
                        this.stateManager.setSortConfig(field, order);
                    });
                    this.sortSelect.dataset.bound = 'true';
                }
            }

            // Clear existing content
            this.container.innerHTML = '';
            
            // Render transactions or empty state
            if (transactions.length === 0) {
                this.showEmptyState();
            } else {
                this.hideEmptyState();
                transactions.forEach(transaction => {
                    const transactionElement = this.createTransactionElement(transaction);
                    this.container.appendChild(transactionElement);
                });
            }
        }
        
        /**
         * Create a DOM element for a single transaction
         * @param {Transaction} transaction - The transaction to create element for
         * @returns {HTMLElement} The transaction element
         */
        createTransactionElement(transaction) {
            // Create transaction item container
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';
            transactionItem.setAttribute('role', 'listitem');
            transactionItem.setAttribute('data-transaction-id', transaction.id);
            
            // Create transaction content
            const transactionContent = document.createElement('div');
            transactionContent.className = 'transaction-content';
            
            // Item name
            const itemName = document.createElement('div');
            itemName.className = 'transaction-item-name';
            itemName.textContent = transaction.itemName;
            itemName.setAttribute('aria-label', `Item: ${transaction.itemName}`);
            
            // Amount
            const amount = document.createElement('div');
            amount.className = 'transaction-amount';
            amount.textContent = `$${Utils.formatCurrency(transaction.amount)}`;
            amount.setAttribute('aria-label', `Amount: $${Utils.formatCurrency(transaction.amount)}`);
            
            // Category
            const category = document.createElement('div');
            category.className = 'transaction-category';
            category.textContent = transaction.category;
            category.setAttribute('data-category', transaction.category.toLowerCase());
            category.setAttribute('aria-label', `Category: ${transaction.category}`);
            
            // Transaction details (date)
            const details = document.createElement('div');
            details.className = 'transaction-details';
            const date = new Date(transaction.timestamp);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            details.textContent = formattedDate;
            details.setAttribute('aria-label', `Date: ${formattedDate}`);
            
            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.type = 'button';
            deleteButton.textContent = '×';
            deleteButton.setAttribute('aria-label', `Delete transaction: ${transaction.itemName}`);
            deleteButton.setAttribute('title', 'Delete transaction');
            
            // Add click handler for delete button
            deleteButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.handleDelete(transaction.id);
            });
            
            // Assemble transaction content
            transactionContent.appendChild(itemName);
            transactionContent.appendChild(amount);
            transactionContent.appendChild(category);
            transactionContent.appendChild(details);
            
            // Assemble transaction item
            transactionItem.appendChild(transactionContent);
            transactionItem.appendChild(deleteButton);
            
            return transactionItem;
        }
        
        /**
         * Handle deletion of a transaction
         * @param {string} transactionId - The ID of the transaction to delete
         */
        handleDelete(transactionId) {
            try {
                // Confirm deletion with user
                const transaction = this.stateManager.state.getTransactionById(transactionId);
                if (!transaction) {
                    console.error('Transaction not found for deletion:', transactionId);
                    return;
                }
                
                const confirmMessage = `Are you sure you want to delete "${transaction.itemName}" ($${Utils.formatCurrency(transaction.amount)})?`;
                
                if (confirm(confirmMessage)) {
                    // Delete through state manager
                    this.stateManager.deleteTransaction(transactionId);
                    console.log('Transaction deleted:', transactionId);
                }
            } catch (error) {
                console.error('Error deleting transaction:', error);
                alert('An error occurred while deleting the transaction. Please try again.');
            }
        }
        
        /**
         * Show the empty state when no transactions exist
         */
        showEmptyState() {
            if (this.emptyState) {
                this.emptyState.style.display = 'block';
            }
            
            if (this.container) {
                this.container.style.display = 'none';
            }
        }
        
        /**
         * Hide the empty state when transactions exist
         */
        hideEmptyState() {
            if (this.emptyState) {
                this.emptyState.style.display = 'none';
            }
            
            if (this.container) {
                this.container.style.display = 'block';
            }
        }
        
        /**
         * Handle state changes from the AppStateManager
         * @param {string} eventType - The type of event
         * @param {Object} data - Event data
         */
        handleStateChange(eventType, data) {
            switch (eventType) {
                case 'transactionAdded':
                case 'transactionDeleted':
                case 'dataLoaded':
                case 'sortChanged':
                    // Re-render with updated transactions
                    this.render(data.transactions);
                    break;
                default:
                    // Ignore other event types
                    break;
            }
        }
        
        /**
         * Add a single transaction to the list without full re-render
         * @param {Transaction} transaction - The transaction to add
         */
        addTransactionToList(transaction) {
            if (!this.container) return;
            
            // Hide empty state if showing
            this.hideEmptyState();
            
            // Create and append new transaction element
            const transactionElement = this.createTransactionElement(transaction);
            this.container.appendChild(transactionElement);
            
            // Add animation class for smooth insertion
            transactionElement.classList.add('transaction-added');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                transactionElement.classList.remove('transaction-added');
            }, 300);
        }
        
        /**
         * Remove a transaction from the list without full re-render
         * @param {string} transactionId - The ID of the transaction to remove
         */
        removeTransactionFromList(transactionId) {
            if (!this.container) return;
            
            const transactionElement = this.container.querySelector(`[data-transaction-id="${transactionId}"]`);
            if (transactionElement) {
                // Add animation class for smooth removal
                transactionElement.classList.add('transaction-removed');
                
                // Remove element after animation
                setTimeout(() => {
                    transactionElement.remove();
                    
                    // Show empty state if no transactions remain
                    if (this.container.children.length === 0) {
                        this.showEmptyState();
                    }
                }, 300);
            }
        }
        
        /**
         * Get the current number of displayed transactions
         * @returns {number} Number of transactions in the list
         */
        getTransactionCount() {
            return this.container ? this.container.children.length : 0;
        }
        
        /**
         * Clear all transactions from the list
         */
        clearTransactions() {
            if (this.container) {
                this.container.innerHTML = '';
            }
            this.showEmptyState();
        }
    }
    
    class BalanceDisplayComponent {
        constructor(stateManager) {
            this.stateManager = stateManager;
            this.element = null;
            this.balanceAmountElement = null;
            this.limitInput = null;
            
            this.stateManager.subscribe(this, ['transactionAdded', 'transactionDeleted', 'dataLoaded', 'limitChanged']);
        }
        
        render(totalBalance = 0) {
            this.element = document.getElementById('balance-display');
            this.balanceAmountElement = document.querySelector('.balance-amount');
            this.limitInput = document.getElementById('spending-limit');
            
            if (!this.element || !this.balanceAmountElement) return;
            
            if (this.limitInput) {
                this.limitInput.value = this.stateManager.state.spendingLimit;
                this.limitInput.addEventListener('input', (e) => {
                    this.stateManager.setLimit(e.target.value);
                });
            }

            this.updateDisplay(totalBalance);
        }
        
        updateDisplay(newBalance) {
            if (!this.balanceAmountElement) return;
            
            const formattedBalance = this.formatCurrency(newBalance);
            this.balanceAmountElement.textContent = `$${formattedBalance}`;
            this.balanceAmountElement.setAttribute('aria-label', `Total spending: $${formattedBalance}`);
            
            const limit = this.stateManager.state.spendingLimit;
            if (limit > 0 && newBalance > limit) {
                this.balanceAmountElement.classList.add('over-limit');
            } else {
                this.balanceAmountElement.classList.remove('over-limit');
            }

            this.addUpdateAnimation();
        }
        
        formatCurrency(amount) {
            if (typeof amount !== 'number' || isNaN(amount)) return '0.00';
            return amount.toFixed(2);
        }
        
        addUpdateAnimation() {
            if (!this.balanceAmountElement) return;
            this.balanceAmountElement.classList.remove('balance-updated');
            this.balanceAmountElement.offsetHeight;
            this.balanceAmountElement.classList.add('balance-updated');
            setTimeout(() => {
                if (this.balanceAmountElement) {
                    this.balanceAmountElement.classList.remove('balance-updated');
                }
            }, 300);
        }
        
        handleStateChange(eventType, data) {
            if (eventType === 'limitChanged' || eventType === 'dataLoaded' || 
                eventType === 'transactionAdded' || eventType === 'transactionDeleted') {
                this.updateDisplay(this.stateManager.getTotalBalance());
                if (eventType === 'dataLoaded' && this.limitInput) {
                    this.limitInput.value = data.limit;
                }
            }
        }
        
        /**
         * Get the current displayed balance value
         * @returns {number} Current balance value
         */
        getCurrentBalance() {
            return this.stateManager ? this.stateManager.getTotalBalance() : 0;
        }
        
        /**
         * Reset the balance display to zero
         */
        resetDisplay() {
            this.updateDisplay(0);
        }
    }
    
    class ChartComponent {
        constructor(stateManager) {
            this.stateManager = stateManager;
            this.chart = null;
            this.chartConfig = {
                type: 'pie',
                data: {
                    labels: ['Food', 'Transport', 'Fun'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    if (total === 0) return `${context.label}: $0.00 (0%)`;
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: $${context.parsed.toFixed(2)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            };
        }
        
        render(transactions = []) {
            if (!this.chart) {
                this.initializeChart();
            }
            
            if (this.chart) {
                this.updateChart(transactions);
            } else {
                this.showFallbackDisplay(transactions);
            }
        }
        
        initializeChart() {
            try {
                const canvas = document.getElementById('expense-chart');
                if (!canvas) {
                    console.warn('Chart canvas element not found');
                    return false;
                }
                
                // Check if Chart.js is available
                if (typeof Chart === 'undefined') {
                    console.warn('Chart.js library not available');
                    return false;
                }
                
                const ctx = canvas.getContext('2d');
                this.chart = new Chart(ctx, this.chartConfig);
                return true;
            } catch (error) {
                console.warn('Chart initialization failed:', error);
                this.chart = null;
                return false;
            }
        }
        
        updateChart(transactions = []) {
            const categoryTotals = this.calculateCategoryTotals(transactions);
            const categories = this.stateManager.state.getAllCategories();
            const data = categories.map(cat => categoryTotals[cat] || 0);
            const isEmpty = data.every(value => value === 0);
            
            if (this.chart) {
                this.chart.data.labels = categories;
                this.chart.data.datasets[0].data = data;
                
                // Generate colors for new categories if needed
                const currentColors = this.chart.data.datasets[0].backgroundColor;
                if (currentColors.length < categories.length) {
                    for (let i = currentColors.length; i < categories.length; i++) {
                        const hue = (i * 137.5) % 360;
                        currentColors.push(`hsl(${hue}, 70%, 60%)`);
                    }
                }
                
                this.chart.update('active');
            }
            
            if (isEmpty) this.showEmptyState();
            else this.hideEmptyState();
        }
        
        calculateCategoryTotals(transactions = []) {
            const totals = {};
            this.stateManager.state.getAllCategories().forEach(cat => {
                totals[cat] = 0;
            });
            
            transactions.forEach(transaction => {
                if (totals.hasOwnProperty(transaction.category)) {
                    totals[transaction.category] += transaction.amount;
                }
            });
            
            return totals;
        }
        
        showEmptyState() {
            const emptyState = document.querySelector('.chart-empty-state');
            const canvas = document.getElementById('expense-chart');
            
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            if (canvas) {
                canvas.style.display = 'none';
            }
        }
        
        hideEmptyState() {
            const emptyState = document.querySelector('.chart-empty-state');
            const canvas = document.getElementById('expense-chart');
            
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            if (canvas) {
                canvas.style.display = 'block';
            }
        }
        
        showFallbackDisplay(transactions = []) {
            const chartContainer = document.querySelector('.chart-container');
            if (!chartContainer) return;
            
            const categoryTotals = this.calculateCategoryTotals(transactions);
            const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
            
            chartContainer.innerHTML = `
                <div class="chart-fallback" role="region" aria-labelledby="fallback-heading">
                    <h3 id="fallback-heading">Spending Breakdown</h3>
                    <div class="category-breakdown">
                        <div class="category-item">
                            <span class="category-label" style="color: #FF6384;">● Food:</span>
                            <span class="category-amount">$${categoryTotals.Food.toFixed(2)} ${total > 0 ? `(${((categoryTotals.Food / total) * 100).toFixed(1)}%)` : '(0%)'}</span>
                        </div>
                        <div class="category-item">
                            <span class="category-label" style="color: #36A2EB;">● Transport:</span>
                            <span class="category-amount">$${categoryTotals.Transport.toFixed(2)} ${total > 0 ? `(${((categoryTotals.Transport / total) * 100).toFixed(1)}%)` : '(0%)'}</span>
                        </div>
                        <div class="category-item">
                            <span class="category-label" style="color: #FFCE56;">● Fun:</span>
                            <span class="category-amount">$${categoryTotals.Fun.toFixed(2)} ${total > 0 ? `(${((categoryTotals.Fun / total) * 100).toFixed(1)}%)` : '(0%)'}</span>
                        </div>
                    </div>
                    ${total === 0 ? '<p class="no-data-message">Add some expenses to see your spending breakdown!</p>' : ''}
                </div>
            `;
        }
        
        handleStateChange(eventType, data) {
            if (eventType === 'transactionAdded' || eventType === 'transactionDeleted' || 
                eventType === 'categoryAdded' || eventType === 'dataLoaded') {
                const transactions = this.stateManager.getTransactions();
                this.render(transactions);
            }
        }
        
        destroy() {
            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }
        }
    }
    
    class AppStateManager {
        constructor() {
            this.state = new ApplicationState();
            this.components = [];
            this.storageManager = new StorageManager();
        }
        
        addTransaction(transaction) {
            try {
                this.state.addTransaction(transaction);
                this.saveToStorage();
                this.notifyComponents('transactionAdded', {
                    transaction: transaction,
                    totalBalance: this.state.getTotalBalance(),
                    transactions: this.getTransactions(),
                    limit: this.state.spendingLimit
                });
            } catch (error) {
                console.error('Error adding transaction:', error);
                throw error;
            }
        }
        
        deleteTransaction(id) {
            try {
                const removedTransaction = this.state.removeTransaction(id);
                this.saveToStorage();
                this.notifyComponents('transactionDeleted', {
                    transaction: removedTransaction,
                    totalBalance: this.state.getTotalBalance(),
                    transactions: this.getTransactions(),
                    limit: this.state.spendingLimit
                });
            } catch (error) {
                console.error('Error deleting transaction:', error);
                throw error;
            }
        }

        addCategory(category) {
            if (this.state.addCategory(category)) {
                this.storageManager.saveCategories(this.state.customCategories);
                this.notifyComponents('categoryAdded', {
                    categories: this.state.getAllCategories()
                });
                return true;
            }
            return false;
        }

        setLimit(limit) {
            this.state.setSpendingLimit(limit);
            this.storageManager.saveSpendingLimit(limit);
            this.notifyComponents('limitChanged', {
                limit: this.state.spendingLimit,
                totalBalance: this.state.totalBalance
            });
        }

        setSortConfig(field, order) {
            this.state.sortConfig = { field, order };
            this.storageManager.saveSortConfig(this.state.sortConfig);
            this.notifyComponents('sortChanged', {
                transactions: this.state.getSortedTransactions()
            });
        }
        
        getTransactions() {
            return this.state.getSortedTransactions();
        }
        
        getTotalBalance() {
            return this.state.getTotalBalance();
        }
        
        saveToStorage() {
            const transactions = this.state.getTransactions().map(t => t.toJSON());
            this.storageManager.saveTransactions(transactions);
        }
        
        loadFromStorage() {
            try {
                const transactions = this.storageManager.loadTransactions();
                const categories = this.storageManager.loadCategories();
                const limit = this.storageManager.loadSpendingLimit();
                const sortConfig = this.storageManager.loadSortConfig();
                
                this.state.clear();
                this.state.customCategories = categories;
                this.state.setSpendingLimit(limit);
                this.state.sortConfig = sortConfig;
                
                transactions.forEach(transaction => {
                    this.state.addTransaction(transaction);
                });
                
                this.notifyComponents('dataLoaded', {
                    totalBalance: this.state.getTotalBalance(),
                    transactions: this.getTransactions(),
                    categories: this.state.getAllCategories(),
                    limit: this.state.spendingLimit,
                    sortConfig: this.state.sortConfig
                });
            } catch (error) {
                console.error('Error loading from storage:', error);
            }
        }
        
        notifyComponents(eventType, data) {
            this.components.forEach(component => {
                if (component.handleStateChange && typeof component.handleStateChange === 'function') {
                    try {
                        component.handleStateChange(eventType, data);
                    } catch (error) {
                        console.error('Error notifying component:', error);
                    }
                }
            });
        }
        
        subscribe(component, eventTypes) {
            if (!this.components.includes(component)) {
                this.components.push(component);
            }
        }
        
        unsubscribe(component) {
            this.components = this.components.filter(c => c !== component);
        }
    }

    class ThemeManager {
        constructor(stateManager) {
            this.stateManager = stateManager;
            this.theme = 'light';
            this.toggleBtn = null;
        }

        init() {
            this.toggleBtn = document.getElementById('theme-toggle');
            this.theme = this.stateManager.storageManager.loadTheme();
            this.applyTheme();

            if (this.toggleBtn) {
                this.toggleBtn.addEventListener('click', () => {
                    this.theme = this.theme === 'light' ? 'dark' : 'light';
                    this.applyTheme();
                    this.stateManager.storageManager.saveTheme(this.theme);
                });
            }
        }

        applyTheme() {
            document.documentElement.setAttribute('data-theme', this.theme);
        }
    }
    
    // Main Application Class
    class ExpenseTracker {
        constructor() {
            this.stateManager = null;
            this.components = {};
            this.validator = null;
            this.themeManager = null;
        }
        
        initializeComponents() {
            // Initialize core components
            this.validator = new Validator();
            this.stateManager = new AppStateManager();
            this.themeManager = new ThemeManager(this.stateManager);
            
            // Initialize UI components
            this.components.inputForm = new InputFormComponent(this.stateManager, this.validator);
            this.components.transactionList = new TransactionListComponent(this.stateManager);
            this.components.balanceDisplay = new BalanceDisplayComponent(this.stateManager);
            this.components.chart = new ChartComponent(this.stateManager);
            
            console.log('Application components initialized');
        }
        
        bindEvents() {
            this.themeManager.init();
            
            // Subscribe components to state changes
            this.stateManager.subscribe(this.components.inputForm, ['transactionAdded', 'categoryAdded', 'dataLoaded']);
            this.stateManager.subscribe(this.components.transactionList, ['transactionAdded', 'transactionDeleted', 'dataLoaded']);
            this.stateManager.subscribe(this.components.balanceDisplay, ['transactionAdded', 'transactionDeleted', 'dataLoaded', 'limitChanged']);
            this.stateManager.subscribe(this.components.chart, ['transactionAdded', 'transactionDeleted', 'categoryAdded', 'dataLoaded']);
            
            // Render the input form component
            if (this.components.inputForm) {
                this.components.inputForm.render();
            }
            
            // Render the transaction list component
            if (this.components.transactionList) {
                this.components.transactionList.render(this.stateManager.getTransactions());
            }
            
            // Render the balance display component
            if (this.components.balanceDisplay) {
                this.components.balanceDisplay.render(this.stateManager.getTotalBalance());
            }
            
            // Render the chart component
            if (this.components.chart) {
                this.components.chart.render(this.stateManager.getTransactions());
            }
            
            console.log('Event binding completed');
        }
        
        loadInitialData() {
            // Load initial data from storage
            if (this.stateManager) {
                this.stateManager.loadFromStorage();
            }
            
            console.log('Initial data loading completed');
        }
        
        start() {
            this.initializeComponents();
            this.bindEvents();
            this.loadInitialData();
            console.log('Expense Tracker application started successfully');
        }
    }
    
    // Initialize application when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        const app = new ExpenseTracker();
        app.start();
    });
    
    // Export for testing purposes (if needed)
    window.ExpenseTracker = {
        Utils,
        Transaction,
        ApplicationState,
        ChartComponent,
        ExpenseTracker
    };
    
})();