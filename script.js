// --- 1. SELEKSI ELEMEN ---
const logForm = document.getElementById('logForm');
const logTableBody = document.getElementById('logTableBody');
const clearBtn = document.getElementById('clearAll');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const editIdInput = document.getElementById('editId');
const keteranganInput = document.getElementById('keterangan');

// --- 2. INIT ---
document.addEventListener('DOMContentLoaded', () => {
    logForm.reset();
    displayLogs();
});

// --- 3. LOGIKA WARNA STATUS ---
function getStatusStyle(ket) {
    let bg, text;
    const k = ket ? ket.toLowerCase() : "";
    if (k.includes("surat indek")) { bg = "#dcfce7"; text = "#166534"; }
    else if (k.includes("bon muat")) { bg = "#fef9c3"; text = "#854d0e"; }
    else if (k.includes("proses muat")) { bg = "#dbeafe"; text = "#1e40af"; }
    else if (k.includes("selesai")) { bg = "#22c55e"; text = "#ffffff"; }
    else if (k.includes("pending")) { bg = "#fee2e2"; text = "#991b1b"; }
    else { bg = "#f1f5f9"; text = "#475569"; }
    return { bg, text };
}

// --- 4. CRUD DATA ---
logForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const plat = document.getElementById('plat').value.toUpperCase();
    const dt = document.getElementById('dt').value.toUpperCase();
    const cashName = document.getElementById('cashName').value;
    const material = document.getElementById('material').value;
    const toko = document.getElementById('toko').value;
    const banyaknya = document.getElementById('banyaknya').value;
    const keterangan = keteranganInput.value;
    const waktuValue = document.getElementById('waktuCustom').value;
    const editId = editIdInput.value;

    const dateObj = new Date(waktuValue);
    const tanggal = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const jam = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    let logs = JSON.parse(localStorage.getItem('indeksData')) || [];
    const dataEntry = { plat, dt, cashName, material, toko, banyaknya, keterangan, tanggal, jam, waktuRaw: waktuValue };

    if (editId) {
        logs = logs.map(item => item.id == editId ? { ...dataEntry, id: item.id } : item);
    } else {
        logs.unshift({ ...dataEntry, id: Date.now() });
    }

    localStorage.setItem('indeksData', JSON.stringify(logs));
    resetForm();
    displayLogs();
});

function displayLogs() {
    let logs = JSON.parse(localStorage.getItem('indeksData')) || [];
    logs.sort((a, b) => new Date(b.waktuRaw) - new Date(a.waktuRaw));
    logTableBody.innerHTML = '';

    logs.forEach(log => {
        const style = getStatusStyle(log.keterangan);
        const row = document.createElement('tr');
        
        // Penyesuaian Lebar Kolom di Tampilan Web (Sebelum Cetak)
        row.innerHTML = `
            <td style="width: 100px;">
                <div style="color: #2563eb; font-weight:700;">${log.tanggal}</div>
                <div style="font-size:0.75rem; color: #64748b;">${log.jam}</div>
            </td>
            <td style="width: 120px;">
                <span style="color: #3b82f6; font-size: 0.8rem; font-weight: 600;">${log.dt}</span><br>
                <strong style="color: #1e40af; white-space: nowrap;">${log.plat}</strong>
            </td>
            <td style="width: 130px;"><strong>${log.cashName}</strong></td>
            <td style="width: 180px;">${log.toko}</td> 
            <td style="width: 80px;">${log.material}</td>
            <td style="width: 150px; white-space: pre-line;">${log.banyaknya}</td> 
            <td style="width: 150px;"><span class="status-badge" style="background:${style.bg}; color:${style.text}; padding:4px 8px; border-radius:12px; font-size:0.7rem; font-weight:bold; display: block; text-align: center;">${log.keterangan}</span></td>
            <td style="width: 80px; text-align: center;">
                <button onclick="editLog(${log.id})" class="btn-edit" style="margin-bottom: 5px;"><i class="fas fa-edit"></i></button>
                <button onclick="deleteLog(${log.id})" class="btn-delete"><i class="fas fa-trash"></i></button>
            </td>`;
        logTableBody.appendChild(row);
    });
}

function resetForm() {
    logForm.reset();
    editIdInput.value = "";
    submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Tambah Catatan Ritasi';
    cancelBtn.style.display = "none";
}

// --- 5. LOGIKA CETAK PDF ---

