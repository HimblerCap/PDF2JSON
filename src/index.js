var datass = '';
var DataArr = [];
var json = [];
var json_2 = [];
PDFJS.workerSrc = '';

function ExtractText() {
    var input = document.getElementById("file-id");
    var fReader = new FileReader();
    fReader.readAsDataURL(input.files[0]);
    fReader.onloadend = function (event) {
        convertDataURIToBinary(event.target.result);
    }
}

var BASE64_MARKER = ';base64,';

function convertDataURIToBinary(dataURI) {

    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (var i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    pdfAsArray(array)
}

function getPageText(pageNum, PDFDocumentInstance) {
    // Return a Promise that is solved once the text of the page is retrieven
    return new Promise(function (resolve, reject) {
        PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
            // The main trick to obtain the text of the PDF page, use the getTextContent method
            pdfPage.getTextContent().then(function (textContent) {
                var textItems = textContent.items;
                var finalString = "";

                // Concatenate the string of the item to the final string
                for (var i = 0; i < textItems.length; i++) {
                    var item = textItems[i];

                    finalString += item.str + "|";
                }

                // Solve promise with the text retrieven from the page
                resolve(finalString);
            });
        });
    });
}

function pdfAsArray(pdfAsArray) {

    PDFJS.getDocument(pdfAsArray).then(function (pdf) {

        var pdfDocument = pdf;
        // Create an array that will contain our promises
        var pagesPromises = [];
        let data = [];
        let data_clean = [];
        let temp = [];

        for (var i = 0; i < pdf.pdfInfo.numPages; i++) {
            // Required to prevent that i is always the total of pages
            (function (pageNumber) {
                // Store the promise of getPageText that returns the text of a page
                pagesPromises.push(getPageText(pageNumber, pdfDocument));
            })(i + 1);
        }

        // Execute all the promises
        Promise.all(pagesPromises).then(function (pagesText) {
            //console.log(pagesText); 
            
            for (var pageNum = 0; pageNum < pagesText.length; pageNum++){
                temp.push(pagesText[pageNum].split("|"))
            }

            for (var i = 0; i < temp.length; i++){
                for (var j = 0; j < temp[i].length; j++){
                    data.push(temp[i][j]);
                }
            }
            
            //Cleaning the data 
            var not_wanted = ['CODIGO', 'CURSO', 'SECCION', 'TIPO', 'DIA', 'HORA', 'DOCENTE', 'PRIMER CICLO', 'SEGUNDO CICLO', 'TERCER CICLO','CUARTO CICLO', 'QUINTO CICLO', 'SEXTO CICLO', 'SÉPTIMO CICLO', 'OCTAVO CICLO', 'NOVENO CICLO', 'DÉCIMO CICLO', 'HORARIO 202', '1', '2', '-', '']

            for (var i = 0; i < data.length; i++){
                var count = 0;
                for (var j = 0; j < not_wanted.length; j++){
                    if (data[i] == not_wanted[j]){
                        count++;
                    }
                }
                if (count == 0){
                    data_clean.push(data[i]);
                }
            }
            
            //Structure the data
            data = []; 
            for (var i=0; i < data_clean.length / 7; i++){
                data.push([data_clean[7*i], data_clean[7*i + 1], data_clean[7*i + 2], data_clean[7*i + 3], data_clean[7*i + 4], data_clean[7*i + 5], data_clean[7*i + 6]]);
            }
            //Course per ciclo
            const ciclo_1 = ['BFI01', 'BIC01', 'BMA01', 'BMA03', 'BRN01', 'EE250'];
            const ciclo_2 = ['BFI05', 'BMA09', 'BMA02', 'BQU01', 'BRC01', 'EE152'];
            const ciclo_3 = ['BFI03', 'BEG01', 'BMA05', 'BMA10', 'BMA15', 'EE306'];
            const ciclo_4 = ['BEF01', 'BFI06', 'BMA07', 'BMA18', 'EE320', 'EE410'];
            const ciclo_5 = ['BFM16', 'BMA22', 'EE418', 'EE420', 'EE428', 'EE522', 'EE647'];
            const ciclo_6 = ['BFM17','BMA20','BRN93','EE238','EE288','EE353','EE430','EE438','EE449','EE458','EE588','EE604','EE648','IP101'];
            const ciclo_7 = ['EE354', 'EE235', 'EE239', 'EE241', 'EE298', 'EE528', 'EE532', 'EE467', 'EE530', 'EE590', 'EE593', 'EE658', 'EE644', 'EE678'];
            const ciclo_8 = ['BEG06','CIB12', 'EE225', 'EE242', 'EE336', 'EE375', 'EE393', 'EE470', 'EE468', 'EE592', 'CIB02', 'EE594', 'EE596', 'EE598', 'EE621', 'EE689', 'EE681', 'EE508', 'EE693', 'EE585', 'EE672'];
            const ciclo_9 = ['EE676', 'EE344', 'EE346', 'EE445', 'EE498', 'EE625', 'EE698', 'EE708', 'CIB14', 'CIB54'];
            const ciclo_10 = ['EE316', 'EE376', 'EE385', 'EE387', 'EE446', 'EE679', 'EE712', 'EE548','EE718', 'BRN35','CIB28', 'EE469'];
            
            //forms the first keys
            json_data = [];
            for (var i = 0; i < data.length; i++){
                if (ciclo_1.includes(data[i][0])){
                    if (i === 0){
                        json_data.push({
                            'Ciclo': 1,
                            'Codigo' : data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })
                    }
                    else if (data[i][0] != data[i-1][0]) {
                        json_data.push({
                            'Ciclo': 1,
                            'Codigo': data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })  
                    }   
                }
                if (ciclo_2.includes(data[i][0])){
                    if (i === 0){
                        json_data.push({
                            'Ciclo': 2,
                            'Codigo' : data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })
                    }
                    else if (data[i][0] != data[i-1][0]) {
                        json_data.push({
                            'Ciclo': 2,
                            'Codigo': data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })  
                    }   
                }
                if (ciclo_3.includes(data[i][0])){
                    if (i === 0){
                        json_data.push({
                            'Ciclo': 3,
                            'Codigo' : data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })
                    }
                    else if (data[i][0] != data[i-1][0]) {
                        json_data.push({
                            'Ciclo': 3,
                            'Codigo': data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })  
                    }   
                }
                if (ciclo_4.includes(data[i][0])){
                    if (i === 0){
                        json_data.push({
                            'Ciclo': 4,
                            'Codigo' : data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })
                    }
                    else if (data[i][0] != data[i-1][0]) {
                        json_data.push({
                            'Ciclo': 4,
                            'Codigo': data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })  
                    }   
                }
                if (ciclo_5.includes(data[i][0])){
                    if (i === 0){
                        json_data.push({
                            'Ciclo': 5,
                            'Codigo' : data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })
                    }
                    else if (data[i][0] != data[i-1][0]) {
                        json_data.push({
                            'Ciclo': 5,
                            'Codigo': data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })  
                    }   
                }
                if (ciclo_6.includes(data[i][0])){
                    if (i === 0){
                        json_data.push({
                            'Ciclo': 6,
                            'Codigo' : data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })
                    }
                    else if (data[i][0] != data[i-1][0]) {
                        json_data.push({
                            'Ciclo': 6,
                            'Codigo': data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })  
                    }   
                }
                if (ciclo_7.includes(data[i][0])){
                    if (i === 0){
                        json_data.push({
                            'Ciclo': 7,
                            'Codigo' : data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })
                    }
                    else if (data[i][0] != data[i-1][0]) {
                        json_data.push({
                            'Ciclo': 7,
                            'Codigo': data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })  
                    }   
                }
                if (ciclo_8.includes(data[i][0])){
                    if (i === 0){
                        json_data.push({
                            'Ciclo': 8,
                            'Codigo' : data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })
                    }
                    else if (data[i][0] != data[i-1][0]) {
                        json_data.push({
                            'Ciclo': 8,
                            'Codigo': data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })  
                    }   
                }
                if (ciclo_9.includes(data[i][0])){
                    if (i === 0){
                        json_data.push({
                            'Ciclo': 9,
                            'Codigo' : data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })
                    }
                    else if (data[i][0] != data[i-1][0]) {
                        json_data.push({
                            'Ciclo': 9,
                            'Codigo': data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })  
                    }   
                }
                if (ciclo_10.includes(data[i][0])){
                    if (i === 0){
                        json_data.push({
                            'Ciclo': 10,
                            'Codigo' : data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })
                    }
                    else if (data[i][0] != data[i-1][0]) {
                        json_data.push({
                            'Ciclo': 10,
                            'Codigo': data[i][0],
                            'Secciones': [],
                            // 'Nombre': data[i][1].trim(),
                        })  
                    }   
                }
            }
            //forms the keys of seccion
            var count = 0
            for (var i=0; i < data.length; i++){
                let obj = {}; 
                if(count < json_data.length){
                    if (data[i][0] == json_data[count]['Codigo']){
                        if (i==0){
                            obj[data[i][2]] = [];
                            json_data[count]['Secciones'].push(obj);
                        }
                        else if (data[i][2] != data[i-1][2]){
                            obj[data[i][2]] = [];
                            json_data[count]['Secciones'].push(obj);
                        }
                    }
                    else{
                        count++;
                        if(count < json_data.length){
                            console.log(json_data);
                            obj[data[i][2]] = [];
                            json_data[count]['Secciones'].push(obj);
                        }
                    }
                }
            }
            
            //Fill
            for (var j = 0; j < json_data.length; j++){
                var count = 0;
                for (var i = 0; i < data.length; i++){
                    for (var key in json_data[j]['Secciones'][count]){
                        if ((data[i][2] == key) && (data[i][0] == json_data[j]['Codigo'])){
                            json_data[j]['Secciones'][count][data[i][2]].push({
                                'Tipo': data[i][3],
                                'Día': data[i][4],
                                'Hora': data[i][5],
                                'Profesor': data[i][6],
                            })
                        }
                        else if (data[i][0] == json_data[j]['Codigo']){
                            count++;
                            if (count < json_data[j]['Secciones'].length){
                                json_data[j]['Secciones'][count][data[i][2]].push({
                                    'Tipo': data[i][3],
                                    'Día': data[i][4],
                                    'Hora': data[i][5],
                                    'Profesor': data[i][6],
                                })
                            }
                        }
                    }
                }

            }
            json = json_data;
            console.log(json_data);

            //Second JSON
            console.log(typeof(data[0][0]));
            json_data_2 = {"data": []};
            for (var i = 0; i < data.length; i++){
                if(ciclo_1.includes(data[i][0])){
                    json_data_2.data.push([
                        data[i][0],
                        data[i][1].trim(),
                        data[i][2],
                        data[i][3],
                        data[i][4],
                        data[i][5],
                        data[i][6],
                        "PRIMER CICLO",
                    ]);
                }else if(ciclo_2.includes(data[i][0])){
                    json_data_2.data.push([
                        data[i][0],
                        data[i][1].trim(),
                        data[i][2],
                        data[i][3],
                        data[i][4],
                        data[i][5],
                        data[i][6],
                        "SEGUNDO CICLO",
                    ]);
                }else if(ciclo_3.includes(data[i][0])){
                    json_data_2.data.push([
                        data[i][0],
                        data[i][1].trim(),
                        data[i][2],
                        data[i][3],
                        data[i][4],
                        data[i][5],
                        data[i][6],
                        "TERCER CICLO",
                    ]);
                }else if(ciclo_4.includes(data[i][0])){
                    json_data_2.data.push([
                        data[i][0],
                        data[i][1].trim(),
                        data[i][2],
                        data[i][3],
                        data[i][4],
                        data[i][5],
                        data[i][6],
                        "CUARTO CICLO",
                    ]);
                }else if(ciclo_5.includes(data[i][0])){
                    json_data_2.data.push([
                        data[i][0],
                        data[i][1].trim(),
                        data[i][2],
                        data[i][3],
                        data[i][4],
                        data[i][5],
                        data[i][6],
                        "QUINTO CICLO",
                    ]);
                }else if(ciclo_6.includes(data[i][0])){
                    json_data_2.data.push([
                        data[i][0],
                        data[i][1].trim(),
                        data[i][2],
                        data[i][3],
                        data[i][4],
                        data[i][5],
                        data[i][6],
                        "SEXTO CICLO",
                    ]);
                }else if(ciclo_7.includes(data[i][0])){
                    json_data_2.data.push([
                        data[i][0],
                        data[i][1].trim(),
                        data[i][2],
                        data[i][3],
                        data[i][4],
                        data[i][5],
                        data[i][6],
                        "SEPTIMO CICLO",
                    ]);
                }else if(ciclo_8.includes(data[i][0])){
                    json_data_2.data.push([
                        data[i][0],
                        data[i][1].trim(),
                        data[i][2],
                        data[i][3],
                        data[i][4],
                        data[i][5],
                        data[i][6],
                        "OCTAVO CICLO",
                    ]);    
                }else if(ciclo_9.includes(data[i][0])){
                    json_data_2.data.push([
                        data[i][0],
                        data[i][1].trim(),
                        data[i][2],
                        data[i][3],
                        data[i][4],
                        data[i][5],
                        data[i][6],
                        "NOVENO CICLO",
                    ]);
                }
                else {
                    json_data_2.data.push([
                        data[i][0],
                        data[i][1].trim(),
                        data[i][2],
                        data[i][3],
                        data[i][4],
                        data[i][5],
                        data[i][6],
                        "DECIMO CICLO",
                    ]);    
                }
            }
        });


    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
}

function download(content, fileName, contentType){
    const a = document.createElement("a");
    const file = new Blob([content], { type : contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function getJson(){
    download(JSON.stringify(json_data), 'horarioUltimo.json', "text/plain")
}

function getJson2(){
    download(JSON.stringify(json_data_2), 'horarios.json', "text/plain");
}

    