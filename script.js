// TODO:
// Input validation

// ================================
//     html elements/constants
// ================================
const ordersTable = document.getElementById("orders-table");

const addBooksButton = document.getElementById("add-books-btn");
const gradeSelect = document.getElementById("grade-select");
const subjectSelect = document.getElementById("subject-select");
const storybookSelect = document.getElementById("storybook-select");
const weekCheckboxes = Array.from(document.querySelectorAll(".week-checkbox"));
const allWeeksButton = document.getElementById("all-weeks-btn");
const copiesNumber = document.getElementById("copies-number");
const ppPageNumber = document.getElementById("ppPage-number");
const ppBookNumber = document.getElementById("ppBook-number");

const totalPagesDisplay = document.getElementById("total-pages-display");
const totalBooksDisplay = document.getElementById("total-books-display");
const totalPriceDisplay = document.getElementById("total-price-display");

const englishPagesTable = document.getElementById("english-pages-table");
const storybookPagesTable = document.getElementById("storybook-pages-table");
const mathPagesTable = document.getElementById("math-pages-table");
const chemPagesTable = document.getElementById("chem-pages-table");

// ================================
//        page number tables
// ================================
/**
* creates the page number table(s) (used for english, math, and chemistry)
* 
* @param {HTMLTableElement} table: the table element to append the rows to
* @param {string[]} cols: column headers
* @param {string[]} rows: row headers
*/
function createPagesTable(table, cols, rows) {
    const createElementWithAttributes = (tag, attributes = {}, children = []) => {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => element[key] = value);
        children.forEach(c => element.appendChild(c));
        return element;
    };

    const createInputCell = () => {
        return createElementWithAttributes("td", {}, [
            createElementWithAttributes("input", {
                type: "number",
                min: 0,
                value: 0,
                className: "page-number-input",
            })
        ]);
    };

    const createRow = (rowLabel, rowIndex) => {
        const cells = [
            createElementWithAttributes("td", { textContent: rowLabel }),
            ...Array(cols.length - 2).fill().map(() => createInputCell()),
            createElementWithAttributes("td")
        ];
        return createElementWithAttributes("tr", { id: `${table.id}-r${rowIndex + 1}` }, cells);
    };

    const headerRow = createElementWithAttributes("tr", { id: `${table.id}-r0` },
        cols.map((col, i) => createElementWithAttributes("th", { textContent: col, id: `${table.id}-c${i}` })));
    const bodyRows = rows.map((row, i) => createRow(row, i));

    [headerRow, ...bodyRows].forEach(r => table.appendChild(r));
}


/**
* creates the page number table for storybooks.
* separate function to other page number tables since format is different.
* 
* @param {HTMLTableElement} table: the table element to append the row to
* @param {string[]} cols: column headers
*/
function createStorybookPagesTable(table, cols) {
    const createElementWithAttributes = (tag, attributes = {}, children = []) => {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => element[key] = value);
        children.forEach(c => element.appendChild(c));
        return element;
    };

    const createHeaderCell = (col, index) =>
        createElementWithAttributes("th", {
            textContent: col,
            id: `${table.id}-c${index},`
        });

    const createInputCell = () =>
        createElementWithAttributes("td", {}, [
            createElementWithAttributes("input", {
                type: "number",
                value: 0,
                min: 0,
            })
        ]);

    const createRow = (cells, rowIndex) => createElementWithAttributes("tr", { id: `${table.id}-r${rowIndex}` }, cells);

    const headerRow = createRow(cols.map(createHeaderCell), 0);
    const bodyRow = createRow(cols.map(createInputCell), 1);

    [headerRow, bodyRow].forEach(r => table.appendChild(r));
}

const cols = ["", "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10", "Total"];
const rows = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12", "Scholarship", "Selective"];
createPagesTable(englishPagesTable, cols, rows);
createStorybookPagesTable(storybookPagesTable, cols.slice(7, 11));
createPagesTable(mathPagesTable, cols, rows);
createPagesTable(chemPagesTable, cols, rows.slice(11, 13));
const pageNumberInputs = Array.from(document.querySelectorAll(".page-number-input"));

// ================================
//           listeners
// ================================
addBooksButton.addEventListener('click', () => {
    addOrder(ordersTable, totalPagesDisplay, totalBooksDisplay, totalPriceDisplay);
});

