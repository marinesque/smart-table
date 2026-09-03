import {sortCollection, sortMap} from "../lib/sort.js";

export function initSorting(columns) {
    return (data, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            // #3.1 — запомнить выбранный режим сортировки
            action.dataset.value = sortMap[action.dataset.value]; // сохраним и применим следующее состояние из карты
            field = action.dataset.field;                          // информация о сортируемом поле есть в кнопке
            order = action.dataset.value;                          // направление заберём прямо из датасета

            // #3.2 — сбросить сортировки остальных колонок
            columns.forEach(column => {                                  // перебираем все кнопки-колонки
                if (column.dataset.field !== action.dataset.field) {      // если это не та кнопка, что нажал пользователь
                    column.dataset.value = 'none';                        // сбрасываем её в начальное состояние
                }
            });
        } else {
            // #3.3 — получить выбранный режим сортировки
            columns.forEach(column => {              // перебираем все кнопки сортировки
                if (column.dataset.value !== 'none') { // ищем ту, что не в начальном состоянии
                    field = column.dataset.field;        // сохраняем поле
                    order = column.dataset.value;        // и направление сортировки
                }
            });
        }

        return sortCollection(data, field, order);
    }
}