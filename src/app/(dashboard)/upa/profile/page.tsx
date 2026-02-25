import ProfilePage from "@/components/features/profile/ProfilePage";

export default function UpaProfilePage() {
    return (
        <ProfilePage
            editHref="/upa/profile/edit"
            changePasswordHref="/upa/profile/ubah-password"
        />
    );
}
