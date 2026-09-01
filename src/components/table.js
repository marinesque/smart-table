import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    // #1.2 — выводим дополнительные шаблоны до и после таблицы.
    // "before" вставляем в обратном порядке, т.к. каждый prepend ставит
    // элемент самым первым — без reverse() порядок блоков был бы перевёрнут.
    before.reverse().forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.prepend(root[subName].container);
    });

    // "after" просто добавляем по порядку в конец контейнера
    after.forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.append(root[subName].container);
    });

    // #1.3 — обрабатываем события формы таблицы
    root.container.addEventListener('change', () => {
        // Любое изменение поля (текст, select) — сразу перерисовываем
        onAction();
    });

    root.container.addEventListener('reset', () => {
        // reset срабатывает раньше, чем браузер реально очистит значения полей,
        // поэтому откладываем вызов onAction на следующий тик через setTimeout
        setTimeout(onAction);
    });

    root.container.addEventListener('submit', e => {
        e.preventDefault();
        // Передаём именно ту кнопку, которая инициировала submit
        onAction(e.submitter);
    });

    const render = (data) => {
        // #1.1 — превращаем массив данных в массив DOM-строк
        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate);

            Object.keys(item).forEach(key => {
                if (row.elements[key]) {
                    row.elements[key].textContent = item[key];
                }
            });

            return row.container;
        });

        root.elements.rows.replaceChildren(...nextRows);
    }

    return {...root, render};
}