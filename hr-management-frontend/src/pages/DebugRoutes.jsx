import { Link } from 'react-router-dom';

const DebugRoutes = () => {
  const routes = [
    { path: '/login', name: 'Login' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/employees', name: 'Colaboradores' },
    { path: '/departments', name: 'Departamentos' },
    { path: '/positions', name: 'Cargos' },
    { path: '/performance-evaluations', name: 'Avaliações de Desempenho' },
    { path: '/admissions', name: 'Admissões' },
    { path: '/benefits', name: 'Benefícios' },
    { path: '/training', name: 'Treinamentos' },
    { path: '/vacations', name: 'Férias' },
    { path: '/reports', name: 'Relatórios' },
    { path: '/settings', name: 'Configurações' },
    { path: '/profile', name: 'Perfil' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Lista de Rotas</h1>
      <ul className="space-y-2">
        {routes.map((route) => (
          <li key={route.path}>
            <Link to={route.path} className="text-blue-600 hover:underline">
              {route.name} ({route.path})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DebugRoutes;