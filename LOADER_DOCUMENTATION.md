# Universal Loader System

Sistem loader universal yang telah dibuat untuk aplikasi E-Office memungkinkan penggunaan yang konsisten dan fleksibel untuk semua jenis operasi loading.

## Komponen yang Tersedia

### 1. Komponen Loader Dasar

#### `<Loader />`

Komponen loader utama dengan berbagai konfigurasi:

```tsx
import { Loader } from "@/components/ui/loader";

// Penggunaan dasar
<Loader />

// Dengan konfigurasi
<Loader
  size="lg"
  variant="spinner"
  message="Memproses data..."
  fullScreen={true}
  overlay={true}
/>
```

**Props:**

- `size`: "sm" | "md" | "lg" | "xl"
- `variant`: "spinner" | "dots" | "pulse"
- `fullScreen`: boolean - untuk fullscreen loader
- `overlay`: boolean - menambahkan backdrop blur
- `message`: string - pesan loading
- `className`: string - custom styling

### 2. Komponen Loader Khusus

#### `<PageLoader />`

Untuk loading halaman penuh:

```tsx
import { PageLoader } from "@/components/ui/loader";

<PageLoader message="Memuat halaman..." />;
```

#### `<PDFLoader />`

Untuk operasi PDF:

```tsx
import { PDFLoader } from "@/components/ui/loader";

<PDFLoader message="Menghasilkan dokumen PDF..." />;
```

#### `<InlineLoader />`

Untuk loading di dalam komponen:

```tsx
import { InlineLoader } from "@/components/ui/loader";

<InlineLoader message="Memuat data..." size="sm" />;
```

#### `<ButtonLoader />`

Untuk loading di dalam button:

```tsx
import { ButtonLoader } from "@/components/ui/loader";

<Button disabled={loading}>
    {loading && <ButtonLoader />}
    Submit
</Button>;
```

## Context dan Hooks

### 1. LoadingContext

Context global untuk mengelola loading state:

```tsx
// Provider sudah disetup di root layout
import { LoadingProvider } from "@/contexts/LoadingContext";
```

### 2. Hooks yang Tersedia

#### `usePageLoading()`

Untuk loading halaman:

```tsx
import { usePageLoading } from "@/contexts/LoadingContext";

const { isPageLoading, setPageLoading } = usePageLoading();

// Mulai page loading
setPageLoading(true, "Memuat data...");

// Stop page loading
setPageLoading(false);
```

#### `usePDFLoading()`

Untuk loading PDF:

```tsx
import { usePDFLoading } from "@/contexts/LoadingContext";

const { isPDFLoading, setPDFLoading } = usePDFLoading();

// Mulai PDF loading
setPDFLoading(true, "Menghasilkan PDF...");

// Stop PDF loading
setPDFLoading(false);
```

#### `useCustomLoading(key)`

Untuk loading dengan key custom:

```tsx
import { useCustomLoading } from "@/contexts/LoadingContext";

const { loading, setLoading } = useCustomLoading("delete-operation");

// Mulai loading
setLoading(true, "Menghapus data...");

// Stop loading
setLoading(false);
```

#### `useAsyncOperation()`

Helper untuk operasi async dengan loading:

```tsx
import { useAsyncOperation } from "@/hooks/useAsyncOperation";

const { executeWithLoading } = useAsyncOperation();

const handleOperation = async () => {
    await executeWithLoading(
        async () => {
            // Your async operation here
            const result = await fetch("/api/data");
            return result.json();
        },
        {
            loadingKey: "fetch-data",
            loadingMessage: "Mengambil data...",
            onSuccess: (result) => console.log("Success:", result),
            onError: (error) => console.error("Error:", error),
        },
    );
};
```

#### `usePDFGeneration()`

Helper khusus untuk operasi PDF:

