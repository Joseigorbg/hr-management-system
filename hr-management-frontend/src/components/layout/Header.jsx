import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Menu, Moon, Sun, LogOut, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import profileService from '../../services/profileService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const DEFAULT_AVATAR = '/Uploads/avatars/default-avatar.png';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR);

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const profileData = await profileService.getProfile();
        const avatarUrl = profileData?.avatar ? `${API_BASE_URL}${profileData.avatar}` : DEFAULT_AVATAR;
        setAvatarSrc(avatarUrl);
        console.log('Avatar Src carregado no Header:', avatarUrl);
      } catch (err) {
        console.error('Erro ao carregar avatar no Header:', err);
        setAvatarSrc(DEFAULT_AVATAR); // Fallback para avatar padrão em caso de erro
      }
    };
    if (user?.id) {
      loadAvatar();
    } else {
      setAvatarSrc(DEFAULT_AVATAR); // Define avatar padrão se não houver usuário logado
    }
  }, [user?.id]);

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (name) => {
    return name
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const handleImageError = () => {
    console.error('Erro ao carregar imagem do avatar:', avatarSrc);
    setAvatarSrc(DEFAULT_AVATAR); // Fallback para avatar padrão em caso de erro na imagem
  };

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between lg:pl-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop spacing */}
      <div className="hidden lg:block lg:w-64"></div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={avatarSrc}
                  alt={user?.name || 'Usuário'}
                  onError={handleImageError}
                />
                <AvatarFallback>{getUserInitials(user?.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Usuário'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'email@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;