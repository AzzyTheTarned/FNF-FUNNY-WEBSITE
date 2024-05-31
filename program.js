let translateYear = (year) => {
    let val;
    switch (year) {
        case 2020:
            val = 0.25;
            break;
        case 2021:
            val = 0.45;
            break;
        case 2022:
            val = 0.65;
            break;
        case 2023:
            val = 0.9;
            break;
        case 2024:
            val = 1;
            break;
        default:
            val = 1;
            break;
    }
    return val;
}

//выводим таблицу на страницу
let createTable = (data, idTable) => {
    // находим таблицу
    let table = document.getElementById(idTable);
    // формируем заголовочную строку из ключей нулевого элемента массива
    let tr = document.createElement('tr');
    for (key in data[0]) {
        let th = document.createElement('th');
        th.innerHTML = key;
        tr.append(th);
    }
    table.append(tr);
    // самостоятельно сформировать строки таблицы на основе массива data
    data.forEach((item) => {
        // создать новую строку таблицы tr
        // перебрать ключи очередного элемента массива
        // создать элемент td
        // занести в него соответствующее значение из массива
        // добавить элемент td к строке
        // строку добавить в таблицу
        let tr = document.createElement('tr');
        for (key in item) {
            let td = document.createElement('td');
            td.innerHTML = item[key];
            tr.append(td);
        }
        table.append(tr);
    });
}

let clearTable = (idTable) => {
    let table = document.getElementById(idTable);
    table.innerHTML = '';
}

document.addEventListener("DOMContentLoaded",
    function () {
        createTable(mods, 'list');
        setSortSelects(mods, document.forms.sort);
    }
);

// устанавливаем соответствие между полями формы и столбцами таблицы
let correspond = {
    "Название": "name",
    "Скачивания": ["loads-min", "loads-max"],
    "Лайки": ["likes-min", "likes-max"],
    "Просмотры": ["views-min", "views-max"],
    "Эра выхода": "epoch",
    "Год выхода": ["year-min", "year-max"]
}

let dataFilter = (dataForm) => {
    /* Структура ассоциативного массива:
    {
     input_id: input_value,
     ...
    }
    */
    let dictFilter = {};
    // перебираем все элементы формы с фильтрами

    for (let j = 0; j < dataForm.elements.length; j++) {
        // выделяем очередной элемент формы
        let item = dataForm.elements[j];

        // получаем значение элемента
        let valInput = item.value;
        // если поле типа text - приводим его значение к нижнему регистру
        if (item.type == "text") {
            valInput = valInput.toLowerCase();
            dictFilter[item.id] = valInput;
        }
        /* самостоятельно обработать значения числовых полей:
        - если в поле занесено значение - преобразовать valInput к числу;
        - если поле пусто и его id включает From - занести в valInput
        -бесконечность
        - если поле пусто и его id включает To - занести в valInput
        +бесконечность
        */
        // формируем очередной элемент ассоциативного массива
        else if (item.type == "number") {
            if (valInput) {
                valInput = Number(valInput);
            } else {
                if (item.id.includes("-min")) {
                    valInput = -Infinity;
                } else if (item.id.includes("-max")) {
                    valInput = Infinity;
                }
            }
            dictFilter[item.id] = valInput;
        }

    }
    return dictFilter;
}

// фильтрация таблицы
let filterTable = (data, idTable, dataForm) => {

    // получаем данные из полей формы
    let datafilter = dataFilter(dataForm);

    // выбираем данные соответствующие фильтру и формируем таблицу из них
    let tableFilter = data.filter(item => {

        let result = true;

        // строка соответствует фильтру, если сравнение всех значения из input
        // со значением ячейки очередной строки - истина
        for (let key in item) {

            let val = item[key];

            // текстовые поля проверяем на вхождение
            if (typeof val == 'string') {
                val = item[key].toLowerCase();
                result &&= val.indexOf(datafilter[correspond[key]]) !== -1;
            }
            // самостоятельно проверить числовые поля на принадлежность интервалу
            else if (typeof val == 'number') {
                result &&= val >= datafilter[correspond[key][0]] && val <= datafilter[correspond[key][1]];
            }
        }
        return result;
    });

    // создать и вызвать функцию, которая удаляет все строки таблицы с id=idTable

    clearTable(idTable);

    // показать на странице таблицу с отфильтрованными строками
    createTable(tableFilter, idTable);
}

/* Настроить обработку события клик по кнопке Найти (вызвать функцию
filterTable() с соответствующими параметрами).*/
document.querySelector('input[type="button"][value="Отфильтровать"]').addEventListener('click', function () {
    clearSort('list', document.forms.sort);
    filterTable(mods, 'list', document.forms.filter);
});