```tsx
import { usePDFGeneration } from "@/hooks/useAsyncOperation";

const { generatePDF } = usePDFGeneration();

const handleGeneratePDF = async () => {
    await generatePDF(async () => {
        // PDF generation logic
        const pdfBlob = await generatePDFContent();
        downloadPDF(pdfBlob);
    }, "Menghasilkan PDF surat...");
};
```

#### `usePageOperation()`

Helper untuk operasi halaman:

```tsx
import { usePageOperation } from "@/hooks/useAsyncOperation";

const { executePageOperation } = usePageOperation();

const loadPageData = async () => {
    await executePageOperation(async () => {
        const data = await fetchPageData();
        setPageData(data);
    }, "Memuat data halaman...");
};
```

## Contoh Implementasi

### 1. Form Submission dengan Loading Button

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLoader } from "@/components/ui/loader";
import { useCustomLoading } from "@/contexts/LoadingContext";

const MyForm = () => {
    const { loading, setLoading } = useCustomLoading("submit-form");

    const handleSubmit = async () => {
        setLoading(true, "Menyimpan form...");
        try {
            await submitForm();
            toast.success("Form berhasil disimpan!");
        } catch (error) {
            toast.error("Gagal menyimpan form");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleSubmit} disabled={loading}>
            {loading && <ButtonLoader />}
            {loading ? "Menyimpan..." : "Submit"}
        </Button>
    );
};
```

### 2. PDF Generation

```tsx
import { usePDFGeneration } from "@/hooks/useAsyncOperation";

const DocumentPage = () => {
    const { generatePDF } = usePDFGeneration();

    const handleDownloadPDF = async () => {
        await generatePDF(async () => {
            // Generate PDF logic
            const pdfBlob = await createPDF(documentData);

            // Download PDF
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "document.pdf";
            link.click();
            URL.revokeObjectURL(url);
        });
    };

    return <Button onClick={handleDownloadPDF}>Download PDF</Button>;
};
```

### 3. Page Loading saat Load Data

```tsx
import { usePageLoading } from "@/contexts/LoadingContext";

const DataPage = () => {
    const { setPageLoading } = usePageLoading();
    const [data, setData] = useState([]);

    const fetchData = async () => {
        setPageLoading(true, "Memuat data...");
        try {
            const response = await fetch("/api/data");
            const result = await response.json();
            setData(result);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return <div>{/* Your page content */}</div>;
};
```

### 4. Delete Operation dengan Custom Loading

```tsx
const { loading: deleteLoading, setLoading: setDeleteLoading } =
    useCustomLoading("delete-item");

const handleDelete = async (id: string) => {
    setDeleteLoading(true, "Menghapus item...");
    try {
        await deleteItem(id);
        toast.success("Item berhasil dihapus");
        refetchData();
    } catch (error) {
        toast.error("Gagal menghapus item");
    } finally {
        setDeleteLoading(false);
    }
};
```

## Best Practices

1. **Gunakan Page Loader** untuk operasi yang memuat seluruh halaman
2. **Gunakan PDF Loader** untuk operasi generate/download PDF
3. **Gunakan Custom Loading** untuk operasi spesifik dengan key unik
4. **Gunakan Button Loader** untuk loading di dalam button
5. **Gunakan Inline Loader** untuk loading di dalam komponen tertentu

## Variasi Visual

### Spinner (Default)

- Putaran loading icon standar
- Cocok untuk sebagian besar kasus

### Dots

- Tiga titik berkedip bergantian
- Cocok untuk operasi yang membutuhkan indikator lebih halus

### Pulse

- Lingkaran yang mengembang mengecil
- Cocok untuk operasi singkat

## Kustomisasi

Anda dapat mengkustomisasi loader dengan:

- Mengubah pesan loading
- Mengatur ukuran (sm, md, lg, xl)
- Memilih variasi visual
- Menambahkan styling custom dengan className

Sistem loader ini dirancang untuk memberikan pengalaman pengguna yang konsisten dan profesional di seluruh aplikasi E-Office.
