// --- 1. SELEKSI ELEMEN DOM ---
const logForm = document.getElementById('logForm');
const logTableBody = document.getElementById('logTableBody');
const clearBtn = document.getElementById('clearAll');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const editIdInput = document.getElementById('editId');

// --- 2. INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
    logForm.reset(); 
    editIdInput.value = "";
    displayLogs();
});

// --- 3. SIMPAN & UPDATE DATA ---
logForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const plat = document.getElementById('plat').value.toUpperCase();
    const dt = document.getElementById('dt').value.toUpperCase();
    const cashName = document.getElementById('cashName').value;
    const material = document.getElementById('material').value;
    const toko = document.getElementById('toko').value;
    const banyaknya = document.getElementById('banyaknya').value;
    const waktuValue = document.getElementById('waktuCustom').value;
    const editId = editIdInput.value;

    const dateObj = new Date(waktuValue);
    const tanggal = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const jam = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    let logs = JSON.parse(localStorage.getItem('indeksData')) || [];

    const dataEntry = {
        plat, dt, cashName, material, toko, banyaknya, tanggal, jam, waktuRaw: waktuValue
    };

    if (editId) {
        logs = logs.map(item => item.id == editId ? { ...dataEntry, id: item.id } : item);
        resetForm();
    } else {
        logs.unshift({ ...dataEntry, id: Date.now() });
    }

    localStorage.setItem('indeksData', JSON.stringify(logs));
    resetForm(); 
    displayLogs();
});

// --- 4. TAMPILKAN TABEL ---
function displayLogs() {
    let logs = JSON.parse(localStorage.getItem('indeksData')) || [];
    logs.sort((a, b) => new Date(b.waktuRaw) - new Date(a.waktuRaw));
    logTableBody.innerHTML = '';

    logs.forEach(log => {
        const lines = log.banyaknya.split('\n');
        const dimensi = lines.slice(0, -1).join('\n');
        const hasilM3 = lines.slice(-1);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="font-weight: 600;">${log.tanggal}</div>
                <div style="font-size: 0.75rem; color: #64748b;">${log.jam} WIB</div>
            </td>
            <td>
                <strong>${log.plat}</strong><br>
                <span style="background:#e2e8f0; padding:2px 6px; border-radius:4px; font-size:0.7rem; color:#475569; font-weight:600;">${log.dt}</span>
            </td>
            <td>${log.cashName}</td>
            <td style="font-size: 0.85rem;">${log.toko}</td>
            <td>${log.material}</td>
            <td style="font-size: 0.8rem;">
                <div style="border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 4px; white-space: pre-line;">${dimensi}</div>
                <div style="font-weight: 700; color: #1e293b;">${hasilM3}</div>
            </td>
            <td>
                <div style="display:flex; gap:5px">
                    <button class="btn-edit" onclick="editLog(${log.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" onclick="deleteLog(${log.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        logTableBody.appendChild(row);
    });
}

// --- 5. FUNGSI EDIT & RESET ---
function editLog(id) {
    const logs = JSON.parse(localStorage.getItem('indeksData')) || [];
    const item = logs.find(log => log.id === id);

    if (item) {
        document.getElementById('plat').value = item.plat;
        document.getElementById('dt').value = item.dt;
        document.getElementById('cashName').value = item.cashName;
        document.getElementById('material').value = item.material;
        document.getElementById('toko').value = item.toko;
        document.getElementById('banyaknya').value = item.banyaknya;
        document.getElementById('waktuCustom').value = item.waktuRaw; 
        editIdInput.value = item.id;

        submitBtn.innerHTML = '<i class="fas fa-sync"></i> Simpan Perubahan';
        cancelBtn.style.display = "block";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function resetForm() {
    logForm.reset();
    editIdInput.value = "";
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Tambah Catatan';
    cancelBtn.style.display = "none";
}

cancelBtn.addEventListener('click', resetForm);

// --- 6. CETAK PDF LAPORAN (UKURAN FONT OPTIMAL & GARIS) ---
function printPDF() {
    const filterVal = document.getElementById('filterTanggal').value;
    if (!filterVal) return alert("Pilih tanggal laporan!");

    let logs = JSON.parse(localStorage.getItem('indeksData')) || [];
    const filteredData = logs.filter(log => log.waktuRaw.startsWith(filterVal));
    
    if (filteredData.length === 0) return alert("Data tidak ditemukan.");

    filteredData.sort((a, b) => new Date(a.waktuRaw) - new Date(b.waktuRaw));
    const tglIndo = new Date(filterVal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Laporan_SJ_${filterVal}</title>
            <style>
                @page { size: A4; margin: 1cm; }
                body { font-family: 'Arial', sans-serif; padding: 10px; color: #000; line-height: 1.4; }
                header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
                p { margin: 5px 0; font-size: 14px; font-weight: bold; }
                
                table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: auto; }
                
                /* Pengaturan Font Cetak */
                th { 
                    border: 1.5px solid #000 !important; 
                    padding: 10px 5px; 
                    font-size: 13px; /* Ukuran header lebih besar sedikit */
                    background-color: #e5e5e5 !important; 
                    -webkit-print-color-adjust: exact;
                    text-align: center;
                }
                
                td { 
                    border: 1px solid #000 !important; 
                    padding: 8px 6px; 
                    font-size: 12px; /* Ukuran isi tabel yang standar & mudah dibaca */
                    text-align: left;
                    word-wrap: break-word;
                }
                
                .text-center { text-align: center; }
                .sig-table { width: 100%; margin-top: 50px; border: none !important; }
                .sig-table td { border: none !important; text-align: center; height: 120px; vertical-align: bottom; font-size: 13px; font-weight: bold; }
            </style>
        </head>
        <body>
            <header>
                <h2>REKAPITULASI SURAT JALAN</h2>
                <p>TANGGAL: ${tglIndo}</p>
            </header>
            <table>
                <thead>
                    <tr>
                        <th style="width: 5%">NO</th>
                        <th style="width: 10%">JAM</th>
                        <th style="width: 15%">UNIT / PLAT</th>
                        <th style="width: 15%">SOPIR</th>
                        <th style="width: 20%">TUJUAN / TOKO</th>
                        <th style="width: 15%">MATERIAL</th>
                        <th style="width: 20%">BANYAKNYA (M3)</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredData.map((log, i) => `
                        <tr>
                            <td class="text-center">${i+1}</td>
                            <td class="text-center">${log.jam}</td>
                            <td>${log.dt}<br>${log.plat}</td>
                            <td>${log.cashName}</td>
                            <td>${log.toko}</td>
                            <td>${log.material}</td>
                            <td style="white-space: pre-line;">${log.banyaknya}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <table class="sig-table">
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
    setTimeout(() => printWindow.print(), 500);
}

// --- 7. HAPUS DATA ---
function deleteLog(id) {
    if(confirm('Hapus data ini?')) {
        let logs = JSON.parse(localStorage.getItem('indeksData')) || [];
        localStorage.setItem('indeksData', JSON.stringify(logs.filter(i => i.id !== id)));
        displayLogs();
    }
}

clearBtn.addEventListener('click', () => {
    if(confirm('Hapus SEMUA data ritasi?')) {
        localStorage.removeItem('indeksData');
        displayLogs();
    }
});