/* Реализовать функцию clearFilter(), которая
будет вызываться по клику по кнопке Очистить фильтры (функция в качестве параметра
получает id таблицы и данные из формы). Связать вызов этой функции с событием клик по
кнопке Очистить фильтры.
*/
let clearFilter = (idTable, dataForm) => {
    dataForm.reset();
    clearTable(idTable);
    createTable(mods, idTable);
}

document.querySelector('input[type="button"][value="Очистить фильтры"]').addEventListener('click', function () {
    clearSort('list', document.forms.sort);
    clearFilter('list', document.forms.filter);
});

// формирование полей элемента списка с заданным текстом и значением
let createOption = (str, val) => {
    let item = document.createElement('option');
    item.text = str;
    item.value = val;
    return item;
}
// формирование полей со списком из заголовков таблицы
// параметры – массив из заголовков таблицы и элемент select
let setSortSelect = (head, sortSelect) => {

    // создаем OPTION Нет и добавляем ее в SELECT
    sortSelect.append(createOption('—', 0));

    // перебираем все ключи переданного элемента массива данных
    for (let i in head) {
        // создаем OPTION из очередного ключа и добавляем в SELECT
        // значение атрибута VAL увеличиваем на 1, так как значение 0 имеет опция Нет
        sortSelect.append(createOption(head[i], Number(i) + 1));
    }
}
// формируем поля со списком для многоуровневой сортировки
let setSortSelects = (data, dataForm) => {
    // выделяем ключи словаря в массив
    let head = Object.keys(data[0]);
    // находим все SELECT в форме
    let allSelect = dataForm.getElementsByTagName('select');

    for (let j = 0; j < allSelect.length; j++) {
        //формируем опции очередного SELECT
        setSortSelect(head, allSelect[j]);
        //самостоятельно все SELECT, кроме первого, сделать неизменяемыми
        if (j > 0) {
            allSelect[j].disabled = true;
        }
    }
}

// настраиваем поле для следующего уровня сортировки

let changeNextSelect = (nextSelectId, curSelect, nextNextSelectId) => {
    let nextSelect = document.getElementById(nextSelectId);
    let nextNextSelect = document.getElementById(nextNextSelectId);

    nextSelect.disabled = false;

    // в следующем SELECT выводим те же option, что и в текущем
    nextSelect.innerHTML = curSelect.innerHTML;

    // удаляем в следующем SELECT уже выбранную в текущем опцию
    // если это не первая опция - отсутствие сортировки
    if (curSelect.value != 0) {
        let optionToRemove = nextSelect.querySelector(`option[value='${curSelect.value}']`);
        optionToRemove.remove();
    } else {
        nextSelect.disabled = true;
    }

    // Если есть следующий SELECT, обновляем его содержимое
    if (nextNextSelect) {
        nextNextSelect.innerHTML = nextSelect.innerHTML;
        if (nextSelect.value != 0) {
            let optionToRemove = nextNextSelect.querySelector(`option[value='${nextSelect.value}']`);
            optionToRemove.remove();
        } else {
            nextNextSelect.disabled = true;
        }
    }
}

document.getElementById('level-first').addEventListener('change', function () {
    changeNextSelect('level-second', this, 'level-third');
});

document.getElementById('level-second').addEventListener('change', function () {
    changeNextSelect('level-third', this);
});

/*формируем массив для сортировки по уровням вида:
 [
 {column: номер столбца,
 order: порядок сортировки (true по убыванию, false по возрастанию)
 },
 {column: номер столбца,
 order: порядок сортировки
 }
 ]
*/
let createSortArr = (data) => {
    let sortArr = [];

    let sortSelects = data.getElementsByTagName('select');

    for (let i = 0; i < sortSelects.length; i++) {

        // получаем номер выбранной опции
        let keySort = sortSelects[i].value;
        // в случае, если выбрана опция Нет, заканчиваем формировать массив
        if (keySort == 0) {
            break;
        }
        // получаем номер значение флажка для порядка сортировки
        // имя флажка сформировано как имя поля SELECT и слова Desc
        let desc = document.getElementById(sortSelects[i].id + '-desc').checked;
        sortArr.push({
            column: keySort - 1,
            order: desc
        });
    }
    return sortArr;
};

