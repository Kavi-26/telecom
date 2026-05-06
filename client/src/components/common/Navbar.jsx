import { useState } from 'react';
import { Search, Sun, Moon, Bell, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ title, subtitle, onRefresh }) {
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Search logic could be updated or removed if it was only for alarms
    console.log('Searching for:', search);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div>
          <h2 className="navbar-title">{title}</h2>
          {subtitle && <p className="navbar-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="navbar-center">
        <form className="navbar-search-wrapper" onSubmit={handleSearch}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      <div className="navbar-right">
        {onRefresh && (
          <button className="btn btn-ghost btn-icon refresh-nav" onClick={onRefresh} title="Sync Data">
            <RefreshCw size={18} />
          </button>
        )}
        <button
          className="btn btn-ghost btn-icon theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          id="theme-toggle"
        >
          {theme === 'dark' ? <Moon size={18} fill="currentColor" /> : <Sun size={18} fill="currentColor" />}
        </button>
      </div>
    </header>
  );
}
