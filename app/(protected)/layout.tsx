import Navigation from '../components/Navigation';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
} 