// these listeners handle the "all weeks" checkbox functionality
allWeeksButton.addEventListener('click', e => {
    e.target.checked ? weekCheckboxes.forEach(w => w.checked = true) : weekCheckboxes.forEach(w => w.checked = false);
});

weekCheckboxes.forEach(w => w.addEventListener('click', e => {
    if (e.target.checked && weekCheckboxes.every(w => w.checked)) {
        allWeeksButton.checked = true;
        return;
    }
    if (!e.target.checked && allWeeksButton.checked) {
        allWeeksButton.checked = false;
        return;
    }
}));

// handling auto-selecting of storybook
[gradeSelect, subjectSelect].forEach(e => e.addEventListener('change', () => {
    ["7", "8", "9", "10"].includes(gradeSelect.value) && subjectSelect.value == "English" ? storybookSelect.value = gradeSelect.value : storybookSelect.value = "None";
}));

pageNumberInputs.forEach(i => i.addEventListener('input', e => {
    const parentRow = e.target.closest("tr");
    const parentRowCells = Array.from(parentRow.querySelectorAll("td")).slice(1, -1);
    const pageNumbers = parentRowCells.map(c => parseInt(c.firstElementChild.value));
    const sum = pageNumbers.reduce((acc, n) => acc + n);
    parentRow.lastElementChild.textContent = sum;
}));

// ================================
//           functions
// ================================
/**
 * processes the weekCheckboxes array into an array of values.
 * elements in the array are strings of integers.
 * 
 * @param {HTMLInputElement[]} weeks: array of checkboxes that each represent a week from 1-10
 * @returns {string[]} array of numbers as strings representing the checked weeks.
 */
function getWeeks(weeks) {
    const checkedWeeks = weeks.filter(w => w.checked);
    const checkedWeeksValues = checkedWeeks.map(w => w.value);
    return checkedWeeksValues;
}

/**
 * returns a formatted string representing which weeks were checked.
 * 
 * @param {string[]} weeks: array of strings that correspond to which weeks have been checked
 * @returns {string}
 */
function formatWeeks(weeks) {
    const weekInts = weeks.map(w => parseInt(w));

    // split the array into segments (an array of arrays)
    const segments = weekInts.reduce((acc, curr) => {
        const lastSegment = acc[acc.length - 1];

        if (!lastSegment || curr != lastSegment[lastSegment.length - 1] + 1) {
            return [...acc, [curr]];
        } else {
            return [...acc.slice(0, acc.length - 1), [...lastSegment, curr]];
        }
    }, []);

    // map each segment into a formatted string
    const res = segments.map(seg => {
        if (seg.length == 1) {
            return `${seg[0]}`;
        } else {
            return `${seg[0]}-${seg[seg.length - 1]}`;
        }
    });

    return res.join(", ");
}

/**
 * calculates and returns the number of books in the current order.
 * 
 * @param {string[]} weeks: array of strings that correspond to which weeks have been checked
 * @param {number} copies: number of copies in current order
 * @param {string} storybook: indicates which grade of storybook in current order
 * @returns {number}
 */
function getNumBooks(weeks, copies, storybook) {
    const booksPerCopy = storybook == "None" ? weeks.length : weeks.length + 1;
    return booksPerCopy * copies;
}

/**
 * calculates the number of pages for each student in the order.
 * 
 * @param {string[]} weeks: array of strings that correspond to which weeks have been checked
 * @param {string} grade: grade of current order
 * @param {string} subject: subject of current order
 * @param {string} storybook: indicates which grade of storybook in current order
 * @returns {number}  
 */
function getNumPages(weeks, grade, subject, storybook, copies) {
    const row = getPageNumbersRow(grade, subject);
    const cells = weeks.map(w => row.cells[parseInt(w)]);
    const total = cells.reduce((acc, c) => {
        return acc + parseInt(c.firstElementChild.value);
    }, 0);
    if (storybook != "None") {
        const sbRow = storybookPagesTable.rows[1];
        const sbCell = sbRow.cells[parseInt(storybook) - 7];
        const sbValue = parseInt(sbCell.firstElementChild.value);
        return (total + sbValue) * copies;
    } else {
        return total * copies;
    }
}

