/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Image,
} from "@react-pdf/renderer";

// Register fonts if needed, but standard fonts (Helvetica, Times-Roman) work out of the box.

const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        paddingTop: "3cm",
        paddingBottom: "3cm",
        paddingLeft: "4cm",
        paddingRight: "3cm",
        fontFamily: "Times-Roman",
        fontSize: 12,
    },
    headerContainer: {
        flexDirection: "row",
        borderBottomWidth: 4,
        borderBottomColor: "#000000",
        paddingBottom: 8,
        marginBottom: 20,
        alignItems: "flex-start",
        fontFamily: "Helvetica",
        position: "relative",
        height: "auto", // Allow growth
    },
    logoContainer: {
        width: "2.5cm",
        height: "2.5cm",
        position: "absolute",
        left: 0,
        top: 0,
    },
    logo: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
    },
    centerTextContainer: {
        width: "100%",
        textAlign: "center",
        paddingLeft: "2.8cm", // Offset for logo
        paddingRight: "6cm", // Offset for address to keep center text properly centered?
        // Actually, to center completely on the page (ignoring margins? No, centering within margins).
        // The previous implementation centered it relative to the 'middle' column.
        // Let's us absolute centering logic or just padding.
        // If we use flex: 1, it centers between the side items.
        // But the address is wider than the logo.
        // Let's use absolute overlay for address and logo, and normal flow for center text to ensure true center.
    },
    centerTextMinistry: {
        fontSize: 11,
        color: "#000080",
        textAlign: "center",
        lineHeight: 1.2,
    },
    centerTextUniversity: {
        fontSize: 16,
        fontFamily: "Helvetica-Bold",
        fontWeight: "bold",
        color: "#000080",
        textAlign: "center",
        marginTop: 2,
        lineHeight: 1.2,
    },
    centerTextFaculty: {
        fontSize: 14,
        fontFamily: "Helvetica-Bold",
        fontWeight: "bold",
        color: "#000080",
        textAlign: "center",
        lineHeight: 1.2,
    },
    addressContainer: {
        position: "absolute",
        right: 0,
        top: 0,
        width: "6cm",
        textAlign: "right",
    },
    addressText: {
        fontSize: 8,
        fontFamily: "Helvetica",
        color: "#000000",
        lineHeight: 1.2,
    },
    titleContainer: {
        marginTop: 10,
        marginBottom: 20,
        textAlign: "center",
    },
    titleMain: {
        fontSize: 14, // 14pt requested vs 18px previously? Strict word said 18pt title?
        // Previous code: text-[18px] -> approx 13.5pt.
        // User image says "SURAT-REKOMENDASI".
        fontFamily: "Times-Roman",
        textDecoration: "underline",
        fontWeight: "bold",
        letterSpacing: 2,
        textTransform: "uppercase",
    },
    titleNumber: {
        fontSize: 12,
        marginTop: 4,
        fontFamily: "Times-Roman",
        fontWeight: "bold",
    },
    bodyText: {
        fontSize: 12,
        lineHeight: 1.5,
        textAlign: "justify",
        marginBottom: 8,
        fontFamily: "Times-Roman",
    },
    fieldRow: {
        flexDirection: "row",
        marginBottom: 4,
        marginLeft: 20, // Indent for fields
    },
    fieldLabel: {
        width: 140,
        fontSize: 12,
    },
    fieldSeparator: {
        width: 10,
        fontSize: 12,
    },
    fieldValue: {
        flex: 1,
        fontSize: 12,
    },
    listContainer: {
        marginLeft: 20,
        marginTop: 4,
    },
    listItem: {
        flexDirection: "row",
        marginBottom: 2,
    },
    listItemBullet: {
        width: 15,
        fontSize: 12,
    },
    listItemText: {
        flex: 1,
        fontSize: 12,
    },
    signatureContainer: {
        marginTop: 20, // mt-2 approx
        alignSelf: "flex-end",
        width: 250, // w-80 approx
        textAlign: "left", // Aligned left within the right-aligned box
    },
    signatureText: {
        fontSize: 12,
        marginBottom: 2,
    },
    signatureImageContainer: {
        height: 80,
        position: "relative",
        justifyContent: "center",
        marginVertical: 5,
    },
    signatureImage: {
        width: 150,
        height: 70,
        objectFit: "contain",
    },
    stampImage: {
        position: "absolute",
        left: -30,
        top: 0,
        width: 100,
        height: 100,
        opacity: 0.8,
    },
    signatureName: {
        fontSize: 12,
        fontWeight: "bold",
        textDecoration: "underline",
        fontFamily: "Times-Bold", // Valid standard font
    },
    signatureNIP: {
        fontSize: 12,
    },
    qrCodeContainer: {
        position: "absolute",
        bottom: "3cm",
        left: "3cm",
        width: 80,
        height: 80,
    },
    qrCodeImage: {
        width: "100%",
        height: "100%",
    },
});

