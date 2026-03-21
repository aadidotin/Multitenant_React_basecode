import AppLayout from '@/layouts/AppLayout';

function Dashboard() {
    return (
        <>
            <div className="flex flex-1 flex-col gap-4">
                {Array.from({ length: 24 }).map((_, index) => (
                    <div
                        key={index}
                        className="aspect-video h-12 w-full rounded-lg bg-muted/50"
                    />
                ))}
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default Dashboard;
