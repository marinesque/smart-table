import {rules, createComparison} from "../lib/compare.js";


export function initSearching(searchField) {
    // #5.1 — настроить компаратор
    // Берём только одно базовое правило (пропускать пустой поиск), а всю
    // фактическую логику отдаём специализированному правилу searchMultipleFields:
    // оно само проверит несколько полей исходной строки (date, customer, seller)
    // на вхождение одной и той же поисковой строки без учёта регистра.
    const compare = createComparison(
        ['skipEmptyTargetValues'],
        [rules.searchMultipleFields(searchField, ['date', 'customer', 'seller'], false)]
    );

    return (data, state, action) => {
        // #5.2 — применить компаратор
        return data.filter(row => compare(row, state));
    }
}