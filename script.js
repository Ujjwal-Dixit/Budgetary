// DOM ELEMENTS

// Budget Fields
const monthBudget = document.querySelector('.budget__title--month');
const budgetValue = document.querySelector('.budget__value');
const budgetIncomeValue = document.querySelector('.budget__income--value');
const budgetExpenseValue = document.querySelector('.budget__expenses--value');
const budgetExpensePercentage = document.querySelector('.budget__expenses--percentage');

// Input Fields
const inputType = document.querySelector('.add__type');  // Will be inc(+)/exp(-)
const inputDescription = document.querySelector('.add__description');
const inputValue = document.querySelector('.add__value');
const checkButton = document.querySelector('.add__btn');
const incomeListContainer = document.querySelector('.income__list');
const expenseListContainer = document.querySelector('.expenses__list');

// Event Delegation
const containerForDeleteButton = document.querySelector('.container');


// CLASSES

// BUDGET CONTROLLER
class BudgetController {
  constructor() {
    this.incomeId = 1;
    this.expenseId = 1;
    this.incomes = [];
    this.expenses = [];
  }

  // Generate ID: Which will be use to delete the items
  generateIncomeID() {
    return this.incomeId++;
  }

  generateExpenseID() {
    return this.expenseId++;
  }

  addNewItem(type, description, value) {
    let newItem;
    if (type === 'inc') {
      newItem = new Income(description, value, this.generateIncomeID());
      this.incomes.push(newItem);
    } else if (type === 'exp') {
      newItem = new Expense(description, value, this.generateExpenseID());
      this.expenses.push(newItem);
    }
    this.calculateExpensePercentages();
    return newItem;
  }

  deleteCreatedItem(type, id) {
    let itemsArray = (type === 'inc') ? this.incomes : this.expenses;
    const index = itemsArray.findIndex(item => item.id === id);
    if (index !== -1) itemsArray.splice(index, 1);
  }

  calculateTotal(type) {
    let sum = 0;
    const calcTotal = (type === 'inc' ? this.incomes : this.expenses)
    calcTotal.forEach(item => sum += item.value)
    return sum;
  }

  calculateBudget() {
    const totalIncome = this.calculateTotal('inc');
    const totalExpense = this.calculateTotal('exp');
    const budget = totalIncome - totalExpense;
    const percentage = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : -1;
    return {
      totalIncome,
      totalExpense,
      budget,
      percentage
    }
  }

  calculateExpensePercentages() {
    const totalIncome = this.calculateTotal('inc');
    const expensePercentage = this.expenses.map(expense => {
      expense.percentage = totalIncome > 0 ? Math.round((expense.value / totalIncome) * 100) : -1;
      return expense.percentage;
    });
    return expensePercentage;
  }
};


// INCOME
class Income {
  constructor(description, value, id) {
    this.id = id;
    this.description = description;
    this.value = value;
  }
};


// EXPENSE
class Expense {
  constructor(description, value, id) {
    this.id = id;
    this.description = description;
    this.value = value;
  }
};


// UI CONTROLLER
class UIController {
  constructor() {
    this.html;
  }

  addListItem(type, newItem) {
    if (type === 'inc') {
      this.html =
        `
       <div class="item clearfix" id="inc-${newItem.id}">
           <div class="item__description">${newItem.description}</div>
           <div class="right clearfix">
               <div class="item__value">+ ${newItem.value.toLocaleString('en-IN')}</div>
               <div class="item__delete">
                   <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
               </div>
           </div>
       </div>
      `
      incomeListContainer.insertAdjacentHTML("beforeend", this.html);
    }

    if (type === 'exp') {
      const expensePercentage = newItem.percentage >= 0 ? `${newItem.percentage}%` : '--';
      this.html =
        `
       <div class="item clearfix" id="exp-${newItem.id}">
           <div class="item__description">${newItem.description}</div>
           <div class="right clearfix">
               <div class="item__value">- ${newItem.value.toLocaleString('en-IN')}</div>
               <div class="item__percentage">${expensePercentage}</div>
               <div class="item__delete">
                   <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
               </div>
           </div>
       </div>
      `
      expenseListContainer.insertAdjacentHTML("beforeend", this.html);
    }
    this.updateExpensePercentages();
  }

