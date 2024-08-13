// Elements
const table = document.getElementById("table");
const addBooks = document.getElementById("add-books-btn");
const grade = document.getElementById("grade-select");
const subject = document.getElementById("subject-select");
const storyBook = document.getElementById("storybook-select");
const allWeeksArray = Array.from(document.querySelectorAll(".week-checkbox"));
const allWeeks = document.getElementById("all");
const copies = document.getElementById("copies");
const ppBook = document.getElementById("ppBook");
const ppPage = document.getElementById("ppPage");
const priceFormula = document.getElementById("price-formula");
const totalPages = document.getElementById("total-pages");
const totalBooks = document.getElementById("total-books");
const totalPrice = document.getElementById("total-price");
const pageNumbersArray = document.querySelectorAll(".pn-input");
const storyBookPageNumbersArray = Array.from(document.querySelectorAll(".sb-pn"));

// Listener Events
addBooks.addEventListener('click', e => {
    addRow();
});

grade.addEventListener('change', e => {
    if (["7", "8", "9", "10"].includes(e.target.value) && subject.value == "English") {
        storyBook.value = e.target.value;
    } else {
        storyBook.value = "None";
    }
})

subject.addEventListener('change', e => {
    if (e.target.value != "English") {
        storyBook.value = "None";
    } else {
        if (["7", "8", "9", "10"].includes(grade.value)) {
            storyBook.value = grade.value;
        }
    }
});

subject.addEventListener('change', e => {
    let optionsToHide = grade.querySelectorAll("option[class='no-chem']");
    if (e.target.value == "Chemistry") {
        optionsToHide.forEach(o => o.disabled = true);
        if (grade.value != "11" && grade.value != "12") {
            grade.value = "11";
        }
    } else {
        optionsToHide.forEach(o => o.disabled = false);
    }
});

allWeeksArray.forEach(week => week.addEventListener('click', e => {
    if (e.target.checked == false) {
        allWeeks.checked = false;
    } else {
        if (allWeeksArray.every(week => week.checked == true)) {
            allWeeks.checked = true;
        }
    }
}));

allWeeks.addEventListener('click', e => {
    if (e.target.checked == true) {
        allWeeksArray.forEach(e => { e.checked = true });
    } else {
        allWeeksArray.forEach(e => { e.checked = false });
    }
});

ppBook.addEventListener('input', updatePriceFormula);
ppPage.addEventListener('input', updatePriceFormula);

pageNumbersArray.forEach(c => c.addEventListener('input', e => {
    let currentRow = e.target.closest("tr");
    let currentRowChildren = currentRow.querySelectorAll("td");
    let cells = Array.from(currentRowChildren).slice(1, -1);
    let pageNumbers = cells.map(c => c.querySelector("input").value ? parseInt(c.querySelector("input").value) : 0);
    let total = pageNumbers.reduce((acc, x) => acc + x, 0);

    currentRow.lastElementChild.value = total;
    currentRow.lastElementChild.innerHTML = total;
}));

