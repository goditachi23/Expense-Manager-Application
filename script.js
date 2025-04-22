// Data structure
let data = {
    income: [],
    expenses: []
};

// DOM Elements
const incomeForm = document.getElementById('income-form');
const incomeTitle = document.getElementById('income-title');
const incomeAmount = document.getElementById('income-amount');
const incomeTable = document.getElementById('income-table').querySelector('tbody');
const incomeTotal = document.getElementById('income-total');

const expenseForm = document.getElementById('expense-form');
const expenseTitle = document.getElementById('expense-title');
const expenseAmount = document.getElementById('expense-amount');
const expenseTable = document.getElementById('expense-table').querySelector('tbody');
const expenseTotal = document.getElementById('expense-total');

const totalIncomeElement = document.getElementById('total-income');
const totalExpensesElement = document.getElementById('total-expenses');
const remainingBalanceElement = document.getElementById('remaining-balance');
const exportPdfButton = document.getElementById('export-pdf');

// Charts
let incomeChart;
let expenseChart;

// Initialize application
function init() {
    // Load data from localStorage if available
    loadData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Render initial data
    renderData();
    
    // Initialize charts
    initCharts();
}

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('expenseManagerData');
    if (savedData) {
        data = JSON.parse(savedData);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('expenseManagerData', JSON.stringify(data));
}

// Format amount in Indian currency format with commas
function formatIndianCurrency(amount) {
    const fixedAmount = amount.toFixed(2);
    const [wholePart, decimalPart] = fixedAmount.split('.');
    
    // Format whole part with commas for thousands, lakhs, crores
    let formattedWholePart = '';
    
    // Extract the last 3 digits
    const lastThreeDigits = wholePart.length > 3 ? wholePart.slice(-3) : wholePart;
    
    // Extract the remaining digits
    const remainingDigits = wholePart.length > 3 ? wholePart.slice(0, wholePart.length - 3) : '';
    
    // Add commas for remaining digits (in groups of 2)
    if (remainingDigits) {
        formattedWholePart = remainingDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThreeDigits;
    } else {
        formattedWholePart = lastThreeDigits;
    }
    
    return `₹${formattedWholePart}.${decimalPart}`;
}

// Setup event listeners
function setupEventListeners() {
    // Income form submission
    incomeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = incomeTitle.value;
        const amount = parseFloat(incomeAmount.value);
        
        if (title && amount > 0) {
            addIncome(title, amount);
            incomeTitle.value = '';
            incomeAmount.value = '';
        }
    });
    
    // Expense form submission
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = expenseTitle.value;
        const amount = parseFloat(expenseAmount.value);
        
        if (title && amount > 0) {
            addExpense(title, amount);
            expenseTitle.value = '';
            expenseAmount.value = '';
        }
    });
    
    // Export PDF button click
    exportPdfButton.addEventListener('click', exportToPdf);
}