let sortTable = (idTable, data) => {

    // формируем управляющий массив для сортировки
    let sortArr = createSortArr(data);

    // сортировать таблицу не нужно, во всех полях выбрана опция Нет
    if (sortArr.length === 0) {
        return false;
    }
    //находим нужную таблицу
    let table = document.getElementById(idTable);
    // преобразуем строки таблицы в массив
    let rowData = Array.from(table.rows);

    // удаляем элемент с заголовками таблицы
    rowData.shift();

    //сортируем данные по возрастанию по всем уровням сортировки
    rowData.sort((first, second) => {
        for (let i in sortArr) {
            let key = sortArr[i].column;
            let a = first.cells[key].innerHTML;
            let b = second.cells[key].innerHTML;

            // преобразуем строки в числа, если они являются числами
            a = isNaN(a) ? a : Number(a);
            b = isNaN(b) ? b : Number(b);

            if (a > b) {
                return sortArr[i].order ? -1 : 1;
            } else if (a < b) {
                return sortArr[i].order ? 1 : -1;
            }
        }
        return 0;
    });

    //выводим отсортированную таблицу на страницу
    table.innerHTML = table.rows[0].innerHTML;

    rowData.forEach(item => {
        table.append(item);
    });
}
document.querySelector('input[type="button"][value="Сортировать"]').addEventListener('click', function () {
    sortTable('list', document.forms.sort);
});

/*Реализовать функцию для сброса сортировки, которая:
- формирует поля форы для настройки сортировки как при загрузке страницы;
- восстанавливает на странице ту таблицу, которая была до применения сортировки.*/
let clearSort = (idTable, sortForm) => {
    let selects = sortForm.getElementsByTagName('select');
    for (let i = 0; i < selects.length; i++) {
        selects[i].selectedIndex = 0;
        if (i >= 1) selects[i].disabled = true;
    }
    let ticks = sortForm.querySelectorAll('input[type="checkbox"]');
    for (let i = 0; i < ticks.length; i++) {
        ticks[i].checked = false;
    }
    clearTable(idTable);
    createTable(mods, idTable);
}

let clearSortRestoreFilter = (idTable, sortForm, filterForm) => {
    clearSort(idTable, sortForm);
    filterTable(mods, idTable, filterForm);
}

document.querySelector('input[type="button"][value="Сбросить сортировку"]').addEventListener('click', function () {
    clearSortRestoreFilter('list', document.forms.sort, document.forms.filter);
});

const marginX = 50;
const marginY = 50;
const height = 800;
const width = 1600;

let svg = d3.select("svg").attr("height", height).attr("width", width);


function createArrGraph(data, keyX, keyY) {

    let arrGraph = [];
    for (let i = 0; i < data.length; i++) {
        arrGraph.push({
            x: data[i][keyX],
            y: data[i][keyY],
            a: data[i]['Год выхода']
        });
    }
    arrGraph.sort((a, b) => +b.y - +a.y);
    return arrGraph;
}

function drawGraph(data) {
    const keyX = data.ox.value;
    const keyY = data.oy.value;
    const isBarred = data.barred.checked;

    const arrGraph = createArrGraph(mods, keyX, keyY);

    svg.selectAll('*').remove();

    const [scX, scY] = createAxis(arrGraph);
    
    createChart(arrGraph, scX, scY, isBarred);
}

function createAxis(data) {
    let scaleX = d3.scaleBand()
        .domain(data.map(d => d.x))
        .range([0, width - 2 * marginX]);
    let scaleY = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.y)])
        .range([height - 2 * marginY, 0]);
    
    let axisX = d3.axisBottom(scaleX);
    let axisY = d3.axisLeft(scaleY);

    svg.append("g")
        .attr("transform", `translate(${marginX}, ${height - marginY})`)
        .call(axisX)
        .selectAll("text") // подписи на оси - наклонные
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    svg.append("g")
        .attr("transform", `translate(${marginX}, ${marginY})`)
        .call(axisY);

    return [scaleX, scaleY];
}

function createChart(data, scaleX, scaleY, isBarred) {
    if (isBarred) {
        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => scaleX(d.x) + marginX + scaleX.bandwidth() / 4)
            .attr("y", d => scaleY(d.y) + marginY)
            .attr("width", scaleX.bandwidth() / 2)
            .attr("height", d => height - marginY * 2 - scaleY(d.y))
            .attr("fill", `rgba(189, 82, 6, ${0.865})`);
    }
    else {
        let line = d3.line()
        .x(d => scaleX(d.x) + marginX + scaleX.bandwidth() / 2)
        .y(d => scaleY(d.y) + marginY);

    svg.append("path")
        .data([data])
        .attr("fill", `none`)
        .attr("stroke", `rgba(189, 82, 6, ${0.865})`)
        .attr("stroke-width", 2)
        .attr("d", line);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    drawGraph(document.forms.diagram);
});