// Functions
function addRow() {

    let row = document.createElement("tr");

    let gradeCell = document.createElement("td");
    let subjectCell = document.createElement("td");
    let storyBookCell = document.createElement("td");
    let weeksCell = document.createElement("td");
    let copiesCell = document.createElement("td");
    let booksCell = document.createElement("td");
    let pagesCell = document.createElement("td");
    let priceCell = document.createElement("td");

    let gradeData = document.createTextNode(grade.value);
    let subjectData = document.createTextNode(subject.value);
    let storyBookData = document.createTextNode(storyBook.value);
    let weeksData = document.createTextNode(parseWeeks());
    let copiesData = document.createTextNode(copies.value);
    let booksData = document.createTextNode(getNumBooks() * copies.value);
    let pagesData = document.createTextNode(getNumPages() * copies.value);
    let priceData = document.createTextNode(`$${getPrice().toFixed(2)}`);

    gradeCell.appendChild(gradeData);
    subjectCell.appendChild(subjectData);
    storyBookCell.appendChild(storyBookData);
    weeksCell.appendChild(weeksData);
    copiesCell.appendChild(copiesData);
    booksCell.appendChild(booksData);
    pagesCell.appendChild(pagesData);
    priceCell.appendChild(priceData);

    row.appendChild(gradeCell);
    row.appendChild(subjectCell);
    row.appendChild(storyBookCell);
    row.appendChild(weeksCell);
    row.appendChild(copiesCell);
    row.appendChild(booksCell);
    row.appendChild(pagesCell);
    row.appendChild(priceCell);

    let deleteRowCell = document.createElement("td");
    deleteRowCell.classList.add("delete-row-cell");
    let deleteRowBtn = document.createElement("button");
    deleteRowBtn.classList.add("delete-row-btn");
    deleteRowBtn.addEventListener('click', e => {
        let currentRow = e.target.closest("tr");

        let currentPages = parseInt(totalPages.innerHTML);
        let currentBooks = parseInt(totalBooks.innerHTML);
        let currentPrice = parseFloat(totalPrice.innerHTML);

        let rowPages = parseInt(currentRow.cells[6].innerHTML);
        let rowBooks = parseInt(currentRow.cells[5].innerHTML);
        let rowPrice = parseFloat(currentRow.cells[7].innerHTML.slice(1));

        totalPages.innerHTML = `${currentPages - rowPages}`;
        totalBooks.innerHTML = `${currentBooks - rowBooks}`;
        totalPrice.innerHTML = `${(currentPrice - rowPrice).toFixed(2)}`;

        currentRow.remove();
    });
    let deleteRowLabel = document.createTextNode("X");

    deleteRowBtn.appendChild(deleteRowLabel);
    deleteRowCell.appendChild(deleteRowBtn);
    row.appendChild(deleteRowCell);

    table.appendChild(row);

    let currentPages = parseInt(totalPages.innerHTML);
    let currentBooks = parseInt(totalBooks.innerHTML);
    let currentPrice = parseFloat(totalPrice.innerHTML);

    totalPages.innerHTML = `${currentPages + (getNumPages() * copies.value)}`;
    totalBooks.innerHTML = `${currentBooks + (getNumBooks() * copies.value)}`;
    totalPrice.innerHTML = `${(currentPrice + getPrice()).toFixed(2)}`;
}

function parseWeeks() {
    let checkedWeeks = [];
    allWeeksArray.forEach(week => {
        if (week.checked) {
            checkedWeeks.push(parseInt(week.value));
        }
    });

    let res = [];
    let start = checkedWeeks[0];
    let end = checkedWeeks[0];

    for (let i = 1; i < checkedWeeks.length; i++) {
        if (checkedWeeks[i] == end + 1) {
            end = checkedWeeks[i];
        } else {
            if (start == end) {
                res.push(`${start}`);
            } else {
                res.push(`${start}-${end}`);
            }
            start = checkedWeeks[i];
            end = checkedWeeks[i];
        }
    }

    if (start == end) {
        res.push(`${start}`);
    } else {
        res.push(`${start}-${end}`);
    }

    return res.join(", ");
}

function getNumBooks() {
    let checkedWeeks = [];
    allWeeksArray.forEach(week => {
        if (week.checked) {
            checkedWeeks.push(parseInt(week.value));
        }
    });

    return storyBook.value != "None" ? checkedWeeks.length + 1 : checkedWeeks.length;
}

function getNumPages() {
    let subjectChar = subject.value[0].toLowerCase();
    if (allWeeks.checked) {
        let id = `${grade.value.toLowerCase()}-${subjectChar}-t`;
        let cell = document.getElementById(id);
        return parseInt(cell.value) + getStoryBookPages();
    } else {
        let total = 0;
        let checkedWeeks = [];
        allWeeksArray.forEach(week => {
            if (week.checked) {
                checkedWeeks.push(`w${week.value}`);
            }
        });
        let ids = checkedWeeks.map(w => `${grade.value.toLowerCase()}-${subjectChar}-${w}`);
        ids.forEach(id => {
            let week = document.getElementById(id);
            total += parseInt(week.value);
        })
        return total + getStoryBookPages();
    }
}

function getStoryBookPages() {
    if (storyBook.value == "None") {
        return 0;
    }
    let index = parseInt(storyBook.value) - 7;
    return parseInt(storyBookPageNumbersArray[index].value);
}

function updatePriceFormula() {
    let ppBookData = parseFloat(ppBook.value);
    let ppPageData = parseFloat(ppPage.value);
    priceFormula.innerHTML = `Formula:<br>${ppBookData}*Books + ${ppPageData}*Pages`;
}

function getPrice() {
    let numBooks = getNumBooks();
    let numPages = getNumPages();
    let ppBookData = parseFloat(ppBook.value);
    let ppPageData = parseFloat(ppPage.value);

    return (numBooks * ppBookData) + (numPages * ppPageData);
}
