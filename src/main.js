import './fonts/ys-display/fonts.css'
import './style.css'
//Убираем фиксированный датасет

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";


// api — объект с асинхронными методами getIndexes()/getRecords() для работы с сервером
const api = initData();

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    const rowsPerPage = parseInt(state.rowsPerPage); // приведём количество страниц к числу
    const page = parseInt(state.page ?? 1);          // номер страницы по умолчанию 1 и тоже число

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState(); // состояние полей из таблицы
    let query = {}; // тут будут данные
    // query = applySearching(query, state, action);
    // query = applyFiltering(query, state, action);
    // query = applySorting(query, state, action);
    // query = applyPagination(query, state, action);

    // запрашиваем данные с сервера по собранным параметрам
    const {total, items} = await api.getRecords(query); 

    sampleTable.render(items)
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// @todo: инициализация

const applySearching = initSearching('search');

// initFiltering закомментирован: он синхронно требует indexes.sellers,
// а после перехода на сервер список продавцов нужно будет запрашивать
// асинхронно — восстановим модуль позже, когда появится асинхронная загрузка.
// const applyFiltering = initFiltering(sampleTable.filter.elements, {
//     searchBySeller: indexes.sellers
// });

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const applyPagination = initPagination(
    sampleTable.pagination.elements,             // передаём сюда элементы пагинации, найденные в шаблоне
    (el, page, isCurrent) => {                    // и колбэк, чтобы заполнять кнопки страниц данными
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// получаем справочники продавцов и покупателей с сервера
async function init() {
    const indexes = await api.getIndexes();
}

init().then(render);