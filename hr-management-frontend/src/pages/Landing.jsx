import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserTie, FaBuilding, FaChartLine, FaUserPlus, FaGraduationCap, FaFileAlt, FaBell, FaTasks } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <FaUserTie className="text-3xl text-primary" />,
    title: "Gestão de Funcionários",
    desc: "Gerencie dados, contratos e perfis dos colaboradores com facilidade.",
  },
  {
    icon: <FaBuilding className="text-3xl text-primary" />,
    title: "Departamentos",
    desc: "Organize e monitore a estrutura de departamentos da empresa.",
  },
  {
    icon: <FaChartLine className="text-3xl text-primary" />,
    title: "Avaliações de Desempenho",
    desc: "Acompanhe metas, conquistas e feedback dos colaboradores.",
  },
  {
    icon: <FaUserPlus className="text-3xl text-primary" />,
    title: "Admissões",
    desc: "Automatize o processo de admissão de novos funcionários.",
  },
  {
    icon: <FaGraduationCap className="text-3xl text-primary" />,
    title: "Treinamentos",
    desc: "Gerencie cursos e desenvolvimento profissional.",
  },
  {
    icon: <FaFileAlt className="text-3xl text-primary" />,
    title: "Relatórios",
    desc: "Gere relatórios detalhados para decisões estratégicas.",
  },
];

