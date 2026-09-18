const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData() {
    // переменные для кеширования данных уровне замыкания initData, а не внутри getIndexes/getRecords
    // будут сохраняются между вызовами и рендерами, мемори кэш
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    // из сырых данных в табличные
    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));

    // статичные справочники продавцов и покупателей
    // загружаются один раз за всё время работы приложения
    const getIndexes = async () => {
        if (!sellers || !customers) {                                    // если индексов еще нет, делаем запросы
            [sellers, customers] = await Promise.all([                   // запрашиваем оба справочника параллельно
                fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                fetch(`${BASE_URL}/customers`).then(res => res.json()),
            ]);
        }

        return {sellers, customers};
    }

    // записи о продажах с сервера с учётом параметров квери, который прижет сюда уже с параметрами
    const getRecords = async (query, isUpdated = false) => {
        const qs = new URLSearchParams(query);                // превращаем объект параметров в квери-строку вида key=value&..
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated) {          // если параметры не изменились с прошлого раза используем кэш
            return lastResult;                                // isUpdated позволяет принудительно обойти кэш, если нужно
        }

        // параметры изменились (или кэша еще нет) - запрос на сервер
        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery;                // запоминаем строку параметров для следующего сравнения
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