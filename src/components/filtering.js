import {createComparison, defaultRules} from "../lib/compare.js";

// #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
    // #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes)                                    // получаем ключи из объекта индексов
        .forEach((elementName) => {                          // перебираем по именам элементов
            elements[elementName].append(                    // в каждый элемент добавляем опции
                ...Object.values(indexes[elementName])        // формируем массив имён из значений индекса
                    .map(name => {
                        const option = document.createElement('option'); // создаём тег <option>
                        option.value = name;                              // значение — имя
                        option.textContent = name;                        // видимый текст — тоже имя
                        return option;
                    })
            );
        });

    return (data, state, action) => {
        // #4.2 — обработать очистку поля
        if (action && action.name === 'clear') {
            const field = action.dataset.field;               // из data-field кнопки узнаём, какое поле чистим
            const input = action.closest('.filter-wrapper').querySelector('input'); // находим соседний input
            input.value = '';                                  // очищаем поле в разметке
            state[field] = '';                                 // и синхронизируем состояние для текущего рендера
        }

        // #4.5 — отфильтровать данные используя компаратор
        return data.filter(row => compare(row, state));
    }
}