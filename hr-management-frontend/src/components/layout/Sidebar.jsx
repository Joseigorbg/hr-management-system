import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  UserPlus,
  Calendar,
  FileText,
  Settings,
  User,
  GraduationCap,
  X,
  Users as UsersIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'employee'] },
  { name: 'Colaboradores', href: '/employees', icon: Users, roles: ['admin'] },
  { name: 'Departamentos', href: '/departments', icon: Building2, roles: ['admin'] },
  { name: 'Cargos', href: '/positions', icon: Briefcase, roles: ['admin'] },
  { name: 'Avaliação de Desempenho', href: '/performance-evaluations', icon: TrendingUp, roles: ['admin', 'employee'] },
  { name: 'Admissões', href: '/admissions', icon: UserPlus, roles: ['admin', 'employee'] },
  { name: 'Grupos', href: '/groups', icon: Users, roles: ['admin'] }, // Nova entrada para Grupos
  { name: 'Calendário', href: '/calendar', icon: Calendar, roles: ['admin', 'employee'] },
  { name: 'Treinamentos', href: '/training', icon: GraduationCap, roles: ['admin', 'employee'] },
  { name: 'Apoiadores', href: '/supporter', icon: UsersIcon, roles: ['admin', 'employee'] },
  { name: 'Relatórios', href: '/reports', icon: FileText, roles: ['admin', 'employee'] },
  { name: 'Configurações', href: '/settings', icon: Settings, roles: ['admin'] },
  { name: 'Perfil', href: '/profile', icon: User, roles: ['admin', 'employee'] },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-card text-foreground">
      {/* Logo */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <Users className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">HR System</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navigation
            .filter((item) => !item.roles || item.roles.includes(user?.role || 'employee'))
            .map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center px-4 py-2 text-base font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  {item.name}
                </Link>
              );
            })}
        </nav>
      </ScrollArea>

      {/* Horário */}
      <div className="px-6 py-4 border-t border-border text-sm text-muted-foreground">
        <p id="current-time">
          {currentTime.toLocaleString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short',
            hour12: false,
          })}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:z-20 lg:shadow-lg">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-72 bg-card border-r shadow-lg h-screen overflow-y-auto">
          <div className="flex flex-col h-full">
            <div className="flex h-20 items-center justify-end px-6 border-b border-border">
              <SheetTitle className="sr-only">Menu Lateral</SheetTitle>
              <SheetDescription className="sr-only">Navegação e informações do sistema HR</SheetDescription>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={onClose}
              >
                
              </Button>
            </div>
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;