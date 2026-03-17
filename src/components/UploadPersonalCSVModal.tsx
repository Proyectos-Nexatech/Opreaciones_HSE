import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Info, AlertTriangle, Loader2, X, FileText } from 'lucide-react';
import { createPersonal, getCentrosCosto } from '../services/hseService';

interface UploadPersonalCSVModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}

export const UploadPersonalCSVModal: React.FC<UploadPersonalCSVModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [centros, setCentros] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            getCentrosCosto().then(data => {
                setCentros(data || []);
            }).catch(err => {
                console.error("Error al cargar centros de costo:", err);
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleDownloadTemplate = () => {
        // Separados por punto y coma (;) para formato Excel en Latinoamérica
        const templateHeaders = "Nombre;Centro de costo;Cargo;Area;Estado;Correo;Telefono\n";
        const sampleData = "Juan Perez;Operaciones Principales;Supervisor;Mantenimiento;Activo;juan@empresa.com;3001234567\n";

        // Agregar el BOM (\uFEFF) para que Excel detecte correctamente el UTF-8 con tildes 
        const bom = '\uFEFF';
        const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(bom + templateHeaders + sampleData);

        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", "plantilla_personal_hse.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (!selectedFile.name.endsWith('.csv')) {
                setError("Por favor, selecciona un archivo en formato .CSV");
                return;
            }
            setFile(selectedFile);
        }
    };

    const parseCSV = (fileContent: string) => {
        // Handle line endings and remove empty lines
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            throw new Error("El archivo está vacío o solo contiene los encabezados.");
        }

        // Detect separator: semicolon is standard for Excel in LatAm
        const separator = lines[0].includes(';') ? ';' : ',';
        
        // Remove BOM and trim headers
        const headers = lines[0].split(separator).map(h => h.trim().replace(/^\uFEFF/, '').toLowerCase()).filter(h => h !== '');
        
        const requiredHeaders = ['nombre', 'centro de costo', 'cargo', 'area', 'estado', 'correo', 'telefono'];

        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            throw new Error(`Faltan columnas requeridas en el CSV (usa punto y coma): ${missingHeaders.join(', ')}`);
        }

        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(separator).map(v => v.trim());
            const row: any = {};
            headers.forEach((header, index) => {
                if (header) {
                    row[header] = values[index] || null;
                }
            });
            data.push(row);
        }
        return data;
    };

    const handleProcessFile = () => {
        if (!file) {
            setError("Debes seleccionar un archivo primero.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const parsed = parseCSV(text);
                setParsedData(parsed);
                setShowConfirm(true);
            } catch (err: any) {
                setError(err.message || "Error al leer el archivo CSV. Asegúrate de que esté delimitado por punto y coma (;).");
            }
        };
        reader.readAsText(file, 'utf-8');
    };

    const handleConfirmUpload = async () => {
        if (parsedData.length === 0) return;

        setIsLoading(true);
        setError(null);
        try {
            for (const row of parsedData) {
                // Verificar si el Centro de Costo escrito hace match con alguno existente
                const centroName = row['centro de costo']?.trim();
                const matchedCentro = centros.find(c => c.name.toLowerCase() === centroName?.toLowerCase() || c.code.toLowerCase() === centroName?.toLowerCase());

                const payload = {
                    name: row.nombre || '',
                    email: row.correo || '',
                    phone: row.telefono || '',
                    area: row.area || '',
                    role: row.cargo || 'SUPERVISOR HSE',
                    status: row.estado || 'Activo',
                    centro_costo_id: matchedCentro ? matchedCentro.id : null
                };

                await createPersonal(payload);
            }

            onUploadSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Ocurrió un error al subir los registros al sistema.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        setShowConfirm(false);
        setParsedData([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black tracking-tight text-brand-text">Carga Masiva de Personal</h2>
                        <p className="text-[11px] font-bold tracking-widest uppercase text-brand-text-muted mt-1">Sube archivos CSV</p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors active:scale-95" disabled={isLoading}>
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Explicación de Pasos */}
                    {!showConfirm ? (
                        <>
                            <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl">
                                <h3 className="flex items-center gap-2 text-sm font-black text-brand-text mb-2">
                                    <Info className="w-4 h-4 text-brand-primary" />
                                    Instrucciones (CSV Latinoamérica)
                                </h3>
                                <ul className="text-sm text-brand-text-muted space-y-2 font-medium">
                                    <li>1. Descarga la plantilla oprimiendo el botón de abajo.</li>
                                    <li>2. Llena la información. Los valores están separados por columnas usando <b>punto y coma (;)</b>.</li>
                                    <li>3. El <b>Centro de Costo</b> debe coincidir con el nombre de un centro existente.</li>
                                    <li>4. Guarda el archivo como CSV, súbelo aquí y procesa la carga.</li>
                                </ul>
                            </div>

                            <button
                                onClick={handleDownloadTemplate}
                                className="w-full flex items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-4 text-brand-primary font-bold hover:bg-gray-100 hover:border-brand-primary/30 transition-all active:scale-95"
                            >
                                <Download className="w-5 h-5" />
                                Descargar Plantilla .CSV
                            </button>

                            <div className="mt-8">
                                <label className="block text-[11px] font-black text-brand-text-muted uppercase tracking-widest mb-2 px-1">Seleccionar Archivo</label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2.5 file:px-4
                                        file:rounded-xl file:border-0
                                        file:text-sm file:font-bold
                                        file:bg-brand-primary/10 file:text-brand-primary
                                        hover:file:bg-brand-primary/20 file:cursor-pointer cursor-pointer"
                                />
                                {file && <p className="text-xs text-brand-success font-bold mt-2 px-1 flex items-center gap-1"><FileText className="w-3 h-3" /> {file.name} seleccionado.</p>}
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 mt-4">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    <p className="text-xs font-bold">{error}</p>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={handleProcessFile}
                                    disabled={!file}
                                    className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20"
                                >
                                    Siguiente Paso <Upload className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        // Confirmación
                        <div className="space-y-4">
                            <div className="p-6 bg-amber-50 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                                <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-amber-900 mb-1">Confirmar Carga de Datos</h3>
                                    <p className="text-amber-700 font-medium text-sm">Se detectaron <strong>{parsedData.length} registros</strong> válidos para importar en la plataforma.</p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 mt-4">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    <p className="text-xs font-bold">{error}</p>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    disabled={isLoading}
                                    className="px-5 py-2.5 border-2 border-gray-200 rounded-xl text-gray-500 font-bold hover:bg-gray-50"
                                >
                                    Atrás
                                </button>
                                <button
                                    onClick={handleConfirmUpload}
                                    disabled={isLoading}
                                    className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold flex items-center gap-2 hover:brightness-110 shadow-lg shadow-brand-primary/20"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                                    ) : (
                                        <><Upload className="w-4 h-4" /> Confirmar e Importar</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