interface SuratPDFProps {
    nomorSurat?: string;
    showSignature?: boolean;
    signaturePath?: string | null;
    showStamp?: boolean;
    qrCodeUrl?: string;
    data?: Record<string, string>;
    leadershipConfig?: {
        name: string;
        nip: string;
        jabatan: string;
    };
}

export const SuratPDF = ({
    nomorSurat,
    showSignature,
    signaturePath,
    showStamp,
    qrCodeUrl,
    data,
    leadershipConfig,
}: SuratPDFProps) => {
    // Current year logic
    const currentYear = new Date().getFullYear();
    const defaultData = {
        nama: "...........................",
        nim: "...........................",
        tempatLahir: "...........................",
        tanggalLahir: "...........................",
        noHp: "...........................",
        jurusan: "...........................",
        programStudi: "...........................",
        semester: "...........................",
        ipk: "...........................",
        ips: "...........................",
        keperluan: "Pengajuan Beasiswa ...........................",
        tahunAkademik: `${currentYear}/${currentYear + 1}`,
    };
    const finalData = { ...defaultData, ...data };
    const jurusanDisplay = finalData.programStudi || finalData.jurusan;

    const leadership = leadershipConfig || {
        name: "[Nama Pejabat]",
        nip: "[NIP]",
        jabatan: "[Jabatan]",
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    {/* Logo - Absolute Left */}
                    <View style={styles.logoContainer}>
                        {/* Note: React-PDF requires absolute paths or base64 or precise URLs. 
                            If running on client, /assets/undip-logo.png relative to public should work.
                        */}
                        <Image
                            src="/assets/undip-logo.png"
                            style={styles.logo}
                        />
                    </View>

                    {/* Center Text */}
                    <View style={styles.centerTextContainer}>
                        <Text style={styles.centerTextMinistry}>
                            KEMENTERIAN PENDIDIKAN TINGGI, SAINS,
                        </Text>
                        <Text style={styles.centerTextMinistry}>
                            DAN TEKNOLOGI
                        </Text>
                        <Text style={styles.centerTextUniversity}>
                            UNIVERSITAS DIPONEGORO
                        </Text>
                        <Text style={styles.centerTextFaculty}>
                            FAKULTAS SAINS DAN MATEMATIKA
                        </Text>
                    </View>

                    {/* Address - Absolute Right */}
                    <View style={styles.addressContainer}>
                        <Text style={styles.addressText}>
                            Jalan Prof. Jacub Rais
                        </Text>
                        <Text style={styles.addressText}>
                            Kampus Universitas Diponegoro
                        </Text>
                        <Text style={styles.addressText}>
                            Tembalang, Semarang Kode Pos 50275
                        </Text>
                        <Text style={styles.addressText}>
                            Telp. (024) 7474754 Fax (024) 7460033
                        </Text>
                        <Text style={styles.addressText}>
                            Laman: www.fsm.undip.ac.id
                        </Text>
                        <Text style={styles.addressText}>
                            Pos-el: fsm@undip.ac.id
                        </Text>
                    </View>
                </View>

                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.titleMain}>
                        S U R A T - R E K O M E N D A S I
                    </Text>
                    <Text style={styles.titleNumber}>
                        Nomor:{" "}
                        {nomorSurat || "......../UN7.F8.1/KM/....../20..."}
                    </Text>
                </View>

                {/* Body */}
                <View>
                    <Text style={styles.bodyText}>
                        Dekan Fakultas Sains dan Matematika Universitas
                        Diponegoro dengan ini menerangkan :
                    </Text>

                    {/* Identity Fields */}
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Nama</Text>
                        <Text style={styles.fieldSeparator}>:</Text>
                        <Text style={styles.fieldValue}>{finalData.nama}</Text>
                    </View>
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>NIM</Text>
                        <Text style={styles.fieldSeparator}>:</Text>
                        <Text style={styles.fieldValue}>{finalData.nim}</Text>
                    </View>
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>
                            Tempat / Tgl Lahir
                        </Text>
                        <Text style={styles.fieldSeparator}>:</Text>
                        <Text style={styles.fieldValue}>
                            {finalData.tempatLahir}, {finalData.tanggalLahir}
                        </Text>
                    </View>
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>No HP</Text>
                        <Text style={styles.fieldSeparator}>:</Text>
                        <Text style={styles.fieldValue}>{finalData.noHp}</Text>
                    </View>

                    <Text style={[styles.bodyText, { marginTop: 10 }]}>
                        Pada tahun akademik {finalData.tahunAkademik} terdaftar
                        sebagai mahasiswa Fakultas Sains dan Matematika
                        Universitas Diponegoro
                    </Text>

                    {/* Academic Fields */}
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Jurusan</Text>
                        <Text style={styles.fieldSeparator}>:</Text>
                        <Text style={styles.fieldValue}>{jurusanDisplay}</Text>
                    </View>
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Semester</Text>
                        <Text style={styles.fieldSeparator}>:</Text>
                        <Text style={styles.fieldValue}>
                            {finalData.semester}
                        </Text>
                    </View>
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>IPK</Text>
                        <Text style={styles.fieldSeparator}>:</Text>
                        <Text style={styles.fieldValue}>{finalData.ipk}</Text>
                    </View>
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>
                            IPS (Semester {finalData.semester})
                        </Text>
                        <Text style={styles.fieldSeparator}>:</Text>
                        <Text style={styles.fieldValue}>{finalData.ips}</Text>
                    </View>

                    <Text style={[styles.bodyText, { marginTop: 10 }]}>
                        Surat rekomendasi ini dibuat untuk keperluan :{" "}
                        <Text style={{ textDecoration: "underline" }}>
                            {finalData.keperluan}
                        </Text>
                    </Text>

                    <Text style={styles.bodyText}>
                        Serta menerangkan bahwa mahasiswa yang bersangkutan:
                    </Text>

                    {/* Check List */}
                    <View style={styles.listContainer}>
                        <View style={styles.listItem}>
                            <Text style={styles.listItemBullet}>-</Text>
                            <Text style={styles.listItemText}>
                                Tidak sedang mengajukan atau menerima beasiswa
                                dari instansi lain
                            </Text>
                        </View>
                        <View style={styles.listItem}>
                            <Text style={styles.listItemBullet}>-</Text>
                            <Text style={styles.listItemText}>
                                Berstatus aktif kuliah
                            </Text>
                        </View>
                        <View style={styles.listItem}>
                            <Text style={styles.listItemBullet}>-</Text>
                            <Text style={styles.listItemText}>
                                Berkelakuan baik
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.bodyText, { marginTop: 15 }]}>
                        Demikian untuk diketahui dan dipergunakan sebagaimana
                        mestinya.
                    </Text>
                </View>

                {/* Signature */}
                <View style={styles.signatureContainer}>
                    <Text style={styles.signatureText}>Semarang,</Text>
                    <Text style={styles.signatureText}>a.n. Dekan</Text>
                    <Text style={styles.signatureText}>
                        {leadership.jabatan}
                    </Text>

                    <View style={styles.signatureImageContainer}>
                        {showSignature && signaturePath ? (
                            <Image
                                src={signaturePath}
                                style={styles.signatureImage}
                            />
                        ) : null}
                        {showStamp && (
                            <Image
                                src="/assets/stamp-dummy.png"
                                style={styles.stampImage}
                            />
                        )}
                    </View>

                    <Text style={styles.signatureName}>{leadership.name}</Text>
                    <Text style={styles.signatureNIP}>
                        NIP. {leadership.nip}
                    </Text>
                </View>

                {/* QR Code */}
                {qrCodeUrl && (
                    <View style={styles.qrCodeContainer}>
                        <Image src={qrCodeUrl} style={styles.qrCodeImage} />
                    </View>
                )}
            </Page>
        </Document>
    );
};