// Export to PDF functionality
function exportToPdf() {
    // Get current date for filename
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const filename = `expense-report-${dateString}.pdf`;
    
    // Show loading message
    alert('Preparing your PDF. This may take a few seconds...');
    
    // Use the jsPDF library to create a new PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Define page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(52, 152, 219); // Primary color
    doc.text('Expense Manager Report', pageWidth / 2, margin + 10, { align: 'center' });
    
    // Add date
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${today.toLocaleDateString()}`, pageWidth / 2, margin + 20, { align: 'center' });
    
    // Create a temporary div for summary info
    const summaryDiv = document.createElement('div');
    summaryDiv.innerHTML = `
        <h2 style="color: #3498db; text-align: center; margin-bottom: 10px;">Financial Summary</h2>
        <div style="display: flex; justify-content: space-around; margin-bottom: 20px;">
            <div style="text-align: center; padding: 10px; background-color: #f9f9f9; border-radius: 5px; width: 30%;">
                <div style="font-weight: bold;">Total Income</div>
                <div style="font-size: 16px;">${totalIncomeElement.textContent}</div>
            </div>
            <div style="text-align: center; padding: 10px; background-color: #f9f9f9; border-radius: 5px; width: 30%;">
                <div style="font-weight: bold;">Total Expenses</div>
                <div style="font-size: 16px;">${totalExpensesElement.textContent}</div>
            </div>
            <div style="text-align: center; padding: 10px; background-color: #f9f9f9; border-radius: 5px; width: 30%;">
                <div style="font-weight: bold;">Remaining Balance</div>
                <div style="font-size: 16px; color: ${remainingBalanceElement.classList.contains('positive') ? '#2ecc71' : '#e74c3c'};">
                    ${remainingBalanceElement.textContent}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(summaryDiv);
    
    // Capture the summary section
    html2canvas(summaryDiv, { scale: 2 }).then(canvas => {
        // Remove the temporary div
        document.body.removeChild(summaryDiv);
        
        // Add summary canvas to PDF
        const summaryImgData = canvas.toDataURL('image/png');
        const summaryImgWidth = pageWidth - (margin * 2);
        const summaryImgHeight = (canvas.height * summaryImgWidth) / canvas.width;
        
        doc.addImage(summaryImgData, 'PNG', margin, margin + 30, summaryImgWidth, summaryImgHeight);
        
        // Capture charts section
        html2canvas(document.getElementById('charts-section'), { scale: 2 }).then(canvas => {
            // Add charts canvas to PDF
            const chartsImgData = canvas.toDataURL('image/png');
            const chartsImgWidth = pageWidth - (margin * 2);
            const chartsImgHeight = (canvas.height * chartsImgWidth) / canvas.width;
            
            // Check if we need a new page for charts
            const currentY = margin + 30 + summaryImgHeight + 10;
            if (currentY + chartsImgHeight > pageHeight - margin) {
                doc.addPage();
                doc.addImage(chartsImgData, 'PNG', margin, margin, chartsImgWidth, chartsImgHeight);
            } else {
                doc.addImage(chartsImgData, 'PNG', margin, currentY, chartsImgWidth, chartsImgHeight);
            }
            
            // Create a new page for tables
            doc.addPage();
            
            // Add tables heading
            doc.setFontSize(16);
            doc.setTextColor(52, 152, 219);
            doc.text('Detailed Breakdown', pageWidth / 2, margin + 10, { align: 'center' });
            
            // Calculate column widths for the tables
            const tableWidth = (pageWidth - (margin * 3)) / 2; // Divide available width into 2 columns with margins
            
            // Create side-by-side tables div
            const tablesDiv = document.createElement('div');
            tablesDiv.style.width = '100%';
            tablesDiv.style.padding = '20px';
            tablesDiv.style.backgroundColor = 'white';
            tablesDiv.style.display = 'flex';
            tablesDiv.style.justifyContent = 'space-between';
            
            // Create income table container
            const incomeTableContainer = document.createElement('div');
            incomeTableContainer.style.width = '48%';
            
            // Create expense table container
            const expenseTableContainer = document.createElement('div');
            expenseTableContainer.style.width = '48%';
            
            // Create income table HTML
            let incomeTableHTML = `
                <h3 style="color: #3498db; margin-bottom: 10px; text-align: center;">Income Details</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd;">
                    <thead>
                        <tr style="background-color: #f9f9f9;">
                            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Source</th>
                            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            data.income.forEach(item => {
                incomeTableHTML += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.title}</td>
                        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatIndianCurrency(item.amount)}</td>
                    </tr>
                `;
            });
            
            incomeTableHTML += `
                    </tbody>
                    <tfoot>
                        <tr style="background-color: #f9f9f9;">
                            <td style="padding: 10px; font-weight: bold;">Total</td>
                            <td style="padding: 10px; font-weight: bold; text-align: right;">${formatIndianCurrency(calculateTotalIncome())}</td>
                        </tr>
                    </tfoot>
                </table>
            `;
            
            // Create expense table HTML
            let expenseTableHTML = `
                <h3 style="color: #3498db; margin-bottom: 10px; text-align: center;">Expense Details</h3>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                    <thead>
                        <tr style="background-color: #f9f9f9;">
                            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Title</th>
                            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            data.expenses.forEach(item => {
                expenseTableHTML += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.title}</td>
                        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${formatIndianCurrency(item.amount)}</td>
                    </tr>
                `;
            });
            
            expenseTableHTML += `
                    </tbody>
                    <tfoot>
                        <tr style="background-color: #f9f9f9;">
                            <td style="padding: 10px; font-weight: bold;">Total</td>
                            <td style="padding: 10px; font-weight: bold; text-align: right;">${formatIndianCurrency(calculateTotalExpenses())}</td>
                        </tr>
                    </tfoot>
                </table>
            `;
            
            // Add the tables to their containers
            incomeTableContainer.innerHTML = incomeTableHTML;
            expenseTableContainer.innerHTML = expenseTableHTML;
            
            // Add containers to the main div
            tablesDiv.appendChild(incomeTableContainer);
            tablesDiv.appendChild(expenseTableContainer);
            
            // Add the div to the document
            document.body.appendChild(tablesDiv);
            
            // Capture the tables div
            html2canvas(tablesDiv, { scale: 2 }).then(canvas => {
                // Remove the temporary div
                document.body.removeChild(tablesDiv);
                
                // Add tables canvas to PDF
                const tablesImgData = canvas.toDataURL('image/png');
                const tablesImgWidth = pageWidth - (margin * 2);
                const tablesImgHeight = (canvas.height * tablesImgWidth) / canvas.width;
                
                doc.addImage(tablesImgData, 'PNG', margin, margin + 20, tablesImgWidth, tablesImgHeight);
                
                // Add footer with page numbers
                const totalPages = doc.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i);
                    doc.setFontSize(10);
                    doc.setTextColor(100, 100, 100);
                    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                }
                
                // Save the PDF
                doc.save(filename);
            });
        });
    });
}

