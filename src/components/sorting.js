import {sortMap} from "../lib/sort.js"; // sortCollection больше не используем

export function initSorting(columns) {
    return (query, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            // #3.1 — запомнить выбранный режим сортировки
            action.dataset.value = sortMap[action.dataset.value];  // следующее состояние из карты
            field = action.dataset.field;                          // информация о сортируемом поле
            order = action.dataset.value;                          // и направление
            
            // #3.2 — сбросить сортировки остальных колонок
            columns.forEach(column => {                               // перебираем все кнопки-колонки
                if (column.dataset.field !== action.dataset.field) {  // если юзер нажал не эту кнопку
                    column.dataset.value = 'none';                    // сбросим в начальное состояние
                }
            });
        } else {
            // #3.3 — получить выбранный режим сортировки
            columns.forEach(column => {                 // перебираем все кнопки сортировки
                if (column.dataset.value !== 'none') {  // если кнопка не в начальном состоянии
                    field = column.dataset.field;       // сохраним поле
                    order = column.dataset.value;       // и направление сортировки
                }
            });
        }

        // способ сортировки поле:направление
        const sort = (field && order !== 'none') ? `${field}:${order}` : null;

        return sort ? Object.assign({}, query, { sort }) : query;
    }
}