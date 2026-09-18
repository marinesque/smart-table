export function initSearching(searchField) {
    return (query, state, action) => {                          // result замена на query
        return state[searchField] ? Object.assign({}, query, {  // проверим не пусто ли поле поиска
            search: state[searchField]                          // устанавливаем в квери параметр
        }) : query;                                             // если поле с поиском пустое вернем квери без изменений
    }
}