// Add income
function addIncome(title, amount) {
    const id = generateID();
    data.income.push({ id, title, amount });
    
    saveData();
    renderData();
    updateIncomeChart();
    checkBalance();
}

// Add expense
function addExpense(title, amount) {
    const id = generateID();
    data.expenses.push({ id, title, amount });
    
    saveData();
    renderData();
    updateExpenseChart();
    checkBalance();
}

// Edit income
function editIncome(id, title, amount) {
    const index = data.income.findIndex(item => item.id === id);
    if (index !== -1) {
        data.income[index].title = title;
        data.income[index].amount = amount;
        
        saveData();
        renderData();
        updateIncomeChart();
        checkBalance();
    }
}

// Edit expense
function editExpense(id, title, amount) {
    const index = data.expenses.findIndex(item => item.id === id);
    if (index !== -1) {
        data.expenses[index].title = title;
        data.expenses[index].amount = amount;
        
        saveData();
        renderData();
        updateExpenseChart();
        checkBalance();
    }
}

// Delete income
function deleteIncome(id) {
    data.income = data.income.filter(item => item.id !== id);
    
    saveData();
    renderData();
    updateIncomeChart();
    checkBalance();
}

// Delete expense
function deleteExpense(id) {
    data.expenses = data.expenses.filter(item => item.id !== id);
    
    saveData();
    renderData();
    updateExpenseChart();
    checkBalance();
}

// Render all data
function renderData() {
    renderIncomeTable();
    renderExpenseTable();
    updateSummary();
}

// Render income table
function renderIncomeTable() {
    incomeTable.innerHTML = '';
    
    data.income.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.title}</td>
            <td>${formatIndianCurrency(item.amount)}</td>
            <td class="action-buttons">
                <button class="action-btn edit-btn" data-id="${item.id}">Edit</button>
                <button class="action-btn delete-btn" data-id="${item.id}">Delete</button>
            </td>
        `;
        
        // Add event listeners to buttons
        row.querySelector('.edit-btn').addEventListener('click', () => {
            const newTitle = prompt('Enter new title:', item.title);
            const newAmount = parseFloat(prompt('Enter new amount:', item.amount));
            
            if (newTitle && newAmount > 0) {
                editIncome(item.id, newTitle, newAmount);
            }
        });
        
        row.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this income?')) {
                deleteIncome(item.id);
            }
        });
        
        incomeTable.appendChild(row);
    });
    
    const totalIncome = calculateTotalIncome();
    incomeTotal.textContent = formatIndianCurrency(totalIncome);
}

// Render expense table
function renderExpenseTable() {
    expenseTable.innerHTML = '';
    
    data.expenses.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.title}</td>
            <td>${formatIndianCurrency(item.amount)}</td>
            <td class="action-buttons">
                <button class="action-btn edit-btn" data-id="${item.id}">Edit</button>
                <button class="action-btn delete-btn" data-id="${item.id}">Delete</button>
            </td>
        `;
        
        // Add event listeners to buttons
        row.querySelector('.edit-btn').addEventListener('click', () => {
            const newTitle = prompt('Enter new title:', item.title);
            const newAmount = parseFloat(prompt('Enter new amount:', item.amount));
            
            if (newTitle && newAmount > 0) {
                editExpense(item.id, newTitle, newAmount);
            }
        });
        
        row.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this expense?')) {
                deleteExpense(item.id);
            }
        });
        
        expenseTable.appendChild(row);
    });
    
    const totalExpenses = calculateTotalExpenses();
    expenseTotal.textContent = formatIndianCurrency(totalExpenses);
}

