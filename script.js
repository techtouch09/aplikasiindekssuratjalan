// --- 1. SELEKSI ELEMEN DOM ---
const logForm = document.getElementById('logForm');
const logTableBody = document.getElementById('logTableBody');
const clearBtn = document.getElementById('clearAll');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const editIdInput = document.getElementById('editId');
const keteranganInput = document.getElementById('keterangan'); // Selector Dropdown

// --- 2. INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
    logForm.reset(); 
    editIdInput.value = "";
    displayLogs();
});

// --- FUNGSI PEMBANTU: WARNA STATUS ---
function getStatusStyle(ket) {
    let bg, text;
    switch (ket) {
        case "Terima surat indek":
            bg = "#dcfce7"; text = "#166534"; break; // Hijau Muda
        case "Terima bon muat":
            bg = "#fef9c3"; text = "#854d0e"; break; // Kuning
        case "Proses muat material":
            bg = "#dbeafe"; text = "#1e40af"; break; // Biru
        case "Terima surat jalan/selesai":
            bg = "#22c55e"; text = "#ffffff"; break; // Hijau Tua
        case "Pending/dikerjakan hari berikutnya":
            bg = "#fee2e2"; text = "#991b1b"; break; // Merah
        default:
            bg = "#f1f5f9"; text = "#475569"; // Default Abu-abu
    }
    return { bg, text };
}

// --- 3. SIMPAN & UPDATE DATA ---
logForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const plat = document.getElementById('plat').value.toUpperCase();
    const dt = document.getElementById('dt').value.toUpperCase();
    const cashName = document.getElementById('cashName').value;
    const material = document.getElementById('material').value;
    const toko = document.getElementById('toko').value;
    const banyaknya = document.getElementById('banyaknya').value;
    const keterangan = keteranganInput.value; // Nilai dari dropdown
    const waktuValue = document.getElementById('waktuCustom').value;
    const editId = editIdInput.value;

    const dateObj = new Date(waktuValue);
    const tanggal = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const jam = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    let logs = JSON.parse(localStorage.getItem('indeksData')) || [];

    const dataEntry = {
        plat, dt, cashName, material, toko, banyaknya, keterangan, tanggal, jam, waktuRaw: waktuValue
    };

    if (editId) {
        // Mode Update
        logs = logs.map(item => item.id == editId ? { ...dataEntry, id: item.id } : item);
    } else {
        // Mode Simpan Baru
        logs.unshift({ ...dataEntry, id: Date.now() });
    }

    localStorage.setItem('indeksData', JSON.stringify(logs));
    resetForm(); 
    displayLogs();
});

