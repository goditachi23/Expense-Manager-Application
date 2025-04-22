# Expense Manager Application

A simple web application to help users manage and visualize their monthly income and expenditures in Indian Rupees (₹) with proper Indian number formatting (e.g., ₹1,23,456.00).

## Features

- Track multiple income sources
- Track multiple expenses
- View summary of total income, total expenses, and remaining balance
- Visualize income and expense distribution with pie charts
- View detailed tables of income and expenses
- Edit or delete entries
- Data is automatically saved in your browser (localStorage)
- Responsive design that works on mobile and desktop
- Alerts when expenses exceed income
- Indian currency format with comma separators (e.g., ₹1,23,456.00)

## How to Use

1. **Setup**
   - Simply open the `index.html` file in your web browser
   - No server or installation required

2. **Adding Income**
   - Enter the income source title (e.g., "Salary", "Freelance")
   - Enter the amount in ₹ (Indian Rupees)
   - Click "Add Income"

3. **Adding Expenses**
   - Enter the expense title (e.g., "Rent", "Groceries")
   - Enter the amount in ₹ (Indian Rupees)
   - Click "Add Expense"

4. **Viewing Summary**
   - The summary section shows your total income, total expenses, and remaining balance in ₹
   - All values are displayed in Indian number format with appropriate comma separators (e.g., ₹1,23,456.00)
   - The remaining balance will be highlighted in green if positive, or red if negative

5. **Visualizations**
   - Pie charts show the distribution of your income sources and expenses
   - Charts update automatically as you add, edit, or delete entries

6. **Managing Entries**
   - Each entry in the tables has "Edit" and "Delete" buttons
   - Click "Edit" to modify an existing entry
   - Click "Delete" to remove an entry

7. **Data Persistence**
   - All data is automatically saved in your browser's localStorage
   - Your data will persist even if you close the browser and reopen it later

## Implementation Details

- Frontend: HTML, CSS, JavaScript
- Charts: Chart.js library
- Data Storage: Browser's localStorage
- No backend server required
- Mobile responsive design
- Indian currency formatting with the standard lakh-crore system (commas after 3 digits, then after every 2 digits)

## Browser Compatibility

The application works on all modern browsers that support:
- localStorage
- ES6 JavaScript
- Chart.js

## License

This project is open source and available under the MIT License. 