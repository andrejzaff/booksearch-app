document.addEventListener("DOMContentLoaded", async function() {
    const booksJson = await fetch('books.json').then(response => response.json());
    const booksCsvText = await fetch('books.csv').then(response => response.text());

    const parseCsv = (csvText) => {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index];
                return obj;
            }, {});
        });
    };

    const booksCsv = parseCsv(booksCsvText);

    const booksMap = new Map();
    
    booksJson.forEach(book => booksMap.set(parseInt(book.id), book));
    booksCsv.forEach(book => booksMap.set(parseInt(book.id), book));
    
    const books = Array.from(booksMap.values());

    const bookList = document.getElementById('book-list');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const sortOptions = document.getElementById('sort-options');
    const noResults = document.getElementById('no-results');

    function displayBooks(books) {
        bookList.innerHTML = '';
        if (books.length === 0) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
            books.forEach(book => {
                const bookItem = document.createElement('div');
                bookItem.classList.add('book-item');
                bookItem.innerHTML = `
                    <h2 class="book-item__title">${highlightMatch(book.title, searchInput.value)}</h2>
                    <p class="book-item__author">Author: ${highlightMatch(book.author, searchInput.value)}</p>
                    <p class="book-item__genre">Genre: ${highlightMatch(book.genre, searchInput.value)}</p>
                `;
                bookList.appendChild(bookItem);
            });
        }
    }

    function filterBooks() {
        const query = searchInput.value.toLowerCase();
        const filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(query) || 
            book.author.toLowerCase().includes(query) || 
            book.genre.toLowerCase().includes(query)
        );
        displayBooks(filteredBooks);
    }

    function highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="book-item__highlight">$1</span>');
    }

    function sortBooks(books, criterion) {
        return books.sort((a, b) => a[criterion].localeCompare(b[criterion]));
    }

    searchButton.addEventListener('click', filterBooks);
    sortOptions.addEventListener('change', function() {
        const sortedBooks = sortBooks(books, sortOptions.value);
        displayBooks(sortedBooks);
    });

    displayBooks(sortBooks(books, 'author'));
});
