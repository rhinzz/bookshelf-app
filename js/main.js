const books = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "BOOKSHELF-APPS";
const SAVED_EVENT = "save-bookshelf";

function addBook() {
  const bookID = generateId();
  const bookFormTitle = document.getElementById("bookFormTitle").value;
  const bookFormAuthor = document.getElementById("bookFormAuthor").value;
  const bookFormYear = +document.getElementById("bookFormYear").value;
  const bookFormIsComplete = document.getElementById("bookFormIsComplete").checked;

  const newBookObject = generateNewBookObject(
    bookID,
    bookFormTitle,
    bookFormAuthor,
    bookFormYear,
    bookFormIsComplete
  );

  books.push(newBookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBookData();
}

function generateId() {
  return new Date().getTime();
}

function generateNewBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function createBook(bookObject) {
  const bookItem = document.createElement("div");
  bookItem.setAttribute("data-bookid", `${bookObject.id}`);
  bookItem.setAttribute("data-testid", "bookItem");
  bookItem.classList.add("book-card");

  const bookItemTitle = document.createElement("h3");
  bookItemTitle.setAttribute("data-testid", "bookItemTitle");
  bookItemTitle.innerText = `${bookObject.title}`;

  const bookItemAuthor = document.createElement("p");
  bookItemAuthor.setAttribute("data-testid", "bookItemAuthor");
  bookItemAuthor.innerText = `Penulis: ${bookObject.author}`;

  const bookItemYear = document.createElement("p");
  bookItemYear.setAttribute("data-testid", "bookItemYear");
  bookItemYear.innerText = `Tahun: ${bookObject.year}`;

  const bookItemButton = document.createElement("div");
  bookItemButton.classList.add("button-container");

  if (bookObject.isComplete) {
    const moveBookToUncompleteButton = document.createElement("button");
    moveBookToUncompleteButton.setAttribute(
      "data-testid",
      "bookItemIsCompleteButton"
    );
    moveBookToUncompleteButton.classList.add("done-reading-button");
    moveBookToUncompleteButton.innerText = "Belum Selesai Dibaca";
    moveBookToUncompleteButton.addEventListener("click", function () {
      moveBookToUncomplete(bookObject.id);
    });

    const removeBookFromList = document.createElement("button");
    removeBookFromList.setAttribute("data-testid", "bookItemDeleteButton");
    removeBookFromList.classList.add("remove-book-button");
    removeBookFromList.innerText = "Hapus Buku";
    removeBookFromList.addEventListener("click", function () {
      removeBook(bookObject.id);
    });

    bookItemButton.append(moveBookToUncompleteButton, removeBookFromList);
  } else {
    const moveBookToCompleteButton = document.createElement("button");
    moveBookToCompleteButton.setAttribute(
      "data-testid",
      "bookItemIsCompleteButton"
    );
    moveBookToCompleteButton.classList.add("done-reading-button");
    moveBookToCompleteButton.innerText = "Selesai Dibaca";
    moveBookToCompleteButton.addEventListener("click", function () {
      moveBookToComplete(bookObject.id);
    });

    const removeBookFromList = document.createElement("button");
    removeBookFromList.setAttribute("data-testid", "bookItemDeleteButton");
    removeBookFromList.classList.add("remove-book-button");
    removeBookFromList.innerText = "Hapus Buku";
    removeBookFromList.addEventListener("click", function () {
      removeBook(bookObject.id);
    });

    bookItemButton.append(moveBookToCompleteButton, removeBookFromList);
  }
  bookItem.append(bookItemTitle, bookItemAuthor, bookItemYear, bookItemButton);
  return bookItem;
}

function moveBookToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) {
    return;
  }

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBookData();
}

function moveBookToUncomplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) {
    return;
  }

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBookData();
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) {
    return;
  }

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveBookData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function saveBookData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser anda tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadBookFromStorage() {
  const bookDataFromStorage = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(bookDataFromStorage);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

const bookFormIsComplete = document.getElementById("bookFormIsComplete");
bookFormIsComplete.addEventListener("change", function () {
  const submitTarget = document.getElementById("submitTarget");
  if (this.checked) {
    submitTarget.innerText = '"Selesai Dibaca"';
  } else {
    submitTarget.innerText = '"Belum Selesai Dibaca"';
  }
});

const bookTitleQuery = document.getElementById("searchBookTitle");
const searchBookByTitle = document.getElementById("searchBook");
searchBookByTitle.addEventListener("submit", function (e) {
  e.preventDefault();

  const search = [...books].filter((each) =>
    each.title
      .toLowerCase()
      .trim()
      .includes(bookTitleQuery.value.toLowerCase().trim())
  );

  const incompleteBookList = document.getElementById("incompleteBookList");
  incompleteBookList.innerHTML = "";

  const completeBookList = document.getElementById("completeBookList");
  completeBookList.innerHTML = "";

  if (search.length > 0) {
    for (const item of search) {
      if (!item.isComplete) {
        incompleteBookList.append(createBook(item));
      } else {
        completeBookList.append(createBook(item));
      }
    }
  } else {
    alert("Buku tidak ditemukan!");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const submitBookForm = document.getElementById("bookForm");
  submitBookForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addBook();
    const inputList = document.querySelectorAll("input");
    for (const input of inputList) {
      if (input.getAttribute("type") === "checkbox") {
        const submitTarget = document.getElementById("submitTarget");
        submitTarget.innerText = '"Belum Selesai Dibaca"';
        input.checked = false;
      }
      input.value = "";
    }
  });
});

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookList = document.getElementById("incompleteBookList");
  incompleteBookList.innerHTML = "";

  const completeBookList = document.getElementById("completeBookList");
  completeBookList.innerHTML = "";

  for (const book of books) {
    const bookItem = createBook(book);
    if (!book.isComplete) {
      incompleteBookList.append(bookItem);
    } else {
      completeBookList.append(bookItem);
    }
  }
});

if (isStorageExist()) {
  loadBookFromStorage();
}
