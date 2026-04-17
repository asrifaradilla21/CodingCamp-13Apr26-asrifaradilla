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
        
        validateInputs(itemName, amount, category) {
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
            const validCategories = ['Food', 'Transport', 'Fun'];
            if (!category || !validCategories.includes(category)) {
                throw new Error('Category must be one of: Food, Transport, Fun');
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
            this.categoryTotals = {
                Food: 0,
                Transport: 0,
                Fun: 0
            };
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
            this.categoryTotals = {
                Food: 0,
                Transport: 0,
                Fun: 0
            };
            
            // Calculate category totals
            this.transactions.forEach(transaction => {
                if (this.categoryTotals.hasOwnProperty(transaction.category)) {
                    this.categoryTotals[transaction.category] += transaction.amount;
                }
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
        validateTransaction(transactionData) {
            // Clear previous errors
            this.clearErrors();
            
            // Validate each field
            const itemNameValid = this.validateItemName(transactionData.itemName);
            const amountValid = this.validateAmount(transactionData.amount);
            const categoryValid = this.validateCategory(transactionData.category);
            
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
        validateCategory(category) {
            const validCategories = ['Food', 'Transport', 'Fun'];
            
            // Check if category is provided
            if (!category || typeof category !== 'string' || category.trim().length === 0) {
                this.errors.category = 'Please select a category';
                return false;
            }
            
            // Check if category is valid
            if (!validCategories.includes(category)) {
                this.errors.category = 'Category must be one of: Food, Transport, Fun';
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
            try {
                if (!this.isStorageAvailable()) {
                    console.warn('Local Storage is not available');
                    return false;
                }
                
                const serializedData = JSON.stringify(transactions);
                localStorage.setItem(this.storageKey, serializedData);
                return true;
            } catch (error) {
                return this.handleStorageError(error);
            }
        }
        
        /**
         * Load transactions array from Local Storage
         * @returns {Array} - Array of transaction objects or empty array
         */
        loadTransactions() {
            try {
                if (!this.isStorageAvailable()) {
                    console.warn('Local Storage is not available, returning empty array');
                    return [];
                }
                
                const storedData = localStorage.getItem(this.storageKey);
                
                if (!storedData) {
                    // No stored data exists, return empty array
                    return [];
                }
                
                const parsedData = JSON.parse(storedData);
                
                // Validate that parsed data is an array
                if (!Array.isArray(parsedData)) {
                    console.warn('Stored data is not a valid array, returning empty array');
                    return [];
                }
                
                // Convert plain objects back to Transaction instances
                return parsedData.map(transactionData => {
                    try {
                        return Transaction.fromJSON(transactionData);
                    } catch (error) {
                        console.warn('Failed to parse transaction data:', error);
                        return null;
                    }
                }).filter(transaction => transaction !== null);
                
            } catch (error) {
                this.handleStorageError(error);
                return [];
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
            if (!this.form) {
                console.error('Form element not found');
                return;
            }
            
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
            
            // Bind event listeners
            this.bindEvents();
            
            console.log('InputFormComponent rendered and initialized');
        }
        
        /**
         * Bind form events for submission and real-time validation
         */
        bindEvents() {
            if (!this.form) return;
            
            // Handle form submission
            this.form.addEventListener('submit', (event) => {
                this.handleSubmit(event);
            });
            
            // Add real-time validation on blur events
            Object.keys(this.fields).forEach(fieldName => {
                const field = this.fields[fieldName];
                if (field) {
                    field.addEventListener('blur', () => {
                        this.validateField(fieldName);
                    });
                    
                    // Clear errors on input to provide immediate feedback
                    field.addEventListener('input', () => {
                        this.clearFieldError(fieldName);
                    });
                }
            });
        }
        
        /**
         * Handle form submission with validation
         * @param {Event} event - The form submit event
         */
        handleSubmit(event) {
            event.preventDefault();
            
            // Clear any existing validation errors
            this.clearValidationErrors();
            
            // Get form data
            const formData = this.getFormData();
            
            // Validate the transaction data
            const isValid = this.validator.validateTransaction(formData);
            
            if (!isValid) {
                // Display validation errors
                this.displayValidationErrors(this.validator.getErrorMessages());
                return;
            }
            
            try {
                // Create new transaction
                const transaction = new Transaction(
                    formData.itemName,
                    formData.amount,
                    formData.category
                );
                
                // Add transaction through state manager
                this.stateManager.addTransaction(transaction);
                
                // Clear form after successful submission
                this.clearForm();
                
                console.log('Transaction added successfully:', transaction);
                
            } catch (error) {
                console.error('Error creating transaction:', error);
                // Display generic error message
                this.displayValidationErrors({
                    general: 'An error occurred while adding the transaction. Please try again.'
                });
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
            
            // Subscribe to state changes
            this.stateManager.subscribe(this, ['transactionAdded', 'transactionDeleted', 'dataLoaded']);
        }
        
        /**
         * Initialize the transaction list component and render initial state
         */
        render(transactions = []) {
            // Get container elements from DOM
            this.container = document.querySelector('.transaction-container');
            this.emptyState = document.querySelector('.empty-state');
            
            if (!this.container || !this.emptyState) {
                console.error('Transaction list container elements not found');
                return;
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
            
            console.log(`TransactionListComponent rendered with ${transactions.length} transactions`);
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
            
            // Subscribe to state changes
            this.stateManager.subscribe(this, ['transactionAdded', 'transactionDeleted', 'dataLoaded']);
        }
        
        /**
         * Initialize the balance display component and render initial balance
         * @param {number} totalBalance - The initial total balance to display
         */
        render(totalBalance = 0) {
            // Get balance display elements from DOM
            this.element = document.getElementById('balance-display');
            this.balanceAmountElement = document.querySelector('.balance-amount');
            
            if (!this.element || !this.balanceAmountElement) {
                console.error('Balance display elements not found');
                return;
            }
            
            // Set initial balance display
            this.updateDisplay(totalBalance);
            
            console.log('BalanceDisplayComponent rendered with balance:', totalBalance);
        }
        
        /**
         * Update the balance display with new balance value
         * @param {number} newBalance - The new balance to display
         */
        updateDisplay(newBalance) {
            if (!this.balanceAmountElement) {
                console.error('Balance amount element not found');
                return;
            }
            
            // Format and display the new balance
            const formattedBalance = this.formatCurrency(newBalance);
            this.balanceAmountElement.textContent = `$${formattedBalance}`;
            
            // Update aria-label for accessibility
            this.balanceAmountElement.setAttribute('aria-label', `Total balance: $${formattedBalance}`);
            
            // Add visual feedback for balance changes
            this.addUpdateAnimation();
            
            console.log('Balance display updated to:', formattedBalance);
        }
        
        /**
         * Format currency amount with proper decimal precision
         * @param {number} amount - The amount to format
         * @returns {string} Formatted currency string without $ symbol
         */
        formatCurrency(amount) {
            // Validate input
            if (typeof amount !== 'number' || isNaN(amount)) {
                console.warn('Invalid amount provided to formatCurrency:', amount);
                return '0.00';
            }
            
            // Format with 2 decimal places
            return amount.toFixed(2);
        }
        
        /**
         * Add visual animation when balance updates
         */
        addUpdateAnimation() {
            if (!this.balanceAmountElement) return;
            
            // Remove existing animation class if present
            this.balanceAmountElement.classList.remove('balance-updated');
            
            // Force reflow to ensure class removal takes effect
            this.balanceAmountElement.offsetHeight;
            
            // Add animation class
            this.balanceAmountElement.classList.add('balance-updated');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                if (this.balanceAmountElement) {
                    this.balanceAmountElement.classList.remove('balance-updated');
                }
            }, 300);
        }
        
        /**
         * Handle state changes from the AppStateManager
         * @param {string} eventType - The type of event
         * @param {Object} data - Event data containing totalBalance
         */
        handleStateChange(eventType, data) {
            switch (eventType) {
                case 'transactionAdded':
                case 'transactionDeleted':
                case 'dataLoaded':
                    // Update display with new balance
                    if (typeof data.totalBalance === 'number') {
                        this.updateDisplay(data.totalBalance);
                    }
                    break;
                default:
                    // Ignore other event types
                    break;
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
            const data = [categoryTotals.Food, categoryTotals.Transport, categoryTotals.Fun];
            const isEmpty = data.every(value => value === 0);
            
            if (this.chart) {
                this.chart.data.datasets[0].data = data;
                this.chart.update('active');
            }
            
            // Show/hide empty state
            if (isEmpty) {
                this.showEmptyState();
            } else {
                this.hideEmptyState();
            }
        }
        
        calculateCategoryTotals(transactions = []) {
            const totals = {
                Food: 0,
                Transport: 0,
                Fun: 0
            };
            
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
            if (eventType === 'transactionAdded' || eventType === 'transactionDeleted') {
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
        
        /**
         * Add a transaction to the application state
         * @param {Transaction} transaction - The transaction to add
         */
        addTransaction(transaction) {
            try {
                // Add transaction to state
                this.state.addTransaction(transaction);
                
                // Save to storage
                this.saveToStorage();
                
                // Notify components of the change
                this.notifyComponents('transactionAdded', {
                    transaction: transaction,
                    totalBalance: this.state.getTotalBalance(),
                    transactions: this.state.getTransactions()
                });
                
                console.log('Transaction added successfully:', transaction.id);
                
            } catch (error) {
                console.error('Error adding transaction:', error);
                throw error;
            }
        }
        
        /**
         * Delete a transaction from the application state
         * @param {string} id - The transaction ID to delete
         */
        deleteTransaction(id) {
            try {
                // Remove transaction from state
                const removedTransaction = this.state.removeTransaction(id);
                
                // Save to storage
                this.saveToStorage();
                
                // Notify components of the change
                this.notifyComponents('transactionDeleted', {
                    transaction: removedTransaction,
                    totalBalance: this.state.getTotalBalance(),
                    transactions: this.state.getTransactions()
                });
                
                console.log('Transaction deleted successfully:', id);
                
            } catch (error) {
                console.error('Error deleting transaction:', error);
                throw error;
            }
        }
        
        /**
         * Get all transactions
         * @returns {Array} Array of transactions
         */
        getTransactions() {
            return this.state.getTransactions();
        }
        
        /**
         * Get total balance
         * @returns {number} Total balance
         */
        getTotalBalance() {
            return this.state.getTotalBalance();
        }
        
        /**
         * Save current state to storage
         */
        saveToStorage() {
            const transactions = this.state.getTransactions().map(t => t.toJSON());
            this.storageManager.saveTransactions(transactions);
        }
        
        /**
         * Load initial data from storage
         */
        loadFromStorage() {
            try {
                const transactions = this.storageManager.loadTransactions();
                
                // Clear current state and add loaded transactions
                this.state.clear();
                transactions.forEach(transaction => {
                    this.state.addTransaction(transaction);
                });
                
                // Notify components of initial data load
                this.notifyComponents('dataLoaded', {
                    totalBalance: this.state.getTotalBalance(),
                    transactions: this.state.getTransactions()
                });
                
                console.log(`Loaded ${transactions.length} transactions from storage`);
                
            } catch (error) {
                console.error('Error loading from storage:', error);
            }
        }
        
        /**
         * Notify all subscribed components of state changes
         * @param {string} eventType - The type of event that occurred
         * @param {Object} data - Data associated with the event
         */
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
        
        /**
         * Subscribe a component to state changes
         * @param {Object} component - The component to subscribe
         * @param {Array} eventTypes - Array of event types the component is interested in
         */
        subscribe(component, eventTypes) {
            if (!this.components.includes(component)) {
                this.components.push(component);
                console.log('Component subscribed to state changes');
            }
        }
        
        /**
         * Unsubscribe a component from state changes
         * @param {Object} component - The component to unsubscribe
         */
        unsubscribe(component) {
            const index = this.components.indexOf(component);
            if (index > -1) {
                this.components.splice(index, 1);
                console.log('Component unsubscribed from state changes');
            }
        }
    }
    
    // Main Application Class
    class ExpenseTracker {
        constructor() {
            this.stateManager = null;
            this.components = {};
            this.validator = null;
        }
        
        initializeComponents() {
            // Initialize core components
            this.validator = new Validator();
            this.stateManager = new AppStateManager();
            
            // Initialize UI components
            this.components.inputForm = new InputFormComponent(this.stateManager, this.validator);
            this.components.transactionList = new TransactionListComponent(this.stateManager);
            this.components.balanceDisplay = new BalanceDisplayComponent(this.stateManager);
            this.components.chart = new ChartComponent(this.stateManager);
            
            console.log('Application components initialized');
        }
        
        bindEvents() {
            // Subscribe components to state changes
            this.stateManager.subscribe(this.components.inputForm, ['transactionAdded']);
            this.stateManager.subscribe(this.components.transactionList, ['transactionAdded', 'transactionDeleted', 'dataLoaded']);
            this.stateManager.subscribe(this.components.balanceDisplay, ['transactionAdded', 'transactionDeleted', 'dataLoaded']);
            this.stateManager.subscribe(this.components.chart, ['transactionAdded', 'transactionDeleted', 'dataLoaded']);
            
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