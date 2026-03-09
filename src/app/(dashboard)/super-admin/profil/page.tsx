import ProfilePage from "@/components/features/profile/ProfilePage";

export default function SuperAdminProfilPage() {
    return (
        <ProfilePage
            editHref="/super-admin/profil/edit"
            changePasswordHref="/super-admin/profil/ubah-password"
        />
    );
}