function getPrintStyles() {
    return `
        <style>
            @page { size: A4 landscape; margin: 1cm; }
            body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; }
            header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            th, td { border: 1px solid #000 !important; padding: 6px 4px; word-wrap: break-word; vertical-align: middle; }
            th { background-color: #f8fafc !important; text-align: center; -webkit-print-color-adjust: exact; text-transform: uppercase; font-size: 9pt; }
            
            /* Penyesuaian Lebar Kolom Cetak */
            .col-no { width: 25px; text-align: center; }
            .col-waktu { width: 100px; text-align: center; }
            .col-unit { width: 115px; }      
            .col-bos { width: 130px; }       
            .col-tujuan { width: 180px; }    /* Diperkecil sedikit */
            .col-mat { width: 80px; }     
            .col-vol { width: 150px; }      /* Diperlebar sesuai permintaan */
            .col-ket { width: 140px; }
            
            .badge { padding: 4px; border-radius: 4px; font-weight: bold; display: block; text-align: center; font-size: 8pt; border: 0.5px solid #ccc; -webkit-print-color-adjust: exact; }
            .footer-sig { width: 100%; margin-top: 40px; }
            .footer-sig td { border: none !important; text-align: center; height: 80px; vertical-align: bottom; font-weight: bold; }
            
            .text-blue { color: #1e40af !important; -webkit-print-color-adjust: exact; }
            .text-sub-blue { color: #3b82f6 !important; -webkit-print-color-adjust: exact; }
        </style>
    `;
}

function printData(data, tipe) {
    if (data.length === 0) return alert("Tidak ada data untuk dicetak!");
    data.sort((a, b) => new Date(a.waktuRaw) - new Date(b.waktuRaw));

    const judulUtama = tipe === "semua" ? "CETAK KESELURUHAN SURAT JALAN" : "CETAK HARIAN SURAT JALAN";
    const subJudul = tipe === "semua" ? "Periode: Seluruh Riwayat Data" : "Tanggal: " + tipe;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>${getPrintStyles()}</head>
        <body>
            <header>
                <h2 style="margin:0;">${judulUtama}</h2>
                <p style="margin:5px 0;">${subJudul}</p>
            </header>
            <table>
                <thead>
                    <tr>
                        <th class="col-no">NO</th>
                        <th class="col-waktu">TANGGAL & JAM</th>
                        <th class="col-unit">UNIT/PLAT</th>
                        <th class="col-bos" style="white-space: nowrap;">NAMA BOS</th>
                        <th class="col-tujuan">TUJUAN</th>
                        <th class="col-mat" style="white-space: nowrap;">MATERIAL</th>
                        <th class="col-vol" style="white-space: nowrap;">VOLUME</th>
                        <th class="col-ket">KETERANGAN</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((log, i) => {
                        const style = getStatusStyle(log.keterangan);
                        return `
                        <tr>
                            <td style="text-align:center">${i+1}</td>
                            <td style="text-align:center" class="text-blue"><strong>${log.tanggal}</strong><br><small>${log.jam}</small></td>
                            <td style="white-space: nowrap;">
                                <span class="text-sub-blue" style="font-weight:bold;">${log.dt}</span><br>
                                <strong class="text-blue">${log.plat}</strong>
                            </td>
                            <td><strong>${log.cashName}</strong></td>
                            <td>${log.toko}</td>
                            <td style="text-align:center;">${log.material}</td>
                            <td style="white-space: pre-line; font-size: 9pt;">${log.banyaknya}</td>
                            <td><div class="badge" style="background:${style.bg}; color:${style.text};">${log.keterangan}</div></td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
            <table class="footer-sig">
                <tr>
                    <td>Dibuat Oleh,<br><br><br><br>(________________)</td>
                    <td>Diperiksa Oleh,<br><br><br><br>(________________)</td>
                    <td>Diketahui Oleh,<br><br><br><br>(________________)</td>
                </tr>
            </table>
        </body>
        </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
}

function printPDF() {
    const filter = document.getElementById('filterTanggal').value;
    if (!filter) return alert("Pilih tanggal terlebih dahulu!");
    const logs = JSON.parse(localStorage.getItem('indeksData')) || [];
    const filtered = logs.filter(l => l.waktuRaw.startsWith(filter));
    printData(filtered, filter);
}

function printAllPDF() {
    const logs = JSON.parse(localStorage.getItem('indeksData')) || [];
    printData(logs, "semua");
}

function deleteLog(id) {
    if(confirm("Hapus data ini?")) {
        let logs = JSON.parse(localStorage.getItem('indeksData')) || [];
        localStorage.setItem('indeksData', JSON.stringify(logs.filter(l => l.id !== id)));
        displayLogs();
    }
}

clearBtn.onclick = () => {
    if(confirm("Hapus SEMUA data permanen?")) {
        localStorage.removeItem('indeksData');
        displayLogs();
    }
};

function editLog(id) {
    const logs = JSON.parse(localStorage.getItem('indeksData')) || [];
    const item = logs.find(l => l.id === id);
    if(item) {
        document.getElementById('plat').value = item.plat;
        document.getElementById('dt').value = item.dt;
        document.getElementById('cashName').value = item.cashName;
        document.getElementById('material').value = item.material;
        document.getElementById('toko').value = item.toko;
        document.getElementById('banyaknya').value = item.banyaknya;
        document.getElementById('keterangan').value = item.keterangan;
        document.getElementById('waktuCustom').value = item.waktuRaw;
        editIdInput.value = item.id;
        submitBtn.innerHTML = '<i class="fas fa-sync"></i> Simpan Perubahan';
        cancelBtn.style.display = "block";
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}
cancelBtn.onclick = resetForm;