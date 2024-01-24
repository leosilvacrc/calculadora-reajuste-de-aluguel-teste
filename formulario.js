$(document).ready(function() {
    $('.index-select').select2({
        width: '100%',
        theme: 'classic'
    });

    document.getElementById("calculateButton").addEventListener("click", async function() {
        const currentRent = parseFloat(document.getElementById("currentRent").value);
        const indexSelect = document.getElementById("indexSelect").value;
        const contractStartDate = new Date(document.getElementById("contractStartDate").value);
        const periodicity = document.getElementById("periodicity").value;

        const currentDate = new Date();
        const monthsPassed = (currentDate.getFullYear() - contractStartDate.getFullYear()) * 12 + (currentDate.getMonth() - contractStartDate.getMonth());

        const reajustePorIndice = {
            igpm: 0.05,
            inccdi: 0.03,
            inpc: 0.02,
            ipc: 0.01,
            ipca: 0.04,
            igp: 0.06
        };

        const periodicidadeFatores = {
            mensal: 1,
            trimestral: 3,
            semestral: 6,
            anual: 12,
            bianual: 24
        };

        let errorMessage = "";

        if (periodicity === "trimestral" && monthsPassed < 3) {
            errorMessage = "A data deve ser de no mínimo 3 meses atrás";
        } else if (periodicity === "semestral" && monthsPassed < 6) {
            errorMessage = "A data deve ser de no mínimo 6 meses atrás";
        } else if (periodicity === "anual" && monthsPassed < 12) {
            errorMessage = "A data deve ser de no mínimo 12 meses atrás";
        } else if (periodicity === "bianual" && monthsPassed < 24) {
            errorMessage = "A data deve ser de no mínimo 24 meses atrás";
        }

        // Requisição à API para obter os valores dos índices
        const apiKey = 'Bearer 8cb7a3a5529cec195ed3adc5cd994e66';
        const indiceCodigo = 433; // Código do IGP-M

        try {
            const response = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${indiceCodigo}/dados?formato=json`, {
                headers: {
                    Authorization: apiKey
                }
            });

            const data = await response.json();

            if (data && data.length > 0) {
                reajustePorIndice.igpm = parseFloat(data[data.length - 1].valor) / 100; // Convertendo para decimal
            }
        } catch (error) {
            console.error('Erro ao obter os valores dos índices:', error);
        }

        if (!isNaN(currentRent)) {
            if (indexSelect !== "igp" && errorMessage) {
                document.getElementById("newRent").value = errorMessage;
            } else {
                const reajusteAcumulado = Math.pow(1 + reajustePorIndice[indexSelect], monthsPassed / periodicidadeFatores[periodicity]);
                const newRent = currentRent * reajusteAcumulado;
                document.getElementById("newRent").value = newRent.toFixed(2);
            }
        } else {
            document.getElementById("newRent").value = "Inválido";
        }
    });

    document.getElementById("clearButton").addEventListener("click", function() {
        document.getElementById("currentRent").value = "";
        document.getElementById("indexSelect").value = "igpm";
        document.getElementById("contractStartDate").value = "";
        document.getElementById("periodicity").value = "mensal";
        document.getElementById("newRent").value = "";
    });
});
