
$(document).ready(function () {
    var width = $(window).width();
})

function login() {
    var inputs = document.querySelectorAll('.input-box input');

    inputs.forEach(function(input) {
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.nextElementSibling.style.top = '50%';
                this.nextElementSibling.style.fontSize = '1em';
                this.nextElementSibling.style.color = '#777';
            }
        });
    });

    var username = document.getElementById("email").value;
    var password = document.getElementById("pass").value;

    // pengecekan login
    if (username === "risoewles.radar" && password === "Risoewles2024") {
        alert("Login successful");
        window.location.href = "dashboard.html"
    } else {
        alert("Invalid username or password");
    }
}

//fungsi melihat password
function togglePasswordVisibility() {
    var passwordInput = document.getElementById("pass");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
}

//klik enter berhasil login
function checkEnter(event) {
    if (event.key === 'Enter') {
        login();
    }
}

// Fungsi ini akan mengarahkan pengguna kembali ke halaman sebelumnya
function goBack() {
    window.history.back(); 
}

function pindah() {
    // Mengarahkan pengguna ke halaman lain
    window.location.href = "forget.html";
}

document.getElementById('sidebarToggle').addEventListener('click', function() {
    var sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
});


document.addEventListener("DOMContentLoaded", function () {
    let tableData = [];
    let dailyChart; // Variable to hold the daily average Chart instance
    let monthlyChart; // Variable to hold the monthly average Chart instance

    // Function to fetch data and update UI
    function fetchDataAndUpdateUI() {
        fetch('https://sistem-radar.risoewlesradar.com/users')
            .then(response => response.json())
            .then(data => {
                console.log(data); // Log the data to inspect its structure
                if (data.data && data.data.length > 0) {
                    tableData = data.data; // Store fetched data for CSV download
                    updateUIWithLatestData(tableData);
                    updateCharts(tableData);
                } else {
                    console.error("Data fetched is empty or not in expected format");
                }
            })
            .catch(error => console.error("Error fetching JSON data:", error));
    }

    function updateUIWithLatestData(data) {
        console.log("Updating data with data:", data);
        const dataTable = document.querySelector(".table tbody");
        const hasilPemantauanElement = document.querySelector(".card3 p");
        const hasilPemantauanStatus = document.querySelector(".card4 p");

        if (!dataTable || !hasilPemantauanElement || !hasilPemantauanStatus) {
            console.error("One or more required DOM elements are not found.");
            return;
        }

        const latestData = data[data.length - 1]; // Get the latest data entry
        const rawDate = new Date(latestData.tanggal); // Convert tanggal to JavaScript Date object
        const formattedDate = formatDateToIndonesian(rawDate); // Format the date

        hasilPemantauanElement.innerHTML = `
            <p>Ketinggian Air (mm): ${latestData.ketinggian_air.toFixed(3)}</p>
            <p>Elevasi (Peilschale): ${latestData.papan_elevasi}</p>
        `;

        hasilPemantauanStatus.innerHTML = `
            <p>${latestData.status_ketinggian}</p>
        `;

        // Clear existing rows
        dataTable.innerHTML = '';

        // Iterate through the data in reverse order and create table rows
        for (let i = data.length - 1; i >= 0; i--) {
            const item = data [i]
            
            if(item.ketinggian_air !== 0){
                const rawDate = new Date(item.tanggal); // Convert tanggal to JavaScript Date object
                const stringTanggal = formatDateToIndonesian(rawDate); // Format the date
    
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${i + 1}</td>
                    <td>${stringTanggal}</td>
                    <td>${item.jam}</td>
                    <td>${item.ketinggian_air.toFixed(3)}</td>
                    <td>${item.papan_elevasi}</td>
                    <td>${item.status_ketinggian}</td>
                `;
                dataTable.appendChild(row);
            }    
        }
    }

    // Function to format date to DD-MM-YYYY
    function formatDateToIndonesian(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // Function to download data as CSV based on selected date
    function downloadDataAsCSV() {
        const selectedDate = document.getElementById("datePicker").value.split('-').reverse().join('-'); // Convert YYYY-MM-DD to DD-MM-YYYY
        if (!selectedDate) {
            alert("Please select a date.");
            return;
        }

        // Filter data based on the selected date
        const filteredData = tableData.filter(item => {
            const itemDate = formatDateToIndonesian(new Date(item.tanggal));
            return itemDate === selectedDate;
        });

        if (filteredData.length === 0) {
            alert("No data available for the selected date.");
            return;
        }

        // Prepare CSV content
        let csvContent = "No,Tanggal,Jam,Ketinggian Air (mm),Elevasi (Peilschale),Status\n";
        filteredData.forEach((item, index) => {
            const stringTanggal = formatDateToIndonesian(new Date(item.tanggal));

            csvContent += `${index + 1},${stringTanggal},${item.jam},${item.ketinggian_air.toFixed(3)},${item.papan_elevasi},${item.status_ketinggian}\n`;
        });

        // Create a Blob containing the CSV data
        const blob = new Blob([csvContent], { type: "text/csv" });

        // Create a link element to trigger the download
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `data_${selectedDate}.csv`;

        // Append the link to the document and trigger the click event
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
    }

    // Function to update the charts with new data
    function updateCharts(data) {
        // console.log("Updating charts with data:", data);

        // Calculate daily averages
        const dailyAverages = calculateDailyAverages(data);
        const dailyLabels = dailyAverages.map(item => item.date);
        const dailyData = dailyAverages.map(item => item.averageKetinggianAir);

        // Calculate monthly averages
        const monthlyAverages = calculateMonthlyAverages(data);
        const monthlyLabels = monthlyAverages.map(item => item.month);
        const monthlyData = monthlyAverages.map(item => item.averageKetinggianAir);

        // Update daily average chart
        const dailyCtx = document.getElementById('dailyAverageChart').getContext('2d');
        if (dailyChart) {
            dailyChart.destroy();
        }
        dailyChart = new Chart(dailyCtx, {
            type: 'line',
            data: {
                labels: dailyLabels,
                datasets: [{
                    label: 'Rata-rata Ketinggian Air Harian (mm)',
                    data: dailyData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Tanggal'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Ketinggian Air (mm)'
                        }
                    }
                }
            }
        });

        // Update monthly average chart
        const monthlyCtx = document.getElementById('monthlyAverageChart').getContext('2d');
        if (monthlyChart) {
            monthlyChart.destroy();
        }
        monthlyChart = new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: monthlyLabels,
                datasets: [{
                    label: 'Rata-rata Ketinggian Air Bulanan (mm)',
                    data: monthlyData,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Bulan'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Ketinggian Air (mm)'
                        }
                    }
                }
            }
        });
    }

    // Function to calculate daily averages
    function calculateDailyAverages(data) {
        const dailyTotals = {};

        data.forEach(item => {
            const date = formatDateToIndonesian(new Date(item.tanggal));
            if (!dailyTotals[date]) {
                dailyTotals[date] = { totalKetinggianAir: 0, count: 0 };
            }
            dailyTotals[date].totalKetinggianAir += item.ketinggian_air;
            dailyTotals[date].count += 1;
        });

        return Object.keys(dailyTotals).map(date => ({
            date: date,
            averageKetinggianAir: dailyTotals[date].totalKetinggianAir / (dailyTotals[date].count).toFixed(3)
        }));
    }

    // Function to calculate monthly averages
    function calculateMonthlyAverages(data) {
        const monthlyTotals = {};

        data.forEach(item => {
            const month = new Date(item.tanggal).toLocaleString('id-ID', { year: 'numeric', month: '2-digit' });
            if (!monthlyTotals[month]) {
                monthlyTotals[month] = { totalKetinggianAir: 0, count: 0 };
            }
            monthlyTotals[month].totalKetinggianAir += item.ketinggian_air;
            monthlyTotals[month].count += 1;
        });

        return Object.keys(monthlyTotals).map(month => ({
            month: month,
            averageKetinggianAir: monthlyTotals[month].totalKetinggianAir / (monthlyTotals[month].count).toFixed(3)
        }));
    }

    // Fetch data and update UI immediately
    fetchDataAndUpdateUI();

    // Set interval to fetch data every 5 seconds
    setInterval(fetchDataAndUpdateUI, 5000); // 5000 milliseconds = 5seconds

    // Add event listener to download button
    const downloadButton = document.querySelector(".btn-download");
    if (downloadButton) {
        downloadButton.addEventListener("click", downloadDataAsCSV);
    } else {
        console.error("Download button not found");
    }
});













