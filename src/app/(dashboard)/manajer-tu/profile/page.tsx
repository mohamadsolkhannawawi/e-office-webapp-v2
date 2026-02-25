import ProfilePage from "@/components/features/profile/ProfilePage";

export default function ManajerTuProfilePage() {
    return (
        <ProfilePage
            editHref="/manajer-tu/profile/edit"
            changePasswordHref="/manajer-tu/profile/ubah-password"
        />
    );
}