// --- 4. TAMPILKAN TABEL (DI LAYAR) ---
function displayLogs() {
    let logs = JSON.parse(localStorage.getItem('indeksData')) || [];
    logs.sort((a, b) => new Date(b.waktuRaw) - new Date(a.waktuRaw));
    
    logTableBody.innerHTML = '';

    logs.forEach(log => {
        const style = getStatusStyle(log.keterangan);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="font-weight: 600;">${log.tanggal}</div>
                <div style="font-size: 0.75rem; color: #64748b;">${log.jam} WIB</div>
            </td>
            <td>
                <strong>${log.plat}</strong><br>
                <span style="background:#e2e8f0; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:600;">${log.dt}</span>
            </td>
            <td>${log.cashName}</td>
            <td>${log.toko}</td>
            <td>${log.material}</td>
            <td style="white-space: pre-line; font-size: 0.85rem;">${log.banyaknya}</td>
            <td>
                <span style="background:${style.bg}; color:${style.text}; padding:5px 10px; border-radius:15px; font-size:0.75rem; font-weight:700; display:inline-block; border: 1px solid rgba(0,0,0,0.05);">
                    ${log.keterangan || '-'}
                </span>
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

// --- 5. EDIT & RESET ---
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
        
        // Mengatur nilai Dropdown Keterangan sesuai data yang disimpan
        keteranganInput.value = item.keterangan;
        
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
    submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Tambah Catatan Ritasi';
    cancelBtn.style.display = "none";
}

cancelBtn.addEventListener('click', resetForm);

// --- 6. CETAK PDF (UKURAN FONT SEDANG & PROPORSI SEIMBANG) ---
function printPDF() {
    const filterVal = document.getElementById('filterTanggal').value;
    if (!filterVal) return alert("Pilih tanggal cetak!");

    let logs = JSON.parse(localStorage.getItem('indeksData')) || [];
    const filteredData = logs.filter(log => log.waktuRaw.startsWith(filterVal));
    if (filteredData.length === 0) return alert("Data kosong!");

    filteredData.sort((a, b) => new Date(a.waktuRaw) - new Date(b.waktuRaw));
    const tglIndo = new Date(filterVal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Laporan_SJ_${filterVal}</title>
            <style>
                @page { size: A4 landscape; margin: 1cm; }
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 0; color: #000; }
                header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                
                /* Tabel Layout Tetap */
                table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                
                /* Font Sedang (10.5pt) agar Jelas Dibaca */
                th, td { 
                    border: 1px solid #000 !important; 
                    padding: 8px 5px; 
                    font-size: 10.5pt; 
                    word-wrap: break-word; 
                    text-align: left; 
                    vertical-align: middle;
                }
                
                th { background-color: #f0f0f0 !important; text-align: center; font-weight: bold; -webkit-print-color-adjust: exact; }

                /* Pengaturan Lebar Kolom Proposional */
                .col-no { width: 35px; text-align: center; }
                .col-jam { width: 55px; text-align: center; }
                .col-unit { width: 100px; }
                .col-bos { width: 110px; }
                .col-tujuan { width: auto; } /* Kolom Tujuan Fleksibel */
                .col-mat { width: 90px; }
                .col-vol { width: 110px; }
                .col-ket { width: 170px; }

                .badge { 
                    padding: 4px; 
                    border-radius: 4px; 
                    font-weight: bold; 
                    display: block; 
                    text-align: center; 
                    font-size: 9pt;
                    -webkit-print-color-adjust: exact; 
                }
                
                .sig-table { width: 100%; margin-top: 40px; border: none !important; }
                .sig-table td { border: none !important; text-align: center; height: 90px; vertical-align: bottom; font-weight: bold; font-size: 11pt; }
            </style>
        </head>
        <body>
            <header>
                <h2 style="margin:0; font-size: 16pt;">REKAPITULASI SURAT JALAN</h2>
                <p style="margin:5px 0; font-weight: bold;">TANGGAL: ${tglIndo}</p>
            </header>
            <table>
                <thead>
                    <tr>
                        <th class="col-no">NO</th>
                        <th class="col-jam">JAM</th>
                        <th class="col-unit">UNIT/PLAT</th>
                        <th class="col-bos">NAMA BOS</th>
                        <th class="col-tujuan">TUJUAN</th>
                        <th class="col-mat">MATERIAL</th>
                        <th class="col-vol">VOLUME</th>
                        <th class="col-ket">KETERANGAN</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredData.map((log, i) => {
                        const style = getStatusStyle(log.keterangan);
                        return `
                        <tr>
                            <td style="text-align:center">${i+1}</td>
                            <td style="text-align:center">${log.jam}</td>
                            <td><strong>${log.dt}</strong><br>${log.plat}</td>
                            <td>${log.cashName}</td>
                            <td>${log.toko}</td>
                            <td>${log.material}</td>
                            <td style="white-space: pre-line;">${log.banyaknya}</td>
                            <td>
                                <div class="badge" style="background-color: ${style.bg} !important; color: ${style.text} !important; border: 0.5px solid #bbb;">
                                    ${log.keterangan || '-'}
                                </div>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
            <table class="sig-table">
                <tr>
                    <td>Dibuat Oleh,<br><br><br>(________________)</td>
                    <td>Diperiksa Oleh,<br><br><br>(________________)</td>
                    <td>Diketahui Oleh,<br><br><br>(________________)</td>
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
    if(confirm('Hapus semua data?')) {
        localStorage.removeItem('indeksData');
        displayLogs();
    }
});