  updateExpensePercentages() {
    const expenseItems = document.querySelectorAll('.expenses__list .item');

    expenseItems.forEach(item => {
      const itemId = item.id.split('-')[1];
      const expense = appController.budgetController.expenses.find(expense => expense.id === parseInt(itemId));
      const expensePercentage = expense ? `${expense.percentage}%` : '--';
      item.querySelector('.item__percentage').textContent = expensePercentage;
    });
  }

  deleteListItem(selectorID) {
    const element = document.getElementById(selectorID);
    element.parentNode.removeChild(element);
  }

  clearFields() {
    inputDescription.value = '';
    inputValue.value = '';
    inputDescription.focus();
  }

  displayBudget(budget) {
    budgetValue.textContent = `+ ${budget.budget.toLocaleString('en-IN')}`;
    budgetIncomeValue.textContent = `+ ${budget.totalIncome.toLocaleString('en-IN')}`;
    budgetExpenseValue.textContent = `- ${budget.totalExpense.toLocaleString('en-IN')}`;
    (budget.percentage >= 0) ? budgetExpensePercentage.textContent = `${budget.percentage}%` : budgetExpensePercentage.textContent = `--`;
  }

  displayMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.toLocaleString("default", { month: "long" });
    monthBudget.textContent = `${month} ${year}`;
  }

  changeUX(event) {
    const fields = [inputType, inputDescription, inputValue];
    fields.forEach(cur => cur.classList.toggle('red-focus'));
    checkButton.classList.toggle('red');
  }
};


// APP CONTROLLER
class AppController {
  constructor(budgetController, uiController) {
    this.budgetController = budgetController;
    this.uiController = uiController;

    // Event Listeners
    checkButton.addEventListener('click', this.clickButton.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    containerForDeleteButton.addEventListener('click', this.deleteItem.bind(this));
    inputType.addEventListener('change', this.uiController.changeUX.bind(this));
  };

  clickButton(event) {
    this.addItem();
    event.preventDefault();
  }

  handleKeyDown(event) {
    if (event.key === 'Enter') {
      this.addItem();
      event.preventDefault();
    }
  }

  updateBudget() {
    this.budgetController.calculateBudget();
    const budgetObject = this.budgetController.calculateBudget();
    this.uiController.displayBudget(budgetObject);
  }

  addItem() {
    const type = inputType.value;
    const description = inputDescription.value;
    const value = +(inputValue.value);

    if (description !== '' && !isNaN(value) && value > 0) {
      const newItem = this.budgetController.addNewItem(type, description, value);
      this.uiController.addListItem(type, newItem);
      this.uiController.clearFields();
      this.updateBudget();
      this.budgetController.calculateExpensePercentages();
    }
  }

  deleteItem(event) {
    const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;  // inc-1/exp-1
    if (itemID) {
      const splitID = itemID.split('-');
      const type = splitID[0];
      const id = +(splitID[1]);

      this.budgetController.deleteCreatedItem(type, id);
      this.uiController.deleteListItem(itemID);
      this.updateBudget();
      this.budgetController.calculateExpensePercentages();
    }
  }

  initialize() {
    console.log("Application has started.");
    this.uiController.displayMonth();
    this.uiController.displayBudget({
      budget: 0,
      totalIncome: 0,
      totalExpense: 0,
      percentage: -1,
    });
  }
};

// CREATING INSTANCES
const budgetController = new BudgetController();
const uiController = new UIController();
const appController = new AppController(budgetController, uiController);
appController.initialize();