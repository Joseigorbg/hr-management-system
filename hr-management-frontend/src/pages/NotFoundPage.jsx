import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Oops!</h1>
        <p className="text-lg text-muted-foreground">Parece que esta página não existe ou não está disponível no momento.</p>
        <p className="text-sm text-muted-foreground">Tente voltar ao <Link to="/dashboard" className="text-primary underline">painel principal</Link> ou entre em contato com o suporte se precisar de ajuda.</p>
      </div>
    </div>
  );
};

export default NotFoundPage;