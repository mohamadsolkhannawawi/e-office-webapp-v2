import ProfilePage from "@/components/features/profile/ProfilePage";

export default function SupervisorProfilePage() {
    return (
        <ProfilePage
            editHref="/supervisor-akademik/profile/edit"
            changePasswordHref="/supervisor-akademik/profile/ubah-password"
        />
    );
}