/**
 * TODO: maybe move this into the getNumPages function?
 * returns the correct row in the correct page numbers table based on grade and subject
 * 
 * @param {string} grade: grade of the current order
 * @param {string} subject: subject of the current order
 * @returns {HTMLTableRowElement}
 */
function getPageNumbersRow(grade, subject) {
    const table = document.getElementById(`${subject.toLowerCase()}-pages-table`);
    const rowIdMap = {
        "Prep": "1",
        "Scholarship": "14",
        "Selective": "15"
    };
    const getRowId = grade => rowIdMap[grade] || parseInt(grade) + 1;
    const row = document.getElementById(`${table.id}-r${getRowId(grade)}`);
    return row;
}

/**
 * returns the price of the current order.
 * 
 * @param {HTMLInputElement} ppPage: number input for price per page
 * @param {HTMLInputElement} ppBook: number input for price per book
 * @param {number} numPages: number of pages in the order
 * @param {number} numBooks: number of books in the order
 * @returns {number}
 */
function getPrice(ppPage, ppBook, numPages, numBooks) {
    return (parseFloat(ppPage) * numPages) + (parseFloat(ppBook) * numBooks);
}

/**
 * sums up the value of all cells in a table column
 * 
 * @param {HTMLTableElement} table: table to get data from
 * @param {number} index: column index of the table to sum 
 * @returns {number}
 */
function getOrderTotal(table, index) {
    if (table.rows.length == 1) {
        return 0;
    }

    const rows = Array.from(table.rows).slice(1);
    const cells = rows.map(r => parseFloat(r.cells[index].textContent));
    const sum = cells.reduce((acc, c) => acc + c);
    return sum;
}

/**
 * updates the totals displays based on the current state of the table
 * 
 * @param {*} table: table to get data from 
 * @param {*} totalPagesElem: html element to write result to 
 * @param {*} totalBooksElem: html element to write result to  
 * @param {*} totalPriceElem: html element to write result to  
 */
function updateOrderTotals(table, totalPagesElem, totalBooksElem, totalPriceElem) {
    const totalPages = getOrderTotal(table, 6);
    const totalBooks = getOrderTotal(table, 5);
    const totalPrice = getOrderTotal(table, 7);

    totalPagesElem.innerHTML = totalPages;
    totalBooksElem.innerHTML = totalBooks;
    totalPriceElem.innerHTML = totalPrice.toFixed(2);
}

/**
 * collates all the required information and adds a new row to the orders table.
 * 
 * @param {HTMLTableElement} table: table to append rows to
 * @param {HTMLSpanElement} totalPagesElem: html element to write result to 
 * @param {HTMLSpanElement} totalBooksElem: html element to write result to 
 * @param {HTMLSpanElement} totalPriceElem: html element to write result to 
 */
function addOrder(table, totalPagesElem, totalBooksElem, totalPriceElem) {
    const grade = gradeSelect.value;
    const subject = subjectSelect.value;
    const storybook = storybookSelect.value;
    const weeks = getWeeks(weekCheckboxes);
    const formattedWeeks = formatWeeks(weeks);
    const copies = copiesNumber.value;
    const books = getNumBooks(weeks, parseInt(copies), storybook);
    const pages = getNumPages(weeks, grade, subject, storybook, parseInt(copies));
    const price = getPrice(ppPageNumber.value, ppBookNumber.value, pages, books).toFixed(2);

    cells = [grade, subject, storybook, formattedWeeks, copies, books, pages, price].map(e => {
        const newCell = document.createElement("td");
        newCell.textContent = e;
        return newCell;
    });
    const deleteRowCell = document.createElement("td");
    deleteRowCell.classList.add("delete-row-cell");
    const deleteRowBtn = document.createElement("button");
    deleteRowBtn.addEventListener('click', e => {
        const currentRow = e.target.closest("tr");
        currentRow.remove();
        updateOrderTotals(table, totalPagesElem, totalBooksElem, totalPriceElem);
    })
    deleteRowBtn.textContent = "X";
    deleteRowCell.appendChild(deleteRowBtn);

    const newRow = document.createElement("tr");
    newRow.id = `${table.id}-r${table.rows.length}`;
    cells.forEach(c => newRow.appendChild(c));
    newRow.appendChild(deleteRowCell);

    table.appendChild(newRow);
    updateOrderTotals(table, totalPagesElem, totalBooksElem, totalPriceElem);
}