const grayGradient = "bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900";
const grayGradientHover = "hover:from-gray-700 hover:via-gray-600 hover:to-gray-800";

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
        <header className="bg-card/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-center items-center">
            <div className="text-3xl font-extrabold tracking-tight text-primary drop-shadow-lg select-none">
              HR<span className="text-accent">.</span>System
            </div>
            <nav className="space-x-4 flex items-center ml-auto">
              <Button
                onClick={() => navigate('/dashboard')}
                className={`${grayGradient} ${grayGradientHover} text-white font-bold py-3 px-8 rounded-lg shadow-md border border-gray-600/20 text-lg flex items-center justify-center text-center`}
              >
                Ir para o Dashboard
              </Button>
              <Button
                onClick={() => navigate('/pending-tasks')}
                className={`${grayGradient} ${grayGradientHover} text-white font-bold py-3 px-8 rounded-lg shadow-md border border-gray-600/20 text-lg flex items-center justify-center gap-2 text-center`}
              >
                <FaTasks className="text-xl" /> Ver Tarefas Pendentes
              </Button>
              <div className="relative">
                <Button
                  onClick={() => navigate('/notifications')}
                  className="bg-transparent text-muted-foreground hover:text-accent transition-all p-2 rounded-full flex items-center justify-center"
                >
                  <FaBell className="text-2xl" />
                </Button>
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </div>
              <a href="#features" className="text-muted-foreground hover:text-accent transition text-lg">Recursos</a>
              <a href="#contact" className="text-muted-foreground hover:text-accent transition text-lg">Contato</a>
            </nav>
          </div>
        </header>
        <section className="flex-1 flex items-center justify-center relative py-24 bg-gradient-to-br from-card via-background to-background">
          <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-black mb-6 drop-shadow-xl">
              <span className="bg-gradient-to-r from-primary-foreground via-accent-foreground to-primary-foreground bg-clip-text text-transparent animate-gradient-flow">
                Bem-vindo, Usuário!
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 font-light text-muted-foreground">
              Você está logado. Acesse o dashboard ou gerencie suas tarefas pendentes.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => navigate('/dashboard')}
                className={`${grayGradient} ${grayGradientHover} text-white font-bold py-3 px-10 rounded-lg shadow-md border border-gray-600/20 text-lg flex items-center justify-center text-center`}
                style={{ boxShadow: '0 4px 24px 0 var(--color-accent)' }}
              >
                Acesse o Dashboard
              </Button>
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent opacity-20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary opacity-10 rounded-full blur-2xl"></div>
          </div>
        </section>
        <section id="features" className="py-20 bg-card/90 text-card-foreground">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-extrabold mb-12 text-center text-primary-foreground">Principais Recursos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="bg-background rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl transition-all group border border-border relative"
                >
                  <div className="mb-4">{f.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-transparent bg-gradient-to-r from-primary-foreground via-accent-foreground to-primary-foreground bg-clip-text animate-gradient-flow text-center">
                    {f.title}
                  </h3>
                  <p className="text-base text-muted-foreground text-center">{f.desc}</p>
                  <div className="absolute inset-0 rounded-2xl border-2 animate-border-flow pointer-events-none"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-20 bg-gradient-to-r from-accent to-primary text-accent-foreground text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-4xl font-extrabold mb-4">Pronto para Gerenciar?</h2>
            <p className="mb-8 text-lg font-light">Acesse o dashboard ou verifique suas tarefas pendentes.</p>
            <div className="flex justify-center">
              <Button
                onClick={() => navigate('/dashboard')}
                className={`${grayGradient} ${grayGradientHover} text-white font-bold py-3 px-10 rounded-lg shadow-md border border-gray-600/20 text-lg flex items-center justify-center text-center`}
              >
                Acesse o Dashboard
              </Button>
            </div>
          </div>
        </section>
        <footer id="contact" className="bg-card/90 text-card-foreground py-8 border-t border-border">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="mb-2 font-medium">© {new Date().getFullYear()} HR Management System. Todos os direitos reservados.</p>
            <p className="text-sm text-muted-foreground">Contato: suporte@hrsystem.com | Telefone: (11) 1234-5678</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <header className="bg-card/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-center items-center">
          <div className="text-3xl font-extrabold tracking-tight text-primary drop-shadow-lg select-none">
            HR<span className="text-accent">.</span>System
          </div>
          <nav className="space-x-4 flex items-center ml-auto">
            <Link
              to="/login"
              className={`${grayGradient} ${grayGradientHover} text-white font-bold py-3 px-8 rounded-lg shadow-md border border-gray-600/20 text-lg flex items-center justify-center text-center`}
            >
              Login
            </Link>
            <a href="#features" className="text-muted-foreground hover:text-accent transition text-lg">Recursos</a>
            <a href="#contact" className="text-muted-foreground hover:text-accent transition text-lg">Contato</a>
          </nav>
        </div>
      </header>
      <section className="flex-1 flex items-center justify-center relative py-24 bg-gradient-to-br from-card via-background to-background">
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-black mb-6 drop-shadow-xl">
            <span className="bg-gradient-to-r from-primary-foreground via-accent-foreground to-primary-foreground bg-clip-text text-transparent animate-gradient-flow">
              Bem-vindo ao Sistema de Gestão de RH
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 font-light text-muted-foreground">
            Simplifique a gestão de funcionários, departamentos e avaliações com uma solução completa e intuitiva.
          </p>
          <div className="flex justify-center">
            <Link
              to="/login"
              className={`${grayGradient} ${grayGradientHover} text-white font-bold py-3 px-10 rounded-lg shadow-md border border-gray-600/20 text-lg flex items-center justify-center text-center`}
              style={{ boxShadow: '0 4px 24px 0 var(--color-accent)' }}
            >
              Comece Agora
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary opacity-10 rounded-full blur-2xl"></div>
        </div>
      </section>
      <section id="features" className="py-20 bg-card/90 text-card-foreground">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold mb-12 text-center text-primary-foreground">Principais Recursos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-background rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl transition-all group border border-border relative"
              >
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-transparent bg-gradient-to-r from-primary-foreground via-accent-foreground to-primary-foreground bg-clip-text animate-gradient-flow text-center">
                  {f.title}
                </h3>
                <p className="text-base text-muted-foreground text-center">{f.desc}</p>
                <div className="absolute inset-0 rounded-2xl border-2 animate-border-flow pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-r from-accent to-primary text-accent-foreground text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold mb-4">Pronto para Transformar sua Gestão de RH?</h2>
          <p className="mb-8 text-lg font-light">Acesse o sistema e comece a otimizar seus processos hoje mesmo.</p>
          <div className="flex justify-center">
            <Link
              to="/login"
              className={`${grayGradient} ${grayGradientHover} text-white font-bold py-3 px-10 rounded-lg shadow-md border border-gray-600/20 text-lg flex items-center justify-center text-center`}
            >
              Acesse o Sistema
            </Link>
          </div>
        </div>
      </section>
      <footer id="contact" className="bg-card/90 text-card-foreground py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="mb-2 font-medium">© {new Date().getFullYear()} HR Management System. Todos os direitos reservados.</p>
          <p className="text-sm text-muted-foreground">Contato: suporte@hrsystem.com | Telefone: (11) 1234-5678</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;