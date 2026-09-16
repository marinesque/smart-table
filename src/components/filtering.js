export function initFiltering(elements) {
    // #4.1 — заполнить выпадающие списки опциями
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes)                                  // получаем ключи из объекта индексов
            .forEach((elementName) => {                       // перебираем по именам элементов
                elements[elementName].append(                 // в каждый элемент добавляем опции
                    ...Object.values(indexes[elementName])    // формируем массив имён из значений индекса
                        .map(name => {
                            const el = document.createElement('option'); // создаём тег <option>
                            el.textContent = name;                        // видимый текст — имя
                            el.value = name;                              // значение — тоже имя
                            return el;
                        })
                );
            });
    };

    // Формируем параметры фильтрации ДО обращения к серверу.
    // Модуль больше не фильтрует данные на клиенте — он просто добавляет
    // в query нужные параметры filter[fieldName]=value, которые уйдут в запрос.
    const applyFiltering = (query, state, action) => {
        // #4.2 — обработать очистку поля
        if (action && action.name === 'clear') {
            const field = action.dataset.field;               // из data-field кнопки узнаём, какое поле чистим
            const input = action.closest('.filter-wrapper').querySelector('input'); // находим соседний input
            input.value = '';                                  // очищаем поле в разметке
            state[field] = '';                                 // и синхронизируем состояние для текущего рендера
        }

        // @todo: #4.5 — отфильтровать данные, используя компаратор
        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) { // ищем поля ввода в фильтре с непустыми данными
                    filter[`filter[${elements[key].name}]`] = elements[key].value; // чтобы сформировать в query вложенный объект фильтра
                }
            }
        })

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query; // если в фильтре что-то добавилось, применим к запросу
    };

    return {
        updateIndexes,
        applyFiltering
    };
}