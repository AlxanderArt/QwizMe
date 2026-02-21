import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, UserPlus, ArrowLeft, LogOut, Shield } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isFounder = user?.role === 'founder';

  const navItems = [
    { to: '/admin/accounts', label: 'Accounts', icon: UserPlus },
    ...(isFounder ? [{ to: '/admin/users', label: 'Users', icon: Users }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-dvh bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors mt-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to App
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-indigo-700">
                {(user?.username || user?.first_name || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.username || user?.first_name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 min-h-[44px] flex items-center rounded-lg text-sm font-medium ${
                    active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link to="/dashboard" className="p-2 min-h-[44px] flex items-center text-gray-500">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