// Update summary information
function updateSummary() {
    const totalIncome = calculateTotalIncome();
    const totalExpenses = calculateTotalExpenses();
    const balance = totalIncome - totalExpenses;
    
    totalIncomeElement.textContent = formatIndianCurrency(totalIncome);
    totalExpensesElement.textContent = formatIndianCurrency(totalExpenses);
    
    if (balance >= 0) {
        remainingBalanceElement.textContent = formatIndianCurrency(balance);
        remainingBalanceElement.classList.remove('negative');
        remainingBalanceElement.classList.add('positive');
    } else {
        remainingBalanceElement.textContent = `-${formatIndianCurrency(Math.abs(balance)).substring(1)}`;
        remainingBalanceElement.classList.remove('positive');
        remainingBalanceElement.classList.add('negative');
    }
}

// Calculate total income
function calculateTotalIncome() {
    return data.income.reduce((total, item) => total + item.amount, 0);
}

// Calculate total expenses
function calculateTotalExpenses() {
    return data.expenses.reduce((total, item) => total + item.amount, 0);
}

// Initialize charts
function initCharts() {
    // Common chart options
    Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 6;
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(52, 73, 94, 0.8)';
    Chart.defaults.plugins.tooltip.titleFont = { size: 14 };
    Chart.defaults.plugins.tooltip.bodyFont = { size: 13 };

    // Income chart
    const incomeCtx = document.getElementById('income-chart').getContext('2d');
    incomeChart = new Chart(incomeCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#3498db', '#2980b9', '#1abc9c', '#16a085',
                    '#2ecc71', '#27ae60', '#f1c40f', '#f39c12',
                    '#e67e22', '#d35400', '#9b59b6', '#8e44ad'
                ],
                borderColor: '#f9f9f9',
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 0,
                    bottom: 0
                }
            },
            plugins: {
                legend: {
                    position: 'right',
                    align: 'center',
                    labels: {
                        boxWidth: 15,
                        padding: 15,
                        font: {
                            size: 12
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatIndianCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Expense chart
    const expenseCtx = document.getElementById('expense-chart').getContext('2d');
    expenseChart = new Chart(expenseCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#e74c3c', '#c0392b', '#f1c40f', '#f39c12',
                    '#e67e22', '#d35400', '#3498db', '#2980b9',
                    '#9b59b6', '#8e44ad', '#1abc9c', '#16a085'
                ],
                borderColor: '#f9f9f9',
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 0,
                    bottom: 0
                }
            },
            plugins: {
                legend: {
                    position: 'right',
                    align: 'center',
                    labels: {
                        boxWidth: 15,
                        padding: 15,
                        font: {
                            size: 12
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatIndianCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    updateIncomeChart();
    updateExpenseChart();
}

// Update income chart
function updateIncomeChart() {
    if (!incomeChart) return;
    
    const labels = data.income.map(item => item.title);
    const amounts = data.income.map(item => item.amount);
    
    incomeChart.data.labels = labels;
    incomeChart.data.datasets[0].data = amounts;
    incomeChart.update();
}

// Update expense chart
function updateExpenseChart() {
    if (!expenseChart) return;
    
    const labels = data.expenses.map(item => item.title);
    const amounts = data.expenses.map(item => item.amount);
    
    expenseChart.data.labels = labels;
    expenseChart.data.datasets[0].data = amounts;
    expenseChart.update();
}

// Check balance for warning
function checkBalance() {
    const totalIncome = calculateTotalIncome();
    const totalExpenses = calculateTotalExpenses();
    
    if (totalExpenses > totalIncome) {
        showAlert('Warning: Your expenses exceed your income!');
    }
}

// Show alert message
function showAlert(message) {
    alert(message);
}

// Generate unique ID for items
function generateID() {
    return Math.random().toString(36).substr(2, 9);
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 