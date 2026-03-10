import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { PlacesPage } from './pages/PlacesPage';
import { PlaceDetailPage } from './pages/PlaceDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

type Page = 'home' | 'places' | 'nature' | 'cafe' | 'profile' | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    setSelectedPlaceId(null);
    setSearchQuery('');
  };

  const handlePlaceClick = (placeId: string) => {
    setSelectedPlaceId(placeId);
  };

  const handleBackFromDetail = () => {
    setSelectedPlaceId(null);
  };

  const handleAuthClick = () => {
    setCurrentPage('profile');
  };

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderPage = () => {
    if (selectedPlaceId) {
      return <PlaceDetailPage placeId={selectedPlaceId} onBack={handleBackFromDetail} />;
    }

    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onPlaceClick={handlePlaceClick}
            onMorePlacesClick={() => handleNavigate('places')}
            onAuthRequired={handleAuthRequired}
            searchQuery={searchQuery}
          />
        );
      case 'places':
        return (
          <PlacesPage
            category="all"
            onPlaceClick={handlePlaceClick}
            onAuthRequired={handleAuthRequired}
            searchQuery={searchQuery}
          />
        );
      case 'nature':
        return (
          <PlacesPage
            category="nature"
            onPlaceClick={handlePlaceClick}
            onAuthRequired={handleAuthRequired}
            searchQuery={searchQuery}
          />
        );
      case 'cafe':
        return (
          <PlacesPage
            category="cafe"
            onPlaceClick={handlePlaceClick}
            onAuthRequired={handleAuthRequired}
            searchQuery={searchQuery}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            onPlaceClick={handlePlaceClick}
            onAuthRequired={handleAuthRequired}
          />
        );
      case 'admin':
        return <AdminPage onAuthRequired={handleAuthRequired} />;
      default:
        return null;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onSearch={handleSearch}
          onAuthClick={handleAuthClick}
        />
        {renderPage()}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
