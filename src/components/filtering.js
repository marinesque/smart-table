export function initFiltering(elements) {
    // #4.1 — заполнить выпадающие списки опциями
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes)                                              // ключи из индексов
            .forEach((elementName) => {                                   // по имени элементов
                elements[elementName].append(                             // в каждый элемент добавляем опции
                    ...Object.values(indexes[elementName])                // массив имён из значений индекса
                        .map(name => {
                            const el = document.createElement('option');  // создание тега <option>
                            el.textContent = name;                        // видимый текст = имя
                            el.value = name;                              // значение = имя
                            return el;
                        })
                );
            });
    };

    // теперь параметры фильтрации до обращения к серверу, не фильтруем на слиенте, а добавляем в квери нудные параметры filter[fieldName]=value
    const applyFiltering = (query, state, action) => {
        // #4.2 — обработать очистку поля
        if (action && action.name === 'clear') {
            const field = action.dataset.field;                                      // по data-field кнопки определим поле для очистки
            const input = action.closest('.filter-wrapper').querySelector('input');  // находим соседний input
            input.value = '';                                                        // очищаем поле
            state[field] = '';                                                       // и синхронизируем состояние рендера
        }

        // @todo: #4.5 — отфильтровать данные, используя компаратор
        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) {  // ищем поля в фильтре с непустыми данными
                    filter[`filter[${elements[key].name}]`] = elements[key].value;                 // и с помощью них формируем квери фильтра
                }
            }
        })

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}