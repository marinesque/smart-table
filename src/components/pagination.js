import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    // #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
    const pageTemplate = pages.firstElementChild.cloneNode(true); // в качестве шаблона берём первый элемент из контейнера со страницами
    pages.firstElementChild.remove();                             // и удаляем его

    // Временная переменная для количества страниц с последней отрисовки.
    // Она живёт в замыкании между вызовами applyPagination/updatePagination —
    // это нужно потому, что applyPagination вызывается ДО запроса к серверу
    // (мы ещё не знаем актуальное общее число записей на этот момент),
    // а действие "последняя страница" требует уже посчитанного pageCount.
    // Поэтому используем то значение, что осталось от прошлой успешной отрисовки.
    let pageCount;

    // Формируем параметры пагинации ДО обращения к серверу.
    // Модуль больше не работает с реальными данными — он просто добавляет
    // в query нужные параметры (limit, page), которые уйдут в запрос.
    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage; // сколько строк на страницу — уходит в query как есть
        let page = state.page;           // переменная, т.к. может измениться при обработке действия ниже

        // (перенесено из #2.6) — обработать действия кнопок first/prev/next/last
        if (action) switch (action.name) {
            case 'prev': page = Math.max(1, page - 1); break;         // переход на предыдущую страницу
            case 'next': page = Math.min(pageCount, page + 1); break; // переход на следующую; pageCount берём с прошлой отрисовки
            case 'first': page = 1; break;                            // переход на первую страницу
            case 'last': page = pageCount; break;                     // переход на последнюю; тоже требует прошлого pageCount
        }

        // Object.assign({}, query, {...}) создаёт НОВЫЙ объект вместо мутации
        // переданного query — это важно, потому что тот же query дальше
        // будет ещё дополняться другими модулями (search/filter/sort),
        // и мы не должны неявно менять объект, которым уже кто-то мог
        // владеть снаружи.
        return Object.assign({}, query, {
            limit,
            page
        });
    }

    // Перерисовываем пагинатор ПОСЛЕ того, как сервер ответил.
    // total — реальное количество записей, пришедшее в ответе api.getRecords();
    // второй параметр — это те самые {page, limit}, с которыми был сделан запрос
    // (то есть уже применённые applyPagination значения, а не "сырой" state).
    const updatePagination = (total, {page, limit}) => {
        pageCount = Math.ceil(total / limit); // пересчитываем и запоминаем для следующего клика по "последняя страница"

        // (перенесено из #2.4) — получить список видимых страниц и вывести их
        const visiblePages = getPages(page, pageCount, 5);          // получаем массив страниц для показа, максимум 5
        pages.replaceChildren(...visiblePages.map(pageNumber => {   // перебираем их и создаём для них кнопку
            const el = pageTemplate.cloneNode(true);                // клонируем шаблон, который запомнили ранее
            return createPage(el, pageNumber, pageNumber === page); // вызываем колбэк из настроек, чтобы заполнить кнопку данными
        }));

        // (перенесено из #2.5, rowsPerPage заменена на limit) — обновить статус пагинации
        fromRow.textContent = (page - 1) * limit + 1;              // с какой строки выводим
        toRow.textContent = Math.min((page * limit), total);       // до какой строки выводим
        totalRows.textContent = total;                             // сколько всего строк — теперь это реальное число с сервера
    }

    // #2.2 (срез данных data.slice(...)) больше не нужен вообще:
    // сервер сам возвращает только нужную страницу записей по параметрам
    // limit/page — обрезать на клиенте нечего, items уже готовы к выводу.

    return {
        updatePagination,
        applyPagination
    };
}