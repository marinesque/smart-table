const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData() {
    // Переменные для кеширования данных.
    // Они объявлены на уровне замыкания initData(), а не внутри getIndexes/getRecords,
    // поэтому сохраняются между вызовами (например, между разными рендерами) —
    // это и есть механизм кеша "в памяти".
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    // Приводим сырые записи с сервера к тому виду, который нужен таблице:
    // заменяем числовые id продавца/покупателя на готовые строки "Имя Фамилия"
    // из справочников sellers/customers (они уже загружены к этому моменту).
    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));

    // Получение справочников продавцов и покупателей.
    // Загружаем их только один раз за всё время работы приложения —
    // это статичные данные, которые не меняются от запроса к запросу.
    const getIndexes = async () => {
        if (!sellers || !customers) { // если индексы ещё не установлены, делаем запросы
            [sellers, customers] = await Promise.all([ // запрашиваем оба справочника параллельно
                fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                fetch(`${BASE_URL}/customers`).then(res => res.json()),
            ]);
        }

        return {sellers, customers};
    }

    // Получение записей о продажах с сервера с учётом параметров запроса
    // (поиск, фильтры, сортировка, пагинация — всё это придёт в объекте query).
    const getRecords = async (query, isUpdated = false) => {
        const qs = new URLSearchParams(query); // превращаем объект параметров в query-строку вида key=value&...
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated) { // если параметры не изменились с прошлого раза — используем кеш
            return lastResult;                        // isUpdated позволяет принудительно обойти кеш, если нужно
        }

        // параметры изменились (или кеша ещё не было) — идём на сервер
        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery; // запоминаем строку параметров для следующего сравнения
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}