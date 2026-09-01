import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
    const pageTemplate = pages.firstElementChild.cloneNode(true); // в качестве шаблона берём первый элемент из контейнера со страницами
    pages.firstElementChild.remove();                             // и удаляем его

    return (data, state, action) => {
        // #2.1 — посчитать количество страниц, объявить переменные и константы
        const rowsPerPage = state.rowsPerPage;                     // будем часто обращаться, чтобы короче записывать
        const pageCount = Math.ceil(data.length / rowsPerPage);    // число страниц округляем в большую сторону
        let page = state.page;                                     // переменная, потому что может меняться при обработке действий позже

        // #2.6 — обработать действия
        if (action) switch (action.name) {
            case 'prev': page = Math.max(1, page - 1); break;         // переход на предыдущую страницу
            case 'next': page = Math.min(pageCount, page + 1); break; // переход на следующую страницу
            case 'first': page = 1; break;                            // переход на первую страницу
            case 'last': page = pageCount; break;                     // переход на последнюю страницу
        }

        // #2.4 — получить список видимых страниц и вывести их
        const visiblePages = getPages(page, pageCount, 5);          // получаем массив страниц для показа, максимум 5
        pages.replaceChildren(...visiblePages.map(pageNumber => {   // перебираем их и создаём для них кнопку
            const el = pageTemplate.cloneNode(true);                // клонируем шаблон, который запомнили ранее
            return createPage(el, pageNumber, pageNumber === page); // вызываем колбэк из настроек, чтобы заполнить кнопку данными
        }));

        // #2.5 — обновить статус пагинации
        fromRow.textContent = (page - 1) * rowsPerPage + 1;               // с какой строки выводим
        toRow.textContent = Math.min((page * rowsPerPage), data.length);  // до какой строки выводим
        totalRows.textContent = data.length;                              // сколько всего строк на всех страницах

        // #2.2 — посчитать сколько строк нужно пропустить и получить срез данных
        const skip = (page - 1) * rowsPerPage;      // сколько строк нужно пропустить
        return data.slice(skip, skip + rowsPerPage); // получаем нужную часть строк
    }
}