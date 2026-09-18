import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    // число страниц с последней отрисовки
    // Опеременная будет в замыкании между вызовами applyPagination/updatePagination —
    // до запроса к серверу число страниц неизвестно
    // последняя страница этоуже посчитанный pageCount
    // поэтому используем значение прошлой успешной отрисовки
    let pageCount;

    // в query нужные параметры (limit, page)
    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        if (action) switch (action.name) {
            case 'prev': page = Math.max(1, page - 1); break;
            case 'next': page = Math.min(pageCount, page + 1); break;  // пpageCount берём с прошлой отрисовки
            case 'first': page = 1; break;
            case 'last': page = pageCount; break;                      // тоже нужен прошлый pageCount
        }

        // создаем новый объект Object.assign()
        // вместо использования и неявного изменения старого query
        // т.к он будет дополняться другими модулями (search/filter/sort)
        return Object.assign({}, query, {limit, page});
    }

    // перерисовка пагинатора после ответа сервера
    // total реальное количество записей из api.getRecords()
    // {page, limit} параметры из запрроса, применённые applyPagination
    const updatePagination = (total, {page, limit}) => {
        pageCount = Math.ceil(total / limit);

        // получить список видимых страниц и вывести их #2.4
        const visiblePages = getPages(page, pageCount, 5);           // массив страниц
        pages.replaceChildren(...visiblePages.map(pageNumber => {    // перебираем их и создаём для них кнопку
            const el = pageTemplate.cloneNode(true);                 // клонируем запомненный шаблон
            return createPage(el, pageNumber, pageNumber === page);  // колбэк из настроек, заполняем данными
        }));

        // rowsPerPage->limit,обновить статус пагинации #2.5
        fromRow.textContent = (page - 1) * limit + 1;         // с какой строки
        toRow.textContent = Math.min((page * limit), total);  // до какой строки
        totalRows.textContent = total;                        // сколько всего строк по данным с сервера
    }

    // #2.2 (срез данных data.slice(...)) больше не нужен, сервер будет возвращать нужную страницу записей по параметрам квери

    return {
        updatePagination,
        applyPagination
    };
}