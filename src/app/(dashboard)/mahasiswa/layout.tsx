import CompleteProfileModal from "@/components/features/sso/CompleteProfileModal";

export default function MahasiswaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <CompleteProfileModal />
        </>
    );
}
